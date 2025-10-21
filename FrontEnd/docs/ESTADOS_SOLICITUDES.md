# Estados de Solicitudes en ServiApp

## Descripción General

Las solicitudes de servicios en ServiApp pueden tener 6 estados diferentes durante su ciclo de vida. Cada estado representa una etapa específica del proceso de contratación.

## Estados Disponibles

### 1. `pending` - Pendiente
- **Descripción**: La solicitud ha sido enviada por el cliente y está esperando la respuesta del proveedor.
- **Quién lo establece**: Sistema automáticamente al crear la solicitud
- **Acciones posibles**: 
  - Proveedor puede aceptar → cambia a `accepted`
  - Proveedor puede rechazar → cambia a `rejected`
  - Cliente puede cancelar → cambia a `cancelled`
  - Si pasa la fecha → cambia automáticamente a `expired`
- **Color**: Amarillo 🟡
- **Icono**: Reloj ⏱️

### 2. `accepted` - Aceptada
- **Descripción**: El proveedor ha aceptado la solicitud y se compromete a realizar el servicio.
- **Quién lo establece**: Proveedor al aceptar la solicitud
- **Acciones posibles**:
  - Cliente puede cancelar → cambia a `cancelled`
  - Después de la fecha del servicio → puede calificar
  - Cuando se completa el servicio → cambia a `completed`
- **Color**: Verde 🟢
- **Icono**: Check ✓

### 3. `rejected` - Rechazada
- **Descripción**: El proveedor ha rechazado la solicitud. Debe incluir un motivo de rechazo.
- **Quién lo establece**: Proveedor al rechazar la solicitud
- **Acciones posibles**: Ninguna (estado final)
- **Color**: Rojo 🔴
- **Icono**: X ✗
- **Nota**: El proveedor debe proporcionar un `rejection_reason`

### 4. `cancelled` - Cancelada
- **Descripción**: El cliente ha cancelado la solicitud antes de que se complete el servicio.
- **Quién lo establece**: Cliente al cancelar
- **Acciones posibles**: Ninguna (estado final)
- **Color**: Naranja 🟠
- **Icono**: X ✗

### 5. `completed` - Completada
- **Descripción**: El servicio se ha realizado exitosamente.
- **Quién lo establece**: Sistema o proveedor después de realizar el servicio
- **Acciones posibles**: 
  - Cliente puede dejar una reseña si aún no lo ha hecho
- **Color**: Azul 🔵
- **Icono**: Check ✓

### 6. `expired` - Caducada
- **Descripción**: La solicitud en estado `pending` ha pasado su fecha límite sin recibir respuesta.
- **Quién lo establece**: Sistema automáticamente (proceso batch/cron)
- **Acciones posibles**: Ninguna (estado final)
- **Color**: Gris ⚪
- **Icono**: X ✗

## Diagrama de Flujo de Estados

```
                    ┌─────────────┐
                    │   PENDING   │ (Estado Inicial)
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ ACCEPTED │  │ REJECTED │  │ EXPIRED  │
        └─────┬────┘  └──────────┘  └──────────┘
              │          (Final)       (Final)
              │
        ┌─────┴─────┐
        │           │
        ▼           ▼
   ┌──────────┐  ┌───────────┐
   │CANCELLED │  │ COMPLETED │
   └──────────┘  └───────────┘
     (Final)       (Final)
```

## Validaciones y Reglas de Negocio

### Transiciones Válidas

| Estado Actual | Estados Permitidos |
|--------------|-------------------|
| `pending` | `accepted`, `rejected`, `cancelled`, `expired` |
| `accepted` | `cancelled`, `completed` |
| `rejected` | Ninguno |
| `cancelled` | Ninguno |
| `completed` | Ninguno |
| `expired` | Ninguno |

### Permisos por Rol

#### Cliente
- Puede cancelar solicitudes en estado `pending` o `accepted`
- Puede calificar servicios en estado `completed` o `accepted` (si la fecha ya pasó)

#### Proveedor
- Puede aceptar o rechazar solicitudes en estado `pending`
- Puede marcar como completado servicios en estado `accepted`

### Consideraciones Técnicas

1. **Caducación Automática**: El backend debe ejecutar un proceso periódico que cambie solicitudes `pending` a `expired` si:
   - La fecha de la solicitud ya pasó
   - El proveedor no ha respondido

2. **Motivo de Rechazo**: Cuando se cambia a `rejected`, el campo `rejection_reason` es obligatorio.

3. **Calificaciones**: Solo se pueden crear reseñas para solicitudes:
   - En estado `completed` o `accepted`
   - Donde la fecha del servicio ya haya pasado
   - Por el cliente que hizo la solicitud

## Uso en el Frontend

### Importar utilidades

```typescript
import { 
  getStatusColor, 
  getStatusIcon, 
  getStatusText,
  canRespondToRequest,
  canRateRequest,
  isRequestFinalized
} from '../utils/statusHelpers';
import { AppointmentStatus } from '../types/api';
```

### Ejemplo de uso

```typescript
// Obtener el color del badge
<div className={getStatusColor(request.status)}>
  {getStatusIcon(request.status)}
  <span>{getStatusText(request.status)}</span>
</div>

// Verificar si se puede responder
if (canRespondToRequest(request.status)) {
  // Mostrar botones de aceptar/rechazar
}

// Verificar si se puede calificar
if (canRateRequest(request.status, requestDate)) {
  // Mostrar botón de calificar
}
```

## API Endpoints Relacionados

### Actualizar estado de solicitud
```
PUT /api/appointments/:id/status
Body: { status: 'accepted' | 'rejected', rejection_reason?: string }
```

### Cancelar solicitud (cliente)
```
POST /api/appointments/:id/cancel
```

### Completar servicio (proveedor)
```
POST /api/appointments/:id/complete
```

## Colores y Estilos

| Estado | Background | Text | Border |
|--------|-----------|------|--------|
| pending | yellow-100 | yellow-800 | yellow-200 |
| accepted | green-100 | green-800 | green-200 |
| rejected | red-100 | red-800 | red-200 |
| cancelled | orange-100 | orange-800 | orange-200 |
| completed | blue-100 | blue-800 | blue-200 |
| expired | gray-100 | gray-800 | gray-200 |

---

**Última actualización**: Octubre 2025
