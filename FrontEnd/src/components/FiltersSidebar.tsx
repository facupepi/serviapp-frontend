import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getProvinces, getLocalitiesObject } from '../data/argentina';

export default function FiltersSidebar() {
  const navigate = useNavigate();
  const { categories } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const provinces = getProvinces();
  const localities = getLocalitiesObject();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedProvince) params.set('provincia', selectedProvince);
    if (selectedLocality) params.set('localidad', selectedLocality);
    
    navigate(`/services?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedProvince('');
    setSelectedLocality('');
  };

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    setSelectedLocality(''); // Reset locality when province changes
  };

  return (
    <div className="w-80 bg-white rounded-xl shadow-sm p-6 h-fit sticky top-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="h-5 w-5 mr-2 text-blue-600" />
          Filtros
        </h3>
        <button
          onClick={clearFilters}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
        >
          <X className="h-4 w-4 mr-1" />
          Limpiar
        </button>
      </div>

      {/* Search */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ¿Qué servicio buscas?
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría
          </label>
          <div className="relative">
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
            >
              <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
                {selectedCategory || 'Todas las categorías'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
            
            {showCategoryDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                <div className="max-h-60 scrollbar-hide" style={{ overflowY: 'scroll' }}>
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setShowCategoryDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-500"
                  >
                    Todas las categorías
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowCategoryDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-900"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación
          </label>
          <div className="space-y-3">
            {/* Province */}
            <div className="relative">
              <button
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="w-full px-4 py-3 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
              >
                <span className={selectedProvince ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedProvince || 'Todas las provincias'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              
              {showLocationDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                  <div className="max-h-60 scrollbar-hide" style={{ overflowY: 'scroll' }}>
                    <button
                      onClick={() => {
                        handleProvinceChange('');
                        setShowLocationDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-500"
                    >
                      Todas las provincias
                    </button>
                    {provinces.map((province) => (
                      <button
                        key={province}
                        onClick={() => {
                          handleProvinceChange(province);
                          setShowLocationDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-900"
                      >
                        {province}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Locality */}
            {selectedProvince && (
              <select
                value={selectedLocality}
                onChange={(e) => setSelectedLocality(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las localidades</option>
                {localities[selectedProvince]?.map((locality) => (
                  <option key={locality} value={locality}>
                    {locality}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Search className="h-4 w-4" />
          <span>Buscar Servicios</span>
        </button>
      </div>
    </div>
  );
}
