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

// Interfaces para servicios
export interface ServiceData {
  title: string;
  description: string;
  category: string;
  price: number;
  availability: {
    [key: string]: {
      start?: string;
      end?: string;
      available?: boolean;
    };
  };
  zones: {
    province: string;
    locality: string;
    neighborhood?: string;
  }[];
  image_url: string;
}

export interface ServiceResponse {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  availability: any;
  zones: any[];
  status: 'active' | 'inactive';
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface CategoriesResponse {
  categories: string[];
  message: string;
}

export interface ServicesListResponse {
  message: string;
  data: {
    services: ServiceResponse[];
    total: number;
  };
}

export interface SingleServiceResponse {
  message: string;
  data: ServiceResponse;
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
            // Analizar el mensaje específico para determinar el tipo de error
            const backendMessage = data?.message || data?.error || '';
            console.log('🔍 Backend message for analysis:', backendMessage);
            
            if (backendMessage.toLowerCase().includes('already been used') || 
                backendMessage.toLowerCase().includes('ya fue utilizado') ||
                backendMessage.toLowerCase().includes('ya se usó')) {
              errorMessage = '🔄 Este enlace de recuperación ya fue utilizado. Cada enlace solo puede usarse una vez por seguridad. Por favor, solicita un nuevo enlace si necesitas cambiar tu contraseña nuevamente.';
            } else if (backendMessage.toLowerCase().includes('token') && 
                       (backendMessage.toLowerCase().includes('expired') || 
                        backendMessage.toLowerCase().includes('vencido') ||
                        backendMessage.toLowerCase().includes('expirado'))) {
              errorMessage = '⏰ El enlace de recuperación ha expirado. Por favor, solicita un nuevo enlace de recuperación de contraseña.';
            } else if (backendMessage.toLowerCase().includes('token') && 
                       (backendMessage.toLowerCase().includes('invalid') ||
                        backendMessage.toLowerCase().includes('inválido') ||
                        backendMessage.toLowerCase().includes('not found') ||
                        backendMessage.toLowerCase().includes('no encontrado'))) {
              errorMessage = '🔑 El enlace de recuperación no es válido. Por favor, solicita un nuevo enlace de recuperación de contraseña.';
            } else if (backendMessage.toLowerCase().includes('password') || backendMessage.toLowerCase().includes('contraseña')) {
              errorMessage = '🔒 La contraseña no cumple con los requisitos. Debe tener entre 8 y 16 caracteres, incluir al menos una mayúscula y un número.';
            } else {
              errorMessage = data?.message || data?.error || '❌ Error al procesar la solicitud. Verifica que el enlace sea válido y que la contraseña cumpla los requisitos.';
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

  // Funciones de servicios
  createService: async (serviceData: ServiceData): Promise<ApiResponse<ServiceResponse>> => {
    try {
      console.log('🚀 Creando servicio:', serviceData);
      const response = await api.post('/api/services', serviceData);
      console.log('✅ Servicio creado:', response.data);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error('❌ Error creando servicio:', error);
      let errorMessage = 'Error al crear el servicio';
      
      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 400:
            errorMessage = data?.message || 'Datos del servicio inválidos. Verifica todos los campos.';
            break;
          case 401:
            errorMessage = 'Debes estar autenticado para crear servicios.';
            break;
          case 422:
            errorMessage = data?.message || 'Los datos no cumplen con las validaciones requeridas.';
            break;
          case 429:
            errorMessage = 'Demasiadas solicitudes. Intenta más tarde.';
            break;
          default:
            errorMessage = data?.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  updateService: async (serviceId: string, serviceData: Partial<ServiceData>): Promise<ApiResponse<ServiceResponse>> => {
    try {
      console.log('🔄 Actualizando servicio:', serviceId);
      console.log('📤 Datos a enviar:', JSON.stringify(serviceData, null, 2));
      const response = await api.put(`/api/services/${serviceId}`, serviceData);
      console.log('✅ Respuesta exitosa:', response.data);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error('❌ Error actualizando servicio:', error);
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      console.error('❌ Response headers:', error.response?.headers);
      
      let errorMessage = 'Error al actualizar el servicio';
      
      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 400:
            errorMessage = data?.message || 'Datos del servicio inválidos.';
            break;
          case 401:
            errorMessage = 'Debes estar autenticado para actualizar servicios.';
            break;
          case 403:
            errorMessage = 'No tienes permisos para editar este servicio.';
            break;
          case 404:
            errorMessage = 'Servicio no encontrado.';
            break;
          case 422:
            errorMessage = data?.message || 'Los datos no cumplen con las validaciones requeridas.';
            break;
          default:
            errorMessage = data?.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  getUserServices: async (): Promise<ApiResponse<ServiceResponse[]>> => {
    try {
      console.log('📋 Obteniendo mis servicios...');
      const response = await api.get('/api/my-services');
      console.log('✅ Mis servicios obtenidos:', response.data);
      
      return {
        success: true,
        data: response.data.data.services,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error('❌ Error obteniendo mis servicios:', error);
      let errorMessage = 'Error al obtener los servicios';
      
      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 401:
            errorMessage = 'Debes estar autenticado para ver tus servicios.';
            break;
          default:
            errorMessage = data?.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  getServices: async (): Promise<ApiResponse<ServiceResponse[]>> => {
    try {
      console.log('📋 Obteniendo servicios públicos...');
      const response = await api.get('/api/services');
      console.log('✅ Servicios públicos obtenidos:', response.data);
      
      return {
        success: true,
        data: response.data.data.services,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error('❌ Error obteniendo servicios:', error);
      let errorMessage = 'Error al obtener los servicios';
      
      if (error.response) {
        const { status, data } = error.response;
        errorMessage = data?.message || `Error del servidor (${status})`;
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  getServiceById: async (serviceId: string): Promise<ApiResponse<ServiceResponse>> => {
    try {
      console.log(`📋 Obteniendo servicio con ID: ${serviceId}...`);
      const response = await api.get(`/api/services/${serviceId}`);
      console.log('✅ Respuesta completa del servicio:', response.data);
      
      // Verificar la estructura de la respuesta
      let serviceData;
      if (response.data.data && response.data.data.service) {
        serviceData = response.data.data.service;
      } else if (response.data.data) {
        serviceData = response.data.data;
      } else {
        serviceData = response.data;
      }
      
      console.log('📋 Datos del servicio procesados:', serviceData);
      
      return {
        success: true,
        data: serviceData,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error('❌ Error obteniendo servicio por ID:', error);
      let errorMessage = 'Error al obtener el servicio';
      
      if (error.response) {
        const { status, data } = error.response;
        console.error('❌ Error response:', { status, data });
        if (status === 404) {
          errorMessage = 'Servicio no encontrado';
        } else {
          errorMessage = data?.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  toggleServiceStatus: async (serviceId: string): Promise<ApiResponse<ServiceResponse>> => {
    try {
      console.log('🔄 Cambiando estado del servicio:', serviceId);
      const response = await api.patch(`/api/services/${serviceId}`);
      console.log('✅ Estado del servicio cambiado:', response.data);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error('❌ Error cambiando estado del servicio:', error);
      let errorMessage = 'Error al cambiar el estado del servicio';
      
      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 401:
            errorMessage = 'Debes estar autenticado para cambiar el estado del servicio.';
            break;
          case 403:
            errorMessage = 'No tienes permisos para cambiar el estado de este servicio.';
            break;
          case 404:
            errorMessage = 'Servicio no encontrado.';
            break;
          default:
            errorMessage = data?.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  getCategories: async (): Promise<ApiResponse<string[]>> => {
    try {
      console.log('🔄 Obteniendo categorías desde el backend...');
      const response = await api.get('/api/categories');
      console.log('✅ Categorías obtenidas:', response.data);
      
      return {
        success: true,
        data: response.data.categories,
        message: response.data.message,
      };
    } catch (error: any) {
      console.error('❌ Error obteniendo categorías:', error);
      let errorMessage = 'Error al obtener categorías';
      
      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 500:
            errorMessage = 'Error del servidor al obtener categorías.';
            break;
          default:
            errorMessage = data?.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};
