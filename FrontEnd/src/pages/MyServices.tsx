import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  Edit,
  Eye,
  EyeOff,
  Star,
  MapPin,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function MyServices() {
  const navigate = useNavigate();
  const { isAuthenticated, user, services, deactivateService } = useAuth();
  const [loading, setLoading] = useState(false);

  // Redirigir si no está autenticado
  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  // Todos los usuarios pueden tener servicios ahora
  // Ya no necesitamos verificar isProvider

  // Filtrar servicios del proveedor actual
  const myServices = services.filter(service => service.providerId === user.id);

  const handleToggleService = async (serviceId: string, isActive: boolean) => {
    setLoading(true);
    try {
      if (!isActive) {
        // Reactivar servicio (por ahora solo mostrar mensaje)
        alert('Funcionalidad de reactivación en desarrollo');
      } else {
        // Desactivar servicio
        const result = await deactivateService(serviceId);
        if (result.success) {
          alert('Servicio desactivado exitosamente');
          // La página se actualizará automáticamente gracias al contexto
        } else {
          alert(result.error || 'Error al desactivar el servicio');
        }
      }
    } catch (error) {
      alert('Error al cambiar el estado del servicio');
    } finally {
      setLoading(false);
    }
  };

  const ServiceCard = ({ service }: { service: any }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            service.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {service.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {service.title}
        </h3>
        
        <div className="flex items-center mb-2">
          <Star className="h-5 w-5 text-yellow-400 fill-current" />
          <span className="ml-1 text-gray-600">
            {service.rating} ({service.reviewCount} reseñas)
          </span>
        </div>
        
        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">
            {service.zones.map((zone: any) => zone.locality).join(', ')}
          </span>
        </div>
        
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {service.description}
        </p>
        
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-600 mb-1">Categoría:</p>
          <p className="font-medium">{service.category}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/servicios/${service.id}`)}
              className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </button>
            
            <button
              onClick={() => navigate(`/editar-servicio/${service.id}`)}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </button>
          </div>
          
          <button
            onClick={() => handleToggleService(service.id, service.isActive)}
            disabled={loading}
            className={`flex items-center px-3 py-2 rounded-lg transition-colors disabled:opacity-50 ${
              service.isActive
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {service.isActive ? (
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
        </div>
      </div>
    </div>
  );

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
              onClick={() => navigate('/ofrecer-servicio')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Servicio
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  {myServices.filter(s => s.isActive).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Calificación Promedio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {myServices.length > 0 
                    ? (myServices.reduce((acc, s) => acc + s.rating, 0) / myServices.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services grid */}
        {myServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
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
              onClick={() => navigate('/ofrecer-servicio')}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Crear mi primer servicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
