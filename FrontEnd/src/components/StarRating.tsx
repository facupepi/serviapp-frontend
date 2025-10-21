import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
}

/**
 * Componente para mostrar y/o seleccionar calificación con estrellas
 * @param rating - Calificación actual (0-5)
 * @param onRatingChange - Callback cuando cambia la calificación (modo interactivo)
 * @param readonly - Si es true, solo muestra las estrellas sin permitir interacción
 * @param size - Tamaño de las estrellas: sm, md, lg
 * @param showCount - Mostrar número de calificaciones
 * @param count - Número de calificaciones
 */
const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md',
  showCount = false,
  count = 0,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const starSize = sizeClasses[size];

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((value) => {
          const isFilled = value <= rating;
          const isPartial = value === Math.ceil(rating) && rating % 1 !== 0;
          
          return (
            <button
              key={value}
              type="button"
              onClick={() => handleClick(value)}
              disabled={readonly}
              className={`${
                readonly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-110 transition-transform'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 rounded`}
              aria-label={`${value} ${value === 1 ? 'estrella' : 'estrellas'}`}
            >
              <Star
                className={`${starSize} ${
                  isFilled
                    ? 'fill-yellow-400 text-yellow-400'
                    : isPartial
                    ? 'fill-yellow-200 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      
      {showCount && count > 0 && (
        <span className="text-sm text-gray-600 ml-1">
          ({count} {count === 1 ? 'reseña' : 'reseñas'})
        </span>
      )}
      
      {rating > 0 && !showCount && (
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
