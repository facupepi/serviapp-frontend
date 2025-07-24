import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Star, 
  MapPin, 
  Shield, 
  Calendar,
  Check,
  Award,
  User,
  Clock
} from 'lucide-react';

export default function ProviderProfile() {
  const { id } = useParams();
  const { mockProviders } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Find provider by ID from the AuthContext
  const currentProvider = mockProviders.find(p => p.id === id);
  
  // Fallback provider data if not found
  const provider = currentProvider ? {
    id: currentProvider.id,
    name: currentProvider.name,
    service: currentProvider.services?.[0] || 'Servicios Generales',
    rating: currentProvider.rating || 0,
    reviews: currentProvider.reviewCount || 0,
    location: `${currentProvider.province}, ${currentProvider.locality}`,
    image: currentProvider.avatar || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    verified: currentProvider.verified || false,
    responseTime: '30 min',
    price: 'Desde $2,500',
    experience: currentProvider.experience || '1 año',
    completedJobs: currentProvider.completedJobs || 0,
    description: currentProvider.description || 'Profesional dedicado a brindar servicios de calidad.',
    services: currentProvider.services || [],
    certifications: currentProvider.certifications || []
  } : {
    id: 1,
    name: 'Juan Carlos Méndez',
    service: 'Plomería y Gasfitería',
    rating: 4.9,
    reviews: 127,
    location: 'Buenos Aires',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    verified: true,
    responseTime: '30 min',
    price: 'Desde $2,500',
    experience: '8 años',
    completedJobs: 234,
    description: 'Especialista en plomería residencial y comercial con más de 8 años de experiencia. Ofrezco servicios de calidad con garantía extendida. Disponible para emergencias las 24 horas.',
    services: [
      'Reparación de cañerías',
      'Instalación de grifos',
      'Destapado de cloacas',
      'Instalación de calefones',
      'Reparación de filtraciones',
      'Servicios de emergencia'
    ],
    certifications: [
      'Certificado de Gasista Matriculado',
      'Curso de Soldadura Especializada',
      'Certificación en Seguridad Laboral'
    ]
  };

  const reviews = [
    {
      id: 1,
      user: 'María González',
      rating: 5,
      date: '15 Dic 2023',
      comment: 'Excelente trabajo! Llegó puntual y resolvió el problema rápidamente. Muy profesional y limpio.'
    },
    {
      id: 2,
      user: 'Pedro Martínez',
      rating: 5,
      date: '10 Dic 2023',
      comment: 'Juan Carlos es muy confiable. Ya es la segunda vez que contrato sus servicios y siempre quedo satisfecho.'
    },
    {
      id: 3,
      user: 'Ana Rodríguez',
      rating: 4,
      date: '5 Dic 2023',
      comment: 'Buen trabajo y precio justo. Recomendado!'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Provider Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Provider Image */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src={provider.image}
                    alt={provider.name}
                    className="w-32 h-32 lg:w-40 lg:h-40 rounded-xl object-cover"
                  />
                  {provider.verified && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full">
                      <Shield className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </div>

              {/* Provider Info */}
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{provider.name}</h1>
                    <p className="text-xl text-blue-600 mb-4">{provider.service}</p>
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                      {/* Rating */}
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="font-semibold text-gray-900">{provider.rating}</span>
                        <span className="text-gray-600">({provider.reviews} reseñas)</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">{provider.location}</span>
                      </div>

                      {/* Response Time */}
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">Responde en {provider.responseTime}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed">{provider.description}</p>
                  </div>

                  {/* Contact Section */}
                  <div className="lg:ml-8 mt-6 lg:mt-0">
                    <div className="bg-gray-50 rounded-xl p-6 lg:w-80">
                      <div className="text-center mb-4">
                        <span className="text-2xl font-bold text-gray-900">{provider.price}</span>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <button className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                          <Calendar className="h-5 w-5" />
                          <span>Ver servicios</span>
                        </button>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{provider.completedJobs}</div>
                          <div className="text-sm text-gray-600">Trabajos completados</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{provider.experience}</div>
                          <div className="text-sm text-gray-600">De experiencia</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Resumen
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'services'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Servicios
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Reseñas
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Sobre mí</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {provider.description}
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Certificaciones</h4>
                      <ul className="space-y-2">
                        {provider.certifications.map((cert, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <Award className="h-4 w-4 text-green-500" />
                            <span className="text-gray-700 text-sm">{cert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Estadísticas</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">Trabajos completados</span>
                          <span className="font-medium">{provider.completedJobs}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">Años de experiencia</span>
                          <span className="font-medium">{provider.experience}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">Tasa de respuesta</span>
                          <span className="font-medium">98%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Servicios que ofrezco</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {provider.services.map((service, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Reseñas de clientes</h3>
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        <div className="flex items-start space-x-4">
                          <div className="bg-gray-200 rounded-full p-2">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{review.user}</h4>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                            <div className="flex items-center space-x-1 mb-3">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de contacto</h3>
              <p className="text-gray-600 text-sm">
                Para contactar con este proveedor, solicita un turno en uno de sus servicios. Recibirás sus datos de contacto una vez confirmado.
              </p>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Disponibilidad</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lunes - Viernes</span>
                  <span className="text-gray-900">8:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sábados</span>
                  <span className="text-gray-900">9:00 - 14:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Domingos</span>
                  <span className="text-red-600">Cerrado</span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Verificaciones</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-700">Identidad verificada</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-700">Certificaciones validadas</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-700">Seguro de responsabilidad</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}