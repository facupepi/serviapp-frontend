import { Star, MapPin, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const providers = [
  {
    id: 1,
    name: 'Juan Carlos Méndez',
    service: 'Plomería y Gasfitería',
    rating: 4.9,
    reviews: 127,
    location: 'Buenos Aires',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    verified: true,
    price: 'Desde $2,500'
  },
  {
    id: 2,
    name: 'María Elena Torres',
    service: 'Limpieza del Hogar',
    rating: 4.8,
    reviews: 89,
    location: 'Córdoba',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    verified: true,
    price: 'Desde $1,800'
  },
  {
    id: 3,
    name: 'Roberto Silva',
    service: 'Electricidad',
    rating: 4.7,
    reviews: 156,
    location: 'Rosario',
    image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    verified: true,
    price: 'Desde $3,200'
  },
  {
    id: 4,
    name: 'Ana Sofía Ruiz',
    service: 'Jardinería y Paisajismo',
    rating: 4.9,
    reviews: 73,
    location: 'Mendoza',
    image: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
    verified: true,
    price: 'Desde $2,000'
  }
];

export default function FeaturedProviders() {
  const navigate = useNavigate();

  const handleProviderClick = (providerId: number) => {
    navigate(`/proveedor/${providerId}`);
  };
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Profesionales destacados
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Conecta con los mejores profesionales verificados y con excelentes calificaciones
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {providers.map((provider) => (
            <div
              key={provider.id}
              onClick={() => handleProviderClick(provider.id)}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
            >
              {/* Provider Image */}
              <div className="relative">
                <img
                  src={provider.image}
                  alt={provider.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {provider.verified && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white p-1 rounded-full">
                    <Shield className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Provider Info */}
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-1">{provider.name}</h3>
                <p className="text-blue-600 text-sm mb-3">{provider.service}</p>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium text-gray-900">{provider.rating}</span>
                  </div>
                  <span className="text-gray-500 text-sm">({provider.reviews} reseñas)</span>
                </div>

                {/* Location */}
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 text-sm">{provider.location}</span>
                </div>


                {/* Price and CTA */}
                <div className="flex items-center justify-between mt-4">
                  <span className="font-semibold text-gray-900">{provider.price}</span>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Contactar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors">
            Ver todos los profesionales
          </button>
        </div>
      </div>
    </section>
  );
}