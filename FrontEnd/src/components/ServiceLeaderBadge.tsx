import React from 'react';
import { Award } from 'lucide-react';

interface ServiceLeaderBadgeProps {
  averageRating?: number;
  ratingsCount?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Insignia "Services Líder" que se muestra cuando un servicio tiene:
 * - Promedio de rating ≥ 4
 * - Al menos 5 calificaciones
 */
const ServiceLeaderBadge: React.FC<ServiceLeaderBadgeProps> = ({ 
  averageRating, 
  ratingsCount,
  showLabel = true,
  size = 'md'
}) => {
  // Validar si cumple con los requisitos para ser "Services Líder"
  const isServiceLeader = 
    averageRating !== undefined && 
    averageRating >= 4 && 
    ratingsCount !== undefined && 
    ratingsCount >= 5;

  // No mostrar nada si no cumple los requisitos
  if (!isServiceLeader) {
    return null;
  }

  // Tamaños configurables
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'h-3 w-3',
    },
    md: {
      container: 'px-2.5 py-1 text-sm',
      icon: 'h-4 w-4',
    },
    lg: {
      container: 'px-3 py-1.5 text-base',
      icon: 'h-5 w-5',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div 
      className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 font-semibold rounded-full ${classes.container} shadow-sm`}
      title="Servicio con excelente reputación (promedio ≥ 4 y al menos 5 calificaciones)"
    >
      <Award className={`${classes.icon} fill-current`} />
      {showLabel && <span>Services Líder</span>}
    </div>
  );
};

export default ServiceLeaderBadge;
