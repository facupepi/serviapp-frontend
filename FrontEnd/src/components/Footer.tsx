import React from 'react';
import { Search, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Search className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">ServiApp</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              La plataforma líder que conecta a profesionales calificados con personas que necesitan servicios de calidad. Rápido, seguro y confiable.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Servicios</h3>
            <ul className="space-y-3">
              <li><Link to="/servicios?category=Hogar y Reparaciones" className="text-gray-300 hover:text-white transition-colors">Hogar y Reparaciones</Link></li>
              <li><Link to="/servicios?category=Electricidad" className="text-gray-300 hover:text-white transition-colors">Electricidad</Link></li>
              <li><Link to="/servicios?category=Limpieza" className="text-gray-300 hover:text-white transition-colors">Limpieza</Link></li>
              <li><Link to="/servicios?category=Jardinería" className="text-gray-300 hover:text-white transition-colors">Jardinería</Link></li>
              <li><Link to="/servicios?category=Tecnología" className="text-gray-300 hover:text-white transition-colors">Tecnología</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Empresa</h3>
            <ul className="space-y-3">
              <li><Link to="/sobre-nosotros" className="text-gray-300 hover:text-white transition-colors">Sobre Nosotros</Link></li>
              <li><Link to="/como-funciona" className="text-gray-300 hover:text-white transition-colors">Cómo Funciona</Link></li>
              <li><Link to="/terminos-y-condiciones" className="text-gray-300 hover:text-white transition-colors">Términos y Condiciones</Link></li>
              <li><Link to="/politica-de-privacidad" className="text-gray-300 hover:text-white transition-colors">Política de Privacidad</Link></li>
              <li><Link to="/ayuda" className="text-gray-300 hover:text-white transition-colors">Ayuda</Link></li>
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="border-t border-gray-800 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-blue-400" />
              <span className="text-gray-300">contacto@serviapp.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-blue-400" />
              <span className="text-gray-300">+54 11 4567-8900</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-blue-400" />
              <span className="text-gray-300">Buenos Aires, Argentina</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 ServiApp. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/politica-de-privacidad" className="text-gray-400 hover:text-white text-sm transition-colors">
              Política de Privacidad
            </Link>
            <Link to="/terminos-y-condiciones" className="text-gray-400 hover:text-white text-sm transition-colors">
              Términos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}