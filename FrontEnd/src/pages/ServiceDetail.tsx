import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Shield, 
  Calendar,
  Clock,
  User,
  Heart,
  ArrowLeft,
  Phone,
  Mail,
  Award,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    isAuthenticated, 
    user, 
    services, 
    addToFavorites,
    removeFromFavorites,
    favorites, 
    requestService
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [requestMessage, setRequestMessage] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);

  // Buscar el servicio por ID
  const serviceData = services.find(s => s.id.toString() === id);
  
  if (!serviceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Servicio no encontrado</h2>
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

  const isFavorite = favorites.includes(serviceData.id);
  
  // Mock reviews data for now since reviews are not implemented in AuthContext yet
  const mockReviews = [
    {
      id: '1',
      clientName: 'Pedro López',
      rating: 5,
      comment: 'Excelente servicio, muy profesional y puntual. Lo recomiendo ampliamente.',
      date: '2024-01-10'
    },
    {
      id: '2', 
      clientName: 'Laura Silva',
      rating: 4,
      comment: 'Buen trabajo, aunque llegó un poco tarde. El resultado final fue muy bueno.',
      date: '2024-01-05'
    }
  ];
  
  const serviceReviews = mockReviews;

  // Generar calendario
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días vacíos del mes anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Mock availability - some random available dates
      const isAvailable = Math.random() > 0.5;
      const isPast = date.getTime() < new Date().setHours(0, 0, 0, 0);
      
      days.push({
        day,
        date: dateString,
        isAvailable: isAvailable && !isPast,
        isPast
      });
    }

    return days;
  };

  const calendarDays = generateCalendar();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handleDateSelect = (dateString: string) => {
    setSelectedDate(dateString);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBookingRequest = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!selectedDate || !selectedTime) {
      alert('Por favor selecciona fecha y hora');
      return;
    }

    try {
      const result = await requestService(serviceData.id, selectedDate, selectedTime);
      
      if (result.success) {
        setShowBookingModal(false);
        setBookingStep(1);
        setSelectedDate('');
        setSelectedTime('');
        setRequestMessage('');
        alert('¡Solicitud enviada exitosamente! El proveedor recibirá tu solicitud y te contactará pronto.');
      } else {
        alert(result.error || 'Error al enviar la solicitud');
      }
    } catch (error) {
      alert('Error al enviar la solicitud');
    }
  };

  // Mock available times for the selected date
  const availableTimes = selectedDate ? ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] : [];

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const BookingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Solicitar Servicio: {serviceData.title}
            </h3>
            <button
              onClick={() => setShowBookingModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* Paso 1: Selección de fecha */}
          {bookingStep === 1 && (
            <div>
              <h4 className="text-lg font-semibold mb-4">Paso 1: Selecciona una fecha</h4>
              
              {/* Navegación del calendario */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h5 className="text-lg font-semibold">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h5>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Calendario */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, index) => (
                  <div key={index} className="aspect-square">
                    {day && (
                      <button
                        onClick={() => day.isAvailable && handleDateSelect(day.date)}
                        disabled={!day.isAvailable}
                        className={`w-full h-full rounded text-sm ${
                          selectedDate === day.date
                            ? 'bg-blue-600 text-white'
                            : day.isAvailable
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : day.isPast
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {day.day}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setBookingStep(2)}
                  disabled={!selectedDate}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Paso 2: Selección de hora */}
          {bookingStep === 2 && (
            <div>
              <h4 className="text-lg font-semibold mb-4">
                Paso 2: Selecciona una hora - {selectedDate}
              </h4>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                {availableTimes.map((time: string) => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className={`p-3 rounded-lg border text-center ${
                      selectedTime === time
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setBookingStep(1)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setBookingStep(3)}
                  disabled={!selectedTime}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Paso 3: Mensaje y confirmación */}
          {bookingStep === 3 && (
            <div>
              <h4 className="text-lg font-semibold mb-4">Paso 3: Confirma tu solicitud</h4>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h5 className="font-semibold mb-2">Resumen de la solicitud:</h5>
                <p><strong>Servicio:</strong> {serviceData.title}</p>
                <p><strong>Proveedor:</strong> {serviceData.providerName}</p>
                <p><strong>Fecha:</strong> {selectedDate}</p>
                <p><strong>Hora:</strong> {selectedTime}</p>
                <p><strong>Ubicación:</strong> {serviceData.zones[0]?.locality || 'No especificada'}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje adicional (opcional)
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe detalles específicos sobre el servicio que necesitas..."
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setBookingStep(2)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Anterior
                </button>
                <button
                  onClick={handleBookingRequest}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Confirmar Solicitud
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2">
            {/* Imagen y título */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <img
                src={serviceData.image}
                alt={serviceData.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {serviceData.title}
                    </h1>
                    <div className="flex items-center text-gray-600 mb-2">
                      <User className="h-5 w-5 mr-2" />
                      <span className="font-medium">{serviceData.providerName}</span>
                      <Shield className="h-5 w-5 text-blue-600 ml-2" />
                      <Award className="h-5 w-5 text-yellow-500 ml-2" />
                    </div>
                    <div className="flex items-center mb-2">
                      {renderStars(serviceData.rating)}
                      <span className="ml-2 text-gray-600">
                        {serviceData.rating} ({serviceData.reviewCount} reseñas)
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{serviceData.zones[0]?.locality || 'Ubicación no especificada'}, {serviceData.zones[0]?.province || ''}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => isFavorite ? removeFromFavorites(serviceData.id) : addToFavorites(serviceData.id)}
                    className={`p-2 rounded-full ${
                      isFavorite
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Descripción' },
                    { id: 'reviews', label: 'Reseñas' },
                    { id: 'contact', label: 'Contacto' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Descripción del servicio</h3>
                    <p className="text-gray-700 mb-6">{serviceData.description}</p>
                    
                    <h4 className="text-md font-semibold mb-3">Categoría:</h4>
                    <p className="mb-6">{serviceData.category}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {serviceData.rating}/5
                        </div>
                        <div className="text-sm text-gray-600">calificación promedio</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {serviceData.reviewCount}
                        </div>
                        <div className="text-sm text-gray-600">reseñas recibidas</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Reseñas ({serviceReviews.length})
                    </h3>
                    {serviceReviews.length > 0 ? (
                      <div className="space-y-4">
                        {serviceReviews.map((review) => (
                          <div key={review.id} className="border-b border-gray-200 pb-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <div className="bg-gray-300 rounded-full h-10 w-10 flex items-center justify-center">
                                  <User className="h-6 w-6 text-gray-600" />
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium">{review.clientName}</p>
                                  <div className="flex items-center">
                                    {renderStars(review.rating, 'sm')}
                                    <span className="ml-2 text-sm text-gray-600">
                                      {review.date}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        Este servicio aún no tiene reseñas.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Información de contacto</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-600 mr-3" />
                        <span>Contacto disponible después de solicitar el servicio</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-600 mr-3" />
                        <span>Email disponible después de solicitar el servicio</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-600 mr-3" />
                        <span>{serviceData.zones[0]?.locality || 'Ubicación no especificada'}, {serviceData.zones[0]?.province || ''}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar de reserva */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {serviceData.price ? `$${serviceData.price}` : 'Consultar precio'}
                </div>
                <p className="text-gray-600">por servicio</p>
              </div>

              {isAuthenticated ? (
                user?.id === serviceData.providerId ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600">Este es tu servicio</p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Solicitar Servicio
                  </button>
                )
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Iniciar sesión para solicitar
                </button>
              )}

              <div className="mt-6 space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Respuesta rápida garantizada</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  <span>Proveedor verificado</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span>Comunicación directa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de reserva */}
      {showBookingModal && <BookingModal />}
    </div>
  );
}