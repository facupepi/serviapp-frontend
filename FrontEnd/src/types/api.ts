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

export interface Provider {
  id: number;
  name: string;
  phone?: string;
  locality?: string;
  province?: string;
}

export interface Service {
  id: number;
  user_id?: number;
  provider?: Provider;
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
  average_rating?: number;
  ratings_count?: number;
  is_favorite?: boolean;
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

// Estados posibles de una solicitud/cita
export type AppointmentStatus = 
  | 'pending'     // Pendiente de aceptación por el proveedor
  | 'accepted'    // Aceptado por el proveedor
  | 'rejected'    // Rechazado por el proveedor
  | 'cancelled'   // Cancelado por el cliente
  | 'completed'   // Completado
  | 'expired';    // Caducado automáticamente (pending que quedó en el pasado)

export interface Appointment {
  id: number;
  service: Service;
  serviceId?: number; // Para casos donde solo viene el ID
  client_id: number;
  provider_id: number;
  provider?: Provider;
  date: string; // YYYY-MM-DD
  time_slot: string; // e.g. "09:00-09:30"
  status: AppointmentStatus;
  notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentsResponse extends ApiResponse<Appointment[]> {}

export interface Review {
  id: number;
  user_id: number;
  user_name: string;
  user_avatar?: string | null;
  rating: number; // 1-5
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface RatingDistribution {
  "1": number;
  "2": number;
  "3": number;
  "4": number;
  "5": number;
}

export interface ReviewsData {
  reviews: Review[];
  average_rating: number;
  total_reviews: number;
  rating_distribution: RatingDistribution;
  user_review?: Review | null; // Review del usuario autenticado (si existe)
}

export interface ReviewsResponse extends ApiResponse<ReviewsData> {}
