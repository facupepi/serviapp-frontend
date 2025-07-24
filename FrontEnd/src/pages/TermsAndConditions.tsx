import React from 'react';
import { FileText, Shield, AlertCircle } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-xl text-gray-600">
            Última actualización: 1 de enero de 2024
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          {/* Introducción */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introducción</h2>
            <p className="text-gray-600 leading-relaxed">
              Bienvenido a ServiApp. Estos términos y condiciones ("Términos") rigen el uso de 
              nuestro sitio web y servicios. Al acceder o usar ServiApp, aceptas estar sujeto 
              a estos Términos. Si no estás de acuerdo con alguna parte de estos términos, 
              no debes usar nuestros servicios.
            </p>
          </section>

          {/* Definiciones */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Definiciones</h2>
            <div className="space-y-3">
              <div>
                <strong className="text-gray-900">Plataforma:</strong>
                <span className="text-gray-600 ml-2">
                  Se refiere al sitio web y aplicación móvil de ServiApp.
                </span>
              </div>
              <div>
                <strong className="text-gray-900">Usuario:</strong>
                <span className="text-gray-600 ml-2">
                  Cualquier persona que utilice la plataforma para buscar o contratar servicios.
                </span>
              </div>
              <div>
                <strong className="text-gray-900">Proveedor:</strong>
                <span className="text-gray-600 ml-2">
                  Profesional o empresa que ofrece servicios a través de la plataforma.
                </span>
              </div>
              <div>
                <strong className="text-gray-900">Servicio:</strong>
                <span className="text-gray-600 ml-2">
                  Cualquier trabajo, tarea o prestación ofrecida por un proveedor.
                </span>
              </div>
            </div>
          </section>

          {/* Registro y Cuentas */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Registro y Cuentas de Usuario</h2>
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                Para utilizar ciertos servicios de la plataforma, debes crear una cuenta proporcionando 
                información precisa y completa. Eres responsable de:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Mantener la confidencialidad de tu contraseña</li>
                <li>Todas las actividades que ocurran bajo tu cuenta</li>
                <li>Notificar inmediatamente cualquier uso no autorizado</li>
                <li>Proporcionar información veraz y actualizada</li>
              </ul>
            </div>
          </section>

          {/* Uso de la Plataforma */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Uso de la Plataforma</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Uso Permitido</h3>
                  <p className="text-yellow-700 text-sm">
                    La plataforma debe usarse únicamente para fines legítimos de contratación de servicios.
                  </p>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Está prohibido:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
              <li>Usar la plataforma para actividades ilegales o fraudulentas</li>
              <li>Publicar contenido falso, engañoso o difamatorio</li>
              <li>Interferir con el funcionamiento de la plataforma</li>
              <li>Intentar acceder a cuentas de otros usuarios</li>
              <li>Usar la plataforma para spam o comunicaciones no solicitadas</li>
            </ul>
          </section>

          {/* Servicios y Transacciones */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Servicios y Transacciones</h2>
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                ServiApp actúa como intermediario entre usuarios y proveedores. No somos responsables 
                de la calidad, seguridad o legalidad de los servicios ofrecidos.
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900">Responsabilidades del Usuario:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Verificar las credenciales del proveedor antes de contratar</li>
                <li>Comunicar claramente los requisitos del servicio</li>
                <li>Pagar los servicios según lo acordado</li>
                <li>Proporcionar acceso seguro al lugar de trabajo</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900">Responsabilidades del Proveedor:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Proporcionar servicios de calidad según lo descrito</li>
                <li>Mantener las certificaciones y licencias necesarias</li>
                <li>Cumplir con los horarios acordados</li>
                <li>Comunicar cualquier cambio o problema oportunamente</li>
              </ul>
            </div>
          </section>

          {/* Pagos y Comisiones */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Pagos y Comisiones</h2>
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                Los pagos se procesan de forma segura a través de nuestra plataforma. 
                ServiApp cobra una comisión del 5% sobre el valor total del servicio 
                completado exitosamente.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-800">Garantía de Pago</h3>
                    <p className="text-blue-700 text-sm">
                      Los fondos se retienen de forma segura hasta que el servicio se complete satisfactoriamente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Calificaciones y Reseñas */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Calificaciones y Reseñas</h2>
            <p className="text-gray-600 leading-relaxed">
              Las calificaciones y reseñas deben ser honestas y basadas en experiencias reales. 
              Nos reservamos el derecho de remover contenido que consideremos inapropiado, 
              falso o que viole estos términos.
            </p>
          </section>

          {/* Limitación de Responsabilidad */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitación de Responsabilidad</h2>
            <p className="text-gray-600 leading-relaxed">
              ServiApp no será responsable por daños directos, indirectos, incidentales o 
              consecuentes que resulten del uso de la plataforma o de los servicios contratados 
              a través de ella. Nuestra responsabilidad máxima se limita al monto de las 
              comisiones recibidas por la transacción específica.
            </p>
          </section>

          {/* Modificaciones */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modificaciones</h2>
            <p className="text-gray-600 leading-relaxed">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. 
              Los cambios entrarán en vigor inmediatamente después de su publicación en 
              la plataforma. El uso continuado de nuestros servicios constituye la 
              aceptación de los términos modificados.
            </p>
          </section>

          {/* Ley Aplicable */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Ley Aplicable</h2>
            <p className="text-gray-600 leading-relaxed">
              Estos términos se rigen por las leyes de la República Argentina. 
              Cualquier disputa será resuelta en los tribunales competentes de 
              la Ciudad Autónoma de Buenos Aires.
            </p>
          </section>

          {/* Contacto */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contacto</h2>
            <p className="text-gray-600 leading-relaxed">
              Si tienes preguntas sobre estos términos y condiciones, puedes contactarnos en:
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-gray-600">
                <strong>Email:</strong> legal@serviapp.com
              </p>
              <p className="text-gray-600">
                <strong>Teléfono:</strong> +54 11 4567-8900
              </p>
              <p className="text-gray-600">
                <strong>Dirección:</strong> Av. Corrientes 1234, CABA, Argentina
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}