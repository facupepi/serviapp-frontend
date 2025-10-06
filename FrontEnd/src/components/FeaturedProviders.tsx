import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logger from '../utils/logger';
import { MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
// Image is required on services; use service-provided URL directly
import { Service } from '../types/api';

export default function FeaturedProviders() {
  const navigate = useNavigate();
  const { getServices } = useAuth();
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedServices = async () => {
      try {
        const result = await getServices();
        
        if (result.success && result.data) {
          
          // Tomar los primeros 4 servicios activos como destacados
          const activeServices = result.data
            .filter((service: Service) => service.status === 'active')
            .slice(0, 4);
          
          setFeaturedServices(activeServices);
        }
      } catch (error) {
        logger.error('Error loading featured services:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedServices();
  }, [getServices]);

  const handleServiceClick = (serviceId: number) => {
    navigate(`/service/${serviceId}`);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Servicios destacados
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Conecta con los mejores servicios disponibles
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Servicios destacados
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Conecta con los mejores servicios disponibles
          </p>
        </div>

        {featuredServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              No hay servicios destacados disponibles en este momento.
            </p>
            <button 
              onClick={() => navigate('/services')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors"
            >
              Ver todos los servicios
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceClick(service.id)}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
              >
                {/* Service Image */}
                <div className="relative">
                  <img
                    src={(service as any).image_url || (service as any).image}
                    alt={service.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={() => { /* image is required on backend */ }}
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      {service.category}
                    </span>
                  </div>
                </div>

                {/* Service Info */}
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>

                  {/* Locations: una debajo de otra con icono */}
                  <div className="space-y-1 mb-3">
                    {service.zones && service.zones.length > 0 ? (
                      service.zones.map((zone, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          <span>
                            {zone.neighborhood} ({zone.locality}, {zone.province})
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center text-sm text-gray-400">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Zona no especificada</span>
                      </div>
                    )}
                  </div>

                  {/* Price and Status */}
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-semibold text-gray-900">
                      Desde ${service.price.toLocaleString('es-AR')}
                    </span>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <button 
            onClick={() => navigate('/services')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors"
          >
            Ver todos los servicios
          </button>
        </div>
      </div>
    </section>
  );
}
