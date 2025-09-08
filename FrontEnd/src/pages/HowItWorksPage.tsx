import { Search, Users, CheckCircle, Star, ArrowRight, Play } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      number: 1,
      icon: Search,
      title: 'Busca y compara',
      description: 'Explora profesionales en tu área, compara precios y lee reseñas de otros clientes.',
      details: [
        'Usa nuestro buscador inteligente',
        'Filtra por categoría, ubicación y precio',
        'Lee reseñas reales de otros usuarios',
        'Compara perfiles y calificaciones'
      ]
    },
    {
      number: 2,
      icon: Users,
      title: 'Conecta y agenda',
      description: 'Comunícate directamente con los profesionales y agenda tu servicio.',
      details: [
        'Selecciona fecha y horario disponible',
        'Envía tu solicitud de servicio',
        'Recibe confirmación del proveedor',
        'Coordina detalles por mensaje'
      ]
    },
    {
      number: 3,
      icon: CheckCircle,
      title: 'Recibe el servicio',
      description: 'Disfruta de un servicio de calidad realizado por profesionales verificados.',
      details: [
        'El profesional llega puntual',
        'Trabajo realizado con garantía',
        'Seguimiento en tiempo real',
        'Soporte durante todo el proceso'
      ]
    },
    {
      number: 4,
      icon: Star,
      title: 'Califica la experiencia',
      description: 'Ayuda a otros usuarios compartiendo tu experiencia y calificando el servicio.',
      details: [
        'Califica del 1 al 5 estrellas',
        'Deja un comentario detallado',
        'Ayuda a mejorar la comunidad',
        'Construye confianza para otros'
      ]
    }
  ];

  const forUsers = [
    {
      title: 'Encuentra profesionales verificados',
      description: 'Todos nuestros proveedores pasan por un proceso de verificación de identidad y calificaciones.'
    },
    {
      title: 'Agenda en tiempo real',
      description: 'Ve la disponibilidad real y agenda tu servicio al instante, sin esperas ni llamadas.'
    },
    {
      title: 'Precios transparentes',
      description: 'Conoce el costo antes de contratar, sin sorpresas ni costos ocultos.'
    },
    {
      title: 'Garantía de calidad',
      description: 'Sistema de calificaciones y reseñas que garantiza la calidad del servicio.'
    }
  ];

  const forProviders = [
    {
      title: 'Gestiona tu agenda',
      description: 'Controla tu disponibilidad y recibe solicitudes solo cuando puedes atender.'
    },
    {
      title: 'Amplía tu alcance',
      description: 'Llega a más clientes en tu zona sin invertir en publicidad costosa.'
    },
    {
      title: 'Pagos seguros',
      description: 'Recibe tus pagos de forma segura y puntual a través de nuestra plataforma.'
    },
    {
      title: 'Construye tu reputación',
      description: 'Las buenas calificaciones te ayudan a conseguir más clientes y mejores trabajos.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              ¿Cómo Funciona ServiApp?
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Descubre lo fácil que es encontrar y contratar servicios profesionales 
              o hacer crecer tu negocio como proveedor.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2">
              <Play className="h-5 w-5" />
              <span>Ver video explicativo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              En 4 simples pasos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Desde la búsqueda hasta la calificación, todo el proceso está diseñado 
              para ser simple y seguro.
            </p>
          </div>

          <div className="space-y-16">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {step.number}
                      </div>
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-lg text-gray-600 mb-6">
                      {step.description}
                    </p>
                    
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 h-64 flex items-center justify-center">
                      <Icon className="h-24 w-24 text-blue-600" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* For Users Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Para Usuarios
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Encuentra y contrata servicios profesionales de manera fácil y segura
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {forUsers.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="/registro"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <span>Comenzar como usuario</span>
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      {/* For Providers Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Para Proveedores
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Haz crecer tu negocio conectando con más clientes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {forProviders.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-colors">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="/offer-service"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
            >
              <span>Comenzar como proveedor</span>
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ¿Es gratis usar ServiApp?
              </h3>
              <p className="text-gray-600">
                Sí, registrarse y buscar servicios es completamente gratis. Solo cobramos una pequeña 
                comisión a los proveedores cuando completan un trabajo exitosamente.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ¿Cómo garantizan la calidad de los servicios?
              </h3>
              <p className="text-gray-600">
                Todos nuestros proveedores pasan por un proceso de verificación. Además, nuestro 
                sistema de calificaciones y reseñas permite que la comunidad evalúe la calidad 
                de cada servicio.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ¿Qué pasa si no estoy satisfecho con un servicio?
              </h3>
              <p className="text-gray-600">
                Tenemos un equipo de soporte dedicado para resolver cualquier inconveniente. 
                Trabajamos con ambas partes para encontrar una solución justa y mantener 
                la calidad de nuestra plataforma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}