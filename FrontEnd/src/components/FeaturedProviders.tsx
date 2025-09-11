import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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
        console.log('Resultado completo de getServices:', result);
        
        if (result.success && result.data) {
          console.log('Servicios recibidos:', result.data);
          
          // Tomar los primeros 4 servicios activos como destacados
          const activeServices = result.data
            .filter((service: Service) => service.status === 'active')
            .slice(0, 4);
          
          console.log('Servicios activos filtrados:', activeServices);
          
          // Debug específico para imágenes y precios
          activeServices.forEach((service: Service, index: number) => {
            console.log(`Servicio destacado ${index + 1}:`, {
              id: service.id,
              title: service.title,
              image_url: service.image_url,
              price: service.price,
              category: service.category,
              status: service.status
            });
          });
          
          setFeaturedServices(activeServices);
        }
      } catch (error) {
        console.error('Error loading featured services:', error);
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
                    src={service.image_url || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop&crop=center'}
                    alt={service.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const originalSrc = service.image_url;
                      const fallback1 = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop&crop=center';
                      const fallback2 = 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Servicio';
                      const fallback3 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjM0I4MkY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TZXJ2aWNpbzwvdGV4dD48L3N2Zz4=';

                      console.log('❌ Error cargando imagen:', originalSrc);
                      
                      if (target.src === originalSrc || target.src.includes('unsplash.com')) {
                        console.log('🔄 Intentando fallback 1');
                        target.src = fallback1;
                      } else if (target.src === fallback1) {
                        console.log('🔄 Intentando fallback 2');
                        target.src = fallback2;
                      } else if (target.src === fallback2) {
                        console.log('🔄 Usando fallback final');
                        target.src = fallback3;
                      }
                    }}
                    onLoad={() => {
                      console.log('✅ Imagen cargada correctamente:', service.image_url);
                    }}
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

                  {/* Location */}
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 text-sm">
                      {service.zones.map(zone => zone.neighborhood).slice(0, 2).join(', ')}
                      {service.zones.length > 2 && ` +${service.zones.length - 2}`}
                    </span>
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
