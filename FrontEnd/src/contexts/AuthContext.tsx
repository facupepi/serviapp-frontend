import React, { createContext, useContext, useState, useEffect } from 'react';

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
  mockProviders: User[];
  userRequests: ServiceRequest[];
  providerRequests: ServiceRequest[];
  favorites: string[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  searchServices: (query: string, filters?: ServiceFilters) => Service[];
  requestService: (serviceId: string, date: string, time: string) => Promise<{ success: boolean; error?: string }>;
  respondToRequest: (requestId: string, action: 'accept' | 'reject', rejectionReason?: string) => Promise<{ success: boolean; error?: string }>;
  addToFavorites: (serviceId: string) => void;
  removeFromFavorites: (serviceId: string) => void;
  submitReview: (serviceRequestId: string, rating: number, comment: string) => Promise<{ success: boolean; error?: string }>;
  createService: (serviceData: CreateServiceData) => Promise<{ success: boolean; error?: string }>;
  updateService: (serviceId: string, serviceData: CreateServiceData) => Promise<{ success: boolean; error?: string }>;
  deactivateService: (serviceId: string) => Promise<{ success: boolean; error?: string }>;
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
  zones: Zone[];
  availability: Availability[];
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

// Mock data para desarrollo
const mockServices: Service[] = [
  {
    id: '1',
    title: 'Plomería Profesional',
    description: 'Servicios de plomería para hogares y empresas. Reparación de cañerías, destapaciones, instalación de sanitarios y más. Con más de 10 años de experiencia en el rubro.',
    category: 'Plomería',
    providerId: '2',
    providerName: 'Carlos Rodríguez',
    rating: 4.8,
    reviewCount: 15,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center',
    zones: [
      { province: 'Buenos Aires', locality: 'Capital Federal', neighborhood: 'Palermo' },
      { province: 'Buenos Aires', locality: 'Capital Federal', neighborhood: 'Villa Crespo' }
    ],
    availability: [
      { day: 'monday', timeSlots: [{ start: '09:00', end: '17:00' }] },
      { day: 'tuesday', timeSlots: [{ start: '09:00', end: '17:00' }] },
      { day: 'wednesday', timeSlots: [{ start: '09:00', end: '17:00' }] }
    ],
    isActive: true,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Electricidad y Instalaciones',
    description: 'Servicios eléctricos completos: instalaciones nuevas, reparaciones, cambio de tableros, iluminación LED y automatización del hogar. Trabajo garantizado y seguro.',
    category: 'Electricidad',
    providerId: '3',
    providerName: 'María González',
    rating: 4.9,
    reviewCount: 23,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop&crop=center',
    zones: [
      { province: 'Córdoba', locality: 'Córdoba Capital', neighborhood: 'Nueva Córdoba' }
    ],
    availability: [
      { day: 'monday', timeSlots: [{ start: '08:00', end: '18:00' }] },
      { day: 'thursday', timeSlots: [{ start: '08:00', end: '18:00' }] },
      { day: 'friday', timeSlots: [{ start: '08:00', end: '16:00' }] }
    ],
    isActive: true,
    createdAt: '2024-02-10'
  },
  {
    id: '3',
    title: 'Limpieza Integral del Hogar',
    description: 'Servicio completo de limpieza residencial y comercial. Limpieza profunda, mantenimiento regular, limpieza post-construcción y desinfección.',
    category: 'Limpieza',
    providerId: '2',
    providerName: 'Carlos Rodríguez',
    rating: 4.7,
    reviewCount: 18,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop&crop=center',
    zones: [
      { province: 'Buenos Aires', locality: 'Capital Federal', neighborhood: 'Recoleta' }
    ],
    availability: [
      { day: 'tuesday', timeSlots: [{ start: '09:00', end: '17:00' }] },
      { day: 'wednesday', timeSlots: [{ start: '09:00', end: '17:00' }] },
      { day: 'thursday', timeSlots: [{ start: '09:00', end: '17:00' }] }
    ],
    isActive: true,
    createdAt: '2024-01-20'
  },
  {
    id: '4',
    title: 'Jardinería y Paisajismo',
    description: 'Diseño, mantenimiento y cuidado de jardines. Poda de árboles, césped, plantas ornamentales y sistemas de riego automático.',
    category: 'Jardinería',
    providerId: '3',
    providerName: 'María González',
    rating: 4.6,
    reviewCount: 12,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop&crop=center',
    zones: [
      { province: 'Córdoba', locality: 'Córdoba Capital', neighborhood: 'Cerro de las Rosas' }
    ],
    availability: [
      { day: 'monday', timeSlots: [{ start: '07:00', end: '15:00' }] },
      { day: 'tuesday', timeSlots: [{ start: '07:00', end: '15:00' }] },
      { day: 'saturday', timeSlots: [{ start: '08:00', end: '12:00' }] }
    ],
    isActive: true,
    createdAt: '2024-03-05'
  },
  {
    id: '5',
    title: 'Carpintería y Muebles a Medida',
    description: 'Fabricación y reparación de muebles de madera. Placards, estanterías, mesas, sillas y trabajos de carpintería en general.',
    category: 'Carpintería',
    providerId: '2',
    providerName: 'Carlos Rodríguez',
    rating: 4.9,
    reviewCount: 25,
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop&crop=center',
    zones: [
      { province: 'Buenos Aires', locality: 'Capital Federal', neighborhood: 'San Telmo' }
    ],
    availability: [
      { day: 'monday', timeSlots: [{ start: '08:00', end: '18:00' }] },
      { day: 'tuesday', timeSlots: [{ start: '08:00', end: '18:00' }] },
      { day: 'friday', timeSlots: [{ start: '08:00', end: '18:00' }] }
    ],
    isActive: true,
    createdAt: '2024-02-15'
  }
];

const mockProviders: User[] = [
  {
    id: '1',
    name: 'Juan Carlos Méndez',
    email: 'juan.mendez@email.com',
    phone: '+54 11 4567-8901',
    province: 'Buenos Aires',
    locality: 'Capital Federal',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    rating: 4.9,
    reviewCount: 127,
    completedJobs: 234,
    experience: '8 años',
    services: ['Plomería y Gasfitería', 'Reparación de cañerías', 'Instalación de grifos', 'Destapado de cloacas'],
    description: 'Especialista en plomería residencial y comercial con más de 8 años de experiencia. Ofrezco servicios de calidad con garantía extendida. Disponible para emergencias las 24 horas.',
    certifications: [
      'Certificado de Gasista Matriculado',
      'Curso de Soldadura Especializada',
      'Certificación en Seguridad Laboral'
    ],
    createdAt: '2016-03-15'
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@email.com',
    phone: '+54 11 5678-9012',
    province: 'Buenos Aires',
    locality: 'San Telmo',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    rating: 4.7,
    reviewCount: 43,
    completedJobs: 189,
    experience: '6 años',
    services: ['Electricidad', 'Carpintería', 'Limpieza'],
    description: 'Profesional multi-servicios con experiencia en electricidad, carpintería y limpieza. Trabajo con materiales de primera calidad y garantía en todos mis servicios.',
    certifications: [
      'Electricista Matriculado',
      'Certificado de Carpintería',
      'Curso de Seguridad e Higiene'
    ],
    verified: true,
    createdAt: '2018-07-20'
  },
  {
    id: '3',
    name: 'María González',
    email: 'maria.gonzalez@email.com',
    phone: '+54 351 234-5678',
    province: 'Córdoba',
    locality: 'Cerro de las Rosas',
    avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    rating: 4.6,
    reviewCount: 28,
    completedJobs: 156,
    experience: '5 años',
    services: ['Jardinería y Paisajismo', 'Mantenimiento de jardines', 'Diseño de espacios verdes'],
    description: 'Especialista en jardinería y paisajismo con amplia experiencia en diseño y mantenimiento de espacios verdes. Trabajo con plantas nativas y sistemas de riego eficientes.',
    certifications: [
      'Técnica en Jardinería',
      'Curso de Paisajismo',
      'Certificación en Riego Automático'
    ],
    verified: true,
    createdAt: '2019-04-10'
  }
];

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ana Martínez',
    email: 'ana@email.com',
    phone: '+54 11 9876-5432',
    province: 'Buenos Aires',
    locality: 'Capital Federal',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    rating: 4.5,
    reviewCount: 12,
    completedJobs: 15,
    services: ['Limpieza del hogar', 'Organización de espacios'],
    description: 'Me especializo en limpieza y organización del hogar. Trabajo con productos ecológicos y tengo experiencia en espacios residenciales.',
    verified: true,
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    email: 'carlos@email.com',
    phone: '+54 11 5555-1234',
    province: 'Buenos Aires',
    locality: 'Capital Federal',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    rating: 4.8,
    reviewCount: 15,
    completedJobs: 45,
    experience: '6 años',
    services: ['Electricidad', 'Carpintería', 'Reparaciones generales'],
    description: 'Electricista y carpintero con más de 6 años de experiencia. Realizo trabajos de calidad con garantía.',
    certifications: ['Electricista Matriculado', 'Certificado de Carpintería'],
    verified: true,
    createdAt: '2023-06-15'
  },
  {
    id: '3',
    name: 'María González',
    email: 'maria@email.com',
    phone: '+54 351 444-5678',
    province: 'Córdoba',
    locality: 'Córdoba Capital',
    avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    rating: 4.9,
    reviewCount: 23,
    completedJobs: 67,
    experience: '5 años',
    services: ['Jardinería', 'Paisajismo', 'Mantenimiento de jardines'],
    description: 'Especialista en jardinería y paisajismo. Creo espacios verdes únicos y sostenibles.',
    certifications: ['Técnica en Jardinería', 'Curso de Paisajismo'],
    verified: true,
    createdAt: '2023-08-20'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [services] = useState<Service[]>(mockServices);
  const [userRequests, setUserRequests] = useState<ServiceRequest[]>([]);
  const [providerRequests, setProviderRequests] = useState<ServiceRequest[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    // Verificar si hay un token guardado al cargar la app
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    const savedFavorites = localStorage.getItem('favorites');
    const attempts = localStorage.getItem('loginAttempts');
    const blockTime = localStorage.getItem('blockTime');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
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
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (isBlocked) {
        return { success: false, error: 'Demasiados intentos fallidos. Intenta nuevamente en 10 minutos.' };
      }

      const foundUser = mockUsers.find(u => u.email === email);
      
      if (foundUser && (password === 'Password123' || password === 'password123')) { // Mock password - acepta ambas
        const token = 'mock-jwt-token-' + Date.now();
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(foundUser));
        localStorage.removeItem('loginAttempts');
        setUser(foundUser);
        setLoginAttempts(0);
        return { success: true };
      }
      
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
      
      return { success: false, error: 'Credenciales incorrectas' };
    } catch (error) {
      return { success: false, error: 'Error del servidor' };
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validaciones
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

      // Verificar email único
      const existingUser = mockUsers.find(u => u.email === userData.email);
      if (existingUser) {
        return { success: false, error: 'Ese correo ya está registrado' };
      }

      // Crear nuevo usuario
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        province: userData.province,
        locality: userData.locality,
        avatar: undefined,
        rating: 0,
        reviewCount: 0,
        completedJobs: 0,
        services: [],
        description: '',
        verified: false,
        createdAt: new Date().toISOString()
      };

      const token = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(newUser));
      setUser(newUser);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error del servidor' };
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulación - siempre devuelve éxito por seguridad
      console.log('Password reset requested for:', email);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error del servidor' };
    }
  };

  const resetPassword = async (token: string, password: string, confirmPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (password !== confirmPassword) {
        return { success: false, error: 'Las contraseñas no coinciden' };
      }

      if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        return { success: false, error: 'La contraseña no cumple con los requisitos de seguridad' };
      }

      // Simulación de validación de token
      if (!token || token === 'invalid') {
        return { success: false, error: 'El enlace de recuperación no es válido o ha expirado. Por favor, solicitá uno nuevo.' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error del servidor' };
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
        serviceImage: service.image,
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
      console.log('Review submitted:', { serviceRequestId, rating, comment });
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

      // Simulación de creación de servicio
      console.log('Service created:', serviceData);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error del servidor' };
    }
  };

  const updateService = async (serviceId: string, serviceData: CreateServiceData): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Debes estar autenticado para editar servicios' };
      }

      console.log('Service updated:', { serviceId, serviceData });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error del servidor' };
    }
  };

  const deactivateService = async (serviceId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'Debes estar autenticado para desactivar servicios' };
      }

      console.log('Service deactivated:', serviceId);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error del servidor' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    services,
    mockProviders,
    userRequests,
    providerRequests,
    favorites,
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
    deactivateService,
    isAuthenticated: !!user,
    loading,
    loginAttempts,
    isBlocked
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};