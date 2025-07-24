import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Heart, 
  Clock, 
  MessageSquare, 
  Star,
  Plus,
  Search,
  Shield,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
  color: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon,
  title,
  description,
  action,
  onClick,
  color
}) => (
  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${color}`}>
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm mb-4">{description}</p>
    <button
      onClick={onClick}
      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      {action}
    </button>
  </div>
);

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, userRequests, providerRequests, favorites, services } = useAuth();

  // Redirigir si no está autenticado
  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  // Estadísticas unificadas del usuario
  const userStats = {
    totalRequests: userRequests.length,
    pendingRequests: userRequests.filter(r => r.status === 'pending').length,
    favoriteServices: favorites.length,
    totalReceivedRequests: providerRequests.length,
    activeServices: services.filter(s => s.providerId === user.id && s.isActive).length
  };

  const allActions = [
    {
      icon: <Search className="h-6 w-6 text-white" />,
      title: 'Buscar Servicios',
      description: 'Encuentra el servicio que necesitas entre cientos de profesionales verificados',
      action: 'Explorar Servicios',
      onClick: () => navigate('/servicios'),
      color: 'bg-blue-500'
    },
    {
      icon: <Plus className="h-6 w-6 text-white" />,
      title: 'Ofrecer Servicio',
      description: 'Publica un nuevo servicio para que los clientes puedan encontrarte',
      action: 'Crear Servicio',
      onClick: () => navigate('/ofrecer-servicio'),
      color: 'bg-green-500'
    },
    {
      icon: <Heart className="h-6 w-6 text-white" />,
      title: 'Mis Favoritos',
      description: 'Revisa los servicios que guardaste para contratarlos más tarde',
      action: 'Ver Favoritos',
      onClick: () => navigate('/favoritos'),
      color: 'bg-red-500'
    },
    {
      icon: <Clock className="h-6 w-6 text-white" />,
      title: 'Mis Solicitudes',
      description: 'Haz seguimiento de todas las solicitudes de servicios que realizaste',
      action: 'Ver Solicitudes',
      onClick: () => navigate('/mis-solicitudes'),
      color: 'bg-yellow-500'
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-white" />,
      title: 'Solicitudes Recibidas',
      description: 'Gestiona las solicitudes de servicios que recibiste de los clientes',
      action: 'Ver Solicitudes',
      onClick: () => navigate('/solicitudes-recibidas'),
      color: 'bg-purple-500'
    },
    {
      icon: <Star className="h-6 w-6 text-white" />,
      title: 'Mis Servicios',
      description: 'Administra todos los servicios que tienes publicados',
      action: 'Gestionar Servicios',
      onClick: () => navigate('/mis-servicios'),
      color: 'bg-orange-500'
    }
  ];

  const allStats = [
    {
      icon: <Clock className="h-6 w-6 text-white" />,
      title: 'Solicitudes Enviadas',
      value: userStats.totalRequests,
      color: 'bg-blue-500'
    },
    {
      icon: <Calendar className="h-6 w-6 text-white" />,
      title: 'Pendientes',
      value: userStats.pendingRequests,
      color: 'bg-yellow-500'
    },
    {
      icon: <Heart className="h-6 w-6 text-white" />,
      title: 'Favoritos',
      value: userStats.favoriteServices,
      color: 'bg-red-500'
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-white" />,
      title: 'Solicitudes Recibidas',
      value: userStats.totalReceivedRequests,
      color: 'bg-purple-500'
    },
    {
      icon: <Star className="h-6 w-6 text-white" />,
      title: 'Servicios Activos',
      value: userStats.activeServices,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <User className="h-8 w-8 text-blue-600 mr-3" />
                ¡Hola, {user.name}!
              </h1>
              <p className="mt-2 text-gray-600">
                Gestiona tus servicios, solicitudes y descubre nuevas oportunidades
              </p>
            </div>
            {user.verified && (
              <div className="flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
                <Shield className="h-5 w-5 mr-2" />
                <span className="font-semibold">Usuario Verificado</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {allStats.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              color={stat.color}
            />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Todas las Acciones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allActions.map((action, index) => (
              <QuickActionCard
                key={index}
                icon={action.icon}
                title={action.title}
                description={action.description}
                action={action.action}
                onClick={action.onClick}
                color={action.color}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad Reciente
          </h3>
          {userRequests.length > 0 || providerRequests.length > 0 ? (
            <div className="space-y-3">
              {/* Solicitudes enviadas */}
              {userRequests.slice(0, 2).map((request) => (
                <div key={`sent-${request.id}`} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Solicité: {request.serviceName}</p>
                      <p className="text-sm text-gray-600">
                        A {request.providerName} - {request.requestedDate}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : request.status === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {request.status === 'pending' ? 'Pendiente' : 
                     request.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                  </span>
                </div>
              ))}
              
              {/* Solicitudes recibidas */}
              {providerRequests.slice(0, 2).map((request) => (
                <div key={`received-${request.id}`} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <MessageSquare className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Recibí solicitud: {request.serviceName}</p>
                      <p className="text-sm text-gray-600">
                        De {request.clientName} - {request.requestedDate}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : request.status === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {request.status === 'pending' ? 'Pendiente' : 
                     request.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No tienes actividad reciente. ¡Comienza solicitando u ofreciendo servicios!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
