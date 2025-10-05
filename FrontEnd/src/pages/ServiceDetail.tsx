import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Heart,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logger from '../utils/logger';
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
    requestService,
    user,
    getUserServices
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [serviceData, setServiceData] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserService, setIsUserService] = useState(false);

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
          logger.info('Servicio cargado:', result.data);
          setServiceData(result.data);
          setError(null);
          
          // Verificar si el servicio pertenece al usuario
          if (isAuthenticated && user) {
            try {
              const userServicesResult = await getUserServices();
              if (userServicesResult.success && userServicesResult.data) {
                const userOwnsService = userServicesResult.data.some(
                  (userService: any) => userService.id.toString() === id
                );
                logger.debug('Usuario es dueño del servicio:', userOwnsService);
                logger.debug('Servicios del usuario:', userServicesResult.data.map((s: any) => ({ id: s.id, title: s.title })));
                setIsUserService(userOwnsService);
              }
              } catch (error) {
                logger.error('Error verificando servicios del usuario:', error);
              }
          }
        } else {
          logger.error('Error cargando servicio:', result.error);
          setError(result.error || 'Error al cargar el servicio');
        }
      } catch (error) {
        logger.error('Error inesperado:', error);
        setError('Error inesperado al cargar el servicio');
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [id, getServiceById, getUserServices, isAuthenticated, user]);

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

  // Normaliza la estructura mixta de availability a un mapping por día
  const normalizeAvailability = (availability: any) => {
    const dayOrder = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    const normalized: Record<string, { available: boolean; timeSlots: Array<{start:string;end:string}> }> = {};

    // Inicializar días como no disponibles por defecto
    dayOrder.forEach(d => {
      normalized[d] = { available: false, timeSlots: [] };
    });

    if (!availability || typeof availability !== 'object') return normalized;

    // Primero procesar entradas con timeSlots (claves numéricas y otras con datos reales)
    // Luego procesar entradas con available:false para no sobrescribir datos reales
    const entries = Object.entries(availability);
    const entriesWithSlots: Array<[string, any]> = [];
    const entriesWithAvailableFalse: Array<[string, any]> = [];

    for (const [key, val] of entries) {
      if (!val) continue;
      const entry: any = val;
      
      // Si tiene timeSlots o start/end, tiene prioridad
      if ((Array.isArray(entry.timeSlots) && entry.timeSlots.length) || (entry.start && entry.end)) {
        entriesWithSlots.push([key, val]);
      } else if (entry.available === false) {
        entriesWithAvailableFalse.push([key, val]);
      } else {
        // Otros casos (available:true sin slots, etc.)
        entriesWithSlots.push([key, val]);
      }
    }

    // Procesar primero las entradas con datos de horarios
    for (const [key, val] of entriesWithSlots) {
      const entry: any = val;
      const maybeDay = entry.day || key;
      const day = String(maybeDay).toLowerCase();
      if (!normalized[day]) continue;

      const slots: Array<{start:string;end:string}> = [];
      if (Array.isArray(entry.timeSlots) && entry.timeSlots.length) {
        entry.timeSlots.forEach((s: any) => {
          if (s?.start && s?.end) slots.push({ start: s.start, end: s.end });
        });
      }

      if (entry.start && entry.end) {
        slots.push({ start: entry.start, end: entry.end });
      }

      if (slots.length) {
        normalized[day].timeSlots = slots;
        normalized[day].available = true;
      } else if (entry.available === true) {
        normalized[day].available = true;
      }
    }

    // Procesar después las entradas con available:false, solo si no hay datos ya
    for (const [key, val] of entriesWithAvailableFalse) {
      const entry: any = val;
      const maybeDay = entry.day || key;
      const day = String(maybeDay).toLowerCase();
      if (!normalized[day]) continue;

      // Solo aplicar available:false si no hay timeSlots ya establecidos
      if (normalized[day].timeSlots.length === 0) {
        normalized[day].available = false;
        normalized[day].timeSlots = [];
      }
    }

    return normalized;
  };

  // Formatea la disponibilidad para mostrar por día, usando la normalización
  const formatAvailability = (availability: any): string[] => {
    const dayNames: Record<string, string> = {
      monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo'
    };
    const dayOrder = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

    const norm = normalizeAvailability(availability);

    return dayOrder.map((d) => {
      const human = dayNames[d];
      const dayEntry = norm[d];
      if (!dayEntry) return `${human}: No disponible`;
      if (!dayEntry.available || (dayEntry.timeSlots.length === 0)) return `${human}: No disponible`;
      const parts = dayEntry.timeSlots.map(s => `${s.start} - ${s.end}`);
      return `${human}: ${parts.join(', ')}`;
    });
  };



  const generateTimeSlots = () => {
    if (!serviceData?.availability) return [];

    const selectedDateObj = selectedDate ? new Date(selectedDate) : null;
    if (!selectedDateObj) return [];

    const dayOfWeek = selectedDateObj.getDay();
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayKeys[dayOfWeek];

    const norm = normalizeAvailability(serviceData.availability);
    const dayEntry = norm[dayKey];
    if (!dayEntry || !dayEntry.timeSlots.length) return [];

    const slots: string[] = [];
    // Para cada franja, generar horas enteras desde start hasta end-1
    dayEntry.timeSlots.forEach(ts => {
      const [startHour] = ts.start.split(':').map(Number);
      const [endHour] = ts.end.split(':').map(Number);
      for (let h = startHour; h < endHour; h++) {
        slots.push(`${h.toString().padStart(2, '0')}:00`);
      }
    });

    // Eliminar duplicados y ordenar
    return Array.from(new Set(slots)).sort();
  };

  const isDateAvailable = (date: string) => {
    if (!serviceData?.availability || !date) return false;

    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayKeys[dayOfWeek];

    const norm = normalizeAvailability(serviceData.availability);
    const dayEntry = norm[dayKey];
    return !!(dayEntry && dayEntry.timeSlots && dayEntry.timeSlots.length > 0);
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Service Images */}
          <div className="lg:w-1/2 w-full flex-shrink-0 flex items-center justify-center">
            <div className="relative rounded-2xl overflow-hidden mb-6 shadow-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-gray-100 w-full h-[420px] lg:h-[500px] max-w-[600px] flex items-center justify-center">
              <img
                src={serviceData.image_url}
                alt={serviceData.title}
                className="object-cover w-full h-full mx-auto my-auto"
                style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=400&fit=crop&crop=center';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-black/30 text-white text-sm font-medium backdrop-blur-sm rounded-b-2xl flex items-center gap-2 pointer-events-none">
                Imagen del servicio
              </div>
            </div>
          </div>
          {/* Service Info */}
          <div className="lg:w-1/2 w-full flex flex-col">
            <div className="bg-white rounded-xl shadow-sm p-8 flex-1 flex flex-col h-[420px] lg:h-[500px]">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {serviceData.title}
                  </h1>
                  {/* Ubicaciones en filas separadas con icono */}
                  <div className="space-y-2">
                    {serviceData.zones && serviceData.zones.length > 0 ? (
                      serviceData.zones.map((zone: any, idx: number) => (
                        <div key={idx} className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-gray-700" />
                          <span>
                            {zone.neighborhood} ({zone.locality}, {zone.province})
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-700" />
                        <span>Zona no especificada</span>
                      </div>
                    )}
                  </div>

                  {/* Precio + CTA debajo de ubicaciones */}
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="text-2xl font-bold text-gray-900">
                      ${serviceData.price.toLocaleString('es-AR')}
                    </div>
                    {/* Si el usuario es el dueño, mostrar Editar Servicio y aclaración */}
                    {/* debug logs removed */}
                    {isAuthenticated && isUserService ? (
                      <>
                        <button
                          onClick={() => navigate(`/edit-service/${serviceData?.id}`)}
                          className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Editar Servicio
                        </button>
                        <div className="mt-2 text-xs text-gray-500 italic">
                          Estás viendo la vista pública de tu servicio, tal como la ven otros usuarios.
                        </div>
                      </>
                    ) : isAuthenticated ? (
                      <button
                        onClick={() => setShowBookingModal(true)}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Solicitar Servicio
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/login')}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Iniciar Sesión para Solicitar
                      </button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => isFavorite 
                    ? removeFromFavorites(serviceData.id.toString()) 
                    : addToFavorites(serviceData.id.toString())
                  }
                  className={`ml-4 p-2 rounded-full transition-colors ${
                    isFavorite 
                      ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                      : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
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
                    <div className="grid md:grid-cols-1 gap-6">
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
                    </div>
                  </div>
                )}

                {activeTab === 'availability' && (
                  <div className="space-y-6">
                    <h4 className="font-medium text-gray-900">Horarios disponibles</h4>
                    <div className="space-y-3">
                      {formatAvailability(serviceData.availability).map((daySchedule, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">
                            {daySchedule.split(':')[0]}
                          </span>
                          <span className="text-sm text-gray-600">
                            {daySchedule.includes('No disponible') ? 'Cerrado' : daySchedule.split(': ')[1]}
                          </span>
                        </div>
                      ))}
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
