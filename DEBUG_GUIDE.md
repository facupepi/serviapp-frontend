# 🐛 Guía de Debugging - ServiApp Frontend

*Actualizado: Septiembre 8, 2025*

## 🎯 Estado Actual del Sistema

### ✅ **Problemas Resueltos**
- [x] Error 400 en registro - Backend funcionando correctamente
- [x] Sistema de autenticación JWT implementado
- [x] Persistencia de sesión con cookies seguras
- [x] Redirección prematura al login (flash de carga)
- [x] Doble validación de token en Dashboard
- [x] Configuración de cookies para desarrollo y producción

### � **Sistema Funcionando**
- [x] Registro de usuarios con todas las provincias argentinas
- [x] Login con credenciales: `facujoel2018@gmail.com` / `facujoel2018A`
- [x] Persistencia de sesión al recargar página
- [x] Dashboard unificado con navegación correcta
- [x] Interceptores Axios para manejo automático de tokens

## 📊 Sistema de Logging Implementado

### 1. **AuthContext Debugging**
```typescript
// Inicialización del contexto
🔄 Inicializando AuthContext: {hasToken: true, hasUserData: true, tokenLength: 213}
✅ Usuario restaurado desde storage: facujoel2018@gmail.com
✅ AuthContext inicialización completada, loading = false

// Proceso de login
🔐 Iniciando proceso de login...
✅ Login exitoso, usuario guardado: facujoel2018@gmail.com

// Creación de usuario básico desde token
🔧 Token existe pero no hay datos de usuario, creando usuario básico...
✅ Usuario básico creado desde token: {id: "10", email: "usuario@correo.com"}
```

### 2. **API Debugging (`src/api/auth.ts`)**
```typescript
// Peticiones HTTP
🚀 Enviando datos de login: {email: 'facujoel2018@gmail.com', password: 'facujoel2018A'}
📡 URL: https://iycds2025api-production.up.railway.app/api/user/login
✅ Respuesta de login exitosa: {token: 'eyJhbGciOiJIUzI1NiIs...'}

// Errores detallados
❌ Error en login: AxiosError
📊 Error response: {status: 400, data: {...}}
📋 Response data: {message: "Invalid credentials"}
```

### 3. **Storage Debugging (`src/utils/storage.ts`)**
```typescript
// Gestión de cookies
💾 Guardando token en cookies: eyJhbGciOiJIUzI1NiIs...
✅ Token verificado en cookies: eyJhbGciOiJIUzI1NiIs...

// Configuración de entorno
� Configuración de cookies para desarrollo: {secure: false, sameSite: 'lax'}
```

### 4. **Dashboard Navigation (`src/pages/Dashboard.tsx`)**
```typescript
// Estado de autenticación
🔍 Estado de autenticación: {loading: false, isAuthenticated: true, user: {...}}

// Navegación (solo cuando es necesario)
🚪 Redirigiendo a login - no autenticado
```

## 🧪 Casos de Prueba Verificados

### 1. **Login y Persistencia de Sesión**
```bash
✅ FUNCIONA: Login con credenciales correctas
✅ FUNCIONA: Persistencia de sesión al recargar página
✅ FUNCIONA: Navegación sin flash de redirección
✅ FUNCIONA: Logout y limpieza de cookies
```

### 2. **Registro de Usuarios**
```bash
✅ FUNCIONA: Formulario con todas las provincias argentinas
✅ FUNCIONA: Validación de campos obligatorios
✅ FUNCIONA: Comunicación con backend
✅ FUNCIONA: Redirección post-registro
```

### 3. **Gestión de Errores**
```bash
✅ FUNCIONA: Manejo de errores 400/401/500
✅ FUNCIONA: Mensajes de error amigables al usuario
✅ FUNCIONA: Logging detallado para debugging
✅ FUNCIONA: Interceptores Axios para tokens expirados
```

## 🔧 Configuración de Debugging

### DevTools Setup
1. **Abrir DevTools**: F12 en el navegador
2. **Console Tab**: Ver todos los logs de la aplicación
3. **Network Tab**: Monitorear peticiones HTTP
4. **Application Tab**: Verificar cookies y localStorage

### Variables de Debug
```typescript
// En desarrollo, todos los logs están habilitados
const DEBUG_AUTH = true;
const DEBUG_API = true;
const DEBUG_STORAGE = true;
const DEBUG_NAVIGATION = true;
```

## 🎯 Flujos de Debug Principales

### 1. **Debug de Autenticación**
```typescript
// Paso a paso para debuggear login
1. Abrir /login
2. Llenar formulario con credenciales de prueba
3. Observar logs en consola:
   - 🔐 Iniciando proceso de login...
   - 🚀 Enviando datos de login: {...}
   - ✅ Respuesta de login exitosa: {...}
   - 💾 Guardando token en cookies: ...
   - ✅ Login exitoso, usuario guardado: ...
4. Verificar redirección a /dashboard
5. Recargar página y verificar persistencia
```

### 2. **Debug de Persistencia de Sesión**
```typescript
// Verificar cookies y restauración de usuario
1. Hacer login exitoso
2. Recargar página (F5)
3. Observar logs de inicialización:
   - 🔄 Inicializando AuthContext: {hasToken: true, hasUserData: true}
   - ✅ Usuario restaurado desde storage: email
   - ✅ AuthContext inicialización completada, loading = false
4. Verificar que NO aparece "🚪 Redirigiendo a login"
```

