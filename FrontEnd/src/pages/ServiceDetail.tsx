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
import Calendar from '../components/Calendar';
// Image is required on services; use service-provided URL directly

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    isAuthenticated, 
    getServiceById,
    addToFavorites,
    removeFromFavorites,
  favorites, 
    createAppointment,
    user,
    getUserServices,
    getServiceCalendar,
    getServiceAvailability
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1: date selection, 2: time selection
  const [serviceCalendar, setServiceCalendar] = useState<any | null>(null);
  const [dateSlots, setDateSlots] = useState<Array<{time:string;available:boolean}> | null>(null);
  const [dateError, setDateError] = useState<string>('');
  const [serviceData, setServiceData] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
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
  }, [id, isAuthenticated, user?.id]); // Simplificar dependencias para evitar re-renders innecesarios

  // Cuando cambia la fecha seleccionada, pedir disponibilidad por fecha
  useEffect(() => {
    const fetchDateSlots = async () => {
      // Solo fetch para fechas completas válidas
      const isCompleteDate = /^\d{4}-\d{2}-\d{2}$/.test(selectedDate);
      if (!selectedDate || !isCompleteDate) {
        setDateSlots(null);
        return;
      }

      logger.debug('Fetching availability for date:', selectedDate, 'service:', serviceData?.id);
      
      try {
        const resp = await getServiceAvailability(serviceData!.id.toString(), selectedDate);
        logger.debug('API response for availability:', resp);
        
        if (resp.success && resp.data && Array.isArray(resp.data.time_slots)) {
          logger.info('Using server time slots:', resp.data.time_slots);
          setDateSlots(resp.data.time_slots.map((ts: any) => ({ time: ts.time, available: !!ts.available })));
        } else {
          logger.warn('API returned empty or invalid time slots, setting empty array');
          setDateSlots([]);
        }
      } catch (error) {
        logger.error('Error obteniendo time slots por fecha:', error);
        logger.warn('Falling back to empty slots due to API error');
        setDateSlots([]);
      }
    };

    fetchDateSlots();
  }, [selectedDate, getServiceAvailability, serviceData]);

  // Manejar cambios en el input de fecha y validar rango (hoy .. bookingMaxDate)
  const handleDateChange = (value: string) => {
    setDateError(''); // Limpiar error previo
    setSelectedDate(value);
    setSelectedTime(''); // Reset time selector when date changes
    // dateSlots se cargará automáticamente por el useEffect que observa selectedDate
  };

  // Cargar horarios cuando se selecciona una fecha válida
  useEffect(() => {
    const loadDateSlots = async () => {
      if (selectedDate && isDateAvailable(selectedDate) && bookingStep === 2 && serviceData) {
        setDateSlots(null); // Mostrar loading
        try {
          const result = await getServiceAvailability(serviceData.id.toString(), selectedDate);
          if (result.success) {
            // Ensure result.data is an array before setting it
            if (Array.isArray(result.data)) {
              setDateSlots(result.data);
            } else if (result.data && Array.isArray(result.data.time_slots)) {
              // Handle case where data is wrapped in an object
              setDateSlots(result.data.time_slots);
            } else {
              // Fallback: create empty array if data structure is unexpected
              setDateSlots([]);
            }
          } else {
            setRequestError(result.error || 'No se pudieron cargar los horarios');
            setDateSlots([]);
          }
        } catch (error) {
          setRequestError('Error al obtener los horarios disponibles');
          setDateSlots([]);
        }
      } else if (bookingStep === 1) {
        // Reset time slots when going back to step 1
        setDateSlots(null);
      }
    };

    loadDateSlots();
  }, [selectedDate, bookingStep, serviceData?.id, getServiceAvailability]);

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

  const isFavorite = serviceData ? favorites.includes(serviceData.id.toString()) : false;

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
    if (!serviceData) {
      setRequestError('Error: datos del servicio no disponibles');
      return;
    }
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!selectedDate || !selectedTime) {
      alert('Por favor selecciona fecha y hora');
      return;
    }

    try {
      // Obtener calendario desde el servidor antes de enviar la solicitud
      const calResp = await getServiceCalendar(serviceData.id.toString());
      if (!calResp.success) {
        alert(calResp.error || 'No se pudo obtener el calendario del servicio');
        return;
      }

      setServiceCalendar(calResp.data);

      // Validar ventana de 30 días
      if (selectedDate < todayStr || selectedDate > bookingMaxDate) {
        alert(`Solo se permiten reservas dentro de los próximos 30 días.`);
        return;
      }

      // Si el calendario indica que no hay disponibilidad, avisar al usuario
      if (calResp.data && Array.isArray(calResp.data.days)) {
        const dayInfo = calResp.data.days.find((d: any) => d.date === selectedDate);
        if (dayInfo && !dayInfo.has_availability) {
          alert('El servicio no tiene disponibilidad en la fecha seleccionada');
          return;
        }
      }

      // Use backend endpoint to create appointment
      // The API expects the date in plain YYYY-MM-DD format (no time).
      const appointmentPayload = {
        service_id: Number(serviceData.id),
        date: (/^\d{4}-\d{2}-\d{2}$/.test(selectedDate) ? selectedDate : selectedDate),
        time_slot: selectedTime,
        notes: requestMessage || undefined
      };

      const result = await createAppointment(appointmentPayload as any);
      if (!result.success) {
        setRequestError(result.error || 'Error al crear el turno');
      } else {
        setShowBookingModal(false);
        setRequestMessage('');
      }
    } catch (error) {
      logger.error('Error inesperado al enviar la solicitud:', error);
      setRequestError('Error inesperado al enviar la solicitud');
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

    // Procesar cada entrada de availability
    Object.entries(availability).forEach(([key, val]) => {
      if (!val) return;
      
      const day = String(key).toLowerCase();
      if (!normalized[day]) return;

      // Formato del backend: { "friday": ["09:00-17:00", "18:00-20:00"] }
      if (Array.isArray(val)) {
        const slots: Array<{start:string;end:string}> = [];
        val.forEach((timeRange: string) => {
          if (typeof timeRange === 'string' && timeRange.includes('-')) {
            const [start, end] = timeRange.split('-');
            if (start && end) {
              slots.push({ start: start.trim(), end: end.trim() });
            }
          }
        });
        
        if (slots.length > 0) {
          normalized[day].timeSlots = slots;
          normalized[day].available = true;
        }
      }
      // Formato anterior con objeto
      else if (typeof val === 'object') {
        const entry: any = val;
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
        } else if (entry.available === false) {
          normalized[day].available = false;
          normalized[day].timeSlots = [];
        } else if (entry.available === true) {
          normalized[day].available = true;
        }
      }
    });

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

  // Parse a YYYY-MM-DD string into a local Date object (avoids UTC parsing)
  const parseLocalDate = (dateStr: string) => {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return new Date(dateStr);
    const [y, m, d] = dateStr.split('-').map((v) => parseInt(v, 10));
    return new Date(y, m - 1, d);
  };

  // Fecha mínima (hoy) y máxima (próximos 30 días) para reservas
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultMaxDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  })();
  const bookingMaxDate = serviceCalendar?.end_date || defaultMaxDate;

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
                 onError={() => { /* image is required on backend */ }}
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
                        onClick={async () => {
                          if (!serviceData) return;
                          
                          // Intentar obtener calendario antes de abrir el modal
                          const cal = await getServiceCalendar(serviceData.id.toString());
                          if (!cal.success) {
                            setRequestError(cal.error || 'No se pudo obtener el calendario del servicio');
                            return;
                          }
                          setServiceCalendar(cal.data);
                          setBookingStep(1); // Reset to step 1
                          setSelectedDate(''); // Reset selections
                          setSelectedTime('');
                          setRequestError(null);
                          setShowBookingModal(true);
                        }}
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
                  onClick={() => {
                    if (!serviceData) return;
                    
                    isFavorite 
                    ? removeFromFavorites(serviceData.id.toString()) 
                    : addToFavorites(serviceData.id.toString())
                  }}
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
              <div>
                <h3 className="text-xl font-semibold">Solicitar Servicio</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Paso {bookingStep} de 2: {bookingStep === 1 ? 'Seleccionar fecha' : 'Seleccionar horario'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setBookingStep(1);
                  setSelectedDate('');
                  setSelectedTime('');
                  setRequestError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {bookingStep === 1 ? (
              // Step 1: Date Selection
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha preferida
                  </label>
                  {serviceCalendar && (
                    <p className="text-sm text-gray-600 mb-2">
                      Calendario: {serviceCalendar.start_date} → {serviceCalendar.end_date} · Disponibles: {Array.isArray(serviceCalendar.days) ? serviceCalendar.days.filter((d:any)=>d.has_availability).length : 0} días
                    </p>
                  )}
                  
                  <Calendar
                    selectedDate={selectedDate}
                    onDateSelect={handleDateChange}
                    apiDays={serviceCalendar?.days || null}
                    minDate={todayStr}
                    maxDate={bookingMaxDate}
                    serviceAvailability={serviceData?.availability}
                  />
                  
                  {dateError && (
                    <p className="text-sm text-red-600 mt-1">{dateError}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Nota: solo se pueden reservar fechas dentro de los próximos 30 días.</p>
                </div>

                {requestError && (
                  <div className="text-sm text-red-600">{requestError}</div>
                )}
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowBookingModal(false);
                      setBookingStep(1);
                      setSelectedDate('');
                      setSelectedTime('');
                      setRequestError(null);
                    }}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      if (selectedDate) {
                        setBookingStep(2);
                        setRequestError(null);
                        // Los horarios se cargarán automáticamente por el useEffect
                      } else {
                        setRequestError('Por favor selecciona una fecha');
                      }
                    }}
                    disabled={!selectedDate}
                    className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            ) : (
              // Step 2: Time Selection
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Horarios disponibles
                      </label>
                      <p className="text-sm text-gray-500 mt-1">
                        {parseLocalDate(selectedDate).toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {dateSlots === null ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                      <p className="text-sm text-gray-500">Cargando horarios...</p>
                    </div>
                  ) : !Array.isArray(dateSlots) || dateSlots.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-2">No hay horarios disponibles para esta fecha</p>
                      <p className="text-sm text-gray-400">Intenta con otra fecha</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {dateSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            selectedTime === slot.time
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : slot.available
                                ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-medium">{slot.time}</div>
                            {!slot.available && (
                              <div className="text-xs mt-1">No disponible</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
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

                {requestError && (
                  <div className="text-sm text-red-600">{requestError}</div>
                )}
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setBookingStep(1);
                      setSelectedTime('');
                      setRequestError(null);
                    }}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Atrás
                  </button>
                  <button
                    onClick={handleRequestService}
                    disabled={!selectedDate || !selectedTime || (dateSlots !== null && (!Array.isArray(dateSlots) || dateSlots.length === 0))}
                    className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Enviar Solicitud
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetail;
