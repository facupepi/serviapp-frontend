import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, UserRegister as BackendUserRegister } from '../api/auth';
import { tokenStorage, userStorage } from '../utils/storage';
import logger from '../utils/logger';
import { NotificationContext } from './NotificationContext';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  province: string;
  locality: string;
  avatar?: string;
  rating?: number;
  reviewCount?: number;
  completedJobs?: number;
  experience?: string;
  description?: string;
  services?: string[];
  certifications?: string[];
  verified?: boolean;
  createdAt?: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  rating: number;
  reviewCount: number;
  price?: number;
  image: string;
  image_url?: string; // Campo adicional de la API
  zones: Zone[];
  availability: Availability[];
  isActive: boolean;
  createdAt: string;
}

interface Zone {
  province: string;
  locality: string;
  neighborhood?: string;
}

interface Availability {
  day: string; // 'monday', 'tuesday', etc.
  timeSlots: TimeSlot[];
}

interface TimeSlot {
  start: string;
  end: string;
}

interface ServiceRequest {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceImage: string;
  clientId: string;
  clientName: string;
  providerId: string;
  providerName: string;
  providerPhone?: string;
  providerLocality?: string;
  providerProvince?: string;
  requestedDate: string;
  requestedTime: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed' | 'expired';
  rejectionReason?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  services: Service[];
  userRequests: ServiceRequest[];
  providerRequests: ServiceRequest[];
  favorites: string[];
  categories: string[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string; message?: string; requiresLogin?: boolean }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => void;
  searchServices: (query: string, filters?: ServiceFilters) => Service[];
  requestService: (serviceId: string, date: string, time: string) => Promise<{ success: boolean; error?: string }>;
  createAppointment: (appointment: { service_id: number; date: string; time_slot: string; notes?: string }) => Promise<{ success: boolean; error?: string; data?: any }>;
  respondToRequest: (requestId: string, action: 'accept' | 'reject', rejectionReason?: string) => Promise<{ success: boolean; error?: string }>;
  completeAppointment: (appointmentId: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  addToFavorites: (serviceId: string) => void;
  removeFromFavorites: (serviceId: string) => void;
  submitReview: (serviceRequestId: string, rating: number, comment: string) => Promise<{ success: boolean; error?: string }>;
  createService: (serviceData: CreateServiceData) => Promise<{ success: boolean; error?: string }>;
  updateService: (serviceId: string, serviceData: CreateServiceData) => Promise<{ success: boolean; error?: string }>;
  getUserServices: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
  getServices: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
  getServiceById: (serviceId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  getMyAppointments: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
  getCategories: () => Promise<{ success: boolean; data?: string[]; error?: string }>;
    getServiceAppointments: (serviceId: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;
    getAllServiceAppointments: () => Promise<{ success: boolean; error?: string }>;
  toggleServiceStatus: (serviceId: string) => Promise<{ success: boolean; error?: string }>;
  deactivateService: (serviceId: string) => Promise<{ success: boolean; error?: string }>;
  reactivateService: (serviceId: string) => Promise<{ success: boolean; error?: string }>;
  deleteService: (serviceId: string) => Promise<{ success: boolean; error?: string }>;
  getServiceCalendar: (serviceId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  getServiceAvailability: (serviceId: string, date: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  getUserProfile: () => Promise<{ success: boolean; data?: any; error?: string }>;
  updateUserProfile: (profileData: { name?: string; email?: string; locality?: string; province?: string; phone?: string; }) => Promise<{ success: boolean; error?: string; message?: string }>;
  providerRequestsLoaded: boolean;
  isLoadingAppointments: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  loginAttempts: number;
  isBlocked: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  province: string;
  locality: string;
}

interface ServiceFilters {
  category?: string;
  province?: string;
  locality?: string;
  neighborhood?: string;
}

interface CreateServiceData {
  title: string;
  description: string;
  category: string;
  price?: number; // Campo price opcional
  duration_minutes?: number;
  booking_window_days?: number;
  zones: Zone[];
  availability: { [key: string]: any }; // Formato objeto para disponibilidad
  image: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Flag global para prevenir múltiples inicializaciones
let authContextInitialized = false;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Notifications (safe: useContext will return undefined if provider not present)
  const notifCtx = useContext(NotificationContext);
  const addNotification = notifCtx?.addNotification;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Image is required on services now; no fallback logic here.

  const [services, setServices] = useState<Service[]>([]);
  const [userRequests, setUserRequests] = useState<ServiceRequest[]>([]);
  const [providerRequests, setProviderRequests] = useState<ServiceRequest[]>([]);
  const [providerRequestsLoaded, setProviderRequestsLoaded] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  
  // Flags para evitar llamadas concurrentes
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  // Limpiar datos derivados del usuario cuando cambia el usuario (evita datos cacheados de otro usuario)
  useEffect(() => {
    setServices([]);
    setUserRequests([]);
    setProviderRequests([]);
    // Nota: no tocamos categories (globales) ni loading aquí
  }, [user?.id]);

  // Cargar favoritos cada vez que hay un usuario autenticado
  useEffect(() => {
    const loadFavorites = async () => {
      const token = tokenStorage.getToken();
      
      // Primero, cargar favoritos locales inmediatamente
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        try {
          const parsedFavorites = JSON.parse(savedFavorites);
          setFavorites(parsedFavorites);
          logger.info('✅ Favoritos locales cargados:', parsedFavorites.length);
        } catch (error) {
          logger.error('❌ Error parseando favoritos locales:', error);
          setFavorites([]);
        }
      }

      // Si hay usuario autenticado, sincronizar con API
      if (user && token) {
        try {
          logger.debug('🔄 Sincronizando favoritos con API...');
          const result = await authAPI.getFavorites();
          
          if (result.success && result.data) {
            // Convertir IDs a strings
            const apiFavorites = result.data.map((f: any) => f.service_id.toString());
            const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            
            // Crear unión de ambos sets (sin duplicados)
            const mergedFavorites = Array.from(new Set([...apiFavorites, ...localFavorites]));
            
            setFavorites(mergedFavorites);
            localStorage.setItem('favorites', JSON.stringify(mergedFavorites));
            logger.info('✅ Favoritos sincronizados desde API:', mergedFavorites.length);
          } else {
            logger.warn('⚠️ No se pudieron cargar favoritos desde API:', result.error);
          }
        } catch (error) {
          logger.error('❌ Error cargando favoritos desde API:', error);
          // En caso de error, mantener favoritos locales
        }
      } else if (!user && !token) {
        // Si no hay usuario, limpiar favoritos
        setFavorites([]);
        logger.info('🔄 Usuario no autenticado, favoritos limpiados');
      }
    };

    loadFavorites();
  }, [user]); // Se ejecuta cada vez que cambia el usuario

  useEffect(() => {
    // Prevenir múltiples inicializaciones usando flag global
    if (authContextInitialized) {
      setLoading(false);
      return;
    }
    
    authContextInitialized = true;
    
    // Verificar si hay un token guardado al cargar la app
    const token = tokenStorage.getToken();
    const userData = userStorage.getUser();
    const attempts = localStorage.getItem('loginAttempts');
    const blockTime = localStorage.getItem('blockTime');
    
    if (token && userData) {
      setUser(userData);
    } else if (token && !userData) {
      // Si hay token pero no datos del usuario, crear usuario básico
      try {
        // Decodificar el payload del JWT para obtener información básica
        const payload = JSON.parse(atob(token.split('.')[1]));
        const basicUser: User = {
          id: payload.id?.toString() || 'unknown',
          name: 'Usuario', // Nombre por defecto
          email: 'usuario@correo.com', // Email por defecto
          phone: '',
          province: '',
          locality: '',
          avatar: undefined,
          rating: 0,
          reviewCount: 0,
          completedJobs: 0,
          services: [],
          description: '',
          verified: false,
          createdAt: new Date().toISOString()
        };
        
  setUser(basicUser);
  userStorage.setUser(basicUser);
  logger.info('Usuario básico creado desde token:', basicUser);
      } catch (error) {
  logger.error('Error decodificando token:', error);
        tokenStorage.removeToken();
      }
    } else if (!token && userData) {
      // Si no hay token pero hay datos, limpiar datos
      userStorage.removeUser();
    } else {
      // No hay token ni datos
    }
    
    // La carga de favoritos ahora se hace en un useEffect separado que reacciona al cambio de usuario
    
    if (attempts) {
      setLoginAttempts(parseInt(attempts));
    }
    
    if (blockTime) {
      const blockTimeStamp = parseInt(blockTime);
      const now = Date.now();
      if (now < blockTimeStamp) {
        setIsBlocked(true);
        setTimeout(() => {
          setIsBlocked(false);
          setLoginAttempts(0);
          localStorage.removeItem('blockTime');
          localStorage.removeItem('loginAttempts');
        }, blockTimeStamp - now);
      } else {
        localStorage.removeItem('blockTime');
        localStorage.removeItem('loginAttempts');
      }
    }
    
    setLoading(false);
    
    // Cargar categorías del backend
    loadCategories();
  }, []);

  // Función para cargar categorías
  const loadCategories = async () => {
    try {
      const response = await authAPI.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        logger.error('❌ Error cargando categorías:', response.error);
        // Usar categorías por defecto en caso de error
        setCategories([
          'Limpieza', 'Jardinería', 'Plomería', 'Electricidad', 'Carpintería', 
          'Pintura', 'Mecánica', 'Tecnología', 'Educación', 'Salud', 'Belleza', 
          'Mascotas', 'Transporte', 'Eventos', 'Fotografía', 'Cocina', 'Fitness', 
          'Música', 'Idiomas', 'Otros'
        ]);
      }
    } catch (error) {
      logger.error('❌ Error cargando categorías:', error);
      // Usar categorías por defecto en caso de error
      setCategories([
        'Limpieza', 'Jardinería', 'Plomería', 'Electricidad', 'Carpintería', 
        'Pintura', 'Mecánica', 'Tecnología', 'Educación', 'Salud', 'Belleza', 
        'Mascotas', 'Transporte', 'Eventos', 'Fotografía', 'Cocina', 'Fitness', 
        'Música', 'Idiomas', 'Otros'
      ]);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isBlocked) {
        return { success: false, error: 'Demasiados intentos fallidos. Intenta nuevamente en 10 minutos.' };
      }

  logger.debug('Iniciando proceso de login...');

      // Llamar a la API del backend
      const response = await authAPI.login({ email, password });
      
      if (response.success && response.data) {
        // Verificar que el token existe antes de guardarlo
        if (response.data.token) {
          tokenStorage.setToken(response.data.token);
        } else {
          logger.warn('⚠️ No se recibió token del backend en login');
        }
        
        // Guardar datos del usuario
        if (response.data.user) {
          userStorage.setUser(response.data.user);
        } else {
          logger.warn('⚠️ No se recibieron datos del usuario del backend en login');
        }
        
        localStorage.removeItem('loginAttempts');
        
        // Si el backend envió datos del usuario, usarlos; si no, crear un usuario básico
  let loggedUser: User;
        
        if (response.data.user) {
          // Mapear datos del backend a nuestro formato local
          loggedUser = {
            id: response.data.user.id,
            name: response.data.user.name,
            email: response.data.user.email,
            phone: response.data.user.phone,
            province: response.data.user.province,
            locality: response.data.user.locality,
            avatar: undefined,
            rating: 0,
            reviewCount: 0,
            completedJobs: 0,
            services: [],
            description: '',
            verified: false,
            createdAt: new Date().toISOString()
          };
        } else {
          // Crear usuario básico si el backend no envió datos completos
          logger.debug('Creando usuario básico desde token...');
          try {
            // Decodificar el payload del JWT para obtener información más precisa
            const payload = JSON.parse(atob(response.data.token.split('.')[1]));
            loggedUser = {
              id: payload.id?.toString() || 'unknown',
              name: email.split('@')[0], // Usar parte del email como nombre temporal
              email: email,
              phone: '',
              province: '',
              locality: '',
              avatar: undefined,
              rating: 0,
              reviewCount: 0,
              completedJobs: 0,
              services: [],
              description: '',
              verified: false,
              createdAt: new Date().toISOString()
            };
          } catch (error) {
            logger.error('❌ Error decodificando token:', error);
            loggedUser = {
              id: 'unknown',
              name: email.split('@')[0],
              email: email,
              phone: '',
              province: '',
              locality: '',
              avatar: undefined,
              rating: 0,
              reviewCount: 0,
              completedJobs: 0,
              services: [],
              description: '',
              verified: false,
              createdAt: new Date().toISOString()
            };
          }
        }

        // SIEMPRE guardar los datos del usuario después del login exitoso
        setUser(loggedUser);
        userStorage.setUser(loggedUser);
        setLoginAttempts(0);
  logger.info('Login exitoso, usuario guardado:', loggedUser.email);
        return { success: true };
      } else {
        // Manejo de intentos fallidos
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('loginAttempts', newAttempts.toString());
        
        if (newAttempts >= 5) {
          const blockTime = Date.now() + (10 * 60 * 1000); // 10 minutos
          localStorage.setItem('blockTime', blockTime.toString());
          setIsBlocked(true);
          setTimeout(() => {
            setIsBlocked(false);
            setLoginAttempts(0);
            localStorage.removeItem('blockTime');
            localStorage.removeItem('loginAttempts');
          }, 10 * 60 * 1000);
          return { success: false, error: 'Demasiados intentos fallidos. Cuenta bloqueada por 10 minutos.' };
        }
        
        const formattedError = response.error ? formatLoginError(response.error) : 'Credenciales incorrectas';
        return { success: false, error: formattedError };
      }
    } catch (error: any) {
      logger.error('❌ Error completo en login:', error);
      logger.error('❌ Error tipo:', typeof error);
      logger.error('❌ Error message:', error?.message);
      logger.error('❌ Error response:', error?.response);
      
      // Si es un error de axios que ya fue procesado, usar el mensaje del authAPI
      if (error?.response?.status) {
        const status = error.response.status;
        switch (status) {
          case 401:
            return { success: false, error: 'Email o contraseña incorrectos.' };
          case 400:
            return { success: false, error: 'Email o contraseña requeridos.' };
          case 404:
            return { success: false, error: 'Usuario no encontrado.' };
          case 500:
            return { success: false, error: 'Error del servidor. Intenta más tarde.' };
          default:
            return { success: false, error: `Error del servidor (${status})` };
        }
      }
      
      // Error de conectividad real
      if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
        return { success: false, error: 'Error de conexión. Verifica tu internet e intenta nuevamente.' };
      }
      
      // Error genérico
      return { success: false, error: error?.message || 'Error inesperado al iniciar sesión.' };
    }
  };

  // Función para formatear mensajes de error del backend
  const formatRegisterError = (error: string): string => {
    const errorMessages: Record<string, string> = {
      'Email already exists': 'Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.',
      'email already exists': 'Este correo electrónico ya está registrado. Por favor, inicia sesión o usa otro correo.',
      'User already exists': 'Este usuario ya existe. Por favor, inicia sesión o usa otro correo.',
      'Invalid email format': 'El formato del correo electrónico no es válido.',
      'Password too short': 'La contraseña es demasiado corta.',
      'Phone number already exists': 'Este número de teléfono ya está registrado.',
    };

    // Buscar coincidencia exacta
    if (errorMessages[error]) {
      return errorMessages[error];
    }

    // Buscar coincidencia parcial (case insensitive)
    const lowerError = error.toLowerCase();
    for (const [key, value] of Object.entries(errorMessages)) {
      if (lowerError.includes(key.toLowerCase())) {
        return value;
      }
    }

    // Si no hay coincidencia, retornar el mensaje original
    return error;
  };

  // Función para formatear mensajes de error del login
  const formatLoginError = (error: string): string => {
    const errorMessages: Record<string, string> = {
      'Invalid credentials': 'Correo electrónico o contraseña incorrectos.',
      'invalid credentials': 'Correo electrónico o contraseña incorrectos.',
      'User not found': 'Usuario no encontrado. Verifica tu correo electrónico.',
      'user not found': 'Usuario no encontrado. Verifica tu correo electrónico.',
      'Incorrect password': 'Contraseña incorrecta. Por favor, intenta nuevamente.',
      'incorrect password': 'Contraseña incorrecta. Por favor, intenta nuevamente.',
      'Account locked': 'Tu cuenta ha sido bloqueada. Contacta a soporte.',
      'account locked': 'Tu cuenta ha sido bloqueada. Contacta a soporte.',
    };

    // Buscar coincidencia exacta
    if (errorMessages[error]) {
      return errorMessages[error];
    }

    // Buscar coincidencia parcial (case insensitive)
    const lowerError = error.toLowerCase();
    for (const [key, value] of Object.entries(errorMessages)) {
      if (lowerError.includes(key.toLowerCase())) {
        return value;
      }
    }

    // Si no hay coincidencia, retornar el mensaje original
    return error;
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string; message?: string; requiresLogin?: boolean }> => {
    try {
      
      // Validaciones locales antes de enviar al servidor
      if (userData.password !== userData.confirmPassword) {
        return { success: false, error: 'Las contraseñas no coinciden' };
      }

      if (userData.password.length < 8) {
        return { success: false, error: 'La contraseña debe tener al menos 8 caracteres' };
      }

      if (!/[A-Z]/.test(userData.password)) {
        return { success: false, error: 'La contraseña debe contener al menos una mayúscula' };
      }

      if (!/[0-9]/.test(userData.password)) {
        return { success: false, error: 'La contraseña debe contener al menos un número' };
      }

      // Validar campos requeridos según backend Go
      if (!userData.name?.trim()) {
        return { success: false, error: 'El nombre es obligatorio' };
      }
      if (userData.name.trim().length < 2 || userData.name.trim().length > 100) {
        return { success: false, error: 'El nombre debe tener entre 2 y 100 caracteres' };
      }

      if (!userData.email?.trim()) {
        return { success: false, error: 'El email es obligatorio' };
      }
      // Validación de email más estricta
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(userData.email.trim())) {
        return { success: false, error: 'El formato del email no es válido' };
      }

      // Validación de contraseña según backend (8-16 caracteres)
      if (userData.password.length < 8 || userData.password.length > 16) {
        return { success: false, error: 'La contraseña debe tener entre 8 y 16 caracteres' };
      }

      if (!userData.province?.trim()) {
        return { success: false, error: 'La provincia es obligatoria' };
      }
      if (userData.province.trim().length < 2 || userData.province.trim().length > 100) {
        return { success: false, error: 'La provincia debe tener entre 2 y 100 caracteres' };
      }

      if (!userData.locality?.trim()) {
        return { success: false, error: 'La localidad es obligatoria' };
      }
      if (userData.locality.trim().length < 2 || userData.locality.trim().length > 100) {
        return { success: false, error: 'La localidad debe tener entre 2 y 100 caracteres' };
      }

      // Validación de teléfono según backend (10-20 caracteres si se proporciona)
      if (userData.phone && userData.phone.trim()) {
        const phoneLength = userData.phone.trim().length;
        if (phoneLength < 10 || phoneLength > 20) {
          return { success: false, error: 'El teléfono debe tener entre 10 y 20 caracteres' };
        }
      }

      // Preparar datos para el backend
      const backendUserData: BackendUserRegister = {
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        confirm_password: userData.confirmPassword,
        locality: userData.locality.trim(),
        province: userData.province.trim(),
      };

      // Solo agregar phone si tiene valor
      if (userData.phone && userData.phone.trim()) {
        backendUserData.phone = userData.phone.trim();
      }

    logger.debug('Datos que se enviarán al backend:', backendUserData);

      // Llamar a la API del backend
      const response = await authAPI.register(backendUserData);
      
  logger.debug('Respuesta completa del backend:', response);
  logger.debug('Token en respuesta:', response.data?.token);
  logger.debug('Usuario en respuesta:', response.data?.user);

      if (response.success && response.data) {
        // Verificar que el token existe antes de guardarlo
        if (response.data.token) {
          tokenStorage.setToken(response.data.token);
          logger.info('Token guardado exitosamente');
          
          // Guardar datos del usuario
          if (response.data.user) {
            userStorage.setUser(response.data.user);
            logger.info('Usuario guardado exitosamente');
          }
          
          // Mapear datos del backend a nuestro formato local
          const newUser: User = {
            id: response.data.user.id,
            name: response.data.user.name,
            email: response.data.user.email,
            phone: response.data.user.phone,
            province: response.data.user.province,
            locality: response.data.user.locality,
            avatar: undefined,
            rating: 0,
            reviewCount: 0,
            completedJobs: 0,
            services: [],
            description: '',
            verified: false,
            createdAt: new Date().toISOString()
          };

          setUser(newUser);
          return { success: true };
          
        } else {
          logger.warn && logger.warn('No se recibió token del backend - registro exitoso pero sin autenticación automática');
          
          // El registro fue exitoso pero sin token
          // El usuario tendrá que hacer login por separado
          return { 
            success: true, 
            message: 'Registro exitoso. Por favor, inicia sesión con tu email y contraseña.',
            requiresLogin: true 
          };
        }
      } else {
        const formattedError = response.error ? formatRegisterError(response.error) : 'Error al registrarse';
        return { success: false, error: formattedError };
      }
    } catch (error: any) {
      logger.error('Error en registro:', error);
      return { success: false, error: 'Error de conexión. Verifica tu internet e intenta nuevamente.' };
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
  logger.debug('Enviando solicitud de recuperación para:', email);
      
      const response = await authAPI.forgotPassword(email);
      
      if (response.success) {
  logger.info('Solicitud de recuperación enviada exitosamente');
        return {
          success: true,
          message: response.message
        };
      } else {
  logger.error('Error en forgot password:', response.error);
        return {
          success: false,
          error: response.error
        };
      }
    } catch (error: any) {
  logger.error('Error en forgot password:', error);
      return { success: false, error: 'Error de conexión. Verifica tu internet e intenta nuevamente.' };
    }
  };

