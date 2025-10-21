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
      
      // Transform data to handle null rejection_reason
      const transformedData = Array.isArray(response.data.data) 
        ? response.data.data.map((appointment: any) => ({
            ...appointment,
            rejection_reason: appointment.rejection_reason || null,
            rejectionReason: appointment.rejection_reason || appointment.rejectionReason || null
          }))
        : response.data.data;
      
      return { success: true, data: transformedData, message: response.data.message };
    } catch (error: any) {
      logger.error('Error obteniendo mis appointments:', error);
      let errorMessage = 'Error al obtener mis turnos';
      if (error.response) {
        const status = error.response.status;
        if (status === 401) errorMessage = 'No autenticado';
        else if (status === 500) {
          const serverError = error.response.data?.message || error.response.data?.error || '';
          if (serverError.includes('rejection_reason') && serverError.includes('NULL')) {
            errorMessage = 'Error de base de datos: campo rejection_reason con valor NULL';
          } else {
            errorMessage = serverError || 'Error interno del servidor';
          }
        }
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
      
      // Transform data to handle null rejection_reason
      const transformedData = Array.isArray(response.data.data) 
        ? response.data.data.map((appointment: any) => ({
            ...appointment,
            rejection_reason: appointment.rejection_reason || null,
            rejectionReason: appointment.rejection_reason || appointment.rejectionReason || null
          }))
        : response.data.data;
      
      return { success: true, data: transformedData, message: response.data.message };
    } catch (error: any) {
      logger.error('Error obteniendo appointments del servicio:', error);
      let errorMessage = 'Error al obtener los turnos del servicio';
      if (error.response) {
        const status = error.response.status;
        if (status === 401) errorMessage = 'No autenticado';
        else if (status === 403) errorMessage = 'No tienes permisos para ver los turnos de este servicio';
        else if (status === 404) errorMessage = 'Servicio no encontrado';
        else if (status === 500) {
          const serverError = error.response.data?.message || error.response.data?.error || '';
          if (serverError.includes('rejection_reason') && serverError.includes('NULL')) {
            errorMessage = 'Error de base de datos: campo rejection_reason con valor NULL';
          } else {
            errorMessage = serverError || 'Error interno del servidor';
          }
        }
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
      if (extra?.rejectionReason) payload.rejection_reason = extra.rejectionReason;
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

  // Completar un appointment (marcar como realizado)
  completeAppointment: async (appointmentId: string | number): Promise<ApiResponse<any>> => {
    try {
      logger.debug('Completando appointment:', appointmentId);
      const response = await api.put(`/api/appointments/${appointmentId}/status`, { 
        status: 'completed' 
      });
      logger.info('Appointment completado exitosamente:', response.data);
      return { 
        success: true, 
        data: response.data,
        message: 'Servicio marcado como completado exitosamente'
      };
    } catch (error: any) {
      logger.error('Error completando appointment:', error);
      let errorMessage = 'Error al marcar el servicio como completado';
      if (error.response) {
        const statusCode = error.response.status;
        if (statusCode === 400) errorMessage = error.response.data?.error || 'No se puede completar este servicio';
        else if (statusCode === 401) errorMessage = 'No autenticado';
        else if (statusCode === 403) errorMessage = 'No autorizado para completar este servicio';
        else if (statusCode === 404) errorMessage = 'Servicio no encontrado';
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

  // Obtener perfil del usuario
  getUserProfile: async (): Promise<ApiResponse<any>> => {
    try {
      logger.debug('Obteniendo perfil del usuario');
      const response = await api.get('/api/user/profile');
      logger.info('Perfil obtenido exitosamente:', response.data);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      logger.error('Error obteniendo perfil:', error);
      let errorMessage = 'Error al obtener el perfil';
      
      if (error.response) {
        const { status, data } = error.response;
        logger.debug('Error response data:', data);
        
        switch (status) {
          case 401:
            if (data?.error === 'User not authenticated') {
              errorMessage = 'No autenticado. Inicia sesión nuevamente.';
            } else {
              errorMessage = data?.error || 'Sesión expirada. Inicia sesión nuevamente.';
            }
            break;
            
          case 404:
            errorMessage = 'Perfil no encontrado. Contacta al soporte.';
            break;
            
          case 500:
            if (data?.error === 'Internal server error') {
              errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
            } else {
              errorMessage = data?.error || 'Error del servidor al obtener el perfil.';
            }
            break;
            
          default:
            errorMessage = data?.error || data?.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      } else {
        errorMessage = error.message || 'Error inesperado al obtener el perfil';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // Actualizar perfil del usuario
  updateUserProfile: async (profileData: {
    name?: string;
    email?: string;
    locality?: string;
    province?: string;
    phone?: string;
  }): Promise<ApiResponse<any>> => {
    try {
      logger.debug('Actualizando perfil del usuario:', profileData);
      const response = await api.put('/api/user/profile', profileData);
      logger.info('Perfil actualizado exitosamente:', response.data);
      
      // Formatear mensaje de éxito en español
      let successMessage = 'Perfil actualizado exitosamente';
      if (response.data.message) {
        const msg = response.data.message;
        if (msg === 'User updated successfully') {
          successMessage = 'Perfil actualizado exitosamente';
        } else {
          successMessage = msg;
        }
      }
      
      return {
        success: true,
        data: response.data.user,
        message: successMessage,
      };
    } catch (error: any) {
      logger.error('Error actualizando perfil:', error);
      let errorMessage = 'Error al actualizar el perfil';
      
      if (error.response) {
        const { status, data } = error.response;
        logger.debug('Error response data:', data);
        
        switch (status) {
          case 400:
            // Formatear mensajes de validación
            if (data?.error) {
              const err = data.error;
              if (err === 'Invalid request body') {
                errorMessage = 'Datos inválidos en la solicitud';
              } else if (err.includes('email')) {
                errorMessage = 'El formato del email no es válido';
              } else if (err.includes('phone')) {
                errorMessage = 'El formato del teléfono no es válido';
              } else {
                errorMessage = err;
              }
              
              // Agregar detalles si existen
              if (data?.details) {
                errorMessage += `. ${data.details}`;
              }
            } else if (data?.message) {
              errorMessage = data.message;
            } else {
              errorMessage = 'Datos inválidos. Verifica los campos.';
            }
            break;
            
          case 401:
            if (data?.error === 'User not authenticated') {
              errorMessage = 'No autenticado. Inicia sesión nuevamente.';
            } else {
              errorMessage = data?.error || 'Sesión expirada. Inicia sesión nuevamente.';
            }
            break;
            
          case 500:
            if (data?.error === 'Internal server error') {
              errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
            } else {
              errorMessage = data?.error || 'Error del servidor al actualizar el perfil.';
            }
            break;
            
          default:
            errorMessage = data?.error || data?.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      } else {
        errorMessage = error.message || 'Error inesperado al actualizar el perfil';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // Agregar servicio a favoritos
  addToFavorites: async (serviceId: number): Promise<ApiResponse<any>> => {
    try {
      logger.debug('Agregando servicio a favoritos:', serviceId);
      const response = await api.post('/api/favorites', { service_id: serviceId });
      logger.info('Servicio agregado a favoritos:', response.data);
      
      return {
        success: true,
        data: response.data.favorite,
        message: 'Servicio agregado a favoritos',
      };
    } catch (error: any) {
      logger.error('Error agregando a favoritos:', error);
      let errorMessage = 'Error al agregar a favoritos';
      
      if (error.response) {
        const { status, data } = error.response;
        logger.debug('Error response data:', data);
        
        switch (status) {
          case 400:
            errorMessage = data?.error || 'Solicitud inválida';
            if (data?.details) {
              errorMessage += `. ${data.details}`;
            }
            break;
          case 401:
            errorMessage = 'No autenticado. Inicia sesión nuevamente.';
            break;
          case 404:
            errorMessage = 'Servicio no encontrado';
            break;
          case 409:
            if (data?.error === 'Service is already in favorites') {
              errorMessage = 'Este servicio ya está en tus favoritos';
            } else {
              errorMessage = data?.error || 'El servicio ya está en favoritos';
            }
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
            break;
          default:
            errorMessage = data?.error || data?.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // Obtener lista de favoritos
  getFavorites: async (): Promise<ApiResponse<any[]>> => {
    try {
      logger.debug('Obteniendo favoritos del usuario');
      const response = await api.get('/api/favorites');
      logger.info('Favoritos obtenidos:', response.data);
      
      return {
        success: true,
        data: response.data.favorites || [],
        message: `${response.data.total || 0} favoritos`,
      };
    } catch (error: any) {
      logger.error('Error obteniendo favoritos:', error);
      let errorMessage = 'Error al obtener favoritos';
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 401:
            errorMessage = 'No autenticado. Inicia sesión nuevamente.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
            break;
          default:
            errorMessage = data?.error || data?.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      }

      return {
        success: false,
        error: errorMessage,
        data: [],
      };
    }
  },

  // Eliminar servicio de favoritos
  removeFromFavorites: async (serviceId: number): Promise<ApiResponse<any>> => {
    try {
      logger.debug('Eliminando servicio de favoritos:', serviceId);
      const response = await api.delete(`/api/favorites/${serviceId}`);
      logger.info('Servicio eliminado de favoritos:', response.data);
      
      return {
        success: true,
        message: 'Servicio eliminado de favoritos',
      };
    } catch (error: any) {
      logger.error('Error eliminando de favoritos:', error);
      let errorMessage = 'Error al eliminar de favoritos';
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            errorMessage = data?.error || 'Solicitud inválida';
            break;
          case 401:
            errorMessage = 'No autenticado. Inicia sesión nuevamente.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
            break;
          default:
            errorMessage = data?.error || data?.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // Obtener reviews de un servicio
  getServiceReviews: async (serviceId: number): Promise<ApiResponse<any>> => {
    try {
      logger.debug(`Obteniendo reviews del servicio ${serviceId}`);
      const response = await api.get(`/api/services/${serviceId}/reviews`);
      
      console.log('🔍 [getServiceReviews] Response completa:', response);
      console.log('🔍 [getServiceReviews] Response.data:', response.data);
      
      logger.info('Reviews obtenidas:', response.data);
      
      // La API retorna directamente el objeto con reviews, average_rating, total_reviews, rating_distribution
      return {
        success: true,
        data: response.data, // Este objeto ya contiene reviews, average_rating, etc.
        message: `${response.data.total_reviews || 0} reviews`,
      };
    } catch (error: any) {
      logger.error('Error obteniendo reviews:', error);
      console.error('🔍 [getServiceReviews] Error completo:', error);
      console.error('🔍 [getServiceReviews] Error.response:', error.response);
      
      let errorMessage = 'Error al obtener las valoraciones';
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 404:
            errorMessage = 'Servicio no encontrado';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
            break;
          default:
            errorMessage = data?.error || data?.message || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      }

      return {
        success: false,
        error: errorMessage,
        data: {
          reviews: [],
          average_rating: 0,
          total_reviews: 0,
          rating_distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
        }
      };
    }
  },

  // Crear review para un servicio
  createReview: async (serviceId: number, rating: number, comment: string): Promise<ApiResponse<any>> => {
    try {
      logger.debug(`Creando review para servicio ${serviceId}`);
      const response = await api.post(`/api/services/${serviceId}/reviews`, {
        rating,
        comment
      });
      
      console.log('🔍 [createReview] Response completa:', response);
      console.log('🔍 [createReview] Response.data:', response.data);
      
      logger.info('Review creada exitosamente:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Review creada exitosamente',
      };
    } catch (error: any) {
      logger.error('Error creando review:', error);
      console.error('🔍 [createReview] Error completo:', error);
      console.error('🔍 [createReview] Error.response:', error.response);
      console.error('🔍 [createReview] Error.response.data:', error.response?.data);
      
      let errorMessage = 'Error al crear la valoración';
      
      if (error.response) {
        const { status, data } = error.response;
        
        console.log('🔍 [createReview] Status:', status);
        console.log('🔍 [createReview] Data:', data);
        console.log('🔍 [createReview] Data.message:', data?.message);
        
        switch (status) {
          case 400:
            // Usar el mensaje específico de la API
            if (data?.message?.includes('complete an appointment')) {
              errorMessage = 'Debes tener un servicio completado antes de poder calificarlo. El servicio debe estar en estado "Completado".';
            } else {
              errorMessage = data?.message || data?.error || 'Debes completar un servicio antes de calificarlo';
            }
            break;
          case 401:
            errorMessage = 'No estás autenticado. Inicia sesión nuevamente.';
            break;
          case 404:
            errorMessage = 'Servicio no encontrado';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
            break;
          default:
            errorMessage = data?.message || data?.error || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // Actualizar review existente
  updateReview: async (reviewId: number, rating: number, comment: string): Promise<ApiResponse<any>> => {
    try {
      logger.debug(`Actualizando review ${reviewId}`);
      const response = await api.put(`/api/reviews/${reviewId}`, {
        rating,
        comment
      });
      
      logger.info('Review actualizada exitosamente:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Review actualizada exitosamente',
      };
    } catch (error: any) {
      logger.error('Error actualizando review:', error);
      
      let errorMessage = 'Error al actualizar la valoración';
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            errorMessage = data?.message || data?.error || 'Datos inválidos';
            break;
          case 401:
            errorMessage = 'No estás autenticado. Inicia sesión nuevamente.';
            break;
          case 403:
            errorMessage = 'No tienes permiso para actualizar esta reseña';
            break;
          case 404:
            errorMessage = 'Reseña no encontrada';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
            break;
          default:
            errorMessage = data?.message || data?.error || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // Eliminar review
  deleteReview: async (reviewId: number): Promise<ApiResponse<any>> => {
    try {
      logger.debug(`Eliminando review ${reviewId}`);
      const response = await api.delete(`/api/reviews/${reviewId}`);
      
      logger.info('Review eliminada exitosamente:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Review eliminada exitosamente',
      };
    } catch (error: any) {
      logger.error('Error eliminando review:', error);
      
      let errorMessage = 'Error al eliminar la valoración';
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 401:
            errorMessage = 'No estás autenticado. Inicia sesión nuevamente.';
            break;
          case 403:
            errorMessage = 'No tienes permiso para eliminar esta reseña';
            break;
          case 404:
            errorMessage = 'Reseña no encontrada';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intenta nuevamente más tarde.';
            break;
          default:
            errorMessage = data?.message || data?.error || `Error del servidor (${status})`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};
