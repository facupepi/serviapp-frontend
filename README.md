# 🚀 ServiApp - Plataforma de Servicios Profesionales

Una plataforma completa que conecta clientes con proveedores de servicios profesionales, desarrollada con React, TypeScript y Tailwind CSS.

![ServiApp Banner](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=ServiApp+-+Conectando+Profesionales)

## 📋 Tabla de Contenidos

- [🎯 Características](#-características)
- [🛠️ Tecnologías](#️-tecnologías)
- [📦 Instalación](#-instalación)
- [🚀 Uso](#-uso)
- [👥 Tipos de Usuario](#-tipos-de-usuario)
- [📱 Funcionalidades](#-funcionalidades)
- [🔧 Estructura del Proyecto](#-estructura-del-proyecto)
- [🎨 Diseño](#-diseño)
- [🔒 Seguridad](#-seguridad)
- [📸 Capturas de Pantalla](#-capturas-de-pantalla)
- [🚧 Funcionalidades Futuras](#-funcionalidades-futuras)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)

## 🎯 Características

### ✅ **Características Principales**

- **🔐 Sistema de Autenticación Completo**
  - Registro de usuarios con validación
  - Login seguro con limitación de intentos (5 máximo)
  - Recuperación de contraseña con tokens
  - Bloqueo temporal de cuentas (10 minutos)

- **🔍 Búsqueda Avanzada de Servicios**
  - Filtros por categoría, ubicación y precio
  - Paginación (10 servicios por página)
  - Sistema de favoritos
  - Badges "Services Líder" para proveedores destacados

- **📅 Sistema de Reservas**
  - Calendario interactivo de disponibilidad
  - Selección de horarios disponibles
  - Proceso de reserva en 3 pasos
  - Gestión de solicitudes en tiempo real

- **⭐ Sistema de Reseñas**
  - Calificaciones de 1 a 5 estrellas
  - Comentarios detallados
  - Historial de reseñas
  - Promedio de calificaciones

- **👥 Dashboards Diferenciados**
  - **Panel Cliente**: Búsqueda, favoritos, solicitudes
  - **Panel Proveedor**: Gestión de servicios, solicitudes recibidas
  - Estadísticas en tiempo real
  - Acciones rápidas personalizadas

### 🎯 **Funcionalidades Específicas por Rol**

#### **Para Clientes:**
- Explorar servicios con filtros avanzados
- Guardar servicios favoritos
- Solicitar servicios con calendario
- Seguimiento de solicitudes
- Sistema de reseñas post-servicio
- Dashboard personalizado con estadísticas

#### **Para Proveedores:**
- Crear y gestionar servicios
- Definir zonas de cobertura
- Configurar disponibilidad horaria
- Aceptar/rechazar solicitudes
- Ver estadísticas de rendimiento
- Gestionar perfil profesional

## 🛠️ Tecnologías

### **Frontend**
- ⚛️ **React 18** - Biblioteca de interfaz de usuario
- 🔷 **TypeScript** - Tipado estático para JavaScript
- 🚀 **Vite** - Herramienta de construcción rápida
- 🎨 **Tailwind CSS** - Framework de CSS utilitario
- 🧭 **React Router Dom** - Enrutamiento del lado del cliente
- 🎭 **Lucide React** - Biblioteca de iconos moderna

### **Estado y Persistencia**
- 🗃️ **Context API** - Gestión de estado global
- 💾 **localStorage** - Persistencia de datos local
- 🔄 **Custom Hooks** - Lógica reutilizable

### **Desarrollo**
- 📝 **ESLint** - Linter de código
- 🎯 **PostCSS** - Procesador de CSS
- 🔧 **TypeScript Config** - Configuración de tipos

## 📦 Instalación

### **Prerrequisitos**
- Node.js (versión 16 o superior)
- npm o yarn
- Git

### **Pasos de Instalación**

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/serviapp.git
cd serviapp/FrontEnd
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno** (opcional)
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

5. **Abrir en el navegador**
```
http://localhost:5173
```

### **Scripts Disponibles**

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Construcción
npm run build        # Construye para producción
npm run preview      # Vista previa de la construcción

# Linting
npm run lint         # Ejecuta ESLint
```

## 🚀 Uso

### **Usuarios de Prueba**

La aplicación incluye usuarios de prueba para facilitar las pruebas:

```bash
# Cliente de Prueba
Email: ana@email.com
Password: password123

# Proveedor de Prueba
Email: carlos@email.com
Password: password123
```

### **Flujo de Usuario Típico**

#### **Para Clientes:**
1. 🔐 **Registro/Login** → Crear cuenta o iniciar sesión
2. 🔍 **Explorar** → Buscar servicios usando filtros
3. ❤️ **Favoritos** → Guardar servicios de interés
4. 📅 **Reservar** → Solicitar servicio con fecha/hora
5. 📊 **Seguimiento** → Monitorear estado de solicitudes
6. ⭐ **Reseñar** → Calificar servicio completado

#### **Para Proveedores:**
1. 🔐 **Registro** → Crear cuenta como proveedor
2. ➕ **Crear Servicio** → Publicar nuevo servicio
3. 🗺️ **Configurar Zonas** → Definir áreas de cobertura
4. ⏰ **Disponibilidad** → Establecer horarios
5. 📥 **Gestionar Solicitudes** → Aceptar/rechazar pedidos
6. 📈 **Monitorear** → Ver estadísticas y rendimiento

## 👥 Tipos de Usuario

### **👤 Cliente Regular**
- Buscar y contratar servicios
- Gestionar favoritos y solicitudes
- Evaluar proveedores
- Dashboard con estadísticas personales

### **🔧 Proveedor de Servicios**
- Crear y gestionar servicios
- Configurar disponibilidad
- Recibir y gestionar solicitudes
- Panel de control empresarial

### **🏆 Services Líder**
- Proveedores destacados con badge especial
- Mayor visibilidad en búsquedas
- Confianza adicional para clientes

## 📱 Funcionalidades

### **🔍 Búsqueda y Filtros**
- **Búsqueda por texto**: Título, descripción, proveedor
- **Filtro por categoría**: 13+ categorías disponibles
- **Filtro geográfico**: Provincia y localidad
- **Ordenamiento**: Por relevancia, calificación, precio
- **Paginación**: 10 resultados por página

### **📅 Sistema de Reservas**
- **Calendario visual**: Selección fácil de fechas
- **Horarios disponibles**: Slots de tiempo configurables
- **Proceso paso a paso**: 3 pasos claros
- **Confirmación instantánea**: Notificación inmediata

### **⭐ Sistema de Calificaciones**
- **Estrellas**: Calificación de 1 a 5
- **Comentarios**: Feedback detallado
- **Promedio**: Cálculo automático
- **Historial**: Todas las reseñas visibles

### **📊 Estadísticas y Analytics**
- **Para Clientes**:
  - Total de solicitudes realizadas
  - Solicitudes pendientes/confirmadas
  - Servicios favoritos
  - Actividad reciente

- **Para Proveedores**:
  - Solicitudes recibidas
  - Tasa de aceptación
  - Servicios activos
  - Calificación promedio

## 🔧 Estructura del Proyecto

```
FrontEnd/
├── public/                 # Archivos estáticos
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── ServiceCategories.tsx
│   │   ├── FeaturedProviders.tsx
│   │   └── HowItWorks.tsx
│   ├── contexts/          # Context API
│   │   └── AuthContext.tsx
│   ├── pages/             # Páginas principales
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ServicesPage.tsx
│   │   ├── ServiceDetail.tsx
│   │   ├── OfferService.tsx
│   │   ├── MyServices.tsx
│   │   ├── FavoritesPage.tsx
│   │   ├── UserRequestsPage.tsx
│   │   ├── ProviderRequestsPage.tsx
│   │   └── ...
│   ├── App.tsx            # Componente principal
│   ├── main.tsx          # Punto de entrada
│   └── index.css         # Estilos globales
├── package.json          # Dependencias
├── vite.config.ts       # Configuración Vite
├── tailwind.config.js   # Configuración Tailwind
└── tsconfig.json        # Configuración TypeScript
```

## 🎨 Diseño

### **🎯 Principios de Diseño**
- **Mobile First**: Responsive en todos los dispositivos
- **Accesibilidad**: Colores contrastantes y navegación clara
- **Consistencia**: Sistema de diseño unificado
- **Usabilidad**: Interfaces intuitivas y flujos simples

### **🎨 Paleta de Colores**
- **Primario**: Azul (#3B82F6)
- **Secundario**: Gris (#6B7280)
- **Éxito**: Verde (#10B981)
- **Advertencia**: Amarillo (#F59E0B)
- **Error**: Rojo (#EF4444)

### **📱 Responsive**
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔒 Seguridad

### **🛡️ Medidas de Seguridad Implementadas**

- **Limitación de Intentos de Login**:
  - Máximo 5 intentos fallidos
  - Bloqueo temporal de 10 minutos
  - Contador visible de intentos restantes

- **Validación de Datos**:
  - Validación de email en tiempo real
  - Fortaleza de contraseñas
  - Sanitización de inputs

- **Protección de Rutas**:
  - Rutas protegidas por autenticación
  - Redirección automática
  - Verificación de roles

- **Almacenamiento Seguro**:
  - Tokens en localStorage
  - Limpieza automática al logout
  - Validación de sesión

## 📸 Capturas de Pantalla

### **🏠 Página Principal**
- Hero section con call-to-action
- Categorías de servicios
- Proveedores destacados
- Cómo funciona la plataforma

### **🔍 Búsqueda de Servicios**
- Grid de servicios con imágenes
- Filtros laterales
- Paginación
- Sistema de favoritos

### **📊 Dashboard Cliente**
- Estadísticas personales
- Acciones rápidas
- Actividad reciente
- Navegación intuitiva

### **🛠️ Dashboard Proveedor**
- Métricas de negocio
- Gestión de servicios
- Solicitudes pendientes
- Herramientas de administración

## 🚧 Funcionalidades Futuras

### **📈 Mejoras Planificadas**

- **💬 Sistema de Chat**
  - Comunicación directa cliente-proveedor
  - Notificaciones en tiempo real
  - Historial de conversaciones

- **💳 Integración de Pagos**
  - Múltiples métodos de pago
  - Pagos seguros online
  - Facturación automática

- **📱 Aplicación Móvil**
  - App nativa iOS/Android
  - Notificaciones push
  - Geolocalización

- **🤖 IA y Machine Learning**
  - Recomendaciones personalizadas
  - Detección de fraude
  - Optimización de precios

- **📊 Analytics Avanzado**
  - Dashboard de métricas
  - Reportes detallados
  - Insights de negocio

### **🔧 Mejoras Técnicas**

- **Backend Real**
  - API REST con Node.js
  - Base de datos PostgreSQL
  - Autenticación JWT

- **Testing**
  - Tests unitarios con Jest
  - Tests de integración
  - Tests E2E con Cypress

- **Performance**
  - Lazy loading
  - Optimización de imágenes
  - Service Workers

## 🤝 Contribución

### **🚀 Cómo Contribuir**

1. **Fork** el repositorio
2. **Crear** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abrir** un Pull Request

### **📋 Lineamientos**

- Seguir las convenciones de código existentes
- Escribir tests para nuevas funcionalidades
- Actualizar documentación según sea necesario
- Usar mensajes de commit descriptivos

### **🐛 Reportar Bugs**

- Usar el sistema de Issues de GitHub
- Incluir pasos para reproducir
- Adjuntar capturas de pantalla si es relevante
- Especificar navegador y versión

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 📞 Contacto

### **👨‍💻 Desarrollador**
- **GitHub**: [@tu-usuario](https://github.com/tu-usuario)
- **Email**: tu-email@ejemplo.com
- **LinkedIn**: [Tu Perfil](https://linkedin.com/in/tu-perfil)

### **🔗 Enlaces Útiles**
- **Demo en Vivo**: [https://serviapp-demo.vercel.app](https://serviapp-demo.vercel.app)
- **Documentación**: [https://docs.serviapp.com](https://docs.serviapp.com)
- **API Docs**: [https://api.serviapp.com/docs](https://api.serviapp.com/docs)

---

<div align="center">

**🌟 Si te gusta este proyecto, ¡dale una estrella! ⭐**

**Hecho con ❤️ por el equipo de ServiApp**

</div>
