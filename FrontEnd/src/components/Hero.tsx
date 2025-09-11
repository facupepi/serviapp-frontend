import React from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProvinces, getLocalitiesObject } from '../data/argentina';

export default function Hero() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedProvince, setSelectedProvince] = React.useState('');
  const [selectedLocality, setSelectedLocality] = React.useState('');
  
  // Obtener datos de Argentina
  const provinces = getProvinces();
  const localities = getLocalitiesObject();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (selectedProvince) {
      params.set('provincia', selectedProvince);
      params.set('province', selectedProvince); // También agregar el parámetro en inglés para compatibilidad
    }
    if (selectedLocality) {
      params.set('localidad', selectedLocality);
      params.set('locality', selectedLocality); // También agregar el parámetro en inglés para compatibilidad
    }
    navigate(`/services?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Encuentra el servicio
            <span className="block text-orange-400">perfecto para ti</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto">
            Conectamos a profesionales calificados con personas que necesitan servicios de calidad.
            Rápido, seguro y confiable.
          </p>

          {/* Search Section */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="¿Qué servicio buscas?"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                
                <div>
                  <select 
                    value={selectedProvince}
                    onChange={(e) => {
                      setSelectedProvince(e.target.value);
                      setSelectedLocality(''); // Reset locality when province changes
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="">Todas las provincias</option>
                    {provinces.map((province: string) => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <select 
                    value={selectedLocality}
                    onChange={(e) => setSelectedLocality(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    disabled={!selectedProvince}
                  >
                    <option value="">Todas las ciudades</option>
                    {selectedProvince && localities[selectedProvince]?.map((locality: string) => (
                      <option key={locality} value={locality}>{locality}</option>
                    ))}
                  </select>
                </div>
                
                <button 
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 group"
                >
                  <span>Buscar</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}