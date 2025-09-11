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
  const { user, isAuthenticated, loading, userRequests, providerRequests, favorites, getUserServices } = useAuth();
  const [userServices, setUserServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Verificar autenticación en useEffect para evitar problemas de renderizado
  useEffect(() => {
    // Solo redirigir si no está cargando y no está autenticado
    if (!loading && (!isAuthenticated || !user)) {
      console.log('🔄 Redirigiendo a login - no autenticado');
      navigate('/login');
    }
  }, [loading, isAuthenticated, user, navigate]);

  // Cargar servicios del usuario
  useEffect(() => {
    if (isAuthenticated && user) {
      const loadUserServices = async () => {
        setServicesLoading(true);
        try {
          const result = await getUserServices();
          if (result.success && result.data) {
            setUserServices(result.data);
          } else {
            console.error('Error al cargar servicios del usuario:', result.error);
            setUserServices([]);
          }
        } catch (error) {
          console.error('Error al cargar servicios:', error);
          setUserServices([]);
        } finally {
          setServicesLoading(false);
        }
      };

      loadUserServices();
    }
  }, [isAuthenticated, user]); // Removemos getUserServices de las dependencias

  // Debug: Verificar estado de autenticación solo en transiciones importantes
  useEffect(() => {
    // Solo mostrar logs en transiciones significativas
    if (!loading && isAuthenticated && user) {
      console.log('✅ Dashboard: Usuario autenticado y cargado:', {
        userId: user.id,
        email: user.email,
        tokenExists: document.cookie.includes('authToken')
      });
    } else if (!loading && !isAuthenticated) {
      console.log('❌ Dashboard: Usuario no autenticado');
    }
  }, [loading, isAuthenticated, user]);

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

  // Estadísticas unificadas del usuario
  const userStats = {
    totalRequests: userRequests.length,
    pendingRequests: userRequests.filter((r: any) => r.status === 'pending').length,
    favoriteServices: favorites.length,
    totalReceivedRequests: providerRequests.length,
    activeServices: servicesLoading ? 0 : userServices.filter((s: any) => s.status === 'active').length
  };

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
      description: 'Administra todos los servicios que ofreces y sus configuraciones',
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

  const statsConfig = [
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
      color: 'bg-orange-500'
    },
    {
      icon: <Heart className="h-6 w-6 text-white" />,
      title: 'Servicios Favoritos',
      value: userStats.favoriteServices,
      color: 'bg-red-500'
    },
    {
      icon: <Shield className="h-6 w-6 text-white" />,
      title: 'Mis Servicios Activos',
      value: userStats.activeServices,
      color: 'bg-green-500'
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-white" />,
      title: 'Solicitudes Recibidas',
      value: userStats.totalReceivedRequests,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de bienvenida */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                ¡Hola, {user.name}! 👋
              </h1>
              <p className="text-gray-600">
                Bienvenido a tu panel de control de ServiApp
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                      <p className="text-sm text-gray-600">{request.date} - {request.time}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
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
                      <p className="text-sm text-gray-600">De: {request.userName}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
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
