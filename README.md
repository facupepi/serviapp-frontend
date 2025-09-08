# 🚀 ServiApp Frontend

Frontend de la plataforma ServiApp desarrollado con React, TypeScript y Vite. Una aplicación web completa para conectar usuarios con proveedores de servicios.

🌐 **Aplicación en vivo:** https://serviapp-frontend.vercel.app/
📦 **Repositorio:** https://github.com/facupepi/serviapp-frontend
🔗 **Backend API:** https://iycds2025api-production.up.railway.app/

## 👥 Desarrollado por

- **Facundo Pepino** - fpepino@facultad.sanfrancisco.utn.edu.ar
- **Santiago Villaba**
- **Mauricio Truchet**

*Universidad Tecnológica Nacional - Facultad Regional San Francisco*

## 🛠️ Stack Tecnológico

- **React 18.3.1** - Biblioteca de UI con hooks modernos y Context API
- **TypeScript 5.5.3** - Tipado estático y desarrollo type-safe
- **Vite 5.4.8** - Build tool y dev server ultrarrápido
- **Tailwind CSS 3.4.1** - Framework CSS utilitario responsive
- **React Router Dom 7.7.0** - Enrutamiento SPA con navegación programática
- **Axios** - Cliente HTTP con interceptores para autenticación
- **js-cookie** - Gestión segura de cookies para persistencia de sesión
- **Lucide React 0.344.0** - Iconos SVG optimizados

## 🏗️ Arquitectura de la Aplicación

### Estructura del Proyecto
```
src/
├── api/           # Configuración de API y endpoints
├── components/    # Componentes reutilizables
├── contexts/      # Context API para estado global
├── pages/         # Páginas principales de la aplicación
└── utils/         # Utilidades y helpers

public/           # Archivos estáticos
```

### Características Principales
- ✅ **Autenticación completa** - Registro, login, recuperación de contraseña
- ✅ **Gestión de estado global** - Context API con persistencia en cookies
- ✅ **Routing protegido** - Rutas públicas y privadas
- ✅ **Interfaz responsive** - Diseño móvil y desktop
- ✅ **Integración con backend** - API REST completa
- ✅ **Manejo de errores** - Interceptores y validaciones
- ✅ **Formularios dinámicos** - Todas las provincias argentinas
- ✅ **Sistema de favoritos** - Persistencia local
- ✅ **Dashboard unificado** - Panel de control para usuarios y proveedores

## 📦 Instalación y Configuración

### Prerrequisitos
```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### Instalación
```bash
# Clonar repositorio
git clone https://github.com/facupepi/serviapp-frontend.git
cd serviapp-frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Scripts Disponibles
```bash
npm run dev      # Servidor de desarrollo (localhost:5174)
npm run build    # Build para producción
npm run lint     # Linting con ESLint
npm run preview  # Preview del build de producción
```
## 🔐 Autenticación y Seguridad

### Sistema de Autenticación
- **JWT Tokens** - Autenticación basada en tokens
- **Cookies seguras** - Persistencia de sesión con js-cookie
- **Interceptores Axios** - Manejo automático de tokens
- **Protección de rutas** - Verificación de autenticación
- **Roles de usuario** - Sistema de permisos básico

### Credenciales de Prueba
```bash
Email: facujoel2018@gmail.com
Password: facujoel2018A
```

### Gestión de Estado de Autenticación
```typescript
// AuthContext.tsx - Estados principales
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);
const [isAuthenticated] = useState(!!user);

// Persistencia en cookies
const token = tokenStorage.getToken();
const userData = userStorage.getUser();
```

## 🌍 Integración con Backend

### API Endpoints
```typescript
// Base URL
const API_BASE = 'https://iycds2025api-production.up.railway.app';

// Endpoints principales
POST /api/user/register  # Registro de usuarios
POST /api/user/login     # Inicio de sesión
GET  /api/services       # Listado de servicios
POST /api/services       # Crear servicio
```

