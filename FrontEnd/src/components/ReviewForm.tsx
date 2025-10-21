import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import StarRating from './StarRating';

interface ReviewFormProps {
  serviceName: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onClose: () => void;
  isOpen: boolean;
  initialRating?: number;
  initialComment?: string;
  isEditing?: boolean;
}

/**
 * Modal con formulario para calificar un servicio
 * Permite seleccionar rating (1-5 estrellas) y escribir comentario (20-500 caracteres)
 */
const ReviewForm: React.FC<ReviewFormProps> = ({
  serviceName,
  onSubmit,
  onClose,
  isOpen,
  initialRating = 0,
  initialComment = '',
  isEditing = false,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MIN_COMMENT_LENGTH = 20;
  const MAX_COMMENT_LENGTH = 500;

  // Reinicializar el formulario cuando se abre en modo edición
  useEffect(() => {
    if (isOpen) {
      setRating(initialRating);
      setComment(initialComment);
      setError(null);
    }
  }, [isOpen, initialRating, initialComment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (rating === 0) {
      setError('Por favor selecciona una calificación');
      return;
    }

    if (comment.trim().length < MIN_COMMENT_LENGTH) {
      setError(`El comentario debe tener al menos ${MIN_COMMENT_LENGTH} caracteres`);
      return;
    }

    if (comment.trim().length > MAX_COMMENT_LENGTH) {
      setError(`El comentario no puede superar ${MAX_COMMENT_LENGTH} caracteres`);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(rating, comment.trim());
      // Reset form
      setRating(0);
      setComment('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al enviar la reseña');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRating(0);
      setComment('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  const commentLength = comment.trim().length;
  const isCommentValid = commentLength >= MIN_COMMENT_LENGTH && commentLength <= MAX_COMMENT_LENGTH;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Editar Reseña' : 'Calificar Servicio'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{serviceName}</p>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                ¿Cómo calificarías este servicio? *
              </label>
              <div className="flex items-center justify-center py-4">
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                  size="lg"
                  readonly={false}
                />
              </div>
              {rating > 0 && (
                <p className="text-center text-sm text-gray-600 mt-2">
                  {rating === 1 && 'Muy malo'}
                  {rating === 2 && 'Malo'}
                  {rating === 3 && 'Regular'}
                  {rating === 4 && 'Bueno'}
                  {rating === 5 && 'Excelente'}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Cuéntanos tu experiencia *
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe tu experiencia con este servicio..."
                rows={5}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  commentLength > 0 && !isCommentValid
                    ? 'border-red-300'
                    : 'border-gray-300'
                }`}
                maxLength={MAX_COMMENT_LENGTH}
                disabled={loading}
              />
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs ${
                  commentLength < MIN_COMMENT_LENGTH
                    ? 'text-gray-500'
                    : isCommentValid
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {commentLength < MIN_COMMENT_LENGTH
                    ? `Mínimo ${MIN_COMMENT_LENGTH} caracteres`
                    : isCommentValid
                    ? 'Comentario válido ✓'
                    : `Máximo ${MAX_COMMENT_LENGTH} caracteres`}
                </span>
                <span className="text-xs text-gray-500">
                  {commentLength}/{MAX_COMMENT_LENGTH}
                </span>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || rating === 0 || !isCommentValid}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditing ? 'Actualizando...' : 'Enviando...'}
                  </>
                ) : (
                  isEditing ? 'Guardar Cambios' : 'Enviar Reseña'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ReviewForm;
