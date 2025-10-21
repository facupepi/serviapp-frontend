import { Users, Target, Award, Heart } from 'lucide-react';

export default function AboutUs() {
  const values = [
    {
      icon: Target,
      title: 'Nuestra Misión',
      description: 'Conectar a profesionales calificados con personas que necesitan servicios de calidad, creando una comunidad de confianza y excelencia.'
    },
    {
      icon: Users,
      title: 'Nuestra Visión',
      description: 'Ser la plataforma líder en Argentina para la contratación de servicios profesionales, facilitando el crecimiento económico local.'
    },
    {
      icon: Award,
      title: 'Calidad Garantizada',
      description: 'Todos nuestros proveedores pasan por un proceso de verificación riguroso para asegurar la mejor experiencia para nuestros usuarios.'
    },
    {
      icon: Heart,
      title: 'Compromiso Social',
      description: 'Apoyamos el desarrollo de pequeños emprendedores y profesionales independientes, contribuyendo al crecimiento de la economía local.'
    }
  ];

  const team = [
    {
      name: 'Facundo Pepino',
      role: 'Software Engineer',
      image: 'https://media.licdn.com/dms/image/v2/D4D03AQE2mYG1ghmPTw/profile-displayphoto-scale_200_200/B4DZksojv8JAAY-/0/1757390455710?e=1762387200&v=beta&t=HOOrvlhTZK3ktktvU_V9e6R7d33L3-fAfa8e1S6rmIw',
      description: 'Estudiante avanzado de Ingeniería en Sistemas de Información, con una visión enfocada en crear soluciones tecnológicas que generen impacto real en las empresas. Comprendo las necesidades del negocio y las traduzco en soluciones técnicas simples.',
      linkedin: 'https://www.linkedin.com/in/facundo-pepino/'
    },
    {
      name: 'Mauricio Truchet',
      role: 'Software Engineer',
      image: 'https://media.licdn.com/dms/image/v2/D4D03AQEplRPeIPXz9Q/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1726600480158?e=1762387200&v=beta&t=9me8gihPl6sTd6hS5yNpY9yb2ZjkwHCJuc7bOUeC7Eg',
      description: 'Especializado en análisis de requerimientos, diseño, implementación, testing, monitoreo y post producción. Desarrollo Back-End en aplicaciones REST, arquitecturas de microservicios, y Go.',
      linkedin: 'https://www.linkedin.com/in/mauricio-truchet-385a86198/'
    },
    {
      name: 'Santiago Villalba',
      role: 'Software Engineer',
      image: 'https://santiagovillalba.flyweb.com.ar/assets/img/hero/perfil.png',
      description: 'Desarrollador WEB enfocado en la creación de sitios web personalizables y altamente funcionales. Especializado en diseño y desarrollo de páginas institucionales, landing pages y sitios de ecommerce.',
      linkedin: 'https://www.linkedin.com/in/santiago-villalba-8711832a0/'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Sobre Nosotros
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Somos una plataforma que conecta profesionales con clientes, 
              construyendo puentes de confianza y calidad en cada servicio.
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Nuestra Historia
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  ServiApp nació en 2023 con una idea simple pero poderosa: hacer que encontrar 
                  y contratar servicios profesionales sea tan fácil como pedir comida a domicilio.
                </p>
                <p>
                  Fundada por un equipo de emprendedores argentinos, nuestra plataforma surge 
                  de la necesidad real de conectar a profesionales talentosos con personas que 
                  necesitan sus servicios, eliminando las barreras tradicionales y creando 
                  oportunidades para todos.
                </p>
                <p>
                  Desde nuestros inicios, hemos ayudado a miles de profesionales a hacer crecer 
                  sus negocios y a miles de familias a encontrar soluciones confiables para 
                  sus necesidades del hogar y más.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"
                alt="Equipo trabajando"
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nuestros Valores
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Los principios que guían cada decisión y acción en ServiApp
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nuestro Equipo
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Las personas que hacen posible ServiApp cada día
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="text-center bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-4 text-sm uppercase tracking-wide">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed mb-6 min-h-[120px] flex items-center">
                  {member.description}
                </p>
                <div className="flex justify-center">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-200">Servicios completados</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">2,500+</div>
              <div className="text-blue-200">Profesionales activos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15,000+</div>
              <div className="text-blue-200">Usuarios registrados</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.8</div>
              <div className="text-blue-200">Calificación promedio</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¿Quieres saber más?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Estamos aquí para responder todas tus preguntas y ayudarte a aprovechar 
            al máximo nuestra plataforma.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:contacto@serviapp.com"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contactanos
            </a>
            <a
              href="/help"
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Centro de Ayuda
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}