### Configuración Axios
```typescript
// api/auth.ts
const authAPI = axios.create({
  baseURL: 'https://iycds2025api-production.up.railway.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptores para manejo automático de tokens
authAPI.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 📱 Páginas y Funcionalidades

### Página Principal (Home)
- Hero section con llamada a la acción
- Categorías de servicios populares
- Proveedores destacados
- Cómo funciona la plataforma

### Autenticación
- **Login** - Autenticación con validación y límite de intentos
- **Registro** - Formulario completo con todas las provincias argentinas
- **Recuperación de contraseña** - Flujo completo de reset

### Dashboard Unificado
- **Estadísticas personalizadas** por tipo de usuario
- **Gestión de servicios** (para proveedores)
- **Solicitudes activas** (usuarios y proveedores)
- **Servicios favoritos**
- **Perfil y configuración**

### Servicios
- **Búsqueda avanzada** con filtros por categoría y ubicación
- **Detalle de servicios** con información completa del proveedor
- **Sistema de reservas** con selección de fecha y hora
- **Reseñas y calificaciones**

### Gestión para Proveedores
- **Crear servicios** con disponibilidad y zonas de cobertura
- **Gestionar solicitudes** - aceptar/rechazar reservas
- **Mi perfil de proveedor** con estadísticas

## 🎨 Diseño y UX

### Principios de Diseño
- **Mobile First** - Diseño responsivo desde mobile
- **Accesibilidad** - Contraste adecuado y navegación por teclado
- **Consistencia visual** - Sistema de diseño coherente
- **Feedback inmediato** - Loading states y mensajes de confirmación

### Componentes de UI
```typescript
// Ejemplos de componentes reutilizables
<StatCard />        # Tarjetas de estadísticas
<ServiceCard />     # Tarjetas de servicios
<LoadingSpinner />  # Indicadores de carga
<Alert />           # Mensajes de notificación
```

## 🔧 Configuración de Desarrollo

### Variables de Entorno
```bash
# Para desarrollo local
VITE_API_URL=https://iycds2025api-production.up.railway.app
```

### Configuración de Cookies
```typescript
// utils/storage.ts
const DEV_COOKIE_CONFIG = {
  expires: 7,
  secure: false,      // HTTP permitido en desarrollo
  sameSite: 'lax',    # Más permisivo para desarrollo
  path: '/',
};
```

## 🐛 Debugging y Troubleshooting

### Logs de Desarrollo
La aplicación incluye logging extensivo para debugging:

```typescript
// Logs de autenticación
🔄 Inicializando AuthContext
✅ Usuario restaurado desde storage
🔐 Iniciando proceso de login
💾 Guardando token en cookies
```

### Problemas Comunes y Soluciones

1. **Cookie no persiste al recargar**
   - Verificar configuración `sameSite` y `secure`
   - Confirmar que `path: '/'` está configurado

2. **Error 400 en login/registro**
   - Verificar formato de datos enviados
   - Confirmar headers `Content-Type: application/json`

3. **Redirección inesperada al login**
   - Verificar estado `loading` en componentes protegidos
   - Confirmar que `isAuthenticated` se evalúa después de la carga

### Herramientas de Debug
```typescript
// Debug en consola del navegador
console.log('🔍 Estado de autenticación:', {
  loading,
  isAuthenticated,
  user: user ? { id: user.id, email: user.email } : null,
  tokenExists: document.cookie.includes('authToken')
});
```

## 📊 Estado Actual del Proyecto

### ✅ Completado
- [x] Configuración inicial de React + TypeScript + Vite
- [x] Sistema de autenticación completo con backend
- [x] Gestión de estado global con Context API
- [x] Persistencia de sesión con cookies seguras
- [x] Todas las páginas principales implementadas
- [x] Formularios con validación completa
- [x] Sistema de rutas protegidas
- [x] Integración completa con API backend
- [x] Manejo de errores y estados de carga
- [x] Diseño responsive con Tailwind CSS
- [x] Debugging y logging para desarrollo

### 🔄 En Desarrollo
- [ ] Tests unitarios con Jest + Testing Library
- [ ] Optimización de performance
- [ ] PWA capabilities
- [ ] Notificaciones push

### 🎯 Próximas Mejoras
- [ ] Sistema de chat en tiempo real
- [ ] Integración con pasarelas de pago
- [ ] Geolocalización avanzada
- [ ] Sistema de notificaciones por email

## 📝 Notas de Desarrollo

### Patrones Implementados
- **Context API** para estado global
- **Custom Hooks** para lógica reutilizable
- **Compound Components** para componentes complejos
- **Error Boundaries** para manejo de errores
- **Loading States** para mejor UX

### Mejores Prácticas
- Tipado estricto con TypeScript
- Componentes funcionales con hooks
- Separación de responsabilidades
- Código limpio y documentado
- Manejo consistente de errores

---

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork del repositorio
2. Crear una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto es parte del curso de Ingeniería y Calidad de Software de la UTN-FRSF.

---

**Desarrollado con ❤️ por el equipo de ServiApp**
       proxy: {
         '/api': 'http://localhost:3000'
       }
     }
   })
   ```

2. **Problemas con TypeScript**
   ```bash
   # Limpiar caché de TypeScript
   npx tsc --build --clean
   ```

3. **Problemas con Tailwind**
   ```bash
   # Regenerar estilos
   npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch
   ```

## 📚 Recursos Adicionales

- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide)

---

**Desarrollado con ❤️ usando las mejores prácticas de React y TypeScript**
