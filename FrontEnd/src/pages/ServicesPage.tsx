import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import logger from '../utils/logger';
import { Search, Filter, MapPin, Shield, Heart, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import FiltersSidebar from '../components/FiltersSidebar';

interface ServiceCardProps {
  service: any;
  isFavorite: boolean;
  onToggleFavorite: (serviceId: string) => void;
  isAuthenticated: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, isFavorite, onToggleFavorite, isAuthenticated }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/service/${service.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Prevenir comportamiento por defecto
    if (isAuthenticated) {
      onToggleFavorite(service.id);
    } else {
      navigate('/login');
    }
  };

  const isServicesLider = service.rating >= 4.5 && service.reviewCount >= 5;

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer transform hover:-translate-y-1"
      onClick={handleCardClick}
    >
      <div className="relative">
        <img
          src={service.image_url}
          alt={service.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Sin+Imagen';
          }}
        />
        {/* Category badge on image (like FeaturedProviders) */}
        <div className="absolute top-3 right-3">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            {service.category}
          </span>
        </div>
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 left-3 p-2 rounded-full transition-colors ${
            isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
        {isServicesLider && (
          <div className="absolute top-12 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
            <Shield className="h-3 w-3 mr-1" />
            Services Líder
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
            {service.title}
          </h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{service.description}</p>

        {/* Locations: like FeaturedProviders */}
        <div className="space-y-1 mb-3">
          {Array.isArray(service.zones) && service.zones.length > 0 ? (
            service.zones.map((z: any, idx: number) => (
              <div key={idx} className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                <span>{z.locality ? `(${z.locality}, ${z.province})` : `${z.province}`}</span>
              </div>
            ))
          ) : (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
              <span>Zona no especificada</span>
            </div>
          )}
        </div>
        
        {/* Precio + Ver detalles */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-base font-semibold text-gray-900">
            Desde ${service.price?.toLocaleString('es-AR')}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/service/${service.id}`);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Ver detalles
          </button>
        </div>
        <div>
          <span className="text-sm text-gray-600">
            <span className="font-medium">{service.providerName}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getServices, favorites, addToFavorites, removeFromFavorites, isAuthenticated } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || searchParams.get('categoria') || ''
  );
  const [selectedProvince, setSelectedProvince] = useState(
    searchParams.get('provincia') || searchParams.get('province') || ''
  );
  const [selectedLocality, setSelectedLocality] = useState(
    searchParams.get('localidad') || searchParams.get('locality') || ''
  );
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const servicesPerPage = 10;

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      try {
        const result = await getServices();
        if (result.success && result.data) {
          setServices(result.data);
        } else {
          logger.error('❌ Error cargando servicios:', result.error);
          setServices([]);
        }
      } catch (error) {
        logger.error('Error al cargar servicios:', error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [getServices]);

  // Filtrar servicios basándose en todos los criterios (memoizado para evitar recomputaciones y logs múltiples)
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        service.title?.toLowerCase().includes(q) ||
        service.category?.toLowerCase().includes(q) ||
        service.description?.toLowerCase().includes(q);

      const matchesCategory = !selectedCategory || service.category === selectedCategory;

      const matchesLocation = (!selectedProvince && !selectedLocality) ||
        (service.zones && service.zones.some((zone: any) => {
          const matchesProvince = !selectedProvince || zone.province === selectedProvince;
          const matchesLocality = !selectedLocality || zone.locality === selectedLocality;
          return matchesProvince && matchesLocality;
        }));

      // Solo mostrar servicios activos
      const isActive = service.status === 'active';

      return matchesSearch && matchesCategory && matchesLocation && isActive;
    });
  }, [services, searchQuery, selectedCategory, selectedProvince, selectedLocality]);

  useEffect(() => {
    // Actualizar URL cuando cambien los filtros
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedProvince) params.set('province', selectedProvince);
    if (selectedLocality) params.set('locality', selectedLocality);

    // Solo aplicar si realmente cambió algo en la URL para evitar renders extra
    const current = searchParams.toString();
    const next = params.toString();
    if (current !== next) {
      setSearchParams(params);
      // Reiniciar a la primera página si cambian filtros
      setCurrentPage(1);
    }
  }, [searchQuery, selectedCategory, selectedProvince, selectedLocality, setSearchParams, searchParams]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedProvince('');
    setSelectedLocality('');
  };

  const handleToggleFavorite = (serviceId: string) => {
    if (favorites.includes(serviceId)) {
      removeFromFavorites(serviceId);
    } else {
      addToFavorites(serviceId);
    }
  };

  // Paginación
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
  const startIndex = (currentPage - 1) * servicesPerPage;
  const endIndex = startIndex + servicesPerPage;
  const currentServices = filteredServices.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Removemos el scroll automático que causa problemas
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar de filtros - Desktop */}
        <div className="hidden lg:block lg:w-80 lg:flex-shrink-0">
          <div className="sticky top-0 h-fit bg-white border-r border-gray-200">
            <FiltersSidebar 
              searchTerm={searchQuery}
              setSearchTerm={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedProvince={selectedProvince}
              setSelectedProvince={setSelectedProvince}
              selectedLocality={selectedLocality}
              setSelectedLocality={setSelectedLocality}
              onClearFilters={clearFilters}
            />
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1">
          {/* Sidebar de filtros móvil */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
              <div className="bg-white w-80 h-full overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-md"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <FiltersSidebar 
                  searchTerm={searchQuery}
                  setSearchTerm={setSearchQuery}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedProvince={selectedProvince}
                  setSelectedProvince={setSelectedProvince}
                  selectedLocality={selectedLocality}
                  setSelectedLocality={setSelectedLocality}
                  onClearFilters={clearFilters}
                />
              </div>
            </div>
          )}

          {/* Contenido de servicios */}
          <div className="max-w-none px-4 sm:px-6 lg:px-8 py-6">
            {/* Header con filtros móvil */}
            <div className="lg:hidden mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </button>
            </div>
            
            {services.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron servicios
                </h3>
                <p className="text-gray-500 mb-4">
                  Verificá tu búsqueda o usá los filtros para encontrar lo que necesitás.
                </p>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Limpiar filtros y ver todos los servicios
                </button>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron servicios
                </h3>
                <p className="text-gray-500 mb-4">
                  {selectedCategory 
                    ? `No hay servicios disponibles en la categoría "${selectedCategory}"`
                    : 'No hay servicios que coincidan con tus criterios de búsqueda'
                  }
                </p>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Limpiar filtros y ver todos los servicios
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {currentServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      isFavorite={favorites.includes(service.id)}
                      onToggleFavorite={handleToggleFavorite}
                      isAuthenticated={isAuthenticated}
                    />
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-md ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}