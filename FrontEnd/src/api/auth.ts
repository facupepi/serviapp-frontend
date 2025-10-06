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
import logger from '../utils/logger';

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
  logger.info('Token inválido/expirado - datos limpiados');
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
  logger.debug('Enviando datos de registro:', userData);
  logger.debug('URL:', `${API_BASE_URL}/api/user/register`);
      
      const response = await api.post('/api/user/register', userData);
  logger.info('Respuesta exitosa:', response.data);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      // Log detallado del error
  logger.error('Error en registro:', error);
  logger.error('Error response:', error.response);
  logger.error('Error data:', error.response?.data);
  logger.error('Status code:', error.response?.status);
      
      // Manejo específico de errores
      let errorMessage = 'Error al registrarse';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
  logger.debug('Analizando error con status:', status);
  logger.debug('Data del error:', data);
        
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

  logger.error('Mensaje de error final:', errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  login: async (credentials: UserLogin): Promise<ApiResponse<AuthResponse>> => {
    try {
  logger.debug('Enviando datos de login:', credentials);
  logger.debug('URL:', `${API_BASE_URL}/api/user/login`);
      
      const response = await api.post('/api/user/login', credentials);
  logger.info('Respuesta de login exitosa:', response.data);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
  logger.error('Error en login:', error);
  logger.error('Error response:', error.response);
  logger.error('Error data:', error.response?.data);
  logger.error('Status code:', error.response?.status);
      
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
  logger.debug('Enviando solicitud de recuperación de contraseña para:', email);
  logger.debug('URL:', `${API_BASE_URL}/api/user/forgot-password`);
      
      const response = await api.post('/api/user/forgot-password', { 
        email 
      });
      
  logger.info('Solicitud de recuperación enviada exitosamente');
      
      return {
        success: true,
        message: response.data?.message || 'Se ha enviado un correo con instrucciones para restablecer tu contraseña',
      };
    } catch (error: any) {
  logger.error('Error en forgot password:', error);
  logger.error('Error response:', error.response);
  logger.error('Error data:', error.response?.data);
      
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
  logger.debug('Enviando solicitud de reset de contraseña');
  logger.debug('URL:', `${API_BASE_URL}/api/user/reset-password`);
      
      // Validación de token antes de enviar
      if (!token || token.trim() === '') {
  logger.error('Token vacío o inválido:', { token, length: token?.length });
        return {
          success: false,
          error: 'Token de recuperación inválido. Por favor, solicita un nuevo enlace de recuperación.'
        };
      }
      
  logger.debug('Token recibido:', token.length > 20 ? token.substring(0, 20) + '...' : token);
  logger.debug('Token length:', token.length);
      
      // Payload que coincide exactamente con la estructura del backend
      const payload = {
        token: token.trim(),
        new_password: newPassword
      };
      
      logger.debug('Payload enviado:', { 
        token: payload.token.length > 20 ? payload.token.substring(0, 20) + '...' : payload.token,
        new_password: '[HIDDEN]',
        token_length: payload.token.length 
      });
      
      const response = await api.post('/api/user/reset-password', payload);
      
  logger.info('Contraseña restablecida exitosamente');
      
      return {
        success: true,
        message: response.data?.message || 'Tu contraseña ha sido actualizada exitosamente',
      };
    } catch (error: any) {
  logger.error('Error en reset password:', error);
  logger.error('Error response:', error.response);
  logger.error('Error data:', error.response?.data);
      
      let errorMessage = 'Error al restablecer contraseña';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
  logger.debug('Analizando error - Status:', status);
  logger.debug('Analizando error - Data:', data);
  logger.debug('Message from backend:', data?.message);
  logger.debug('Error from backend:', data?.error);
        
        switch (status) {
          case 400:
            // Analizar el mensaje específico para determinar el tipo de error
            const backendMessage = data?.message || data?.error || '';
            logger.debug('Backend message for analysis:', backendMessage);
            
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
  logger.debug('Creando servicio:', serviceData);
  const response = await api.post('/api/services', serviceData);
  logger.info('Servicio creado:', response.data);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
  logger.error('Error creando servicio:', error);
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
  logger.debug('Actualizando servicio:', serviceId);
  logger.debug('Datos a enviar:', JSON.stringify(serviceData, null, 2));
  const response = await api.put(`/api/services/${serviceId}`, serviceData);
  logger.info('Respuesta exitosa:', response.data);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
  logger.error('Error actualizando servicio:', error);
  logger.error('Response data:', error.response?.data);
  logger.error('Response status:', error.response?.status);
  logger.error('Response headers:', error.response?.headers);
      
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

  // Crear un turno / cita
  createAppointment: async (appointmentData: { service_id: number; date: string; time_slot: string; notes?: string }): Promise<ApiResponse<any>> => {
    try {
      logger.debug('Creando appointment:', appointmentData);
      const response = await api.post('/api/appointments', appointmentData);
      logger.info('Appointment creado:', response.data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
      logger.error('Error creando appointment:', error);
      let errorMessage = 'Error al crear el turno';
      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 400:
            errorMessage = data?.message || 'Solicitud inválida';
            break;
          case 401:
            errorMessage = 'No autenticado';
            break;
          case 409:
            errorMessage = data?.message || 'El horario ya está ocupado';
            break;
          default:
            errorMessage = data?.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor.';
      }
      return { success: false, error: errorMessage };
    }
  },

  // Obtener mis turnos (cliente)
  getMyAppointments: async (): Promise<ApiResponse<any>> => {
    try {
      logger.debug('Solicitando mis appointments (GET /api/my-appointments)');
      const response = await api.get('/api/my-appointments');
      logger.info('Mis appointments obtenidos:', response.data);
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error: any) {
      logger.error('Error obteniendo mis appointments:', error);
      let errorMessage = 'Error al obtener mis turnos';
      if (error.response) {
        const status = error.response.status;
        if (status === 401) errorMessage = 'No autenticado';
        else if (status === 500) errorMessage = error.response.data?.message || 'Error interno del servidor';
        else errorMessage = error.response.data?.message || `Error del servidor (${status})`;
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor.';
      }
      return { success: false, error: errorMessage };
    }
  },

  // Actualizar perfil del usuario autenticado
  updateProfile: async (profileData: { name?: string; email?: string; locality?: string; province?: string; phone?: string; }): Promise<ApiResponse> => {
    try {
      logger.debug('Updating user profile with:', profileData);
      const response = await api.put('/api/user/profile', profileData);
      logger.info('Profile update response:', response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      logger.error('Error updating profile:', error);
      let errMsg = 'Error updating profile';
      if (error.response) {
        errMsg = error.response.data?.error || error.response.data?.message || errMsg;
      }
      return { success: false, error: errMsg };
    }
  },

  getUserServices: async (): Promise<ApiResponse<ServiceResponse[]>> => {
    try {
  logger.debug('Obteniendo mis servicios...');
  const response = await api.get('/api/my-services');
  logger.info('Mis servicios obtenidos:', response.data);
      
      return {
        success: true,
        data: response.data.data.services,
        message: response.data.message,
      };
    } catch (error: any) {
  logger.error('Error obteniendo mis servicios:', error);
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
      const response = await api.get('/api/services');
      
      return {
        success: true,
        data: response.data.data.services,
        message: response.data.message,
      };
    } catch (error: any) {
  logger.error('Error obteniendo servicios:', error);
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
  logger.debug(`Obteniendo servicio con ID: ${serviceId}...`);
  const response = await api.get(`/api/services/${serviceId}`);
  logger.info('Respuesta completa del servicio:', response.data);
      
      // Verificar la estructura de la respuesta
      let serviceData;
      if (response.data.data && response.data.data.service) {
        serviceData = response.data.data.service;
      } else if (response.data.data) {
        serviceData = response.data.data;
      } else {
        serviceData = response.data;
      }
      
  logger.debug('Datos del servicio procesados:', serviceData);
      
      return {
        success: true,
        data: serviceData,
        message: response.data.message,
      };
    } catch (error: any) {
  logger.error('Error obteniendo servicio por ID:', error);
      let errorMessage = 'Error al obtener el servicio';
      
  if (error.response) {
  const { status, data } = error.response;
  logger.error('❌ Error response:', { status, data });
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

  toggleServiceStatus: async (serviceId: string, status?: string): Promise<ApiResponse<ServiceResponse>> => {
    try {
  logger.debug('Cambiando estado del servicio:', serviceId, 'status:', status);
  // Enviar el nuevo estado en el body según el swagger: { status: 'active' | 'inactive' }
  const payload = status ? { status } : {};
  const response = await api.patch(`/api/services/${serviceId}/status`, payload);
  logger.info('Estado del servicio cambiado:', response.data);
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error: any) {
  logger.error('Error cambiando estado del servicio:', error);
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

  // Eliminar un servicio (solo propietario)
  deleteService: async (serviceId: string): Promise<ApiResponse<any>> => {
    try {
      logger.debug('Enviando DELETE para servicio:', serviceId);
      const response = await api.delete(`/api/services/${serviceId}`);
      logger.info('Respuesta DELETE exitosa:', response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      logger.error('Error en deleteService:', error);
      logger.error('Response data:', error.response?.data);
      logger.error('Response status:', error.response?.status);

      let errorMessage = 'Error al eliminar el servicio';
      const status = error.response?.status;
      if (status === 401) errorMessage = 'Usuario no autenticado';
      else if (status === 403) errorMessage = error.response?.data?.error || 'No autorizado para eliminar este servicio';
      else if (status === 404) errorMessage = error.response?.data?.error || 'Servicio no encontrado';
      else if (status === 500) errorMessage = 'Error interno del servidor';
      else errorMessage = error.response?.data?.error || error.message || errorMessage;

      return { success: false, error: errorMessage };
    }
  },

  // Obtener calendario de disponibilidad del servicio para los próximos 30 días
  getServiceCalendar: async (serviceId: string): Promise<ApiResponse<any>> => {
    try {
      logger.debug('Obteniendo calendario para servicio:', serviceId);
      const response = await api.get(`/api/services/${serviceId}/calendar`);
      logger.info('Calendario obtenido:', response.data);
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error: any) {
      logger.error('Error obteniendo calendario del servicio:', error);
      let errorMessage = 'Error al obtener el calendario';
      if (error.response) {
        const status = error.response.status;
        if (status === 404) errorMessage = 'Servicio no encontrado';
        else if (status === 500) errorMessage = 'Error interno del servidor';
        else errorMessage = error.response.data?.error || error.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor.';
      }
      return { success: false, error: errorMessage };
    }
  },

  // Obtener disponibilidad para una fecha específica
  getServiceAvailability: async (serviceId: string, date: string): Promise<ApiResponse<any>> => {
    try {
      logger.debug('Obteniendo disponibilidad para servicio:', serviceId, 'fecha:', date);
      const response = await api.get(`/api/services/${serviceId}/availability`, { params: { date } });
      logger.info('Disponibilidad obtenida:', response.data);
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error: any) {
      logger.error('Error obteniendo disponibilidad del servicio:', error);
      let errorMessage = 'Error al obtener disponibilidad';
      if (error.response) {
        const status = error.response.status;
        if (status === 400) errorMessage = error.response.data?.error || 'Solicitud inválida';
        else if (status === 404) errorMessage = 'Servicio no encontrado';
        else if (status === 500) errorMessage = 'Error interno del servidor';
        else errorMessage = error.response.data?.error || error.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor.';
      }
      return { success: false, error: errorMessage };
    }
  },

  // Obtener los turnos (appointments) asignados a un servicio (solo para el proveedor del servicio)
  getServiceAppointments: async (serviceId: string): Promise<ApiResponse<any>> => {
    try {
      logger.debug('Obteniendo appointments para servicio:', serviceId);
      const response = await api.get(`/api/services/${serviceId}/appointments`);
      logger.info('Appointments del servicio obtenidos:', response.data);
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error: any) {
      logger.error('Error obteniendo appointments del servicio:', error);
      let errorMessage = 'Error al obtener los turnos del servicio';
      if (error.response) {
        const status = error.response.status;
        if (status === 401) errorMessage = 'No autenticado';
        else if (status === 403) errorMessage = 'No tienes permisos para ver los turnos de este servicio';
        else if (status === 404) errorMessage = 'Servicio no encontrado';
        else errorMessage = error.response.data?.message || `Error del servidor (${status})`;
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor.';
      }
      return { success: false, error: errorMessage };
    }
  },

  // Actualizar el estado de un appointment
  updateAppointmentStatus: async (appointmentId: string | number, status: string, extra?: { rejectionReason?: string }): Promise<ApiResponse<any>> => {
    try {
      logger.debug('Actualizando estado de appointment:', appointmentId, 'status:', status, 'extra:', extra);
      const payload: any = { status };
      if (extra?.rejectionReason) payload.rejectionReason = extra.rejectionReason;
      const response = await api.put(`/api/appointments/${appointmentId}/status`, payload);
      logger.info('Respuesta updateAppointmentStatus:', response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      logger.error('Error updateAppointmentStatus:', error);
      let errorMessage = 'Error actualizando el estado del turno';
      if (error.response) {
        const statusCode = error.response.status;
        if (statusCode === 400) errorMessage = error.response.data?.error || 'Solicitud inválida';
        else if (statusCode === 401) errorMessage = 'No autenticado';
        else if (statusCode === 403) errorMessage = 'No autorizado para modificar este turno';
        else if (statusCode === 404) errorMessage = 'Turno no encontrado';
        else errorMessage = error.response.data?.message || `Error del servidor (${statusCode})`;
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor.';
      }
      return { success: false, error: errorMessage };
    }
  },

  getCategories: async (): Promise<ApiResponse<string[]>> => {
    try {
      const response = await api.get('/api/categories');
      
      return {
        success: true,
        data: response.data.categories,
        message: response.data.message,
      };
    } catch (error: any) {
  logger.error('Error obteniendo categorías:', error);
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
