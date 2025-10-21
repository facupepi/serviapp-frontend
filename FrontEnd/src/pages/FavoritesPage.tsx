import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Service } from '../types/api';
import logger from '../utils/logger';
import StarRating from '../components/StarRating';
// Image is required on services; use service-provided URL directly

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { getServices, favorites, removeFromFavorites, isAuthenticated } = useAuth();
  const [favoriteServices, setFavoriteServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Cargar servicios favoritos (solo al montar el componente)
  useEffect(() => {
    const loadFavoriteServices = async () => {
      console.log('🔍 [FavoritesPage] Cargando favoritos iniciales:', favorites);
      console.log('🔍 [FavoritesPage] isAuthenticated:', isAuthenticated);
      
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      // Si no hay favoritos, no mostrar loading
      if (favorites.length === 0) {
        setFavoriteServices([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = await getServices();
        console.log('🔍 [FavoritesPage] Servicios obtenidos:', result.data?.length);
        
        if (result.success && result.data) {
          // Filtrar solo los servicios que están en favoritos
          const favServices = result.data.filter((service: Service) => 
            favorites.includes(service.id.toString())
          );
          console.log('🔍 [FavoritesPage] Servicios favoritos filtrados:', favServices.length);
          setFavoriteServices(favServices);
          logger.info('Servicios favoritos cargados:', favServices.length);
        }
      } catch (error) {
        logger.error('Error cargando servicios favoritos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavoriteServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, favorites.length]); // Recargar cuando cambia la cantidad de favoritos

  // Actualizar la lista de servicios favoritos cuando cambian los favoritos
  useEffect(() => {
    if (favoriteServices.length > 0) {
      // Filtrar servicios que ya no están en favoritos
      const updatedServices = favoriteServices.filter(service => 
        favorites.includes(service.id.toString())
      );
      
      if (updatedServices.length !== favoriteServices.length) {
        setFavoriteServices(updatedServices);
        console.log('🔍 [FavoritesPage] Lista de favoritos actualizada:', updatedServices.length);
      }
    }
  }, [favorites, favoriteServices]);

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

  const handleServiceClick = (serviceId: string | number) => {
    navigate(`/service/${serviceId}`);
  };

  const handleRemoveFavorite = (serviceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Actualizar estado local inmediatamente (optimistic update)
    setFavoriteServices(prev => prev.filter(service => service.id.toString() !== serviceId));
    
    // Luego actualizar en el contexto/API
    removeFromFavorites(serviceId);
  };

  // Mostrar loading mientras carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Heart className="h-8 w-8 text-red-500 mr-3 fill-current" />
            Mis Favoritos
          </h1>
          <p className="mt-2 text-gray-600">
            Servicios que guardaste para revisar más tarde
          </p>
        </div>

        {favoriteServices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Heart className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Todavía no guardaste ningún servicio
            </h3>
            <p className="text-gray-500 mb-6">
              Explorá y guardá tus favoritos para contratarlos después.
            </p>
            <button
              onClick={() => navigate('/services')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Explorar Servicios
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleServiceClick(service.id)}
              >
                <div className="relative">
                  <img
                    src={service.image_url}
                    alt={service.title}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={(e) => handleRemoveFavorite(service.id.toString(), e)}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    title="Eliminar de favoritos"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-2">{service.category}</p>
                  
                  {/* Mostrar rating si existe */}
                  {service.average_rating !== undefined && service.average_rating > 0 ? (
                    <div className="mb-2">
                      <StarRating 
                        rating={service.average_rating} 
                        size="sm"
                        showCount={true}
                        count={service.ratings_count || 0}
                      />
                    </div>
                  ) : null}
                  
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{service.zones[0]?.province}, {service.zones[0]?.locality}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Por: <span className="font-medium">{service.provider?.name || 'Proveedor'}</span>
                    </span>
                    <button
                      onClick={() => handleServiceClick(service.id)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      Ver detalle
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
