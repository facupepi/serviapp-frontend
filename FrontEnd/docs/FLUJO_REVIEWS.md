# Flujo de Calificaciones (Reviews) en ServiApp

## ⚡ Actualización Reciente - Detección de Review del Usuario

### ✅ Nuevo Comportamiento del Backend

El endpoint `GET /api/services/:id/reviews` ahora retorna un campo adicional:

```json
{
  "reviews": [...],
  "average_rating": 4.5,
  "total_reviews": 10,
  "rating_distribution": {...},
  "user_review": {
    "id": 42,
    "user_id": 10,
    "rating": 5,
    "comment": "Excelente servicio",
    "created_at": "2025-10-18T10:30:00Z",
    "updated_at": "2025-10-18T10:30:00Z"
  }
}
```

**Campo `user_review`:**
- `null` si el usuario no está autenticado
- `null` si el usuario no tiene review para este servicio
- `Review` completa si el usuario ya ha calificado el servicio

### 🎯 Ventajas para el Frontend

1. **Detección Automática**: Sabe si el usuario ya tiene review
2. **ID Disponible**: Tiene el `review_id` para PUT/DELETE
3. **UI Adaptativa**: Puede mostrar "Editar" vs "Escribir reseña"
4. **Evita Duplicados**: No muestra la review del usuario dos veces

## Descripción General

El sistema de calificaciones permite a los clientes valorar los servicios que han recibido. Este documento explica el flujo completo y las validaciones del backend.

## Requisitos para Calificar un Servicio

### ✅ Validaciones del Backend

La API valida lo siguiente antes de permitir crear una review:

1. **Servicio Existente y Activo**
   - El servicio debe existir en la base de datos
   - El servicio debe tener status `active`

2. **No Reviewar Servicio Propio**
   - El usuario no puede reviewar un servicio que él mismo ofrece
   - Validación: `user_id !== service.provider_id`

3. **Appointment Completado** ⚠️ **CRÍTICO**
   - El usuario **DEBE** tener al menos un appointment con este servicio
   - El appointment **DEBE** tener status `completed`
   - No es suficiente con que esté `accepted` o que la fecha haya pasado
   - El proveedor debe marcar el servicio como completado

4. **Rating Válido**
   - El rating debe estar entre 1 y 5
   - Solo valores enteros

5. **Comentario Válido**
   - El comentario debe tener entre 20 y 500 caracteres (validación frontend)

### 🔄 Comportamiento Upsert

Si el usuario ya tiene una review para este servicio:
- ✅ Se actualiza la review existente
- ✅ Se mantiene el mismo ID de review
- ✅ Se actualiza `updated_at`

## Flujo Completo del Usuario

```
1. Usuario solicita servicio
   ↓
2. Proveedor acepta (status: accepted)
   ↓
3. Se realiza el servicio en la fecha acordada
   ↓
4. Proveedor marca como completado (status: completed)
   ↓
5. Usuario puede calificar el servicio
   ↓
6. Review se crea/actualiza en la base de datos
   ↓
7. Rating promedio del servicio se actualiza automáticamente
```

## Estados de Appointment y Capacidad de Review

| Estado Appointment | Puede Reviewar | Notas |
|-------------------|---------------|-------|
| `pending` | ❌ | Aún no aceptado |
| `accepted` | ❌ | Aceptado pero no completado |
| `rejected` | ❌ | Rechazado por proveedor |
| `cancelled` | ❌ | Cancelado por cliente |
| `completed` | ✅ | **Único estado válido** |
| `expired` | ❌ | Caducado sin respuesta |

## Endpoints de la API

### GET `/api/services/{id}/reviews`

Obtiene todas las reviews de un servicio + la review del usuario autenticado (si existe).

**Headers:**
```
Authorization: Bearer {token} (opcional)
```

**Response Exitosa (200):**
```json
{
  "reviews": [
    {
      "id": 1,
      "user_id": 10,
      "user_name": "Juan Pérez",
      "user_avatar": null,
      "rating": 5,
      "comment": "Excelente servicio",
      "created_at": "2025-10-18T10:30:00Z",
      "updated_at": "2025-10-18T10:30:00Z"
    }
  ],
  "average_rating": 4.5,
  "total_reviews": 10,
  "rating_distribution": {
    "1": 0,
    "2": 1,
    "3": 2,
    "4": 3,
    "5": 4
  },
  "user_review": {
    "id": 42,
    "user_id": 15,
    "rating": 5,
    "comment": "Mi review",
    "created_at": "2025-10-18T10:30:00Z",
    "updated_at": "2025-10-18T10:30:00Z"
  }
}
```

