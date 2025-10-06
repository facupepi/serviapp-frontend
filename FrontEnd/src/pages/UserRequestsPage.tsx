import React, { useEffect } from 'react';
// Image is required on services; use service-provided URL directly
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Calendar, Star, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface RequestCardProps {
  request: any;
  onRate?: (requestId: string) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onRate }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
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
      case 'expired':
        return <XCircle className="h-4 w-4" />;
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
      case 'expired':
        return 'Caducada';
      default:
        return 'Desconocido';
    }
  };

  const getStatusDescription = (status: string, rejectionReason?: string) => {
    switch (status) {
      case 'pending':
        return 'Esta solicitud aún no ha sido respondida por el proveedor.';
      case 'accepted':
        return 'El proveedor ha confirmado tu solicitud.';
      case 'rejected':
        return rejectionReason ? `Motivo: ${rejectionReason}` : 'El proveedor rechazó tu solicitud.';
      case 'expired':
        return 'Esta solicitud no fue respondida a tiempo y ha caducado.';
      default:
        return '';
    }
  };

  const requestDate = request.requestedDate ? new Date(request.requestedDate) : null;
  const canRate = request.status === 'accepted' && (requestDate ? requestDate < new Date() : false);

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
        <div className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {request.serviceName}
            </h3>
            <div className="flex items-center text-gray-600 text-sm mb-3">
              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
              <span className="font-medium">
                {requestDate
                  ? requestDate.toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
                  : request.requestedDate}
                {request.requestedTime ? ` · ${request.requestedTime}` : ''}
              </span>
            </div>
          </div>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)} w-fit`}>
            {getStatusIcon(request.status)}
            <span className="ml-1">{getStatusText(request.status)}</span>
          </div>
        </div>
        {/* Image: full-width below content */}

      <div className="px-6 pb-4">
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {getStatusDescription(request.status, request.rejectionReason)}
        </p>
      </div>

      <div className="mt-3 w-full">
        <img
          src={request.serviceImage}
          alt={request.serviceName}
          className="w-full h-44 object-cover rounded-b-xl"
            onError={() => { /* image required on backend */ }}
        />
      </div>

      {canRate && onRate && (
        <div className="border-t border-gray-100 px-6 py-4">
          <button
            onClick={() => onRate(request.id)}
            className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Star className="h-4 w-4 mr-2" />
            Calificar servicio
          </button>
        </div>
      )}
    </div>
  );
};

export default function UserRequestsPage() {
  const navigate = useNavigate();
  const { userRequests, isAuthenticated, getMyAppointments } = useAuth();
  const [viewMode, setViewMode] = React.useState<'kanban' | 'list'>('kanban');
  const [loadingAppointments, setLoadingAppointments] = React.useState(false);
  const [appointmentsError, setAppointmentsError] = React.useState<string | null>(null);

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

  const handleRate = (requestId: string) => {
    navigate(`/calificar/${requestId}`);
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
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 rounded ${viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
            >
              Lista
            </button>
          </div>
        </div>
        {sortedRequests.length === 0 ? (
          loadingAppointments ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando turnos...</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onRate={handleRate}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedRequests.map((request) => {
                const date = request.requestedDate ? new Date(request.requestedDate) : null;
                const formattedDate = date ? date.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) : '';
                const timeRange = request.requestedTime || '';
                const statusMap: Record<string, string> = {
                  pending: 'Pendiente',
                  accepted: 'Aceptada',
                  rejected: 'Rechazada',
                  expired: 'Caducada'
                };
                const statusLabel = statusMap[request.status] || 'Desconocido';
                const description = (request as any).description || '';

                return (
                  <div key={request.id} className="bg-white rounded-lg p-4 shadow border flex items-center space-x-4">
                    <img src={request.serviceImage} alt={request.serviceName} className="w-28 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{request.serviceName}</h4>
                      {description ? <p className="text-sm text-gray-600 mt-1">{description}</p> : null}
                      <div className="mt-2 text-sm text-gray-700">
                        <span className="font-medium">{formattedDate}</span>
                        {timeRange ? <span className="text-gray-500"> · {timeRange}</span> : null}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="px-3 py-1 rounded-full text-sm font-medium border bg-gray-50 text-gray-800">{statusLabel}</div>
                      {request.status === 'accepted' && (
                        <button onClick={() => handleRate(request.id)} className="px-3 py-1 bg-blue-600 text-white rounded">Calificar</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}
