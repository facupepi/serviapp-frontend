// Tipos basados en la estructura de la API real

export interface ServiceAvailability {
  [key: string]: {
    start?: string;
    end?: string;
    available?: boolean;
  };
}

export interface ServiceZone {
  province: string;
  locality: string;
  neighborhood: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  availability: ServiceAvailability;
  zones: ServiceZone[];
  status: 'active' | 'inactive';
  image_url: string;
  created_at: string;
  updated_at: string;
}

// Tipos para respuestas de la API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ServicesResponse extends ApiResponse<Service[]> {}

export interface ServiceResponse extends ApiResponse<Service> {}
