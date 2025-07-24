import { useState } from 'react';
import { Search, Menu, X, Bell, User, Heart, Clock, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Search className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-900">ServiApp</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="¿Qué servicio necesitas?"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/servicios" className="text-gray-700 hover:text-blue-600 transition-colors">
              Servicios
            </Link>
            <Link to="/ofrecer-servicio" className="text-gray-700 hover:text-blue-600 transition-colors">
              Ofrecer Servicio
            </Link>
            {isAuthenticated ? (
              <>
                <Bell className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
                <div className="relative group">
                  <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <User className="h-4 w-4" />
                    <span>{user?.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Mi Dashboard
                    </Link>
                    <Link to="/favoritos" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Heart className="h-4 w-4 mr-2" />
                      Mis Favoritos
                    </Link>
                    <Link to="/mis-solicitudes" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Clock className="h-4 w-4 mr-2" />
                      Mis Solicitudes
                    </Link>
                    <Link to="/solicitudes-recibidas" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Solicitudes Recibidas
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Iniciar Sesión
                </Link>
                <Link to="/registro" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Registrarse
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden py-4 border-t border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="¿Qué servicio necesitas?"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 space-y-4">
            <Link to="/servicios" className="block text-gray-700 hover:text-blue-600 transition-colors">
              Servicios
            </Link>
            <Link to="/ofrecer-servicio" className="block text-gray-700 hover:text-blue-600 transition-colors">
              Ofrecer Servicio
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block text-gray-700 hover:text-blue-600 transition-colors">
                  Mi Dashboard
                </Link>
                <Link to="/favoritos" className="block text-gray-700 hover:text-blue-600 transition-colors">
                  Mis Favoritos
                </Link>
                <Link to="/mis-solicitudes" className="block text-gray-700 hover:text-blue-600 transition-colors">
                  Mis Solicitudes
                </Link>
                <Link to="/solicitudes-recibidas" className="block text-gray-700 hover:text-blue-600 transition-colors">
                  Solicitudes Recibidas
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-700 hover:text-blue-600 transition-colors">
                  Iniciar Sesión
                </Link>
                <Link to="/registro" className="block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}