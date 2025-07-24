import React from 'react';
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
      name: 'Ana García',
      role: 'CEO & Fundadora',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      description: 'Emprendedora con más de 10 años de experiencia en tecnología y servicios.'
    },
    {
      name: 'Carlos Rodríguez',
      role: 'CTO',
      image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      description: 'Ingeniero en sistemas especializado en plataformas digitales y experiencia de usuario.'
    },
    {
      name: 'María López',
      role: 'Directora de Operaciones',
      image: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      description: 'Experta en gestión de operaciones y desarrollo de comunidades digitales.'
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

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600">
                  {member.description}
                </p>
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
              href="/ayuda"
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