  const resetPassword = async (token: string, password: string, confirmPassword: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      // Validaciones locales
      if (password !== confirmPassword) {
        return { success: false, error: 'Las contraseñas no coinciden' };
      }

      if (password.length < 8 || password.length > 16) {
        return { success: false, error: 'La contraseña debe tener entre 8 y 16 caracteres' };
      }

      if (!/[A-Z]/.test(password)) {
        return { success: false, error: 'La contraseña debe contener al menos una mayúscula' };
      }

      if (!/[0-9]/.test(password)) {
        return { success: false, error: 'La contraseña debe contener al menos un número' };
      }

  logger.debug('Iniciando reset de contraseña...');
      
      // Usar la nueva API que coincide con el backend
      const response = await authAPI.resetPassword(token, password);
      
      if (response.success) {
  logger.info('Contraseña restablecida exitosamente');
        return {
          success: true,
          message: response.message
        };
      } else {
  logger.error('Error al restablecer contraseña:', response.error);
        return {
          success: false,
          error: response.error || 'Error al restablecer la contraseña'
        };
      }
    } catch (error: any) {
  logger.error('Error en reset password:', error);
      return { success: false, error: 'Error de conexión. Verifica tu internet e intenta nuevamente.' };
    }
  };

  const searchServices = (query: string, filters?: ServiceFilters): Service[] => {
    let filteredServices = services.filter(service => service.isActive);
    
    if (query) {
      const searchTerm = query.toLowerCase();
      filteredServices = filteredServices.filter(service =>
        service.title.toLowerCase().includes(searchTerm) ||
        service.description.toLowerCase().includes(searchTerm) ||
        service.category.toLowerCase().includes(searchTerm) ||
        service.providerName.toLowerCase().includes(searchTerm) ||
        service.zones.some(zone => 
          zone.province.toLowerCase().includes(searchTerm) ||
          zone.locality.toLowerCase().includes(searchTerm) ||
          zone.neighborhood?.toLowerCase().includes(searchTerm)
        )
      );
    }
    
    if (filters?.category) {
      filteredServices = filteredServices.filter(service => service.category === filters.category);
    }
    
    if (filters?.province) {
      filteredServices = filteredServices.filter(service =>
        service.zones.some(zone => zone.province === filters.province)
      );
    }
    
    if (filters?.locality) {
      filteredServices = filteredServices.filter(service =>
        service.zones.some(zone => zone.locality === filters.locality)
      );
    }
    
    return filteredServices;
  };

  const requestService = async (serviceId: string, date: string, time: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Debes iniciar sesión para solicitar un servicio' };
      }

      const service = services.find(s => s.id === serviceId);
      if (!service) {
        return { success: false, error: 'Servicio no encontrado' };
      }

      const newRequest: ServiceRequest = {
        id: Date.now().toString(),
        serviceId,
        serviceName: service.title,
  serviceImage: (service as any).image_url || (service as any).image,
        clientId: user.id,
        clientName: user.name,
        providerId: service.providerId,
        providerName: service.providerName,
        requestedDate: date,
        requestedTime: time,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      setUserRequests(prev => [...prev, newRequest]);
  try { addNotification?.({ type: 'success', message: 'Solicitud creada correctamente' }); } catch (e) {}
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error del servidor' };
    }
  };

  // Real create appointment using backend API
  const createAppointment = async (appointment: { service_id: number; date: string; time_slot: string; notes?: string }) => {
    try {
      if (!user) {
        return { success: false, error: 'Debes iniciar sesión para reservar un turno' };
      }

      const response = await authAPI.createAppointment(appointment);

      if (!response.success) {
        logger.warn('createAppointment API fallo:', response.error || response.message);
  try { addNotification?.({ type: 'error', message: response.error || response.message || 'Error creando turno' }); } catch(e) {}
        return { success: false, error: response.error || response.message };
      }

      const created = response.data;
      // Si el backend devuelve el turno creado, normalizar la fecha a YYYY-MM-DD
      if (created) {
        try {
          if (created.date && typeof created.date === 'string') {
            // Extraer la parte de fecha si viene como ISO timestamp
            const dateOnly = created.date.split('T')[0];
            created.date = dateOnly;
          }
        } catch (e) {
          logger.debug('No se pudo normalizar la fecha del turno creado', e);
        }

        setUserRequests(prev => [created, ...prev]);
        try { addNotification?.({ type: 'success', message: 'Turno reservado correctamente' }); } catch(e) {}
      }

      return { success: true, data: created };
    } catch (error) {
      logger.error('Error en createAppointment:', error);
      return { success: false, error: 'Error al crear turno' };
    }
  };

  const getServiceCalendar = async (serviceId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const response = await authAPI.getServiceCalendar(serviceId);
      if (!response.success) return { success: false, error: response.error };
      return { success: true, data: response.data };
    } catch (error) {
      logger.error('Error en getServiceCalendar:', error);
      return { success: false, error: 'Error del servidor' };
    }
  };

  const getServiceAvailability = async (serviceId: string, date: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const response = await authAPI.getServiceAvailability(serviceId, date);
      if (!response.success) return { success: false, error: response.error };
      return { success: true, data: response.data };
    } catch (error) {
      logger.error('Error en getServiceAvailability:', error);
      return { success: false, error: 'Error del servidor' };
    }
  };

  // Obtener perfil del usuario
  const getUserProfile = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      if (!user) return { success: false, error: 'No hay usuario autenticado' };
      
      const resp = await authAPI.getUserProfile();
      if (!resp.success) return { success: false, error: resp.error };

      // Actualizar estado local del usuario con los datos obtenidos
      if (resp.data) {
        const profileData = resp.data;
        const updatedUser: User = {
          id: profileData.id?.toString() || user.id,
          name: profileData.name || user.name,
          email: profileData.email || user.email,
          phone: profileData.phone || user.phone || '',
          province: profileData.province || user.province || '',
          locality: profileData.locality || user.locality || '',
          avatar: user.avatar,
          rating: user.rating,
          reviewCount: user.reviewCount,
          completedJobs: user.completedJobs,
          experience: user.experience,
          description: user.description,
          services: user.services,
          certifications: user.certifications,
          verified: user.verified,
          createdAt: profileData.created_at || user.createdAt
        };
        setUser(updatedUser);
        userStorage.setUser(updatedUser);
      }

      return { success: true, data: resp.data };
    } catch (error) {
      logger.error('Error en getUserProfile:', error);
      return { success: false, error: 'Error obteniendo perfil' };
    }
  };

  const updateUserProfile = async (profileData: { name?: string; email?: string; locality?: string; province?: string; phone?: string; }): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      // Usar el nuevo endpoint
      const resp = await authAPI.updateUserProfile(profileData);
      if (!resp.success) return { success: false, error: resp.error };

      // Actualizar estado local del usuario (si hay datos)
      if (resp.data) {
        const updated = resp.data;
        const newUser: User = {
          id: updated.id?.toString() || user?.id || 'unknown',
          name: updated.name || user?.name || '',
          email: updated.email || user?.email || '',
          phone: updated.phone || user?.phone || '',
          province: updated.province || user?.province || '',
          locality: updated.locality || user?.locality || '',
          avatar: user?.avatar,
          rating: user?.rating,
          reviewCount: user?.reviewCount,
          completedJobs: user?.completedJobs,
          experience: user?.experience,
          description: user?.description,
          services: user?.services,
          certifications: user?.certifications,
          verified: user?.verified,
          createdAt: updated.created_at || user?.createdAt
        };
        setUser(newUser);
        userStorage.setUser(newUser);
      }

      return { success: true, message: resp.message };
    } catch (error) {
      logger.error('Error en updateUserProfile:', error);
      return { success: false, error: 'Error actualizando perfil' };
    }
  };

  const respondToRequest = async (requestId: string, action: 'accept' | 'reject', rejectionReason?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Call backend to update status
      const resp = await authAPI.updateAppointmentStatus(requestId, action === 'accept' ? 'accepted' : 'rejected', { rejectionReason });
      if (!resp.success) return { success: false, error: resp.error };

      // Update local state to reflect backend
      setProviderRequests(prev => prev.map(request =>
        request.id === requestId
          ? {
              ...request,
              status: action === 'accept' ? 'accepted' : 'rejected',
              rejectionReason: action === 'reject' ? rejectionReason : undefined
            }
          : request
      ));

      setUserRequests(prev => prev.map(request =>
        request.id === requestId
          ? {
              ...request,
              status: action === 'accept' ? 'accepted' : 'rejected',
              rejectionReason: action === 'reject' ? rejectionReason : undefined
            }
          : request
      ));

      return { success: true };
    } catch (error) {
      logger.error('Error en respondToRequest:', error);
      return { success: false, error: 'Error del servidor' };
    }
  };

  const completeAppointment = async (appointmentId: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      logger.info('Completando appointment:', appointmentId);
      
      const result = await authAPI.completeAppointment(appointmentId);
      
      if (result.success) {
        // Actualizar estado local en providerRequests
        setProviderRequests(prev => prev.map(request =>
          request.id === appointmentId
            ? { ...request, status: 'completed' }
            : request
        ));

        // Actualizar estado local en userRequests
        setUserRequests(prev => prev.map(request =>
          request.id === appointmentId
            ? { ...request, status: 'completed' }
            : request
        ));

        logger.info('Appointment completado exitosamente');
        return { 
          success: true, 
          message: result.message || 'Servicio marcado como completado exitosamente' 
        };
      } else {
        logger.error('Error completando appointment:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      logger.error('Exception completando appointment:', error);
      return { success: false, error: 'Error inesperado al completar el servicio' };
    }
  };

  const addToFavorites = async (serviceId: string) => {
    if (!user) {
      logger.warn('Usuario no autenticado - no se puede agregar a favoritos');
      return;
    }

    // Actualizar UI inmediatamente (optimistic update)
    if (!favorites.includes(serviceId)) {
      const newFavorites = [...favorites, serviceId];
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      logger.debug('Favorito agregado localmente (optimistic):', serviceId);
    }

    try {
      const result = await authAPI.addToFavorites(parseInt(serviceId));
      
      if (result.success) {
        logger.info('Favorito agregado en servidor:', serviceId);
      } else {
        // Si falla en el servidor, revertir el cambio optimista
        logger.error('Error agregando favorito en servidor:', result.error);
        const revertedFavorites = favorites.filter(id => id !== serviceId);
        setFavorites(revertedFavorites);
        localStorage.setItem('favorites', JSON.stringify(revertedFavorites));
      }
    } catch (error) {
      // Si falla la petición, revertir el cambio optimista
      logger.error('Excepción agregando favorito:', error);
      const revertedFavorites = favorites.filter(id => id !== serviceId);
      setFavorites(revertedFavorites);
      localStorage.setItem('favorites', JSON.stringify(revertedFavorites));
    }
  };

  const removeFromFavorites = async (serviceId: string) => {
    if (!user) {
      logger.warn('Usuario no autenticado - no se puede eliminar de favoritos');
      return;
    }

    // Actualizar UI inmediatamente (optimistic update)
    const newFavorites = favorites.filter(id => id !== serviceId);
    const previousFavorites = [...favorites]; // Guardar para revertir si falla
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    logger.debug('Favorito eliminado localmente (optimistic):', serviceId);

    try {
      const result = await authAPI.removeFromFavorites(parseInt(serviceId));
      
      if (result.success) {
        logger.info('Favorito eliminado del servidor:', serviceId);
      } else {
        // Si falla en el servidor, revertir el cambio optimista
        logger.error('Error eliminando favorito del servidor:', result.error);
        setFavorites(previousFavorites);
        localStorage.setItem('favorites', JSON.stringify(previousFavorites));
      }
    } catch (error) {
      // Si falla la petición, revertir el cambio optimista
      logger.error('Excepción eliminando favorito:', error);
      setFavorites(previousFavorites);
      localStorage.setItem('favorites', JSON.stringify(previousFavorites));
    }
  };

  const submitReview = async (serviceRequestId: string, rating: number, comment: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Debes iniciar sesión para calificar' };
      }

      if (rating < 1 || rating > 5) {
        return { success: false, error: 'La calificación debe ser entre 1 y 5 estrellas' };
      }

      if (comment.length < 20 || comment.length > 500) {
        return { success: false, error: 'El comentario debe tener entre 20 y 500 caracteres' };
      }

      // Buscar el appointment para obtener el service_id
      const appointment = userRequests.find(req => req.id.toString() === serviceRequestId.toString());
      
      if (!appointment || !appointment.serviceId) {
        return { success: false, error: 'No se encontró información del servicio' };
      }

      const serviceId = parseInt(appointment.serviceId);
      
      console.log('🔍 [submitReview] Appointment encontrado:', appointment);
      console.log('🔍 [submitReview] Appointment status:', appointment.status);
      console.log('🔍 [submitReview] Service ID:', serviceId);
      console.log('🔍 [submitReview] Rating:', rating);
      console.log('🔍 [submitReview] Comment:', comment);
      
      // Validar que el appointment esté completado
      if (appointment.status !== 'completed' && appointment.status !== 'accepted') {
        return { 
          success: false, 
          error: 'Solo puedes calificar servicios completados o aceptados' 
        };
      }

      // Llamar a la API para crear la review
      const result = await authAPI.createReview(serviceId, rating, comment);
      
      console.log('🔍 [submitReview] Resultado de createReview:', result);
      
      if (result.success) {
        logger.info('Review enviada exitosamente:', result.data);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Error al enviar la reseña' };
      }
    } catch (error) {
      logger.error('Error en submitReview:', error);
      console.error('🔍 [submitReview] Exception:', error);
      return { success: false, error: 'Error del servidor' };
    }
  };

  const createService = async (serviceData: CreateServiceData): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Debes estar autenticado para crear servicios' };
      }

      if (serviceData.description.length < 100) {
        return { success: false, error: 'La descripción debe tener al menos 100 caracteres' };
      }

      // Mapear datos del frontend al formato del backend
      // Normalizar availability a { day: ['HH:MM-HH:MM', ...], ... }
      const normalizeAvailabilityToBackend = (availabilityInput: any) => {
        const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
        const result: Record<string, string[]> = {};

        if (!availabilityInput) return result;

        // Si viene como array [{day, timeSlots: [{start,end}]}]
        if (Array.isArray(availabilityInput)) {
          availabilityInput.forEach((entry: any) => {
            if (entry.day && Array.isArray(entry.timeSlots)) {
              result[entry.day] = entry.timeSlots.map((ts: any) => `${ts.start}-${ts.end}`);
            }
          });
          return result;
        }

        // Si viene como objeto por día
        if (typeof availabilityInput === 'object') {
          for (const d of days) {
            const val = availabilityInput[d];
            if (!val) continue;

            // Si es un array de strings
            if (Array.isArray(val) && val.length && typeof val[0] === 'string') {
              result[d] = val;
              continue;
            }

            // Si es objeto con timeSlots
            if (Array.isArray(val.timeSlots)) {
              result[d] = val.timeSlots.map((ts: any) => `${ts.start}-${ts.end}`);
              continue;
            }
          }
        }

        return result;
      };

      const backendServiceData: any = {
        title: serviceData.title,
        description: serviceData.description,
        category: serviceData.category,
        price: Number(serviceData.price) || 0,
        // Añadir duración y ventana si están presentes en el formulario
        duration_minutes: Number((serviceData as any).durationMinutes) || Number((serviceData as any).duration_minutes) || 60,
        booking_window_days: Number((serviceData as any).bookingWindowDays) || Number((serviceData as any).booking_window_days) || 30,
        availability: normalizeAvailabilityToBackend(serviceData.availability),
        zones: serviceData.zones
          .filter(zone => zone.province && zone.locality)
          .map(zone => ({
            province: zone.province,
            locality: zone.locality,
            neighborhood: zone.neighborhood || ""
          })),
  image_url: serviceData.image || (serviceData as any).image_url,
      };

  // Mostrar payload explícitamente en consola para debugging (no depende de VITE_DEBUG)
  console.log('Payload enviado a createService:', backendServiceData);
  const response = await authAPI.createService(backendServiceData);
      
      if (response.success && response.data) {
  logger.info('Servicio creado exitosamente:', response.data);
        // Mapear la respuesta del backend al modelo de frontend y actualizar el estado
        const created = response.data;
        const mappedService: Service = {
          id: created.id.toString(),
          title: created.title,
          description: created.description,
          category: created.category,
          providerId: user.id,
          providerName: user.name,
          providerAvatar: user.avatar,
          rating: 0,
          reviewCount: 0,
          price: created.price,
            image: created.image_url || (created as any).image || '',
          image_url: created.image_url,
          zones: Array.isArray(created.zones) ? created.zones : [],
          availability: created.availability || [],
          isActive: created.status === 'active',
          createdAt: created.created_at || new Date().toISOString()
        };

        // Prepend para que aparezca inmediatamente en la lista del usuario
        setServices(prev => [mappedService, ...prev]);

        return { success: true };
      } else {
        return { success: false, error: response.error || 'Error desconocido' };
      }
    } catch (error) {
  logger.error('Error en createService:', error);
      return { success: false, error: 'Error del servidor' };
    }
  };

  const updateService = async (serviceId: string, serviceData: CreateServiceData): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Debes estar autenticado para editar servicios' };
      }

  logger.debug('Datos de entrada updateService:', serviceData);

      // Reutilizar la normalización de availability creada para createService
      const normalizeAvailabilityToBackend = (availabilityInput: any) => {
        const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
        const result: Record<string, string[]> = {};

        if (!availabilityInput) return result;

        if (Array.isArray(availabilityInput)) {
          availabilityInput.forEach((entry: any) => {
            if (entry.day && Array.isArray(entry.timeSlots)) {
              result[entry.day] = entry.timeSlots.map((ts: any) => `${ts.start}-${ts.end}`);
            }
          });
          return result;
        }

        if (typeof availabilityInput === 'object') {
          for (const d of days) {
            const val = availabilityInput[d];
            if (!val) continue;

            if (Array.isArray(val) && val.length && typeof val[0] === 'string') {
              result[d] = val;
              continue;
            }

            if (Array.isArray(val.timeSlots)) {
              result[d] = val.timeSlots.map((ts: any) => `${ts.start}-${ts.end}`);
              continue;
            }
          }
        }

        return result;
      };

      const backendServiceData: any = {
        title: serviceData.title,
        description: serviceData.description,
        category: serviceData.category,
        price: Number(serviceData.price) || 0,
        duration_minutes: Number((serviceData as any).durationMinutes) || Number((serviceData as any).duration_minutes) || 60,
        booking_window_days: Number((serviceData as any).bookingWindowDays) || Number((serviceData as any).booking_window_days) || 30,
        availability: normalizeAvailabilityToBackend(serviceData.availability),
        zones: serviceData.zones
          .filter(zone => zone.province && zone.locality)
          .map(zone => ({
            province: zone.province,
            locality: zone.locality,
            neighborhood: zone.neighborhood || ""
          })),
  image_url: serviceData.image || (serviceData as any).image_url,
      };

    // Mostrar payload explícitamente en consola para debugging (no depende de VITE_DEBUG)
    console.log('Payload enviado a updateService:', backendServiceData);
    logger.debug('Datos enviados al backend:', backendServiceData);

    const response = await authAPI.updateService(serviceId, backendServiceData);
      
  logger.debug('Respuesta del backend:', response);

      if (response.success && response.data) {
  logger.info('Servicio actualizado exitosamente:', response.data);
        
        // Actualizar estado local si es necesario
        setServices(prevServices => 
          prevServices.map(service => 
            service.id === serviceId && service.providerId === user.id
              ? {
                  ...service,
                  title: serviceData.title,
                  description: serviceData.description,
                  category: serviceData.category,
                  price: serviceData.price,
                  zones: serviceData.zones,
                  // availability se maneja directamente del backend en futuras cargas
                  image: serviceData.image
                }
              : service
          )
        );
        
        return { success: true };
      } else {
  logger.error('Error del backend al actualizar servicio:', response);
        return { success: false, error: response.error || 'Error desconocido' };
      }
    } catch (error) {
  logger.error('Error en updateService:', error);
      return { success: false, error: 'Error del servidor' };
    }
  };

  const getUserServices = useCallback(async (): Promise<{ success: boolean; data?: any[]; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Debes estar autenticado para obtener tus servicios' };
      }

      if (isLoadingServices) {
        logger.debug('getUserServices ya está en progreso, saltando...');
        return { success: true, data: services };
      }

      setIsLoadingServices(true);
      logger.debug('Obteniendo mis servicios...');
      const response = await authAPI.getUserServices();
      
      if (response.success && response.data) {
        logger.info('Mis servicios obtenidos');
        // Normalizar la forma: puede venir como ServiceResponse[] o como { services: ServiceResponse[] }
        const rawData: any = response.data;
        const servicesList: any[] = Array.isArray(rawData)
          ? rawData
          : (rawData.services || rawData.data || []);

        // Log para debug: ver qué status recibimos
        servicesList.forEach((service: any, index: number) => {
          logger.debug(`Servicio ${index + 1}: "${service.title}" - Status: "${service.status}"`);
        });

        // Mapear ServiceResponse[] a Service[] y actualizar el estado
        const mappedServices: Service[] = servicesList.map((serviceResponse: any) => {
          const mappedService = {
            id: serviceResponse.id.toString(),
            title: serviceResponse.title,
            description: serviceResponse.description,
            category: serviceResponse.category,
            providerId: user.id,
            providerName: user.name,
            providerAvatar: user.avatar,
            rating: 0,
            reviewCount: 0,
            price: serviceResponse.price,
            image: serviceResponse.image_url || (serviceResponse as any).image || '',
            image_url: serviceResponse.image_url,
            zones: Array.isArray(serviceResponse.zones) ? serviceResponse.zones : [],
            availability: serviceResponse.availability || [],
            isActive: serviceResponse.status === 'active',
            createdAt: serviceResponse.created_at || new Date().toISOString()
          };
          
          logger.debug(`Mapeado "${mappedService.title}": status="${serviceResponse.status}" → isActive=${mappedService.isActive}`);
          return mappedService;
        });
        
        setServices(mappedServices);
        const activeCount = mappedServices.filter(s => s.isActive).length;
  logger.info(`Servicios actualizados en el estado: ${mappedServices.length} total, ${activeCount} activos`);
        
        return { success: true, data: servicesList };
      } else {
        return { success: false, error: response.error || 'Error al obtener servicios' };
      }
      } catch (error) {
      logger.error('Error en getUserServices:', error);
      return { success: false, error: 'Error del servidor' };
    } finally {
      setIsLoadingServices(false);
    }
  }, [user?.id, user?.name, user?.avatar, isLoadingServices, services]); // Incluir dependencias necesarias para el mapeo

  const getServices = useCallback(async (): Promise<{ success: boolean; data?: any[]; error?: string }> => {
    try {
      const response = await authAPI.getServices();
      if (response.success && response.data) {
        // Normalizar la respuesta: puede venir como arreglo o como { services: [...] }
        const rawData: any = response.data;
        const servicesList: any[] = Array.isArray(rawData)
          ? rawData
          : (rawData.services || rawData.data || []);
        return { success: true, data: servicesList };
      } else {
        return { success: false, error: response.error || 'Error al obtener servicios' };
      }
      } catch (error) {
      logger.error('Error en getServices:', error);
      return { success: false, error: 'Error del servidor' };
    }
  }, []);

  const getServiceById = useCallback(async (serviceId: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const response = await authAPI.getServiceById(serviceId);
      
      if (response.success && response.data) {
        logger.info('Servicio obtenido por ID');
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Error al obtener el servicio' };
      }
    } catch (error) {
      logger.error('Error en getServiceById:', error);
      return { success: false, error: 'Error del servidor' };
    }
  }, []);

  // Obtener los turnos del usuario autenticado (cliente)
  const getMyAppointments = useCallback(async (): Promise<{ success: boolean; data?: any[]; error?: string }> => {
    try {
      if (!user) return { success: false, error: 'Debes iniciar sesión' };
      const resp = await authAPI.getMyAppointments();
      if (!resp.success) return { success: false, error: resp.error };

      const appointments = Array.isArray(resp.data) ? resp.data : [];

      // Mapear al formato ServiceRequest que usa la UI
      const mapped = appointments.map((a: any) => {
        const svc = a.service || {};
        const provider = a.provider || svc.provider || {};
        return {
          id: a.id?.toString() || Date.now().toString(),
          serviceId: svc.id?.toString() || '',
          serviceName: svc.title || 'Servicio',
          serviceImage: svc.image_url || svc.image || '',
          clientId: a.client_id?.toString() || user.id,
          clientName: user.name,
          providerId: a.provider_id?.toString() || '',
          providerName: provider.name || svc.providerName || svc.provider_name || 'Proveedor no disponible',
          providerPhone: provider.phone || '',
          providerLocality: provider.locality || '',
          providerProvince: provider.province || '',
          requestedDate: a.date, // Use date field directly as it's already in YYYY-MM-DD format
          requestedTime: a.time_slot,
          status: a.status,
          rejectionReason: a.rejection_reason || a.rejectionReason || undefined,
          createdAt: a.created_at || a.createdAt || new Date().toISOString()
        } as ServiceRequest;
      });

      setUserRequests(mapped);
      return { success: true, data: appointments };
    } catch (error) {
      logger.error('Error en getMyAppointments:', error);
      return { success: false, error: 'Error al obtener mis turnos' };
    }
  }, [user?.id, user?.name]);

  // Obtener los turnos de un servicio (para el proveedor que lo ofrece)
  const getServiceAppointments = useCallback(async (serviceId: string): Promise<{ success: boolean; data?: any[]; error?: string }> => {
    try {
      if (!user) return { success: false, error: 'Debes iniciar sesión' };
      const resp = await authAPI.getServiceAppointments(serviceId);
      if (!resp.success) return { success: false, error: resp.error };

      const appointments = Array.isArray(resp.data) ? resp.data : [];

      // Mapear al formato ServiceRequest que usa la UI
      const mapped = appointments.map((a: any) => {
        const svc = a.service || {};
        const provider = a.provider || svc.provider || {};
        return {
          id: a.id?.toString() || Date.now().toString(),
          serviceId: svc.id?.toString() || serviceId,
          serviceName: svc.title || 'Servicio',
          serviceImage: svc.image_url || svc.image || '',
          clientId: a.client_id?.toString() || '',
          clientName: a.client_name || a.client?.name || 'Cliente',
          providerId: a.provider_id?.toString() || user.id,
          providerName: provider.name || a.provider_name || a.provider?.name || user.name,
          providerPhone: provider.phone || '',
          providerLocality: provider.locality || '',
          providerProvince: provider.province || '',
          requestedDate: a.date, // Use date field directly as it's already in YYYY-MM-DD format
          requestedTime: a.time_slot,
          status: a.status,
          rejectionReason: a.rejection_reason || a.rejectionReason || undefined,
          createdAt: a.created_at || a.createdAt || new Date().toISOString()
        } as ServiceRequest;
      });

      setProviderRequests(mapped);
      setProviderRequestsLoaded(true);
      return { success: true, data: appointments };
    } catch (error) {
      logger.error('Error en getServiceAppointments:', error);
      return { success: false, error: 'Error al obtener los turnos del servicio' };
    }
  }, [user?.id, user?.name]);

  // Obtener turnos de todos los servicios del proveedor y consolidarlos en providerRequests
  const getAllServiceAppointments = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) return { success: false, error: 'Debes iniciar sesión' };
      if (isLoadingAppointments) {
        logger.debug('getAllServiceAppointments ya está en progreso, saltando...');
        return { success: true };
      }

      setIsLoadingAppointments(true);
      
      // Si no hay servicios en memoria, intentar recargarlos
      let svcList = services;
      if (!svcList || svcList.length === 0) {
        logger.debug('No hay servicios en memoria, recargando...');
        const resp = await getUserServices();
        if (resp.success && resp.data) {
          svcList = resp.data;
        } else {
          logger.debug('No se pudieron cargar los servicios, usando lista vacía');
          svcList = [];
        }
      }

      // Recolectar promises para cada servicio
      const allAppointments: ServiceRequest[] = [];
      for (const s of svcList) {
        try {
          const resp = await authAPI.getServiceAppointments((s as any).id.toString());
          if (resp.success && Array.isArray(resp.data)) {
            const mapped = resp.data.map((a: any) => {
              const svc = a.service || a.service_data || s;
              const provider = a.provider || svc.provider || {};
              return {
                id: a.id?.toString() || Date.now().toString(),
                serviceId: svc.id?.toString() || (s as any).id?.toString() || '',
                serviceName: svc.title || svc.name || (s as any).title || 'Servicio',
                serviceImage: (svc as any).image_url || (svc as any).image || (s as any).image_url || (s as any).image || '',
                clientId: a.client_id?.toString() || a.client?.id?.toString() || '',
                clientName: a.client_name || a.client?.name || '',
                providerId: a.provider_id?.toString() || a.provider?.id?.toString() || user.id,
                providerName: provider.name || a.provider_name || a.provider?.name || user.name,
                providerPhone: provider.phone || '',
                providerLocality: provider.locality || '',
                providerProvince: provider.province || '',
                requestedDate: a.date,
                requestedTime: a.time_slot,
                status: a.status,
                rejectionReason: (a as any).rejection_reason || (a as any).rejectionReason || undefined,
                createdAt: a.created_at || a.createdAt || new Date().toISOString()
              } as ServiceRequest;
            });
            allAppointments.push(...mapped);
          }
        } catch (e) {
          logger.debug('Error cargando appointments para servicio', (s as any).id, e);
        }
      }

      // Ordenar por fecha descendente
      allAppointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setProviderRequests(allAppointments);
      setProviderRequestsLoaded(true);
      return { success: true };
    } catch (error) {
      logger.error('Error en getAllServiceAppointments:', error);
      return { success: false, error: 'Error al obtener los turnos de los servicios' };
    } finally {
      setIsLoadingAppointments(false);
    }
  }, [user?.id, user?.name, services, getUserServices, isLoadingAppointments]); // Incluimos las dependencias necesarias

  const getCategories = useCallback(async (): Promise<{ success: boolean; data?: string[]; error?: string }> => {
    try {
      const response = await authAPI.getCategories();
      
      if (response.success && response.data) {
        logger.info('Categorías obtenidas');
        setCategories(response.data);
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Error al obtener categorías' };
      }
    } catch (error) {
      logger.error('Error en getCategories:', error);
      return { success: false, error: 'Error del servidor' };
    }
  }, []);

  const toggleServiceStatus = async (serviceId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Debes estar autenticado para cambiar el estado del servicio' };
      }

      // Determinar el nuevo estado según el servicio actual en memoria
      const current = services.find(s => s.id === serviceId);
      const newStatus = current && current.isActive ? 'inactive' : 'active';

      // Llamar al API con el status en el body
      const response = await authAPI.toggleServiceStatus(serviceId, newStatus);

      if (!response.success) {
        return { success: false, error: response.error || 'Error al cambiar estado del servicio' };
      }

      // Si la API nos devolvió el recurso actualizado, usarlo para actualizar el estado local
      if (response.data) {
        const updated = response.data;
        const updatedMapped: Service = {
          id: updated.id.toString(),
          title: updated.title,
          description: updated.description,
          category: updated.category,
          providerId: user.id,
          providerName: user.name,
          providerAvatar: user.avatar,
          rating: 0,
          reviewCount: 0,
          price: updated.price,
          image: updated.image_url || (updated as any).image || '',
          image_url: updated.image_url,
          zones: Array.isArray(updated.zones) ? updated.zones : [],
          availability: updated.availability || [],
          isActive: updated.status === 'active',
          createdAt: updated.created_at || new Date().toISOString()
        };

        setServices(prev => prev.map(s => s.id === serviceId ? updatedMapped : s));
      } else {
        // Si la API no devuelve data, recargar la lista de servicios para sincronizar
        const userServicesResponse = await authAPI.getUserServices();
        if (userServicesResponse.success && userServicesResponse.data) {
          const mappedServices: Service[] = userServicesResponse.data.map((serviceResponse: any) => {
            const mappedService = {
              id: serviceResponse.id.toString(),
              title: serviceResponse.title,
              description: serviceResponse.description,
              category: serviceResponse.category,
              providerId: user.id,
              providerName: user.name,
              providerAvatar: user.avatar,
              rating: 0,
              reviewCount: 0,
              price: serviceResponse.price,
              image: serviceResponse.image_url || (serviceResponse as any).image || '',
              image_url: serviceResponse.image_url,
              zones: Array.isArray(serviceResponse.zones) ? serviceResponse.zones : [],
              availability: serviceResponse.availability || [],
              isActive: serviceResponse.status === 'active',
              createdAt: serviceResponse.created_at || new Date().toISOString()
            };
            return mappedService;
          });

          setServices(mappedServices);
        }
      }

      return { success: true };
    } catch (error) {
      logger.error('Error en toggleServiceStatus:', error);
      return { success: false, error: 'Error del servidor' };
    }
  };

  const deactivateService = async (serviceId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Debes estar autenticado para desactivar servicios' };
      }

      // Actualizar estado del servicio en memoria
      setServices(prevServices => 
        prevServices.map(service => 
          service.id === serviceId && service.providerId === user.id
            ? { ...service, isActive: false }
            : service
        )
      );

  logger.info('Service deactivated:', serviceId);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error del servidor' };
    }
  };

  const reactivateService = async (serviceId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Debes estar autenticado para reactivar servicios' };
      }

      // Actualizar estado del servicio en memoria
      setServices(prevServices => 
        prevServices.map(service => 
          service.id === serviceId && service.providerId === user.id
            ? { ...service, isActive: true }
            : service
        )
      );

  logger.info('Service reactivated:', serviceId);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error del servidor' };
    }
  };

  const deleteService = async (serviceId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Debes estar autenticado para eliminar servicios' };
      }

      // Llamar al API para eliminar el servicio
      const response = await authAPI.deleteService(serviceId);

      if (!response.success) {
        logger.warn('deleteService API error:', response.error);
        return { success: false, error: response.error || 'Error al eliminar servicio' };
      }

      // Si la API respondió con éxito, actualizar el estado local
      // Preferimos recargar la lista del usuario para asegurar sincronización completa
      const userServicesResponse = await authAPI.getUserServices();
      if (userServicesResponse.success && userServicesResponse.data) {
        const mappedServices: Service[] = userServicesResponse.data.map((serviceResponse: any) => {
          return {
            id: serviceResponse.id.toString(),
            title: serviceResponse.title,
            description: serviceResponse.description,
            category: serviceResponse.category,
            providerId: user.id,
            providerName: user.name,
            providerAvatar: user.avatar,
            rating: 0,
            reviewCount: 0,
            price: serviceResponse.price,
            image: serviceResponse.image_url || (serviceResponse as any).image || '',
            image_url: serviceResponse.image_url,
            zones: Array.isArray(serviceResponse.zones) ? serviceResponse.zones : [],
            availability: serviceResponse.availability || [],
            isActive: serviceResponse.status === 'active',
            createdAt: serviceResponse.created_at || new Date().toISOString()
          };
        });

        setServices(mappedServices);
      } else {
        // Como fallback, eliminar localmente si la recarga falla
        setServices(prevServices => prevServices.filter(s => s.id !== serviceId));
      }

      logger.info('Service deleted (API):', serviceId);
      return { success: true };
    } catch (error) {
      logger.error('Error en deleteService:', error);
      return { success: false, error: 'Error del servidor' };
    }
  };

  const logout = () => {
    userStorage.clearAll();
    setUser(null);
    // Limpiar todo el estado relacionado al usuario al cerrar sesión
    setServices([]);
    setUserRequests([]);
    setProviderRequests([]);
    setFavorites([]);
    setLoginAttempts(0);
    setIsBlocked(false);
  };

  const value: AuthContextType = {
    user,
    services,
    userRequests,
    providerRequests,
    favorites,
    categories,
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    searchServices,
    requestService,
    createAppointment,
    respondToRequest,
    completeAppointment,
    addToFavorites,
    removeFromFavorites,
    submitReview,
    createService,
    updateService,
    getUserServices,
    getAllServiceAppointments,
    getServices,
    getServiceById,
    getCategories,
  providerRequestsLoaded,
  isLoadingAppointments,
  getServiceCalendar,
  getServiceAvailability,
    getMyAppointments,
    getServiceAppointments,
    getUserProfile,
  updateUserProfile,
    toggleServiceStatus,
    deactivateService,
    reactivateService,
    deleteService,
    isAuthenticated: !!user,
    loading,
    loginAttempts,
    isBlocked
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};