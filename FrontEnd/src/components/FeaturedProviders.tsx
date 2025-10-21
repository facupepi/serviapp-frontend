import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logger from '../utils/logger';
import { MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Service } from '../types/api';
import StarRating from './StarRating';
import ServiceLeaderBadge from './ServiceLeaderBadge';

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
          <div className="text-center py-6 flex flex-col items-center">
            {/* Improved illustrative SVG for empty state */}
            <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6">
              <rect x="0" y="0" width="160" height="120" rx="12" fill="#F8FAFC" />
              <g transform="translate(20,24)">
                <rect x="0" y="0" width="80" height="56" rx="6" fill="#EFF6FF" />
                <rect x="92" y="14" width="36" height="36" rx="6" fill="#EEF2FF" />
                <path d="M92 50 L128 86" stroke="#BFDBFE" strokeWidth="4" strokeLinecap="round" />
                <circle cx="124" cy="88" r="8" fill="#60A5FA" />
                <path d="M8 10 H64" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
                <path d="M8 26 H56" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M8 42 H48" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
              </g>
            </svg>

            <p className="text-gray-700 font-medium mb-1">
              No hay servicios destacados disponibles
            </p>
            <p className="text-sm text-gray-500 mb-4">Explorá toda la oferta y encontrá el servicio que necesitás.</p>
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
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">{service.title}</h3>
                  </div>
                  
                  {/* Services Líder Badge */}
                  <div className="mb-2">
                    <ServiceLeaderBadge 
                      averageRating={service.average_rating}
                      ratingsCount={service.ratings_count}
                      showLabel={true}
                      size="sm"
                    />
                  </div>
                  
                  {/* Rating */}
                  {service.average_rating !== undefined && service.average_rating > 0 && (
                    <div className="mb-2">
                      <StarRating
                        rating={service.average_rating}
                        readonly
                        size="sm"
                        showCount
                        count={service.ratings_count || 0}
                      />
                    </div>
                  )}
                  
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

                  {/* Provider info */}
                  {service.provider && (
                    <div className="border-t pt-3 mt-3">
                      <span className="text-sm text-gray-600">
                        <span className="font-medium">{service.provider.name}</span>
                        {service.provider.locality && service.provider.province && (
                          <span className="text-xs text-gray-500 block mt-1">
                            {service.provider.locality}, {service.provider.province}
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA always visible */}
        <div className={`text-center ${featuredServices.length === 0 ? 'mt-6' : 'mt-12'}`}>
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
