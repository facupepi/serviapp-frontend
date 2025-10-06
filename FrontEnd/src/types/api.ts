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
  duration_minutes?: number;
  booking_window_days?: number;
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

export interface Appointment {
  id: number;
  service: Service;
  client_id: number;
  provider_id: number;
  date: string; // YYYY-MM-DD
  time_slot: string; // e.g. "09:00-09:30"
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentsResponse extends ApiResponse<Appointment[]> {}
