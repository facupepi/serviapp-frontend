import { useState } from 'react';
import { Menu, X, Heart, Clock, MessageSquare, Home, Briefcase, Users, ChevronDown, Settings, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const isActivePath = (path: string) => location.pathname === path;
  
  const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

  return (
    <>
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Section - Left */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md transform group-hover:scale-105 transition-all duration-300">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">
                  ServiApp
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Conectamos servicios</p>
              </div>
            </Link>

            {/* Navigation - Center */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link 
                to="/" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActivePath('/') 
                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <Home className="w-4 h-4 inline mr-2" />
                Inicio
              </Link>
              <Link 
                to="/services" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActivePath('/services') 
                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <Briefcase className="w-4 h-4 inline mr-2" />
                Servicios
              </Link>
              <Link 
                to="/how-it-works" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActivePath('/how-it-works') 
                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Cómo funciona
              </Link>
              <Link 
                to="/about-us" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActivePath('/about-us') 
                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                Nosotros
              </Link>
            </nav>

            {/* Actions - Right */}
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  {/* Favorites */}
                  <Link to="/favorites" className="p-2.5 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-all duration-300 hidden sm:flex">
                    <Heart className="w-5 h-5" />
                  </Link>

                  {/* User Menu - Desktop only */}
                  <div className="relative hidden md:block">
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-2 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                        {userInitials}
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-gray-900">{user?.name?.split(' ')[0]}</p>
                        <p className="text-xs text-gray-500">Cuenta</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                    {/* User Dropdown - Desktop only */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-900">{user?.name}</p>
                          <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                        
                        <div className="py-2">
                          <Link to="/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                            <Home className="w-4 h-4 mr-3" />
                            Mi Dashboard
                          </Link>
                          <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                            <Settings className="w-4 h-4 mr-3" />
                            Mi Perfil
                          </Link>
                          <Link to="/my-requests" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                            <Clock className="w-4 h-4 mr-3" />
                            Mis Solicitudes
                          </Link>
                          <Link to="/received-requests" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                            <MessageSquare className="w-4 h-4 mr-3" />
                            Solicitudes Recibidas
                          </Link>
                          <Link to="/favorites" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-700 transition-colors">
                            <Heart className="w-4 h-4 mr-3" />
                            Mis Favoritos
                          </Link>
                        </div>

                        <div className="border-t border-gray-100 py-2">
                          <button 
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Offer Service CTA */}
                  <Link 
                    to="/offer-service" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap"
                  >
                    Ofrecer Servicio
                  </Link>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link 
                    to="/login" 
                    className="text-gray-700 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Registrarse
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 active:scale-95"
                aria-label="Abrir menú"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Menu */}
      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300" 
            onClick={() => setIsMenuOpen(false)} 
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-50 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">ServiApp</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 active:scale-95"
                  aria-label="Cerrar menú"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* User Info */}
              {isAuthenticated && (
                <div className="p-4 bg-blue-50 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {userInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                      <div className="flex items-center mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-500">En línea</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="space-y-1">
                  <Link 
                    to="/" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all duration-200 active:scale-98 group"
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 group-hover:bg-blue-100 rounded-lg mr-4 transition-colors">
                      <Home className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Inicio</span>
                  </Link>
                  <Link 
                    to="/services" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all duration-200 active:scale-98 group"
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 group-hover:bg-blue-100 rounded-lg mr-4 transition-colors">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Servicios</span>
                  </Link>
                  <Link 
                    to="/how-it-works" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all duration-200 active:scale-98 group"
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 group-hover:bg-blue-100 rounded-lg mr-4 transition-colors">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Cómo funciona</span>
                  </Link>
                  <Link 
                    to="/about-us" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all duration-200 active:scale-98 group"
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 group-hover:bg-blue-100 rounded-lg mr-4 transition-colors">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Nosotros</span>
                  </Link>
                </div>

                {isAuthenticated && (
                  <>
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <p className="px-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mi cuenta</p>
                      <div className="space-y-1">
                        <Link 
                          to="/dashboard" 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all duration-200 active:scale-98 group"
                        >
                          <div className="w-10 h-10 flex items-center justify-center bg-gray-100 group-hover:bg-blue-100 rounded-lg mr-4 transition-colors">
                            <Home className="w-5 h-5" />
                          </div>
                          <span className="font-medium">Mi Dashboard</span>
                        </Link>
                        <Link 
                          to="/profile" 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all duration-200 active:scale-98 group"
                        >
                          <div className="w-10 h-10 flex items-center justify-center bg-gray-100 group-hover:bg-blue-100 rounded-lg mr-4 transition-colors">
                            <Settings className="w-5 h-5" />
                          </div>
                          <span className="font-medium">Mi Perfil</span>
                        </Link>
                        <Link 
                          to="/favorites" 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center px-4 py-4 text-gray-700 hover:bg-pink-50 hover:text-pink-700 rounded-xl transition-all duration-200 active:scale-98 group"
                        >
                          <div className="w-10 h-10 flex items-center justify-center bg-gray-100 group-hover:bg-pink-100 rounded-lg mr-4 transition-colors">
                            <Heart className="w-5 h-5" />
                          </div>
                          <span className="font-medium">Mis Favoritos</span>
                        </Link>
                        <Link 
                          to="/my-requests" 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all duration-200 active:scale-98 group"
                        >
                          <div className="w-10 h-10 flex items-center justify-center bg-gray-100 group-hover:bg-blue-100 rounded-lg mr-4 transition-colors">
                            <Clock className="w-5 h-5" />
                          </div>
                          <span className="font-medium">Mis Solicitudes</span>
                        </Link>
                        <Link 
                          to="/received-requests" 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center px-4 py-4 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all duration-200 active:scale-98 group"
                        >
                          <div className="w-10 h-10 flex items-center justify-center bg-gray-100 group-hover:bg-blue-100 rounded-lg mr-4 transition-colors">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <span className="font-medium">Solicitudes Recibidas</span>
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </nav>

              {/* Bottom Actions */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
                {isAuthenticated ? (
                  <>
                    <Link 
                      to="/offer-service" 
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-center block transition-all duration-200 transform active:scale-98 shadow-lg hover:shadow-xl"
                    >
                      Ofrecer Servicio
                    </Link>
                    <button 
                      onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                      className="w-full flex items-center justify-center text-red-600 hover:bg-red-50 py-3 px-4 rounded-xl font-medium transition-all duration-200 active:scale-98 group"
                    >
                      <LogOut className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Link 
                      to="/login" 
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full border-2 border-blue-600 text-blue-600 py-4 px-6 rounded-xl font-semibold text-center block hover:bg-blue-50 transition-all duration-200 active:scale-98"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-center block transition-all duration-200 transform active:scale-98 shadow-lg hover:shadow-xl"
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </>
  );
}