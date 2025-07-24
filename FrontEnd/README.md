# 🚀 ServiApp Frontend

Frontend de la plataforma ServiApp desarrollado con React, TypeScript y Vite.

## 🛠️ Stack Tecnológico

- **React 18.3.1** - Biblioteca de UI con hooks modernos
- **TypeScript 5.5.3** - Tipado estático
- **Vite 5.4.1** - Build tool y dev server
- **Tailwind CSS 3.4.1** - Framework CSS utilitario
- **React Router Dom 7.7.0** - Enrutamiento SPA
- **Lucide React 0.344.0** - Iconos SVG

## 📦 Instalación y Configuración

### Prerrequisitos
```bash
Node.js >= 16.0.0
npm >= 8.0.0
```

### Instalación
```bash
# Clonar repositorio
git clone <repository-url>
cd "Proyecto ServiApp/FrontEnd"

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Scripts Disponibles
```bash
npm run dev      # Servidor de desarrollo (localhost:5173)
npm run build    # Build para producción
npm run lint     # Linting con ESLint
npm run preview  # Preview del build de producción
```

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── Header.tsx       # Navegación principal
│   ├── Footer.tsx       # Pie de página
│   ├── Hero.tsx         # Sección hero
│   ├── ServiceCategories.tsx
│   ├── FeaturedProviders.tsx
│   └── HowItWorks.tsx
├── contexts/            # Context API
│   └── AuthContext.tsx  # Estado global de autenticación
├── pages/              # Páginas de la aplicación
│   ├── Dashboard.tsx   # Panel principal (role-based)
│   ├── Login.tsx       # Inicio de sesión
│   ├── Register.tsx    # Registro de usuarios
│   ├── ServicesPage.tsx # Búsqueda y listado
│   ├── ServiceDetail.tsx # Detalle y reserva
│   ├── OfferService.tsx # Crear servicio (proveedores)
│   ├── MyServices.tsx  # Gestión de servicios
│   ├── FavoritesPage.tsx # Servicios favoritos
│   ├── UserRequestsPage.tsx # Solicitudes del cliente
│   ├── ProviderRequestsPage.tsx # Solicitudes del proveedor
│   └── ...             # Páginas adicionales
├── App.tsx             # Componente raíz
├── main.tsx           # Punto de entrada
└── index.css          # Estilos globales + Tailwind
```

## 🔧 Configuración de Desarrollo

### ESLint
```javascript
// eslint.config.js
export default tseslint.config({
  extends: [js.configs.recommended, ...tseslint.configs.recommended],
  files: ['**/*.{ts,tsx}'],
  ignores: ['dist'],
  // ...configuración personalizada
})
```

### Tailwind CSS
```javascript
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        // ...colores personalizados
      }
    },
  },
  plugins: [],
}
```

### TypeScript
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx"
  }
}
```

## 🎯 Arquitectura y Patrones

### Context API para Estado Global
```typescript
// AuthContext.tsx
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{success: boolean}>;
  // ...más métodos
}
```

### Tipado con TypeScript
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  isProvider?: boolean;
  // ...más propiedades
}

interface Service {
  id: string;
  title: string;
  providerId: string;
  // ...más propiedades
}
```

### Componentes Funcionales con Hooks
```typescript
export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // ...lógica del componente
}
```

## 🔒 Seguridad y Validación

### Protección de Rutas
```typescript
// Verificación en cada página protegida
if (!isAuthenticated || !user) {
  navigate('/login');
  return null;
}

// Verificación de roles
if (!user.isProvider) {
  navigate('/dashboard');
  return null;
}
```

### Validación de Formularios
```typescript
const validateForm = () => {
  const newErrors: Record<string, string> = {};
  
  if (!email.trim()) {
    newErrors.email = 'El email es requerido';
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    newErrors.email = 'El email no es válido';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Limitación de Intentos de Login
```typescript
// En AuthContext
const [loginAttempts, setLoginAttempts] = useState(0);
const [isBlocked, setIsBlocked] = useState(false);

const login = async (email: string, password: string) => {
  if (isBlocked) {
    return { success: false, error: 'Cuenta bloqueada' };
  }
  
  // ...lógica de login
  
  if (!success) {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    
    if (newAttempts >= 5) {
      setIsBlocked(true);
      setTimeout(() => {
        setIsBlocked(false);
        setLoginAttempts(0);
      }, 10 * 60 * 1000); // 10 minutos
    }
  }
};
```

## 📱 Responsive Design

### Breakpoints de Tailwind
```css
/* Mobile First */
.container {
  @apply px-4;              /* Base (mobile) */
  @apply sm:px-6;           /* ≥ 640px */
  @apply lg:px-8;           /* ≥ 1024px */
}

/* Grid responsivo */
.services-grid {
  @apply grid grid-cols-1;  /* Mobile: 1 columna */
  @apply md:grid-cols-2;    /* Tablet: 2 columnas */
  @apply lg:grid-cols-3;    /* Desktop: 3 columnas */
}
```

## 🎨 Sistema de Diseño

### Colores
```typescript
// Paleta principal
const colors = {
  primary: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
}
```

### Componentes Reutilizables
```typescript
// Ejemplo: StatCard
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);
```

## 🚀 Optimización y Performance

### Lazy Loading
```typescript
// Para rutas
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Para imágenes
<img 
  src={service.image} 
  alt={service.title}
  loading="lazy"
  className="w-full h-48 object-cover"
/>
```

### Memoización
```typescript
// useMemo para cálculos costosos
const filteredServices = useMemo(() => {
  return services.filter(service => 
    service.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [services, searchQuery]);

// useCallback para funciones
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query);
}, []);
```

## 🧪 Testing (Configuración Futura)

### Jest + React Testing Library
```javascript
// Ejemplo de test
describe('Login Component', () => {
  test('renders login form', () => {
    render(<Login />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
});
```

## 🌐 Deployment

### Build para Producción
```bash
npm run build
```

### Variables de Entorno
```bash
# .env
VITE_API_URL=https://api.serviapp.com
VITE_APP_NAME=ServiApp
```

### Configuración Vercel
```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 🐛 Debugging

### Herramientas de Desarrollo
- **React Developer Tools** - Inspección de componentes
- **Redux DevTools** - Estado de la aplicación (si se implementa)
- **Lighthouse** - Auditoría de performance

### Logging
```typescript
// En desarrollo
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

## 🔧 Troubleshooting

### Problemas Comunes

1. **Error de CORS**
   ```typescript
   // Configurar proxy en vite.config.ts
   export default defineConfig({
     server: {
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
