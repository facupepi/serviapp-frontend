import React from 'react';
import { Shield, Eye, Lock, Database } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Política de Privacidad
          </h1>
          <p className="text-xl text-gray-600">
            Última actualización: 1 de enero de 2024
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          {/* Introducción */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introducción</h2>
            <p className="text-gray-600 leading-relaxed">
              En ServiApp, respetamos tu privacidad y nos comprometemos a proteger tus datos personales. 
              Esta política de privacidad explica cómo recopilamos, usamos, compartimos y protegemos 
              tu información cuando utilizas nuestros servicios.
            </p>
          </section>

          {/* Información que Recopilamos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              <Database className="inline h-6 w-6 mr-2 text-blue-600" />
              Información que Recopilamos
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Información que nos proporcionas:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li>Datos de registro (nombre, email, teléfono, ubicación)</li>
                  <li>Información de perfil y preferencias</li>
                  <li>Contenido que publicas (descripciones de servicios, reseñas)</li>
                  <li>Comunicaciones con otros usuarios y con nosotros</li>
                  <li>Información de pago y facturación</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Información que recopilamos automáticamente:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li>Datos de uso de la plataforma</li>
                  <li>Información del dispositivo y navegador</li>
                  <li>Dirección IP y datos de ubicación</li>
                  <li>Cookies y tecnologías similares</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cómo Usamos tu Información */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              <Eye className="inline h-6 w-6 mr-2 text-green-600" />
              Cómo Usamos tu Información
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Para Usuarios</h3>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Facilitar la búsqueda de servicios</li>
                  <li>• Procesar solicitudes y pagos</li>
                  <li>• Enviar notificaciones importantes</li>
                  <li>• Mejorar recomendaciones</li>
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Para Proveedores</h3>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• Mostrar servicios a usuarios relevantes</li>
                  <li>• Gestionar solicitudes y agenda</li>
                  <li>• Procesar pagos y comisiones</li>
                  <li>• Verificar identidad y calificaciones</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Propósitos generales:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                <li>Proporcionar, mantener y mejorar nuestros servicios</li>
                <li>Personalizar tu experiencia en la plataforma</li>
                <li>Comunicarnos contigo sobre actualizaciones y promociones</li>
                <li>Detectar y prevenir fraudes y actividades maliciosas</li>
                <li>Cumplir con obligaciones legales y regulatorias</li>
              </ul>
            </div>
          </section>

          {/* Compartir Información */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Compartir tu Información</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              No vendemos tu información personal. Compartimos información limitada solo en estas situaciones:
            </p>
            
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900">Con otros usuarios</h3>
                <p className="text-gray-600 text-sm">
                  Información de perfil necesaria para facilitar la contratación de servicios.
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900">Con proveedores de servicios</h3>
                <p className="text-gray-600 text-sm">
                  Terceros que nos ayudan a operar la plataforma (procesamiento de pagos, hosting).
                </p>
              </div>
              
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-semibold text-gray-900">Por requerimientos legales</h3>
                <p className="text-gray-600 text-sm">
                  Cuando sea requerido por ley o para proteger nuestros derechos.
                </p>
              </div>
            </div>
          </section>

          {/* Seguridad */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              <Lock className="inline h-6 w-6 mr-2 text-red-600" />
              Seguridad de los Datos
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-600 leading-relaxed mb-4">
                Implementamos medidas de seguridad técnicas y organizativas para proteger 
                tu información personal contra acceso no autorizado, alteración, divulgación o destrucción.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">Encriptación</h3>
                  <p className="text-gray-600 text-xs">SSL/TLS para todas las comunicaciones</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">Acceso Limitado</h3>
                  <p className="text-gray-600 text-xs">Solo personal autorizado accede a los datos</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Database className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">Respaldos Seguros</h3>
                  <p className="text-gray-600 text-xs">Copias de seguridad encriptadas</p>
                </div>
              </div>
            </div>
          </section>

          {/* Tus Derechos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tus Derechos</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Tienes derecho a:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600">Acceder a tu información personal</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600">Corregir datos inexactos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600">Solicitar la eliminación de datos</span>
                </li>
              </ul>
              
              <ul className="space-y-2">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600">Limitar el procesamiento</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600">Portabilidad de datos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600">Retirar el consentimiento</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies y Tecnologías Similares</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia, 
              analizar el uso de la plataforma y personalizar el contenido. Puedes 
              controlar las cookies a través de la configuración de tu navegador.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Tipos de cookies que usamos:</h3>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• <strong>Esenciales:</strong> Necesarias para el funcionamiento básico</li>
                <li>• <strong>Funcionales:</strong> Mejoran la funcionalidad y personalización</li>
                <li>• <strong>Analíticas:</strong> Nos ayudan a entender cómo usas la plataforma</li>
                <li>• <strong>Publicitarias:</strong> Para mostrar anuncios relevantes</li>
              </ul>
            </div>
          </section>

          {/* Retención de Datos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Retención de Datos</h2>
            <p className="text-gray-600 leading-relaxed">
              Conservamos tu información personal solo durante el tiempo necesario para 
              cumplir con los propósitos descritos en esta política, a menos que la ley 
              requiera o permita un período de retención más largo. Cuando elimines tu cuenta, 
              eliminaremos o anonimizaremos tu información personal, excepto cuando debamos 
              conservarla por razones legales.
            </p>
          </section>

          {/* Cambios en la Política */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cambios en esta Política</h2>
            <p className="text-gray-600 leading-relaxed">
              Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos 
              sobre cambios significativos publicando la nueva política en esta página y 
              actualizando la fecha de "última actualización". Te recomendamos revisar 
              esta política periódicamente.
            </p>
          </section>

          {/* Contacto */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contacto</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos 
              tu información personal, puedes contactarnos:
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-gray-600">
                <strong>Email de Privacidad:</strong> privacidad@serviapp.com
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