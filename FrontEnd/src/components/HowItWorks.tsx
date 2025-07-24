import React from 'react';
import { Search, Users, CheckCircle, Star } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Busca y compara',
    description: 'Explora profesionales en tu área, compara precios y lee reseñas de otros clientes.',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: Users,
    title: 'Conecta y contrata',
    description: 'Comunícate directamente con los profesionales y negocia los detalles del servicio.',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: CheckCircle,
    title: 'Recibe el servicio',
    description: 'Disfruta de un servicio de calidad realizado por profesionales verificados.',
    color: 'bg-orange-100 text-orange-600'
  },
  {
    icon: Star,
    title: 'Califica la experiencia',
    description: 'Ayuda a otros usuarios compartiendo tu experiencia y calificando el servicio.',
    color: 'bg-purple-100 text-purple-600'
  }
];

export default function HowItWorks() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ¿Cómo funciona?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            En cuatro simples pasos puedes encontrar y contratar el servicio que necesitas
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center group">
                {/* Step number */}
                <div className="relative mb-6">
                  <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                {/* Connector line (hidden on mobile and last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-200 transform translate-x-8"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            ¿Listo para encontrar tu servicio ideal?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Únete a miles de usuarios que ya confían en nuestra plataforma para encontrar profesionales de calidad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Buscar Servicios
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Ofrecer Servicios
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}