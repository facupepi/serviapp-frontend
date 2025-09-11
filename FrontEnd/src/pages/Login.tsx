import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginAttempts, isBlocked, isAuthenticated, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Redirigir si el usuario ya está autenticado
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      console.log('✅ Usuario ya autenticado, redirigiendo al dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  // Mostrar loading mientras se verifica autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función de login completamente aislada
  const performLogin = async () => {    
    try {
      if (loading) {
        return;
      }
      
      if (isBlocked) {
        setErrors({ form: 'Cuenta bloqueada por múltiples intentos fallidos' });
        return;
      }

      if (!validateForm()) {
        return;
      }

      setLoading(true);
      setErrors({});
      
      try {
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          // Usar setTimeout para evitar cualquier problema de timing
          setTimeout(() => {
            navigate('/dashboard');
          }, 100);
        } else {
          setErrors({ form: result.error || 'Error al iniciar sesión' });
        }
      } catch (loginError) {
        console.error('Error en llamada login:', loginError);
        setErrors({ form: 'Error de comunicación con el servidor' });
      }
    } catch (outerError) {
      console.error('Error externo en performLogin:', outerError);
      setErrors({ form: 'Error inesperado del sistema' });
    } finally {
      setLoading(false);
    }
  };

  // Handler para el botón - NO debe hacer nada más que llamar performLogin
  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    
    // Envolver en try-catch adicional para prevenir cualquier error no capturado
    try {
      performLogin();
    } catch (error) {
      console.error('Error en handleLoginClick:', error);
      setErrors({ form: 'Error inesperado al procesar login' });
      setLoading(false);
    }
  };

  // Handler para Enter en inputs
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      
      // Envolver en try-catch adicional para prevenir cualquier error no capturado
      try {
        performLogin();
      } catch (error) {
        console.error('Error en handleKeyPress:', error);
        setErrors({ form: 'Error inesperado al procesar login' });
        setLoading(false);
      }
    }
  };

  // Función para cargar credenciales del usuario
  const fillUserCredentials = () => {
    setFormData({
      email: 'facujoel2018@gmail.com',
      password: 'facujoel2018A'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Iniciar Sesión
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Regístrate aquí
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Herramientas de desarrollo */}
          <div className="mb-4">
            <button
              type="button"
              onClick={fillUserCredentials}
              className="w-full px-4 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 border border-green-300"
            >
              👤 Cargar credenciales
            </button>
          </div>

          <form className="space-y-6">
            {/* Mensaje de error general */}
            {errors.form && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-red-700">{errors.form}</div>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Link de recuperar contraseña */}
            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botón de submit */}
            <div>
              <button
                type="button"
                onClick={handleLoginClick}
                disabled={loading || isBlocked}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading || isBlocked
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Iniciando sesión...
                  </div>
                ) : isBlocked ? (
                  'Cuenta bloqueada'
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>

            {/* Información adicional para desarrollo */}
            {(loginAttempts > 0 || isBlocked) && (
              <div className="mt-4 text-center">
                <div className="text-xs text-gray-500">
                  Intentos: {loginAttempts}/5 {isBlocked && '- BLOQUEADO'}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