### 3. **Debug de Problemas de Cookie**
```typescript
// Si las cookies no persisten
1. Verificar en DevTools > Application > Cookies
2. Buscar cookie 'authToken'
3. Verificar configuración:
   - Desarrollo: secure=false, sameSite=lax
   - Producción: secure=true, sameSite=strict
4. Revisar logs de storage:
   - 💾 Guardando token en cookies: ...
   - ✅ Token verificado en cookies: ...
```

## 🚨 Problemas Conocidos y Soluciones

### 1. **Flash de Redirección (RESUELTO)**
**Problema**: Dashboard redirige al login antes de cargar el usuario
**Solución**: Implementado estado `loading` en AuthContext
```typescript
// ANTES
if (!isAuthenticated || !user) {
  navigate('/login');
}

// DESPUÉS  
if (!loading && (!isAuthenticated || !user)) {
  navigate('/login');
}
```

### 2. **Cookies No Persisten (RESUELTO)**
**Problema**: Sesión se pierde al recargar página
**Solución**: Configuración correcta de cookies por entorno
```typescript
const DEV_COOKIE_CONFIG = {
  expires: 7,
  secure: false,    // HTTP permitido en desarrollo
  sameSite: 'lax',  // Más permisivo para desarrollo
  path: '/',        // Disponible en toda la app
};
```

### 3. **Token Existe Pero Sin Usuario (RESUELTO)**
**Problema**: Token válido pero no hay datos de usuario guardados
**Solución**: Crear usuario básico desde JWT payload
```typescript
if (token && !userData) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const basicUser = {
    id: payload.id?.toString(),
    email: 'usuario@correo.com', // Default
    // ... más campos
  };
  setUser(basicUser);
  userStorage.setUser(basicUser);
}
```

## 🔍 Herramientas de Debug Avanzado

### 1. **React Developer Tools**
- Inspeccionar estado del AuthContext
- Verificar props y state de componentes
- Monitorear re-renders

### 2. **Network Monitoring**
```bash
# En DevTools > Network
- Filtrar por XHR/Fetch
- Verificar headers de Authorization
- Revisar status codes y responses
```

### 3. **Console Commands**
```typescript
// Verificar estado actual en consola
console.log('Auth State:', {
  token: document.cookie.includes('authToken'),
  user: localStorage.getItem('userData'),
  isAuthenticated: !!document.cookie.match(/authToken/)
});
```

## � Checklist de Debug

### Pre-Debug
- [ ] DevTools abierto en pestaña Console
- [ ] Network tab habilitado para monitorear peticiones
- [ ] Usuario de prueba: `facujoel2018@gmail.com` / `facujoel2018A`

### Durante Pruebas
- [ ] Logs de inicialización de AuthContext aparecen
- [ ] Peticiones HTTP tienen status 200
- [ ] Cookies se guardan correctamente
- [ ] No hay errores en consola
- [ ] Navegación funciona sin flash

### Post-Debug
- [ ] Sesión persiste al recargar página
- [ ] Logout limpia completamente el estado
- [ ] Errores se manejan correctamente
- [ ] UX es fluida sin interrupciones

## 🎯 Próximos Pasos de Debugging

### 1. **Performance Monitoring**
- Implementar métricas de tiempo de carga
- Monitorear re-renders innecesarios
- Optimizar llamadas a API

### 2. **Error Tracking**
- Implementar error boundaries
- Logging de errores a servicio externo
- Alertas automáticas para errores críticos

### 3. **User Experience Debug**
- Heatmap de interacciones
- Métricas de conversión
- Feedback de usuarios

---

## � Contacto para Debug

Para reportar bugs o solicitar ayuda con debugging:
- **Desarrollador Principal**: Facundo Pepino - fpepino@facultad.sanfrancisco.utn.edu.ar
- **Repositorio**: https://github.com/facupepi/serviapp-frontend

**Última actualización**: Septiembre 8, 2025

### **Validación de Datos**
- ✅ Trim de espacios en blanco
- ✅ Email en minúsculas
- ✅ Validación de campos requeridos
- ✅ Phone opcional solo si tiene valor

### **Formato de Datos**
```typescript
// Antes
{
  phone: userData.phone || undefined  // ❌ Podía enviar undefined
}

// Después
if (userData.phone && userData.phone.trim()) {
  backendUserData.phone = userData.phone.trim();  // ✅ Solo si tiene valor
}
```

### **Manejo de Errores**
- ✅ Error 400: Muestra detalles específicos
- ✅ Logs completos del error response
- ✅ Mensaje de error más descriptivo

## 🔧 Posibles Causas del Error 400

### 1. **Campo Faltante**
```json
// El backend espera:
{
  "name": "string",     // ✅ Requerido
  "email": "string",    // ✅ Requerido  
  "password": "string", // ✅ Requerido
  "confirm_password": "string", // ✅ Requerido
  "locality": "string", // ✅ Requerido
  "province": "string", // ✅ Requerido
  "phone": "string"     // ❓ Opcional
}
```

### 2. **Formato Incorrecto**
- Email sin formato válido
- Contraseña que no cumple validaciones del backend
- Campos con espacios extra

### 3. **Validaciones del Backend**
- Longitud mínima/máxima de campos
- Email ya registrado
- Validaciones de formato específicas

## 📋 Checklist de Debug

- [ ] Abrir DevTools y ver logs en Console
- [ ] Completar formulario con datos de prueba
- [ ] Verificar que los datos se formateen correctamente
- [ ] Ver el error exacto del backend
- [ ] Comparar con estructura esperada del backend

## 🚀 Siguiente Paso

Una vez que tengas los logs, podremos ver:
1. Qué datos exactos se están enviando
2. Qué respuesta específica da el backend
3. Ajustar el formato de datos según sea necesario
