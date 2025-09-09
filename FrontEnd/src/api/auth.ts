// Configuración del API
const API_BASE_URL = 'https://iycds2025api-production.up.railway.app';

// Tipos para las interfaces del backend
export interface UserRegister {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  locality: string;
  province: string;
  phone?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    locality: string;
    province: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

// Configuración de axios
import axios from 'axios';
import { tokenStorage } from '../utils/storage';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 segundos timeout
  withCredentials: false, // Por si hay problemas con CORS
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido, limpiar cookies
      // NOTA: NO forzamos navegación aquí para evitar reloads
      // La lógica de redirección se maneja en el AuthContext
      tokenStorage.removeToken();
      localStorage.removeItem('userData');
      console.log('🚫 Token inválido/expirado - datos limpiados');
    }
    return Promise.reject(error);
  }
);

export default api;

// Funciones del API
export const authAPI = {
  register: async (userData: UserRegister): Promise<ApiResponse<AuthResponse>> => {
    try {
      // Log detallado para debugging
      console.log('🚀 Enviando datos de registro:', userData);
      console.log('📡 URL:', `${API_BASE_URL}/api/user/register`);
      
      const response = await api.post('/api/user/register', userData);
      console.log('✅ Respuesta exitosa:', response.data);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      // Log detallado del error
      console.error('❌ Error en registro:', error);
      console.error('📊 Error response:', error.response);
      console.error('📋 Error data:', error.response?.data);
      console.error('🔢 Status code:', error.response?.status);
      
      // Manejo específico de errores
      let errorMessage = 'Error al registrarse';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        console.log('🔍 Analizando error con status:', status);
        console.log('🔍 Data del error:', data);
        
        switch (status) {
          case 400:
            // Error 400 - Bad Request, mostrar detalles específicos
            if (data?.message) {
              errorMessage = data.message;
            } else if (data?.error) {
              errorMessage = data.error;
            } else if (data?.errors) {
              // Si hay múltiples errores de validación
              errorMessage = Array.isArray(data.errors) 
                ? data.errors.join(', ') 
                : JSON.stringify(data.errors);
            } else {
              errorMessage = 'Datos inválidos. Verifica que todos los campos estén completos y correctos.';
            }
            break;
          case 409:
            errorMessage = 'El email ya está registrado. Usa otro email o inicia sesión.';
            break;
          case 422:
            errorMessage = data?.message || 'Los datos no cumplen con los requisitos del servidor.';
            break;
          case 429:
            errorMessage = 'Demasiados intentos. Espera un momento antes de intentar nuevamente.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intenta más tarde.';
            break;
          default:
            errorMessage = data?.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      } else {
        errorMessage = error.message || 'Error inesperado';
      }

      console.error('💬 Mensaje de error final:', errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  login: async (credentials: UserLogin): Promise<ApiResponse<AuthResponse>> => {
    try {
      console.log('🚀 Enviando datos de login:', credentials);
      console.log('📡 URL:', `${API_BASE_URL}/api/user/login`);
      
      const response = await api.post('/api/user/login', credentials);
      console.log('✅ Respuesta de login exitosa:', response.data);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      console.error('📊 Error response:', error.response);
      console.error('📋 Error data:', error.response?.data);
      console.error('🔢 Status code:', error.response?.status);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            errorMessage = 'Email o contraseña requeridos.';
            break;
          case 401:
            errorMessage = 'Email o contraseña incorrectos.';
            break;
          case 404:
            errorMessage = 'Usuario no encontrado.';
            break;
          case 429:
            errorMessage = 'Demasiados intentos. Espera un momento antes de intentar nuevamente.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intenta más tarde.';
            break;
          default:
            errorMessage = data?.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      } else {
        errorMessage = error.message || 'Error inesperado';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  forgotPassword: async (email: string): Promise<ApiResponse> => {
    try {
      console.log('📧 Enviando solicitud de recuperación de contraseña para:', email);
      console.log('📡 URL:', `${API_BASE_URL}/api/user/forgot-password`);
      
      const response = await api.post('/api/user/forgot-password', { 
        email 
      });
      
      console.log('✅ Solicitud de recuperación enviada exitosamente');
      
      return {
        success: true,
        message: response.data?.message || 'Se ha enviado un correo con instrucciones para restablecer tu contraseña',
      };
    } catch (error: any) {
      console.error('❌ Error en forgot password:', error);
      console.error('📊 Error response:', error.response);
      console.error('📋 Error data:', error.response?.data);
      
      let errorMessage = 'Error al enviar correo de recuperación';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            errorMessage = 'Email requerido. Por favor ingresa un email válido.';
            break;
          case 404:
            errorMessage = 'No existe una cuenta asociada a este email.';
            break;
          case 429:
            errorMessage = 'Demasiadas solicitudes. Espera un momento antes de intentar nuevamente.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intenta más tarde.';
            break;
          default:
            errorMessage = data?.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      } else {
        errorMessage = error.message || 'Error inesperado';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse> => {
    try {
      console.log('🔒 Enviando solicitud de reset de contraseña');
      console.log('📡 URL:', `${API_BASE_URL}/api/user/reset-password`);
      
      // Validación de token antes de enviar
      if (!token || token.trim() === '') {
        console.error('❌ Token vacío o inválido:', { token, length: token?.length });
        return {
          success: false,
          error: 'Token de recuperación inválido. Por favor, solicita un nuevo enlace de recuperación.'
        };
      }
      
      console.log('🎫 Token recibido:', token.length > 20 ? token.substring(0, 20) + '...' : token);
      console.log('🎫 Token length:', token.length);
      
      // Payload que coincide exactamente con la estructura del backend
      const payload = {
        token: token.trim(),
        new_password: newPassword
      };
      
      console.log('📦 Payload enviado:', { 
        token: payload.token.length > 20 ? payload.token.substring(0, 20) + '...' : payload.token,
        new_password: '[HIDDEN]',
        token_length: payload.token.length 
      });
      
      const response = await api.post('/api/user/reset-password', payload);
      
      console.log('✅ Contraseña restablecida exitosamente');
      
      return {
        success: true,
        message: response.data?.message || 'Tu contraseña ha sido actualizada exitosamente',
      };
    } catch (error: any) {
      console.error('❌ Error en reset password:', error);
      console.error('📊 Error response:', error.response);
      console.error('📋 Error data:', error.response?.data);
      
      let errorMessage = 'Error al restablecer contraseña';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        console.log('🔍 Analizando error - Status:', status);
        console.log('🔍 Analizando error - Data:', data);
        console.log('🔍 Message from backend:', data?.message);
        console.log('🔍 Error from backend:', data?.error);
        
        switch (status) {
          case 400:
            // Analizar el mensaje específico para determinar si es token vencido
            const backendMessage = data?.message || data?.error || '';
            console.log('🔍 Backend message for analysis:', backendMessage);
            
            if (backendMessage.toLowerCase().includes('token') && 
                (backendMessage.toLowerCase().includes('expired') || 
                 backendMessage.toLowerCase().includes('vencido') ||
                 backendMessage.toLowerCase().includes('expirado') ||
                 backendMessage.toLowerCase().includes('invalid') ||
                 backendMessage.toLowerCase().includes('inválido'))) {
              errorMessage = '⏰ El enlace de recuperación ha expirado. Por favor, solicita un nuevo enlace de recuperación de contraseña.';
            } else if (backendMessage.toLowerCase().includes('token')) {
              errorMessage = '🔑 El enlace de recuperación no es válido. Por favor, solicita un nuevo enlace de recuperación de contraseña.';
            } else if (backendMessage.toLowerCase().includes('password') || backendMessage.toLowerCase().includes('contraseña')) {
              errorMessage = '🔒 La contraseña no cumple con los requisitos. Debe tener entre 8 y 16 caracteres, incluir al menos una mayúscula y un número.';
            } else {
              errorMessage = data?.message || data?.error || '❌ Token o contraseña inválidos. Verifica que el enlace no haya expirado y que la contraseña cumpla los requisitos.';
            }
            break;
          case 404:
            errorMessage = '🔗 El enlace de recuperación no es válido o ha expirado. Por favor, solicita un nuevo enlace.';
            break;
          case 422:
            errorMessage = 'La contraseña debe tener entre 8 y 16 caracteres.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intenta más tarde.';
            break;
          default:
            errorMessage = data?.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      } else {
        errorMessage = error.message || 'Error inesperado';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};
