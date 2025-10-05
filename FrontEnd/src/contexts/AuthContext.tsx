import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, UserRegister as BackendUserRegister } from '../api/auth';
import { tokenStorage, userStorage } from '../utils/storage';
import logger from '../utils/logger';

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
  requestedDate: string;
  requestedTime: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
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
  respondToRequest: (requestId: string, action: 'accept' | 'reject', rejectionReason?: string) => Promise<{ success: boolean; error?: string }>;
  addToFavorites: (serviceId: string) => void;
  removeFromFavorites: (serviceId: string) => void;
  submitReview: (serviceRequestId: string, rating: number, comment: string) => Promise<{ success: boolean; error?: string }>;
  createService: (serviceData: CreateServiceData) => Promise<{ success: boolean; error?: string }>;
  updateService: (serviceId: string, serviceData: CreateServiceData) => Promise<{ success: boolean; error?: string }>;
  getUserServices: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
  getServices: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
  getServiceById: (serviceId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  getCategories: () => Promise<{ success: boolean; data?: string[]; error?: string }>;
  toggleServiceStatus: (serviceId: string) => Promise<{ success: boolean; error?: string }>;
  deactivateService: (serviceId: string) => Promise<{ success: boolean; error?: string }>;
  reactivateService: (serviceId: string) => Promise<{ success: boolean; error?: string }>;
  deleteService: (serviceId: string) => Promise<{ success: boolean; error?: string }>;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [userRequests, setUserRequests] = useState<ServiceRequest[]>([]);
  const [providerRequests, setProviderRequests] = useState<ServiceRequest[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  // Limpiar datos derivados del usuario cuando cambia el usuario (evita datos cacheados de otro usuario)
  useEffect(() => {
    setServices([]);
    setUserRequests([]);
    setProviderRequests([]);
    // Nota: no tocamos categories (globales) ni loading aquí
  }, [user?.id]);

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
    const savedFavorites = localStorage.getItem('favorites');
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
    
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    
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
        
        return { success: false, error: response.error || 'Credenciales incorrectas' };
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
        return { success: false, error: response.error || 'Error al registrarse' };
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
        serviceImage: service.image_url || service.image || 'https://via.placeholder.com/400x300?text=Sin+Imagen',
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
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error del servidor' };
    }
  };

  const respondToRequest = async (requestId: string, action: 'accept' | 'reject', rejectionReason?: string): Promise<{ success: boolean; error?: string }> => {
    try {

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
      return { success: false, error: 'Error del servidor' };
    }
  };

  const addToFavorites = (serviceId: string) => {
    if (!favorites.includes(serviceId)) {
      const newFavorites = [...favorites, serviceId];
      setFavorites(newFavorites);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    }
  };

  const removeFromFavorites = (serviceId: string) => {
    const newFavorites = favorites.filter(id => id !== serviceId);
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
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

      // Simulación de guardado de reseña
  logger.info('Review submitted:', { serviceRequestId, rating, comment });
      return { success: true };
    } catch (error) {
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
      const backendServiceData: any = {
        title: serviceData.title,
        description: serviceData.description,
        category: serviceData.category,
        price: serviceData.price || 0, // Usar el precio del formulario o 0 por defecto
        availability: {
          monday: { available: false },
          tuesday: { available: false },
          wednesday: { available: false },
          thursday: { available: false },
          friday: { available: false },
          saturday: { available: false },
          sunday: { available: false },
          // Mapear desde el formato frontend (objeto)
          ...serviceData.availability
        },
        zones: serviceData.zones
          .filter(zone => zone.province && zone.locality)
          .map(zone => ({
            province: zone.province,
            locality: zone.locality,
            neighborhood: zone.neighborhood || ""
          })),
        image_url: serviceData.image
      };

      const response = await authAPI.createService(backendServiceData);
      
      if (response.success && response.data) {
  logger.info('Servicio creado exitosamente:', response.data);
        // Aquí podrías actualizar el estado local si es necesario
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

      // Mapear datos del frontend al formato del backend
      const backendServiceData: any = {
        title: serviceData.title,
        description: serviceData.description,
        category: serviceData.category,
        price: serviceData.price || 0, // Incluir el precio
        availability: {
          monday: { available: false },
          tuesday: { available: false },
          wednesday: { available: false },
          thursday: { available: false },
          friday: { available: false },
          saturday: { available: false },
          sunday: { available: false },
          // Mapear desde el formato frontend (objeto)
          ...serviceData.availability
        },
        zones: serviceData.zones
          .filter(zone => zone.province && zone.locality)
          .map(zone => ({
            province: zone.province,      // Backend Go struct espera Province pero API TypeScript espera province
            locality: zone.locality,      // Usando lowercase para coincidir con la respuesta de la API
            neighborhood: zone.neighborhood || ""
          })),
        image_url: serviceData.image
      };

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

      logger.debug('Obteniendo mis servicios...');
      const response = await authAPI.getUserServices();
      
      if (response.success && response.data) {
        logger.info('Mis servicios obtenidos');
        
        // Log para debug: ver qué status recibimos
        response.data.forEach((service: any, index: number) => {
          logger.debug(`Servicio ${index + 1}: "${service.title}" - Status: "${service.status}"`);
        });
        
        // Mapear ServiceResponse[] a Service[] y actualizar el estado
        const mappedServices: Service[] = response.data.map((serviceResponse: any) => {
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
            image: serviceResponse.image_url || 'https://via.placeholder.com/400x300?text=Sin+Imagen',
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
        
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error || 'Error al obtener servicios' };
      }
      } catch (error) {
      logger.error('Error en getUserServices:', error);
      return { success: false, error: 'Error del servidor' };
    }
  }, [user?.id, user?.name, user?.avatar]); // Incluir dependencias necesarias para el mapeo

  const getServices = useCallback(async (): Promise<{ success: boolean; data?: any[]; error?: string }> => {
    try {
      const response = await authAPI.getServices();
      
      if (response.success && response.data) {
        return { success: true, data: response.data };
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

      const response = await authAPI.toggleServiceStatus(serviceId);
      
      if (response.success) {
        logger.info('Estado del servicio cambiado');
        
        // Actualizar estado local si es necesario
        // Nota: Como no sabemos el nuevo estado exacto del backend, refrescar los servicios
        const userServicesResponse = await authAPI.getUserServices();
        if (userServicesResponse.success && userServicesResponse.data) {
          logger.debug('Refrescando servicios después de toggle...');
          
          // Mapear ServiceResponse[] a Service[]
          const mappedServices: Service[] = userServicesResponse.data.map((serviceResponse: any) => {
            const mappedService = {
              id: serviceResponse.id.toString(),
              title: serviceResponse.title,
              description: serviceResponse.description,
              category: serviceResponse.category,
              providerId: user.id,
              providerName: user.name,
              providerAvatar: user.avatar,
              rating: 0, // No disponible en ServiceResponse
              reviewCount: 0, // No disponible en ServiceResponse
              price: serviceResponse.price,
              image: serviceResponse.image_url || 'https://via.placeholder.com/400x300?text=Sin+Imagen',
              image_url: serviceResponse.image_url,
              zones: Array.isArray(serviceResponse.zones) ? serviceResponse.zones : [],
              availability: serviceResponse.availability || [],
              isActive: serviceResponse.status === 'active',
              createdAt: serviceResponse.created_at || new Date().toISOString()
            };
            
            if (serviceResponse.id.toString() === serviceId) {
              logger.debug(`Servicio toggleado "${mappedService.title}": status="${serviceResponse.status}" → isActive=${mappedService.isActive}`);
            }
            
            return mappedService;
          });
          
          setServices(mappedServices);
          const activeCount = mappedServices.filter(s => s.isActive).length;
          logger.info(`Servicios refrescados: ${mappedServices.length} total, ${activeCount} activos`);
        }
        
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Error al cambiar estado del servicio' };
      }
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

      // Eliminar servicio de memoria
      setServices(prevServices => 
        prevServices.filter(service => 
          !(service.id === serviceId && service.providerId === user.id)
        )
      );

  logger.info('Service deleted:', serviceId);
      return { success: true };
    } catch (error) {
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
    respondToRequest,
    addToFavorites,
    removeFromFavorites,
    submitReview,
    createService,
    updateService,
    getUserServices,
    getServices,
    getServiceById,
    getCategories,
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