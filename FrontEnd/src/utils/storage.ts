import Cookies from 'js-cookie';

// Configuración de cookies seguras
const COOKIE_CONFIG = {
  expires: 7, // 7 días
  secure: true, // Solo HTTPS en producción
  sameSite: 'strict' as const, // Protección CSRF
  httpOnly: false, // Necesario false para acceso desde JS
  path: '/', // Disponible en toda la aplicación
};

// Configuración para desarrollo local
const DEV_COOKIE_CONFIG = {
  expires: 7,
  secure: false, // HTTP permitido en desarrollo
  sameSite: 'lax' as const, // Más permisivo en desarrollo
  httpOnly: false,
  path: '/', // Disponible en toda la aplicación
};

// Detectar si estamos en producción
const isProduction = window.location.protocol === 'https:';

export const tokenStorage = {
  // Guardar token en cookie segura
  setToken: (token: string): void => {
    if (!token || token === 'undefined' || token.trim().length === 0) {
      console.error('❌ Intento de guardar token inválido:', token);
      return;
    }
    
    console.log('💾 Guardando token en cookies:', token);
    const config = isProduction ? COOKIE_CONFIG : DEV_COOKIE_CONFIG;
    Cookies.set('authToken', token, config);
    
    // Verificar que se guardó correctamente
    const savedToken = Cookies.get('authToken');
    console.log('✅ Token verificado en cookies:', savedToken);
  },

  // Obtener token de cookie
  getToken: (): string | null => {
    return Cookies.get('authToken') || null;
  },

  // Eliminar token
  removeToken: (): void => {
    Cookies.remove('authToken');
  },

  // Verificar si hay token válido
  hasValidToken: (): boolean => {
    const token = Cookies.get('authToken');
    return !!token && token.length > 0;
  }
};

export const userStorage = {
  // Guardar datos del usuario en localStorage (no sensibles)
  setUser: (userData: any): void => {
    localStorage.setItem('userData', JSON.stringify(userData));
  },

  // Obtener datos del usuario
  getUser: (): any | null => {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Eliminar datos del usuario
  removeUser: (): void => {
    localStorage.removeItem('userData');
  },

  // Limpiar todo
  clearAll: (): void => {
    tokenStorage.removeToken();
    userStorage.removeUser();
    localStorage.removeItem('favorites');
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('blockTime');
  }
};
