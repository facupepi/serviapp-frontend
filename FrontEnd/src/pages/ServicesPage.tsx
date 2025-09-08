import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Star, Clock, Shield, Heart, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const categories = [
  'Plomería',
  'Electricidad',
  'Limpieza',
  'Jardinería',
  'Carpintería',
  'Pintura',
  'Mecánica',
  'Tecnología'
];

const provinces = [
  'Buenos Aires',
  'Córdoba',
  'Santa Fe',
  'Mendoza',
  'Tucumán',
  'Entre Ríos',
  'Salta',
  'Chaco'
];

const localities: Record<string, string[]> = {
  'Buenos Aires': ['Capital Federal', 'La Plata', 'Mar del Plata', 'Bahía Blanca'],
  'Córdoba': ['Córdoba Capital', 'Villa Carlos Paz', 'Río Cuarto'],
  'Santa Fe': ['Santa Fe Capital', 'Rosario', 'Venado Tuerto'],
  'Mendoza': ['Mendoza Capital', 'San Rafael', 'Maipú'],
  'Tucumán': ['San Miguel de Tucumán', 'Yerba Buena'],
  'Entre Ríos': ['Paraná', 'Concordia', 'Gualeguaychú'],
  'Salta': ['Salta Capital', 'San Ramón de la Nueva Orán'],
  'Chaco': ['Resistencia', 'Barranqueras']
};

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
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
            isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
        {isServicesLider && (
          <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
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
        
        <p className="text-gray-600 text-sm mb-2">{service.category}</p>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm font-medium text-gray-900">
              {service.rating}
            </span>
            <span className="ml-1 text-sm text-gray-500">
              ({service.reviewCount} reseñas)
            </span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{service.zones[0]?.province}, {service.zones[0]?.locality}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Por: <span className="font-medium">{service.providerName}</span>
          </span>
          <div className="flex items-center text-green-600">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Disponible</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchServices, favorites, addToFavorites, removeFromFavorites, isAuthenticated } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('tipo') || '');
  const [selectedProvince, setSelectedProvince] = useState(searchParams.get('provincia') || '');
  const [selectedLocality, setSelectedLocality] = useState(searchParams.get('localidad') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [services, setServices] = useState<any[]>([]);
  
  const servicesPerPage = 10;

  useEffect(() => {
    // Realizar búsqueda cuando cambien los parámetros
    const filters = {
      category: selectedCategory || undefined,
      province: selectedProvince || undefined,
      locality: selectedLocality || undefined,
    };
    
    const results = searchServices(searchQuery, filters);
    setServices(results);
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedProvince, selectedLocality, searchServices]);

  useEffect(() => {
    // Actualizar URL cuando cambien los filtros
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('tipo', selectedCategory);
    if (selectedProvince) params.set('provincia', selectedProvince);
    if (selectedLocality) params.set('localidad', selectedLocality);
    
    setSearchParams(params);
  }, [searchQuery, selectedCategory, selectedProvince, selectedLocality, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // La búsqueda se actualiza automáticamente por el useEffect
  };

  const clearFilters = () => {
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
  const totalPages = Math.ceil(services.length / servicesPerPage);
  const startIndex = (currentPage - 1) * servicesPerPage;
  const endIndex = startIndex + servicesPerPage;
  const currentServices = services.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Removemos el scroll automático que causa problemas
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Buscar Servicios
          </h1>
          
          {/* Barra de búsqueda */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar servicio por nombre, rubro o localidad"
                className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="mr-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
                >
                  Buscar
                </button>
              </div>
            </div>
          </form>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provincia
                  </label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => {
                      setSelectedProvince(e.target.value);
                      setSelectedLocality(''); // Reset locality when province changes
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todas las provincias</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localidad
                  </label>
                  <select
                    value={selectedLocality}
                    onChange={(e) => setSelectedLocality(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!selectedProvince}
                  >
                    <option value="">Todas las localidades</option>
                    {selectedProvince &&
                      localities[selectedProvince]?.map((locality) => (
                        <option key={locality} value={locality}>
                          {locality}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpiar filtros
                </button>
                <span className="text-sm text-gray-600">
                  {services.length} servicios encontrados
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resultados */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
  );
}