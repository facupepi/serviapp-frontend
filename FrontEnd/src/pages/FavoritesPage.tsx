import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, MapPin, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { services, favorites, removeFromFavorites, isAuthenticated } = useAuth();

  // Redirigir si no está autenticado
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Obtener servicios favoritos
  const favoriteServices = services.filter(service => favorites.includes(service.id));

  const handleServiceClick = (serviceId: string) => {
    navigate(`/servicio/${serviceId}`);
  };

  const handleRemoveFavorite = (serviceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromFavorites(serviceId);
  };

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
              onClick={() => navigate('/servicios')}
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
                    src={service.image}
                    alt={service.title}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={(e) => handleRemoveFavorite(service.id, e)}
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
                  
                  <div className="flex items-center mb-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium text-gray-900">
                      {service.rating}
                    </span>
                    <span className="ml-1 text-sm text-gray-500">
                      ({service.reviewCount} reseñas)
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{service.zones[0]?.province}, {service.zones[0]?.locality}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Por: <span className="font-medium">{service.providerName}</span>
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
