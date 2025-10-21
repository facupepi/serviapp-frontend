import React, { useEffect, useState } from 'react';
// Image is required on services; use service-provided URL directly
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Calendar, Star, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ReviewForm from '../components/ReviewForm';
import { useNotifications } from '../contexts/NotificationContext';
import { authAPI } from '../api/auth';

interface RequestCardProps {
  request: any;
  onRate?: (requestId: string) => void;
  kanbanView?: boolean;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onRate, kanbanView = false }) => {
  // Parse a YYYY-MM-DD string into a local Date object (avoids UTC parsing)
  const parseLocalDate = (dateStr: string) => {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return new Date(dateStr);
    const [y, m, d] = dateStr.split('-').map((v) => parseInt(v, 10));
    return new Date(y, m - 1, d);
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
      case 'cancelled':
      case 'expired':
        return <XCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
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

  const requestDate = request.requestedDate ? parseLocalDate(request.requestedDate) : null;
  // Solo se puede calificar si el servicio está completado
  // El backend requiere status = 'completed' para crear una review
  const canRate = request.status === 'completed';

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {kanbanView ? (
        /* Vista Kanban: Layout horizontal con imagen a la derecha */
        <div className="flex h-56">
          {/* Columna izquierda: Información */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{request.serviceName}</h3>
              
              {/* Provider info */}
              {request.providerName && (
                <div className="mb-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Proveedor:</span> {request.providerName}
                  </p>
                  {request.providerLocality && request.providerProvince && (
                    <p className="text-xs text-gray-500">
                      {request.providerLocality}, {request.providerProvince}
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex items-center text-gray-600 text-sm mb-3">
                <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                <span className="font-medium">
                  {requestDate
                    ? requestDate.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })
                    : request.requestedDate}
                  {request.requestedTime ? ` · ${request.requestedTime}` : ''}
                </span>
              </div>
              
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)} w-fit mb-3`}>
                {getStatusIcon(request.status)}
                <span className="ml-1">{getStatusText(request.status)}</span>
              </div>

              {request.rejectionReason && (
                <p className="text-gray-600 text-xs leading-relaxed">
                  Motivo: {request.rejectionReason}
                </p>
              )}
            </div>

            {/* Botón de calificar */}
            {canRate && onRate && (
              <div className="mt-2">
                <button
                  onClick={() => onRate(request.id)}
                  className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Calificar
                </button>
              </div>
            )}
          </div>

          {/* Columna derecha: Imagen */}
          <div className="w-32">
            <img
              src={request.serviceImage}
              alt={request.serviceName}
              className="w-full h-full object-cover"
              onError={() => { /* image required on backend */ }}
            />
          </div>
        </div>
      ) : (
        /* Vista no-Kanban: Layout horizontal compacto tipo lista */
        <div className="flex items-center p-4">
          {/* Imagen a la izquierda */}
          <div className="w-16 h-16 flex-shrink-0 mr-4">
            <img
              src={request.serviceImage}
              alt={request.serviceName}
              className="w-full h-full object-cover rounded-lg"
              onError={() => { /* image required on backend */ }}
            />
          </div>

          {/* Información principal */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{request.serviceName}</h3>
            
            {/* Provider info */}
            {request.providerName && (
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Proveedor:</span> {request.providerName}
                {request.providerLocality && request.providerProvince && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({request.providerLocality}, {request.providerProvince})
                  </span>
                )}
              </p>
            )}
            
            <div className="flex items-center text-gray-600 text-sm mt-1">
              <Calendar className="h-4 w-4 mr-1 text-blue-500" />
              <span>
                {requestDate
                  ? requestDate.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })
                  : request.requestedDate}
                {request.requestedTime ? ` • ${request.requestedTime}` : ''}
              </span>
            </div>
            {request.rejectionReason && (
              <p className="text-gray-500 text-xs mt-1 truncate">
                Motivo: {request.rejectionReason}
              </p>
            )}
          </div>

          {/* Estado y acciones */}
          <div className="flex items-center space-x-4">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
              {getStatusIcon(request.status)}
              <span className="ml-1">{getStatusText(request.status)}</span>
            </div>

            {/* Botón de calificar */}
            {canRate && onRate && (
              <button 
                onClick={() => onRate(request.id)} 
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Star className="h-4 w-4" />
                <span>Calificar</span>
              </button>
            )}
            
            {/* Mensaje informativo para servicios aceptados pero no completados */}
            {request.status === 'accepted' && requestDate && requestDate >= new Date() && (
              <span className="text-xs text-gray-500 italic">
                Podrás calificar después del servicio
              </span>
            )}
            
            {/* Mensaje para servicios aceptados cuya fecha ya pasó pero no están completados */}
            {request.status === 'accepted' && requestDate && requestDate < new Date() && (
              <span className="text-xs text-amber-600 italic">
                ⏳ Esperando que el proveedor marque como completado
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function UserRequestsPage() {
  const navigate = useNavigate();
  const { userRequests, isAuthenticated, getMyAppointments, submitReview } = useAuth();
  const { addNotification } = useNotifications();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [existingReview, setExistingReview] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Cargar los turnos del backend al montar la página
  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated) return;
      setLoadingAppointments(true);
      setAppointmentsError(null);
      try {
        const resp = await getMyAppointments();
        if (!resp.success) {
          setAppointmentsError(resp.error || 'No se pudieron obtener los turnos');
        }
      } catch (error) {
        setAppointmentsError('Error al obtener los turnos');
      } finally {
        setLoadingAppointments(false);
      }
    };

    load();
  }, [isAuthenticated, getMyAppointments]);

  // No renderizar nada si no está autenticado (mientras redirige)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  const handleRate = async (requestId: string) => {
    const request = userRequests.find(r => r.id === requestId);
    if (!request) return;

    setSelectedRequest(request);

    // Verificar si el usuario ya tiene una review para este servicio
    try {
      const reviewsResult = await authAPI.getServiceReviews(parseInt(request.serviceId));
      
      if (reviewsResult.success && reviewsResult.data?.user_review) {
        // El usuario ya tiene una review, abrir en modo edición
        setExistingReview(reviewsResult.data.user_review);
        setIsEditMode(true);
        addNotification({
          type: 'info',
          message: 'Ya tienes una reseña para este servicio. Puedes editarla.',
        });
      } else {
        // No tiene review, modo creación
        setExistingReview(null);
        setIsEditMode(false);
      }
      
      setReviewModalOpen(true);
    } catch (error) {
      console.error('Error verificando reviews existentes:', error);
      // Si hay error, permitir abrir el modal de todas formas
      setExistingReview(null);
      setIsEditMode(false);
      setReviewModalOpen(true);
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!selectedRequest) return;

    try {
      let result;

      if (isEditMode && existingReview?.id) {
        // Modo edición: actualizar review existente
        result = await authAPI.updateReview(existingReview.id, rating, comment);
        
        if (result.success) {
          addNotification({
            type: 'success',
            message: 'Reseña actualizada exitosamente',
          });
        }
      } else {
        // Modo creación: crear nueva review
        result = await submitReview(selectedRequest.id, rating, comment);
        
        if (result.success) {
          addNotification({
            type: 'success',
            message: 'Reseña enviada exitosamente',
          });
        }
      }
      
      if (result.success) {
        setReviewModalOpen(false);
        setSelectedRequest(null);
        setExistingReview(null);
        setIsEditMode(false);
        // Recargar solicitudes para actualizar el estado
        await getMyAppointments();
      } else {
        throw new Error(result.error || 'Error al procesar la reseña');
      }
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.message || 'Error al procesar la reseña',
      });
      throw error;
    }
  };

  const sortedRequests = [...userRequests].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver al dashboard
        </button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Clock className="h-8 w-8 text-blue-600 mr-3" />
            Mis Solicitudes
          </h1>
          <p className="mt-2 text-gray-600">
            Seguimiento de todas las solicitudes de servicios que realizaste
          </p>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div>
            {/* placeholder to keep spacing */}
          </div>
          {/* Toggle de vista */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Lista
            </button>
          </div>
        </div>
        {sortedRequests.length === 0 ? (
          loadingAppointments ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando solicitudes...</span>
            </div>
          ) : appointmentsError ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{appointmentsError}</p>
              <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded">Reintentar</button>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Clock className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes solicitudes de servicios
              </h3>
              <p className="text-gray-500 mb-6">
                Cuando solicites un servicio, aparecerá aquí para que puedas hacer seguimiento.
              </p>
              <button
                onClick={() => navigate('/services')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Buscar Servicios
              </button>
            </div>
          )
          ) : (
          viewMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onRate={handleRate}
                  kanbanView={true}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {sortedRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onRate={handleRate}
                  kanbanView={false}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Modal de Reseña */}
      {selectedRequest && (
        <ReviewForm
          isOpen={reviewModalOpen}
          serviceName={selectedRequest.serviceName}
          onSubmit={handleSubmitReview}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedRequest(null);
            setExistingReview(null);
            setIsEditMode(false);
          }}
          initialRating={existingReview?.rating}
          initialComment={existingReview?.comment}
          isEditing={isEditMode}
        />
      )}
    </div>
  );
}
