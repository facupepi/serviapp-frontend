import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Calendar, User, Star } from 'lucide-react';
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

  const requestDate = new Date(request.requestedDate);
  const canRate = request.status === 'accepted' && requestDate < new Date();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {request.serviceName}
          </h3>
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <User className="h-4 w-4 mr-2" />
            <span>Proveedor: <span className="font-medium">{request.providerName}</span></span>
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

      <p className="text-gray-600 text-sm mb-4">
        {getStatusDescription(request.status, request.rejectionReason)}
      </p>

      {canRate && onRate && (
        <div className="border-t pt-4">
          <button
            onClick={() => onRate(request.id)}
            className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
  const { userRequests, isAuthenticated } = useAuth();

  // Redirigir si no está autenticado
  if (!isAuthenticated) {
    navigate('/login');
    return null;
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Clock className="h-8 w-8 text-blue-600 mr-3" />
            Mis Solicitudes
          </h1>
          <p className="mt-2 text-gray-600">
            Seguimiento de todas las solicitudes de servicios que realizaste
          </p>
        </div>

        {sortedRequests.length === 0 ? (
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
        ) : (
          <div className="space-y-6">
            {sortedRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onRate={handleRate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
