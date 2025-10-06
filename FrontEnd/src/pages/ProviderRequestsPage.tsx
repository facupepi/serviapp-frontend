import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Calendar, MessageSquare, ArrowLeft, Grid3X3, List } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface RequestCardProps {
  request: any;
  kanbanView?: boolean;
}

function ProviderRequestCard({ request, kanbanView = false }: RequestCardProps) {
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const { respondToRequest } = useAuth();

  // Parse a YYYY-MM-DD string into a local Date object (avoids UTC parsing)
  const parseLocalDate = (dateStr: string) => {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return new Date(dateStr);
    const [y, m, d] = dateStr.split('-').map((v) => parseInt(v, 10));
    return new Date(y, m - 1, d);
  };

  const requestDate = request.requestedDate ? parseLocalDate(request.requestedDate) : null;
  const canRespond = request.status === 'pending';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'accepted':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'accepted':
        return <CheckCircle className="h-3 w-3" />;
      case 'rejected':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
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
      default:
        return 'Desconocido';
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      await respondToRequest(request.id, 'accept');
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      return;
    }
    
    setLoading(true);
    try {
      await respondToRequest(request.id, 'reject', rejectionReason);
      setShowRejectModal(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
        {kanbanView ? (
          /* Vista Kanban: Layout horizontal con imagen a la derecha */
          <div className="flex h-56">
            {/* Columna izquierda: Información y botones */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{request.serviceName}</h3>
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

              {/* Botones con emojis mejorados */}
              {canRespond && (
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={handleAccept}
                    disabled={loading}
                    className="w-8 h-8 flex items-center justify-center bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                    title="Aceptar"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={loading}
                    className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                    title="Rechazar"
                  >
                    ✕
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
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100">
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

              {/* Estado */}
              <div className="flex items-center space-x-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span className="ml-1">{getStatusText(request.status)}</span>
                </div>

                {/* Botones de acción */}
                {canRespond && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAccept}
                      disabled={loading}
                      className="w-8 h-8 flex items-center justify-center bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50"
                      title="Aceptar"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={loading}
                      className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
                      title="Rechazar"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rechazar solicitud</h3>
            <p className="text-gray-600 mb-4">Por favor, ingresa el motivo del rechazo:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ejemplo: No tengo disponibilidad en esa fecha"
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
              required
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ProviderRequestsPage() {
  const navigate = useNavigate();
  const { providerRequests, isAuthenticated, getAllServiceAppointments, isLoadingAppointments } = useAuth();
  const [serviceFilter, setServiceFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    getAllServiceAppointments();
  }, [isAuthenticated, navigate]); // Removido getAllServiceAppointments para evitar bucle infinito

  const filteredRequests = providerRequests.filter(request => {
    if (serviceFilter === 'all') return true;
    return request.serviceName === serviceFilter;
  });

  const uniqueServices = Array.from(new Set(providerRequests.map(req => req.serviceName)));

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Solicitudes Recibidas</h1>
              <p className="text-gray-600 mt-1">Gestiona las solicitudes de tus servicios</p>
            </div>
          </div>

          {/* Filtros y toggle en la misma fila */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los servicios</option>
                {uniqueServices.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
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
                <Grid3X3 className="h-4 w-4 mr-2" />
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
                <List className="h-4 w-4 mr-2" />
                Lista
              </button>
            </div>
          </div>
        </div>

        {/* Lista de solicitudes */}
        {isLoadingAppointments ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando solicitudes...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes</h3>
            <p className="text-gray-600">
              {serviceFilter === 'all' 
                ? 'No tienes solicitudes pendientes en este momento.'
                : 'No hay solicitudes para el servicio seleccionado.'
              }
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'kanban' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRequests.map((request) => (
                  <ProviderRequestCard
                    key={request.id}
                    request={request}
                    kanbanView={true}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map((request) => (
                  <ProviderRequestCard
                    key={request.id}
                    request={request}
                    kanbanView={false}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}