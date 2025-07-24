import React, { useState } from 'react';
import { 
  Search, 
  MessageCircle, 
  Phone, 
  Mail, 
  ChevronDown, 
  ChevronUp,
  HelpCircle,
  Book,
  Users,
  Settings
} from 'lucide-react';

export default function Help() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const categories = [
    {
      icon: Users,
      title: 'Para Usuarios',
      description: 'Cómo buscar y contratar servicios',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Settings,
      title: 'Para Proveedores',
      description: 'Cómo ofrecer y gestionar servicios',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Book,
      title: 'Pagos y Facturación',
      description: 'Información sobre pagos y comisiones',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: HelpCircle,
      title: 'Cuenta y Seguridad',
      description: 'Gestión de cuenta y privacidad',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const faqs = [
    {
      category: 'General',
      question: '¿Cómo funciona ServiApp?',
      answer: 'ServiApp es una plataforma que conecta usuarios que necesitan servicios con profesionales calificados. Los usuarios pueden buscar, comparar y contratar servicios, mientras que los proveedores pueden ofrecer sus servicios y gestionar su agenda.'
    },
    {
      category: 'General',
      question: '¿Es gratis usar ServiApp?',
      answer: 'Sí, registrarse y buscar servicios es completamente gratis para los usuarios. Los proveedores pagan una comisión del 5% solo cuando completan un trabajo exitosamente.'
    },
    {
      category: 'Usuarios',
      question: '¿Cómo busco un servicio?',
      answer: 'Puedes usar la barra de búsqueda en la página principal o navegar por categorías. También puedes filtrar por ubicación, precio y calificaciones para encontrar el servicio perfecto.'
    },
    {
      category: 'Usuarios',
      question: '¿Cómo sé si un proveedor es confiable?',
      answer: 'Todos los proveedores pasan por un proceso de verificación. Además, puedes ver sus calificaciones, reseñas de otros usuarios y si tienen la insignia "Services Líder" que indica excelente reputación.'
    },
    {
      category: 'Usuarios',
      question: '¿Qué pasa si no estoy satisfecho con un servicio?',
      answer: 'Puedes calificar y dejar una reseña sobre tu experiencia. Si hay un problema serio, nuestro equipo de soporte está disponible para ayudar a resolver la situación.'
    },
    {
      category: 'Proveedores',
      question: '¿Cómo me registro como proveedor?',
      answer: 'Regístrate con tu información personal y luego ve a "Ofrecer Servicio" para crear tu primer servicio. Deberás completar información sobre tu experiencia, zona de cobertura y disponibilidad.'
    },
    {
      category: 'Proveedores',
      question: '¿Cuánto cobran de comisión?',
      answer: 'Cobramos una comisión del 5% sobre el valor total del servicio, que se descuenta automáticamente cuando recibes el pago. No hay costos de registro ni mensualidades.'
    },
    {
      category: 'Proveedores',
      question: '¿Cómo gestiono mi disponibilidad?',
      answer: 'En tu panel de proveedor puedes configurar tus días y horarios disponibles. Los usuarios solo podrán solicitar turnos en los horarios que hayas habilitado.'
    },
    {
      category: 'Pagos',
      question: '¿Cómo funcionan los pagos?',
      answer: 'Los pagos se procesan de forma segura a través de nuestra plataforma. Los fondos se retienen hasta que el servicio se complete satisfactoriamente, garantizando seguridad para ambas partes.'
    },
    {
      category: 'Pagos',
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos tarjetas de crédito y débito, transferencias bancarias y billeteras digitales como MercadoPago. Todos los pagos están protegidos con encriptación SSL.'
    },
    {
      category: 'Cuenta',
      question: '¿Cómo cambio mi contraseña?',
      answer: 'Ve a tu perfil, selecciona "Configuración" y luego "Cambiar contraseña". También puedes usar la opción "¿Olvidaste tu contraseña?" en la página de inicio de sesión.'
    },
    {
      category: 'Cuenta',
      question: '¿Puedo eliminar mi cuenta?',
      answer: 'Sí, puedes eliminar tu cuenta desde la configuración de tu perfil. Ten en cuenta que esta acción es irreversible y se eliminarán todos tus datos permanentemente.'
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Centro de Ayuda
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Encuentra respuestas a tus preguntas o contacta con nuestro equipo de soporte
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar en el centro de ayuda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿En qué podemos ayudarte?
            </h2>
            <p className="text-xl text-gray-600">
              Explora nuestras categorías de ayuda más populares
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer"
                >
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {category.description}
                  </p>
                </div>
              );
            })}
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
            <p className="text-xl text-gray-600">
              Las respuestas a las preguntas más comunes de nuestros usuarios
            </p>
          </div>

          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mr-3">
                      {faq.category}
                    </span>
                    <span className="font-medium text-gray-900">{faq.question}</span>
                  </div>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-gray-600">
                Intenta con otros términos de búsqueda o contacta con nuestro equipo de soporte.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contact Support */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿No encontraste lo que buscabas?
            </h2>
            <p className="text-xl text-gray-600">
              Nuestro equipo de soporte está aquí para ayudarte
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Chat */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chat en Vivo
              </h3>
              <p className="text-gray-600 mb-4">
                Chatea con nuestro equipo de soporte en tiempo real
              </p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Iniciar Chat
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Lun-Vie 9:00-18:00
              </p>
            </div>

            {/* Email */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Email
              </h3>
              <p className="text-gray-600 mb-4">
                Envíanos un email y te responderemos en 24 horas
              </p>
              <a
                href="mailto:soporte@serviapp.com"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block"
              >
                Enviar Email
              </a>
              <p className="text-sm text-gray-500 mt-2">
                soporte@serviapp.com
              </p>
            </div>

            {/* Phone */}
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Teléfono
              </h3>
              <p className="text-gray-600 mb-4">
                Llámanos para soporte inmediato
              </p>
              <a
                href="tel:+541145678900"
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors inline-block"
              >
                Llamar Ahora
              </a>
              <p className="text-sm text-gray-500 mt-2">
                +54 11 4567-8900
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Enlaces Útiles
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="/como-funciona" className="block bg-white p-4 rounded-lg hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-1">Cómo Funciona</h3>
              <p className="text-gray-600 text-sm">Guía completa de la plataforma</p>
            </a>
            
            <a href="/terminos-y-condiciones" className="block bg-white p-4 rounded-lg hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-1">Términos y Condiciones</h3>
              <p className="text-gray-600 text-sm">Nuestros términos de uso</p>
            </a>
            
            <a href="/politica-de-privacidad" className="block bg-white p-4 rounded-lg hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-1">Política de Privacidad</h3>
              <p className="text-gray-600 text-sm">Cómo protegemos tus datos</p>
            </a>
            
            <a href="/sobre-nosotros" className="block bg-white p-4 rounded-lg hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-1">Sobre Nosotros</h3>
              <p className="text-gray-600 text-sm">Conoce nuestro equipo</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}