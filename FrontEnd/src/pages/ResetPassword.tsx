import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { resetPassword } = useAuth();

  useEffect(() => {
    console.log('🔑 ResetPassword montado con token:', token || 'NO TOKEN');
    console.log('🔑 Token type:', typeof token);
    console.log('🔑 Token length:', token?.length || 0);
    console.log('🔑 Token empty?', !token || token.trim() === '');
    
    if (!token || token.trim() === '') {
      console.error('❌ No se recibió token válido, redirigiendo a login');
      navigate('/login');
    } else {
      console.log('✅ Token válido recibido, continuando...');
    }
  }, [token, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else {
      if (password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      } else if (password.length > 16) {
        newErrors.password = 'La contraseña no puede tener más de 16 caracteres';
      } else if (!/[A-Z]/.test(password)) {
        newErrors.password = 'La contraseña debe tener al menos una mayúscula';
      } else if (!/[0-9]/.test(password)) {
        newErrors.password = 'La contraseña debe tener al menos un número';
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación exhaustiva del token
    if (!token || token.trim() === '') {
      console.error('❌ Token vacío en handleSubmit:', { token, type: typeof token, length: token?.length });
      setErrors({ submit: 'Token de recuperación inválido. Por favor, solicita un nuevo enlace.' });
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({}); // Limpiar errores previos

    try {
      console.log('🔒 Iniciando reset de contraseña...');
      console.log('🎫 Token para enviar:', token.length > 20 ? token.substring(0, 20) + '...' : token);
      console.log('🎫 Token length:', token.length);
      
      const result = await resetPassword(token, password, confirmPassword);
      
      if (result.success) {
        console.log('✅ Contraseña restablecida exitosamente:', result.message);
        setSuccess(true);
        // Redirigir a login después de 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        console.error('❌ Error al restablecer contraseña:', result.error);
        setErrors({ submit: result.error || 'Error al restablecer la contraseña' });
      }
    } catch (error) {
      console.error('Error inesperado en reset password:', error);
      setErrors({ submit: 'Error del servidor. Inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Enlace inválido
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              El enlace de recuperación no es válido o ha expirado. Por favor, solicita uno nuevo.
            </p>
            <button
              onClick={() => navigate('/forgot-password')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Solicitar nuevo enlace
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Contraseña actualizada
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Tu contraseña ha sido actualizada correctamente.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Nueva contraseña
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ingresa tu nueva contraseña
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Token Debug Info */}
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
          <h4 className="font-semibold mb-1">🔑 Token recibido:</h4>
          <p className="font-mono break-all">
            {token ? `${token.substring(0, 30)}${token.length > 30 ? '...' : ''}` : 'NO TOKEN'}
          </p>
          <p className="text-xs mt-1 text-blue-600">
            Longitud: {token?.length || 0} caracteres
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Nueva Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Nueva contraseña
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                Debe tener al menos 8 caracteres, una mayúscula y un número
              </p>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar nueva contraseña
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Repite tu nueva contraseña"
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

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}