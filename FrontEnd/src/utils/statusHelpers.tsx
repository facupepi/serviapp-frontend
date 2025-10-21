import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { AppointmentStatus } from '../types/api';

/**
 * Obtiene las clases de Tailwind CSS para el badge de estado
 */
export const getStatusColor = (status: AppointmentStatus): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'accepted':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'cancelled':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'expired':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Obtiene el icono apropiado para el estado
 */
export const getStatusIcon = (status: AppointmentStatus, size: 'sm' | 'md' = 'md') => {
  const className = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  
  switch (status) {
    case 'pending':
      return <Clock className={className} />;
    case 'accepted':
    case 'completed':
      return <CheckCircle className={className} />;
    case 'rejected':
    case 'cancelled':
    case 'expired':
      return <XCircle className={className} />;
    default:
      return <Clock className={className} />;
  }
};

/**
 * Obtiene el texto en español para mostrar el estado
 */
export const getStatusText = (status: AppointmentStatus): string => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'accepted':
      return 'Aceptada';
    case 'rejected':
      return 'Rechazada';
    case 'cancelled':
      return 'Cancelada';
    case 'completed':
      return 'Completada';
    case 'expired':
      return 'Caducada';
    default:
      return 'Desconocido';
  }
};

/**
 * Verifica si una solicitud puede ser respondida (solo pendientes)
 */
export const canRespondToRequest = (status: AppointmentStatus): boolean => {
  return status === 'pending';
};

/**
 * Verifica si una solicitud puede ser calificada (aceptadas y pasadas)
 */
export const canRateRequest = (status: AppointmentStatus, requestDate: Date | null): boolean => {
  return status === 'accepted' && requestDate !== null && requestDate < new Date();
};

/**
 * Verifica si una solicitud está finalizada (no puede ser modificada)
 */
export const isRequestFinalized = (status: AppointmentStatus): boolean => {
  return ['rejected', 'cancelled', 'completed', 'expired'].includes(status);
};
