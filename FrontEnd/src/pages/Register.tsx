import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getProvinces } from '../data/argentina';
import Alert from '../components/Alert';

export default function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    province: '',
    locality: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  // Mover este estado arriba del return condicional para no romper el orden de hooks
  const [successMessage, setSuccessMessage] = useState('');

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

  const provinces = getProvinces();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar nombre (mínimo 2, máximo 100 caracteres)
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'El nombre no puede tener más de 100 caracteres';
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    // Validar contraseña (8-16 caracteres, una mayúscula, un número)
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else {
      if (formData.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      } else if (formData.password.length > 16) {
        newErrors.password = 'La contraseña no puede tener más de 16 caracteres';
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'La contraseña debe tener al menos una mayúscula';
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = 'La contraseña debe tener al menos un número';
      }
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar provincia (mínimo 2, máximo 100 caracteres)
    if (!formData.province) {
      newErrors.province = 'La provincia es obligatoria';
    }

    // Validar localidad (mínimo 2, máximo 100 caracteres)
    if (!formData.locality.trim()) {
      newErrors.locality = 'La localidad es obligatoria';
    } else if (formData.locality.trim().length < 2) {
      newErrors.locality = 'La localidad debe tener al menos 2 caracteres';
    } else if (formData.locality.trim().length > 100) {
      newErrors.locality = 'La localidad no puede tener más de 100 caracteres';
    }

    // Validar teléfono (opcional, pero si se proporciona debe tener 10-20 caracteres)
    if (formData.phone && (formData.phone.length < 10 || formData.phone.length > 20)) {
      newErrors.phone = 'El teléfono debe tener entre 10 y 20 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({}); // Limpiar errores previos
    setSuccessMessage('');

    try {
      const result = await register(formData);
      
      if (result.success) {
        if (result.requiresLogin) {
          // Registro exitoso pero requiere login por separado
          setSuccessMessage(result.message || 'Cuenta creada exitosamente. Por favor, inicia sesión.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          // Registro exitoso con autenticación automática
          setSuccessMessage('¡Bienvenido a ServiApp! Tu cuenta ha sido creada exitosamente.');
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      } else {
        // Mostrar error específico del backend
        setErrors({ general: result.error || 'Error al registrarse. Intenta nuevamente.' });
      }
    } catch (error) {
      console.error('Error durante el registro:', error);
      setErrors({ general: 'Error de conexión. Verifica tu internet e intenta nuevamente.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar errores del campo específico y error general
    if (errors[field] || errors.general) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        delete newErrors.general;
        return newErrors;
      });
    }
    // Limpiar mensaje de éxito si el usuario empieza a escribir
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  // Función para llenar datos del usuario
  const fillTestData = () => {
    setFormData({
      name: 'Facundo Joel',
      email: 'facujoel2018@gmail.com',
      password: 'facujoel2018A',
      confirmPassword: 'facujoel2018A',
      phone: '+54 11 1234-5678',
      province: 'Buenos Aires',
      locality: 'Capital Federal'
    });
    setErrors({});
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Crear cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Inicia sesión aquí
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Herramientas de desarrollo */}
          <div className="mb-4">
            <button
              type="button"
              onClick={fillTestData}
              className="w-full px-4 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 border border-green-300"
            >
              👤 Llenar datos del usuario
            </button>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Mensaje de éxito */}
            {successMessage && (
              <Alert 
                type="success" 
                title="¡Registro exitoso!"
                message={successMessage}
                onClose={() => setSuccessMessage('')}
              />
            )}

            {/* Mensaje de error general */}
            {errors.general && (
              <Alert 
                type="error" 
                title="Error en el registro"
                message={errors.general}
                onClose={() => setErrors(prev => ({ ...prev, general: '' }))}
              />
            )}

            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nombre completo *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Tu nombre completo"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico *
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
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña *
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
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              <p className="mt-1 text-xs text-gray-500">
                Debe tener 8-16 caracteres, una mayúscula y un número
              </p>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar contraseña *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Repite tu contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Teléfono (opcional)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+54 11 1234-5678"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* Provincia */}
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                Provincia *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="province"
                  name="province"
                  required
                  value={formData.province}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.province ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona tu provincia</option>
                  {provinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>
              {errors.province && <p className="mt-1 text-sm text-red-600">{errors.province}</p>}
            </div>

            {/* Localidad */}
            <div>
              <label htmlFor="locality" className="block text-sm font-medium text-gray-700">
                Localidad *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="locality"
                  name="locality"
                  type="text"
                  required
                  value={formData.locality}
                  onChange={(e) => handleInputChange('locality', e.target.value)}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.locality ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Tu localidad"
                />
              </div>
              {errors.locality && <p className="mt-1 text-sm text-red-600">{errors.locality}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando cuenta...
                  </>
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}