import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Shield, 
  Clock,
  User,
  Heart,
  ArrowLeft,
  Phone,
  Mail,
  Award,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Service } from '../types/api';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    isAuthenticated, 
    getServiceById,
    addToFavorites,
    removeFromFavorites,
    favorites, 
    requestService
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [serviceData, setServiceData] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadService = async () => {
      if (!id) {
        setError('ID de servicio no válido');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = await getServiceById(id);
        
        if (result.success && result.data) {
          console.log('✅ Servicio cargado:', result.data);
          setServiceData(result.data);
          setError(null);
        } else {
          console.error('❌ Error cargando servicio:', result.error);
          setError(result.error || 'Error al cargar el servicio');
        }
      } catch (error) {
        console.error('❌ Error inesperado:', error);
        setError('Error inesperado al cargar el servicio');
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [id, getServiceById]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando servicio...</p>
        </div>
      </div>
    );
  }

  if (error || !serviceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Servicio no encontrado'}
          </h2>
          <button
            onClick={() => navigate('/services')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Volver a servicios
          </button>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.includes(serviceData.id.toString());

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleRequestService = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!selectedDate || !selectedTime) {
      alert('Por favor selecciona fecha y hora');
      return;
    }

    try {
      const result = await requestService(serviceData.id.toString(), selectedDate, selectedTime);
      if (result.success) {
        alert('Solicitud enviada exitosamente');
        setShowBookingModal(false);
        setSelectedDate('');
        setSelectedTime('');
        setRequestMessage('');
      } else {
        alert(result.error || 'Error al enviar la solicitud');
      }
    } catch (error) {
      alert('Error inesperado al enviar la solicitud');
    }
  };

  const formatZones = (zones: any[]) => {
    if (!zones || zones.length === 0) return 'Zona no especificada';
    
    // Agrupar por localidad
    const groupedZones: { [key: string]: string[] } = {};
    zones.forEach(zone => {
      const locality = zone.locality || 'Localidad';
      if (!groupedZones[locality]) {
        groupedZones[locality] = [];
      }
      groupedZones[locality].push(zone.neighborhood || 'Barrio');
    });
    
    // Formar el string de zonas
    const zoneStrings = Object.entries(groupedZones).map(([locality, neighborhoods]) => {
      if (neighborhoods.length <= 2) {
        return `${neighborhoods.join(', ')} (${locality})`;
      } else {
        return `${neighborhoods.slice(0, 2).join(', ')} y ${neighborhoods.length - 2} más (${locality})`;
      }
    });
    
    return zoneStrings.join(' • ');
  };

  const formatAvailability = (availability: any): string[] => {
    if (!availability) return ['Disponibilidad: Consultar'];
    
    const days: string[] = [];
    const dayNames = {
      monday: 'Lunes',
      tuesday: 'Martes', 
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo'
    };
    
    // Definir el orden correcto de los días (Lunes a Domingo)
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    dayOrder.forEach((day) => {
      const schedule = availability[day];
      if (schedule && schedule.start && schedule.end) {
        const dayName = dayNames[day as keyof typeof dayNames];
        days.push(`${dayName}: ${schedule.start} - ${schedule.end}`);
      } else if (schedule && schedule.available === false) {
        const dayName = dayNames[day as keyof typeof dayNames];
        days.push(`${dayName}: No disponible`);
      }
    });
    
    return days.length > 0 ? days : ['Disponibilidad: Consultar'];
  };

  const generateTimeSlots = () => {
    if (!serviceData?.availability) return [];
    
    const timeSlots = [];
    const selectedDateObj = selectedDate ? new Date(selectedDate) : null;
    
    if (!selectedDateObj) return [];
    
    // Obtener el día de la semana (0 = domingo, 1 = lunes, etc.)
    const dayOfWeek = selectedDateObj.getDay();
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayKeys[dayOfWeek];
    
    const availability = serviceData.availability[dayKey];
    
    if (!availability || !availability.start || !availability.end) {
      return [];
    }
    
    // Generar slots de 1 hora entre start y end
    const startTime = availability.start;
    const endTime = availability.end;
    
    const [startHour] = startTime.split(':').map(Number);
    const [endHour] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    
    while (currentHour < endHour) {
      const timeSlot = `${currentHour.toString().padStart(2, '0')}:00`;
      timeSlots.push(timeSlot);
      currentHour++;
    }
    
    return timeSlots;
  };

  const isDateAvailable = (date: string) => {
    if (!serviceData?.availability || !date) return false;
    
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayKeys[dayOfWeek];
    
    const availability = serviceData.availability[dayKey];
    return availability && availability.start && availability.end;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Images */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={serviceData.image_url}
                  alt={serviceData.title}
                  className="w-full h-80 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=400&fit=crop&crop=center';
                  }}
                />
              </div>
            </div>

            {/* Service Info */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {serviceData.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {formatZones(serviceData.zones)}
                    </div>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-1" />
                      Verificado
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => isFavorite 
                    ? removeFromFavorites(serviceData.id.toString()) 
                    : addToFavorites(serviceData.id.toString())
                  }
                  className={`p-2 rounded-full transition-colors ${
                    isFavorite 
                      ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                      : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Provider Info */}
              <div className="flex items-center space-x-4 mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Proveedor Profesional</span>
                    <Award className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center mr-4">
                      {renderStars(4.8)}
                      <span className="text-sm text-gray-600 ml-2">
                        4.8 (24 reseñas)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                    <MessageSquare className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100">
                    <Phone className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'overview', label: 'Descripción' },
                    { id: 'availability', label: 'Disponibilidad' },
                    { id: 'reviews', label: 'Reseñas' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      {serviceData.description}
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Detalles del servicio</h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                          <li className="flex justify-between">
                            <span>• Categoría:</span>
                            <span className="font-medium">{serviceData.category}</span>
                          </li>
                          <li className="flex justify-between">
                            <span>• Estado:</span>
                            <span className={`font-medium ${serviceData.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                              {serviceData.status === 'active' ? 'Activo' : 'Inactivo'}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>• Precio:</span>
                            <span className="font-medium text-blue-600">
                              ${serviceData.price.toLocaleString('es-AR')}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>• Servicio desde:</span>
                            <span className="font-medium">
                              {new Date(serviceData.created_at).toLocaleDateString('es-AR')}
                            </span>
                          </li>
                          <li className="flex justify-between">
                            <span>• Última actualización:</span>
                            <span className="font-medium">
                              {new Date(serviceData.updated_at).toLocaleDateString('es-AR')}
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Zona de cobertura</h4>
                        <div className="space-y-2">
                          {serviceData.zones.map((zone: any, index: number) => (
                            <div key={index} className="text-sm bg-gray-50 p-3 rounded-lg">
                              <div className="font-medium text-gray-900">
                                📍 {zone.neighborhood}
                              </div>
                              <div className="text-gray-600">
                                {zone.locality}, {zone.province}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                          Cobertura en {serviceData.zones.length} zona{serviceData.zones.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'availability' && (
                  <div className="space-y-6">
                    <h4 className="font-medium text-gray-900">Horarios disponibles</h4>
                    
                    {/* Horarios detallados por día */}
                    <div className="space-y-3">
                      {formatAvailability(serviceData.availability).map((daySchedule, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">
                            {daySchedule.split(':')[0]}
                          </span>
                          <span className="text-sm text-gray-600">
                            {daySchedule.includes('No disponible') 
                              ? 'Cerrado' 
                              : daySchedule.split(': ')[1]
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Vista visual de días disponibles */}
                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-900">Vista semanal</h5>
                      <div className="grid grid-cols-7 gap-2 text-center text-sm">
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, index) => {
                          const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
                          const schedule = serviceData.availability?.[day];
                          const isAvailable = schedule && schedule.start && schedule.end;
                          
                          return (
                            <div key={day} className="space-y-2">
                              <div
                                className={`p-3 rounded-lg ${
                                  isAvailable
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-gray-50 text-gray-400 border border-gray-200'
                                }`}
                              >
                                {dayLabels[index]}
                              </div>
                              {isAvailable && (
                                <div className="text-xs text-gray-600">
                                  <div>{schedule.start}</div>
                                  <div>-</div>
                                  <div>{schedule.end}</div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Reseñas de clientes</h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {renderStars(4.8)}
                        </div>
                        <span className="text-sm font-medium">4.8/5</span>
                        <span className="text-sm text-gray-500">(24 reseñas)</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Ejemplo de reseñas */}
                      {[1, 2, 3].map((review) => (
                        <div key={review} className="border-b border-gray-100 pb-4">
                          <div className="flex items-start space-x-4">
                            <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium">Cliente Satisfecho</span>
                                <div className="flex items-center">
                                  {renderStars(5)}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                Excelente servicio, muy profesional y puntual. Lo recomiendo totalmente.
                              </p>
                              <span className="text-xs text-gray-400">Hace 1 semana</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${serviceData.price.toLocaleString('es-AR')}
                </div>
                <p className="text-gray-600">Por servicio</p>
              </div>

              {isAuthenticated ? (
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Solicitar Servicio
                </button>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Iniciar Sesión para Solicitar
                </button>
              )}

              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-500" />
                  Proveedor verificado
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                  Respuesta rápida
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2 text-yellow-500" />
                  Altamente calificado
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">¿Tienes preguntas?</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  <span>Enviar mensaje</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Phone className="h-4 w-4" />
                  <span>Llamar</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Mail className="h-4 w-4" />
                  <span>Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Solicitar Servicio</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha preferida
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime(''); // Reset time when date changes
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {selectedDate && !isDateAvailable(selectedDate) && (
                  <p className="text-sm text-red-600 mt-1">
                    El servicio no está disponible en el día seleccionado
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora preferida
                </label>
                {selectedDate && isDateAvailable(selectedDate) ? (
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar hora disponible</option>
                    {generateTimeSlots().map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!selectedDate || !isDateAvailable(selectedDate)}
                  >
                    <option value="">
                      {!selectedDate ? 'Selecciona una fecha primero' : 'No hay horarios disponibles'}
                    </option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje adicional (opcional)
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe detalles específicos del servicio que necesitas..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRequestService}
                disabled={!selectedDate || !selectedTime || !isDateAvailable(selectedDate)}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Enviar Solicitud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetail;
