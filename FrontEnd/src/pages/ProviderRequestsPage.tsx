import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Calendar, User, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface RequestCardProps {
  request: any;
  onAccept: (requestId: string) => void;
  onReject: (requestId: string, reason: string) => void;
}

const ProviderRequestCard: React.FC<RequestCardProps> = ({ request, onAccept, onReject }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleAccept = async () => {
    setLoading(true);
    await onAccept(request.id);
    setLoading(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Debes ingresar un motivo de rechazo');
      return;
    }
    setLoading(true);
    await onReject(request.id, rejectionReason);
    setShowRejectModal(false);
    setRejectionReason('');
    setLoading(false);
  };

  const requestDate = new Date(request.requestedDate);
  const isPastDate = requestDate < new Date();
  const canRespond = request.status === 'pending' && !isPastDate;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {request.serviceName}
            </h3>
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <User className="h-4 w-4 mr-2" />
              <span>Cliente: <span className="font-medium">{request.clientName}</span></span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{request.requestedDate} a las {request.requestedTime}</span>
            </div>
          </div>
          <div className="ml-4">
            <img
              src={request.serviceImage}
              alt={request.serviceName}
              className="w-16 h-16 object-cover rounded-lg"
            />
          </div>
        </div>

        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)} mb-3`}>
          {getStatusIcon(request.status)}
          <span className="ml-1">{getStatusText(request.status)}</span>
        </div>

        {request.rejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-800 text-sm">
              <strong>Motivo de rechazo:</strong> {request.rejectionReason}
            </p>
          </div>
        )}

        {canRespond && (
          <div className="border-t pt-4">
            <div className="flex space-x-3">
              <button
                onClick={handleAccept}
                disabled={loading}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {loading ? 'Procesando...' : 'Aceptar'}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={loading}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rechazar
              </button>
            </div>
          </div>
        )}

        {isPastDate && request.status === 'pending' && (
          <div className="border-t pt-4">
            <p className="text-red-600 text-sm text-center">
              Esta solicitud ha caducado (la fecha ya pasó)
            </p>
          </div>
        )}
      </div>

      {/* Modal de rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rechazar solicitud
            </h3>
            <p className="text-gray-600 mb-4">
              Por favor, ingresa el motivo del rechazo:
            </p>
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
};

export default function ProviderRequestsPage() {
  const navigate = useNavigate();
  const { providerRequests, respondToRequest, isAuthenticated } = useAuth();

  // Redirigir si no está autenticado
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Todos los usuarios pueden recibir solicitudes ahora
  // Ya no necesitamos verificar isProvider

  const handleAccept = async (requestId: string) => {
    try {
      const result = await respondToRequest(requestId, 'accept');
      if (result.success) {
        alert('Solicitud aceptada exitosamente');
      } else {
        alert('Error al aceptar la solicitud: ' + result.error);
      }
    } catch (error) {
      alert('Error del servidor');
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    try {
      const result = await respondToRequest(requestId, 'reject', reason);
      if (result.success) {
        alert('Solicitud rechazada');
      } else {
        alert('Error al rechazar la solicitud: ' + result.error);
      }
    } catch (error) {
      alert('Error del servidor');
    }
  };

  const sortedRequests = [...providerRequests].sort((a, b) => {
    // Ordenar por estado (pendientes primero) y luego por fecha
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <MessageSquare className="h-8 w-8 text-blue-600 mr-3" />
            Solicitudes Recibidas
          </h1>
          <p className="mt-2 text-gray-600">
            Gestiona las solicitudes de servicios que recibiste
          </p>
        </div>

        {sortedRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MessageSquare className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No has recibido solicitudes aún
            </h3>
            <p className="text-gray-500 mb-6">
              Las solicitudes de tus servicios aparecerán aquí para que puedas gestionarlas.
            </p>
            <button
              onClick={() => navigate('/offer-service')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Crear un Servicio
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedRequests.map((request) => (
              <ProviderRequestCard
                key={request.id}
                request={request}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
