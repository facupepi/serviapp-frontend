import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  Edit,
  Eye,
  EyeOff,
  MapPin,
  Calendar,
  ArrowLeft,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  type: 'danger' | 'warning';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          {type === 'danger' ? (
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
              type === 'danger' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MyServices() {
  const navigate = useNavigate();
  const { isAuthenticated, user, getUserServices, toggleServiceStatus, deleteService } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [myServices, setMyServices] = useState<any[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'toggle' | 'delete';
    serviceId: string;
    serviceName: string;
  }>({
    isOpen: false,
    type: 'delete',
    serviceId: '',
    serviceName: ''
  });

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Cargar servicios del usuario
  useEffect(() => {
    if (!isAuthenticated || !user) {
      return; // No cargar servicios si no está autenticado
    }

    const loadServices = async () => {
      setLoading(true);
      try {
        const result = await getUserServices();
        if (result.success && result.data) {
          setMyServices(result.data);
        } else {
          addNotification({
            type: 'error',
            message: result.error || 'Error al cargar los servicios'
          });
        }
      } catch (error) {
        addNotification({
          type: 'error',
          message: 'Error al cargar los servicios'
        });
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [isAuthenticated, user]); // Removemos getUserServices y addNotification de las dependencias

  // No renderizar nada si no está autenticado (mientras redirige)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  const handleServiceAction = async (action: 'toggle' | 'delete', serviceId: string) => {
    setLoading(true);
    try {
      let result;
      let successMessage = '';
      
      switch (action) {
        case 'toggle':
          result = await toggleServiceStatus(serviceId);
          successMessage = 'Estado del servicio cambiado exitosamente';
          break;
        case 'delete':
          result = await deleteService(serviceId);
          successMessage = 'Servicio eliminado exitosamente';
          break;
      }

      if (result?.success) {
        addNotification({
          type: 'success',
          message: successMessage
        });
        
        // Para cambio de estado (toggle), recargar la página completa
        if (action === 'toggle') {
          // Pequeño delay para mostrar la notificación antes de recargar
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          // Para otras acciones, solo refrescar la lista de servicios
          const refreshResult = await getUserServices();
          if (refreshResult.success && refreshResult.data) {
            setMyServices(refreshResult.data);
          }
        }
      } else {
        addNotification({
          type: 'error',
          message: result?.error || `Error al ${action === 'toggle' ? 'cambiar el estado del' : 'eliminar el'} servicio`
        });
      }
    } catch (error) {
      console.error(`Error en ${action}:`, error);
      addNotification({
        type: 'error',
        message: `Error inesperado al ${action === 'toggle' ? 'cambiar el estado del' : 'eliminar el'} servicio`
      });
    } finally {
      // Solo quitar loading si no vamos a recargar la página
      if (action !== 'toggle') {
        setLoading(false);
      }
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  const openConfirmDialog = (type: 'toggle' | 'delete', serviceId: string, serviceName: string) => {
    setConfirmDialog({
      isOpen: true,
      type,
      serviceId,
      serviceName
    });
  };

  const getConfirmDialogConfig = () => {
    const { type, serviceName } = confirmDialog;
    
    switch (type) {
      case 'toggle':
        return {
          title: 'Cambiar Estado del Servicio',
          message: `¿Estás seguro de que quieres cambiar el estado de "${serviceName}"?`,
          confirmText: 'Cambiar Estado',
          cancelText: 'Cancelar',
          type: 'warning' as const
        };
      case 'delete':
        return {
          title: 'Eliminar Servicio',
          message: `¿Estás seguro de que quieres eliminar "${serviceName}"? Esta acción es irreversible y se perderá toda la información del servicio.`,
          confirmText: 'Eliminar',
          cancelText: 'Cancelar',
          type: 'danger' as const
        };
    }
  };

  const ServiceCard = ({ service }: { service: any }) => {
    const isInactive = service.status !== 'active';
    
    return (
      <div className={`bg-white rounded-lg shadow-md overflow-hidden ${isInactive ? 'opacity-60' : ''}`}>
        <div className="relative">
          <img
            src={service.image_url}
            alt={service.title}
            className={`w-full h-48 object-cover ${isInactive ? 'grayscale' : ''}`}
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Sin+Imagen';
            }}
          />
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              service.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {service.status === 'active' ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className={`text-xl font-semibold mb-2 ${isInactive ? 'text-gray-500' : 'text-gray-900'}`}>
            {service.title}
          </h3>
          
          <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {service.zones.map((zone: any) => zone.locality).join(', ')}
            </span>
          </div>
          
          <p className={`text-sm mb-4 line-clamp-3 ${isInactive ? 'text-gray-500' : 'text-gray-700'}`}>
            {service.description}
          </p>
          
          <div className={`p-3 rounded-lg mb-4 ${isInactive ? 'bg-gray-100' : 'bg-gray-50'}`}>
            <p className="text-sm text-gray-600 mb-1">Categoría:</p>
            <p className={`font-medium ${isInactive ? 'text-gray-500' : 'text-gray-900'}`}>{service.category}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {/* Solo mostrar el botón "Ver" si el servicio está activo */}
              {service.status === 'active' && (
                <button
                  onClick={() => navigate(`/service/${service.id}`)}
                  className="flex items-center px-3 py-2 rounded-lg transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200"
                  title="Ver servicio"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </button>
              )}
              
              <button
                onClick={() => navigate(`/edit-service/${service.id}`)}
                className="flex items-center px-3 py-2 rounded-lg transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                title="Editar servicio"
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => openConfirmDialog(
                  'toggle',
                  service.id,
                  service.title
                )}
                disabled={loading || service.status !== 'active'}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                  loading || service.status !== 'active'
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
                title={service.status === 'active' ? 'Desactivar servicio' : 'Función no disponible'}
              >
                {service.status === 'active' ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Activar
                  </>
                )}
              </button>
              
              <button
                onClick={() => openConfirmDialog('delete', service.id, service.title)}
                disabled={true}
                className="flex items-center px-3 py-2 bg-gray-200 text-gray-400 rounded-lg cursor-not-allowed transition-colors"
                title="Función no disponible"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver al dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Mis Servicios
              </h1>
              <p className="text-gray-600">
                Administra todos los servicios que tienes publicados
              </p>
            </div>
            
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && myServices.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando tus servicios...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-500">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Servicios</p>
                    <p className="text-2xl font-bold text-gray-900">{myServices.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-500">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Servicios Activos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {myServices.filter(s => s.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-red-500">
                    <EyeOff className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Servicios Inactivos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {myServices.filter(s => s.status !== 'active').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services grid */}
            {myServices.length > 0 ? (
              <>
                {loading && (
                  <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No tienes servicios publicados
                </h3>
                <p className="text-gray-600 mb-6">
                  Crea tu primer servicio para que los clientes puedan encontrarte
                </p>
                <button
                  onClick={() => navigate('/offer-service')}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Crear mi primer servicio
                </button>
              </div>
            )}
          </>
        )}
      </div>      {/* Confirm Dialog */}
      <ConfirmDialog
        {...getConfirmDialogConfig()}
        isOpen={confirmDialog.isOpen}
        onConfirm={() => handleServiceAction(confirmDialog.type, confirmDialog.serviceId)}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
