import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Heart, 
  Clock, 
  MessageSquare, 
  Plus,
  Search,
  Shield,
  
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logger from '../utils/logger';

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
  title: React.ReactNode;
  value: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center">
      <div className={`flex-shrink-0 p-3 rounded-lg ${color}`}>
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
  const { user, isAuthenticated, loading, userRequests, providerRequests, favorites, services, getUserServices, getMyAppointments, getAllServiceAppointments, isLoadingAppointments, providerRequestsLoaded } = useAuth();

  // Cargar datos del dashboard de forma inteligente
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    // Solo ejecutar si realmente necesitamos cargar datos
    const loadDashboardData = async () => {
      setDashboardLoading(true);
      try {
        // 1. Cargar appointments del usuario (siempre actualizamos para tener datos frescos)
        if (getMyAppointments) {
          await getMyAppointments();
        }
      } catch (e) {
        logger.debug('Error refrescando mis solicitudes en Dashboard:', e);
      }

      try {
        // 2. Cargar servicios solo si no tenemos ninguno
        if (getUserServices && services.length === 0) {
          logger.debug('Cargando servicios del usuario en Dashboard...');
          await getUserServices();
        }
      } catch (e) {
        logger.debug('Error refrescando mis servicios en Dashboard:', e);
      }

      try {
        // 3. Cargar appointments de servicios para el contador
        if (getAllServiceAppointments) {
          await getAllServiceAppointments();
        }
      } catch (e) {
        logger.debug('Error refrescando solicitudes recibidas en Dashboard:', e);
      } finally {
        setDashboardLoading(false);
      }
    };

    loadDashboardData();
  }, [isAuthenticated, user?.id, services.length]); // Solo depende de autenticación y datos clave

  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Verificar autenticación en useEffect para evitar problemas de renderizado
  useEffect(() => {
    // Solo redirigir si no está cargando y no está autenticado
    if (!loading && (!isAuthenticated || !user)) {
      logger.info('Redirigiendo a login - no autenticado');
      navigate('/login');
    }
  }, [loading, isAuthenticated, user, navigate]);

  // Mostrar loading mientras inicializa o mientras no está autenticado
  if (loading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">
            {loading ? 'Cargando...' : 'Verificando autenticación...'}
          </p>
        </div>
      </div>
    );
  }

  // Mostrar loader mientras cargan los datos del dashboard o mientras las citas del proveedor no estén listas
  if (dashboardLoading || isLoadingAppointments || !providerRequestsLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Cargando información del dashboard...</p>
        </div>
      </div>
    );
  }

  // Estadísticas unificadas del usuario
  const userStats = {
    totalRequests: userRequests.length,
    pendingRequests: userRequests.filter((r: any) => r.status === 'pending').length,
    favoriteServices: favorites.length,
    totalReceivedRequests: providerRequests.length,
    activeServices: services.filter((s: any) => s.isActive).length,
    inactiveServices: services.filter((s: any) => !s.isActive).length,
    totalServices: services.length
  };

  // Debug para el Dashboard
  logger.debug('Dashboard Debug:', {
    'Total servicios': services.length,
    'Servicios activos': userStats.activeServices,
    'Servicios inactivos': userStats.inactiveServices,
    'Servicios array': services.map(s => ({ title: s.title, isActive: s.isActive }))
  });

  const allActions = [
    {
      icon: <Search className="h-6 w-6 text-white" />,
      title: 'Buscar Servicios',
      description: 'Encuentra el servicio que necesitas entre cientos de profesionales verificados',
      action: 'Explorar Servicios',
      onClick: () => navigate('/services'),
      color: 'bg-blue-500'
    },
    {
      icon: <Plus className="h-6 w-6 text-white" />,
      title: 'Ofrecer Servicio',
      description: 'Comparte tus habilidades y comienza a generar ingresos ofreciendo tus servicios',
      action: 'Crear Servicio',
      onClick: () => navigate('/offer-service'),
      color: 'bg-green-500'
    },
    {
      icon: <Heart className="h-6 w-6 text-white" />,
      title: 'Mis Favoritos',
      description: 'Accede rápidamente a los servicios que has marcado como favoritos',
      action: 'Ver Favoritos',
      onClick: () => navigate('/favorites'),
      color: 'bg-red-500'
    },
    {
      icon: <Clock className="h-6 w-6 text-white" />,
      title: 'Mis Solicitudes',
      description: 'Revisa el estado de todas las solicitudes de servicios que has realizado',
      action: 'Ver Solicitudes',
      onClick: () => navigate('/my-requests'),
      color: 'bg-yellow-500'
    },
    {
      icon: <Shield className="h-6 w-6 text-white" />,
      title: 'Mis Servicios',
      description: 'Administra todos los servicios que ofreces y sus configuraciones para ofrecer a otros usuarios',
      action: 'Gestionar Servicios',
      onClick: () => navigate('/my-services'),
      color: 'bg-purple-500'
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-white" />,
      title: 'Solicitudes Recibidas',
      description: 'Gestiona las solicitudes que han hecho otros usuarios para tus servicios',
      action: 'Ver Solicitudes',
      onClick: () => navigate('/received-requests'),
      color: 'bg-indigo-500'
    }
  ];

  const getStatusClass = (status: string) =>
    status === 'pending'
      ? 'bg-yellow-100 text-yellow-800'
      : status === 'accepted'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';

  const formatDateForDashboard = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const statsConfig = [
    {
      icon: <MessageSquare className="h-6 w-6 text-white" />,
      title: 'Solicitudes Recibidas',
      value: userStats.totalReceivedRequests,
      color: 'bg-purple-500'
    },
    {
      icon: <Clock className="h-6 w-6 text-white" />,
      title: 'Solicitudes Enviadas',
      value: userStats.totalRequests,
      color: 'bg-blue-500'
    },
    {
      icon: <Heart className="h-6 w-6 text-white" />,
      title: 'Servicios Favoritos',
      value: userStats.favoriteServices,
      color: 'bg-red-500'
    },
    {
      icon: <Shield className="h-6 w-6 text-white" />,
      title: 'Total Servicios',
      value: userStats.totalServices,
      color: 'bg-gray-500'
    },
    {
      icon: <Shield className="h-6 w-6 text-white" />,
      title: 'Servicios Activos',
      value: userStats.activeServices,
      color: 'bg-green-500'
    },
    {
      icon: <Shield className="h-6 w-6 text-white" />,
      title: 'Servicios Inactivos',
      value: userStats.inactiveServices,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de bienvenida */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">¡Hola, {user.name}! 👋</h1>
                <p className="text-gray-600">Bienvenido a tu panel de control de ServiApp</p>
              </div>
            </div>
            <div>
              <button
                onClick={() => navigate('/offer-service')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nuevo Servicio
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statsConfig.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              color={stat.color}
            />
          ))}
        </div>

        {/* Acciones rápidas */}
          <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Acciones Rápidas</h2>
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

        {/* Actividad reciente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Solicitudes recientes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mis Solicitudes Recientes</h3>
            {userRequests.length > 0 ? (
              <div className="space-y-3">
                {userRequests.slice(0, 3).map((request: any) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{request.serviceName}</p>
                      <p className="text-sm text-gray-600">{formatDateForDashboard(request.requestedDate)}{request.requestedTime ? ` · ${request.requestedTime}` : ''}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(request.status)}`}>
                      {request.status === 'pending' ? 'Pendiente' : request.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => navigate('/my-requests')}
                  className="w-full text-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Ver todas las solicitudes →
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No tienes solicitudes aún</p>
            )}
          </div>

          {/* Solicitudes recibidas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Solicitudes Recibidas</h3>
            {providerRequests.length > 0 ? (
              <div className="space-y-3">
                {providerRequests.slice(0, 3).map((request: any) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{request.serviceName}</p>
                      <p className="text-sm text-gray-600">{formatDateForDashboard(request.requestedDate)}{request.requestedTime ? ` · ${request.requestedTime}` : ''}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(request.status)}`}>
                      {request.status === 'pending' ? 'Pendiente' : request.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => navigate('/received-requests')}
                  className="w-full text-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Ver todas las solicitudes →
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No tienes solicitudes recibidas aún</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