### POST `/api/services/{id}/reviews`

Crear review para un servicio (o actualizar si ya existe - upsert).

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "rating": 5,
  "comment": "Excelente servicio, muy profesional y puntual"
}
```

**Response Exitosa (201):**
```json
{
  "message": "Review created successfully",
  "review": {
    "id": 1,
    "user_id": 10,
    "service_id": 5,
    "rating": 5,
    "comment": "Excelente servicio",
    "created_at": "2025-10-18T10:30:00Z",
    "updated_at": "2025-10-18T10:30:00Z"
  }
}
```

**Error 400 - No Completado:**
```json
{
  "code": 400,
  "message": "You must complete an appointment before reviewing this service"
}
```

### PUT `/api/reviews/{id}`

Actualizar una review existente.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "rating": 4,
  "comment": "Actualizo mi comentario"
}
```

**Response Exitosa (200):**
```json
{
  "message": "Review updated successfully",
  "review": {
    "id": 1,
    "user_id": 10,
    "service_id": 5,
    "rating": 4,
    "comment": "Actualizo mi comentario",
    "created_at": "2025-10-18T10:30:00Z",
    "updated_at": "2025-10-20T15:45:00Z"
  }
}
```

### DELETE `/api/reviews/{id}`

Eliminar una review.

**Headers:**
```
Authorization: Bearer {token}
```

**Response Exitosa (200):**
```json
{
  "message": "Review deleted successfully"
}
```

## Implementación en el Frontend

### 1. Detección de Review del Usuario

El frontend ahora puede detectar automáticamente si el usuario ya tiene una review:

```typescript
// Al cargar reviews del servicio
const result = await authAPI.getServiceReviews(serviceId);

if (result.success && result.data) {
  const reviewsData = result.data;
  
  // Verificar si el usuario tiene review
  if (reviewsData.user_review) {
    // Usuario ya tiene review - Mostrar "Editar mi reseña"
    console.log('Review ID:', reviewsData.user_review.id);
    console.log('Rating actual:', reviewsData.user_review.rating);
  } else {
    // Usuario no tiene review - Mostrar "Escribir reseña"
  }
}
```

### 2. Mostrar Review del Usuario Destacada

En `ServiceDetail.tsx`:

```typescript
{/* Review del usuario (destacada al inicio) */}
{reviewsData?.user_review && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <h3>Tu reseña</h3>
    <StarRating rating={reviewsData.user_review.rating} />
    <p>{reviewsData.user_review.comment}</p>
    <button onClick={() => handleEditReview(reviewsData.user_review.id)}>
      Editar
    </button>
    <button onClick={() => handleDeleteReview(reviewsData.user_review.id)}>
      Eliminar
    </button>
  </div>
)}

{/* Reviews de otros usuarios (excluyendo la del usuario) */}
{reviewsData?.reviews
  .filter(review => review.id !== reviewsData.user_review?.id)
  .map(review => (
    <ReviewCard key={review.id} review={review} />
  ))}
```

### 3. Editar Review

```typescript
// En auth.ts
const result = await authAPI.updateReview(reviewId, newRating, newComment);

if (result.success) {
  addNotification('success', 'Reseña actualizada exitosamente');
  // Recargar reviews
  await loadReviews();
}
```

### 4. Eliminar Review

```typescript
// Con confirmación
const confirmDelete = window.confirm('¿Estás seguro de eliminar tu reseña?');

if (confirmDelete) {
  const result = await authAPI.deleteReview(reviewId);
  
  if (result.success) {
    addNotification('success', 'Reseña eliminada exitosamente');
    // Recargar reviews
    await loadReviews();
  }
}
```

### 5. Validación en la UI

```typescript
// Solo mostrar botón si está completado o si es accepted y la fecha pasó
const canRate = request.status === 'completed' || 
                (request.status === 'accepted' && requestDate && requestDate < new Date());
```

### 6. Llamada a la API para Crear

