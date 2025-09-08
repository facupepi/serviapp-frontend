import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginAttempts, isBlocked } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Regístrate aquí
            </Link>
          </p>
        </div>

        {/* Controles de Debug */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-3">🔧 Herramientas</h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={fillUserCredentials}
              className="w-full px-3 py-2 bg-green-200 text-green-800 rounded text-sm hover:bg-green-300"
            >
              👤 Cargar credenciales
            </button>
            <div className="text-xs text-yellow-700">
              Intentos: {loginAttempts}/5 {isBlocked && '- BLOQUEADO'}
            </div>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-lg p-8">
          <div className="space-y-6">
            {errors.form && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <div className="text-sm text-red-700">{errors.form}</div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="button"
              onClick={handleLoginClick}
              disabled={loading || isBlocked}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                loading || isBlocked
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              } transition duration-150 ease-in-out`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </div>
              ) : isBlocked ? (
                'Cuenta bloqueada'
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