```typescript
// En AuthContext.tsx
const result = await authAPI.createReview(serviceId, rating, comment);

if (result.success) {
  // Mostrar notificación de éxito
  addNotification('success', 'Calificación enviada exitosamente');
} else {
  // Mostrar error específico
  addNotification('error', result.error);
}
```

### 3. Manejo de Errores

```typescript
// En auth.ts
if (data?.message?.includes('complete an appointment')) {
  errorMessage = 'Debes tener un servicio completado antes de poder calificarlo. El servicio debe estar en estado "Completado".';
}
```

## Problema Común: Error 400

### 🔴 Error: "You must complete an appointment before reviewing this service"

**Causa:**
- El appointment está en estado `accepted` pero no `completed`
- El proveedor no ha marcado el servicio como completado

**Solución:**
1. **Para Proveedores:** Implementar funcionalidad para marcar servicios como completados
2. **Para Clientes:** Esperar a que el proveedor marque el servicio como completado
3. **Alternativa Temporal:** El backend podría cambiar automáticamente appointments `accepted` a `completed` cuando la fecha pase

### Endpoint para Completar Servicio (Backend debe implementar)

```
POST /api/appointments/{id}/complete
Headers: Authorization: Bearer {token}
Body: (vacío o con datos adicionales)
```

## Flujo de Cambio de Estados (Backend)

### Responsabilidades

**Proveedor debe poder:**
- ✅ Aceptar solicitudes (`pending` → `accepted`)
- ✅ Rechazar solicitudes (`pending` → `rejected`)
- ✅ **Marcar como completado** (`accepted` → `completed`)

**Cliente debe poder:**
- ✅ Cancelar solicitudes (`pending` → `cancelled`)
- ✅ Cancelar servicios aceptados (`accepted` → `cancelled`)
- ✅ Calificar servicios completados (`completed`)

**Sistema automático:**
- ✅ Expirar solicitudes sin respuesta (`pending` → `expired`)

## Consideraciones Técnicas

### Frontend

1. **Tipos TypeScript Actualizados**
   - `AppointmentStatus` incluye todos los 6 estados
   - `ServiceRequest` en AuthContext actualizado

2. **UI Adaptativa**
   - Botón de calificar solo visible cuando `canRate === true`
   - Mensajes informativos para estados intermedios
   - Tooltips explicativos

3. **Manejo de Errores Robusto**
   - Mensajes específicos según código de error
   - Logging detallado para debugging
   - Notificaciones claras al usuario

### Backend (Recomendaciones)

1. **Endpoint Faltante**
   ```
   POST /api/appointments/{id}/complete
   ```
   Permite al proveedor marcar un servicio como completado.

2. **Proceso Automático**
   - Cron job que cambie `accepted` → `completed` automáticamente 24h después de la fecha del servicio
   - Solo si el proveedor no lo marcó manualmente

3. **Notificaciones**
   - Enviar notificación al cliente cuando el servicio se marca como completado
   - Recordar al cliente que puede calificar

## Testing

### Caso de Prueba 1: Review Exitosa
```
1. Crear appointment (POST /api/appointments)
2. Proveedor acepta (PUT /api/appointments/{id}/status → accepted)
3. Proveedor completa (POST /api/appointments/{id}/complete → completed)
4. Cliente crea review (POST /api/services/{id}/reviews) ✅
```

### Caso de Prueba 2: Review Rechazada
```
1. Crear appointment (POST /api/appointments)
2. Proveedor acepta (PUT /api/appointments/{id}/status → accepted)
3. Cliente intenta review (POST /api/services/{id}/reviews) ❌
   Error: "You must complete an appointment before reviewing this service"
```

### Caso de Prueba 3: Upsert
```
1. Cliente crea review con rating 4
2. Cliente actualiza review a rating 5 (mismo endpoint)
3. Solo existe una review con rating 5 ✅
```

## Resumen

**El formato del POST está correcto** ✅
```json
{ "rating": 5, "comment": "..." }
```

**El problema es de validación de negocio** ⚠️
- El appointment debe estar en estado `completed`
- El proveedor debe tener funcionalidad para completar servicios
- O el sistema debe completarlos automáticamente

---

**Última actualización**: Octubre 2025
**Responsable**: Equipo de Desarrollo ServiApp
