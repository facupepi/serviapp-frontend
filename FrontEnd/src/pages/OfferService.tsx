import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Plus, 
  X,
  Save,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
// Image is required on services; do not inject default image here
import { getProvinces, getLocalitiesObject } from '../data/argentina';

interface AvailabilityDay {
  enabled: boolean;
  timeSlots: { start: string; end: string }[];
}

interface FormData {
  title: string;
  category: string;
  description: string;
  price: number;
  image: string;
  durationMinutes: number;
  bookingWindowDays: number;
  zones: { province: string; locality: string; neighborhood?: string }[];
  availability: {
    monday: AvailabilityDay;
    tuesday: AvailabilityDay;
    wednesday: AvailabilityDay;
    thursday: AvailabilityDay;
    friday: AvailabilityDay;
    saturday: AvailabilityDay;
    sunday: AvailabilityDay;
  };
}

export default function OfferService() {
  const navigate = useNavigate();
  const { isAuthenticated, user, createService, categories } = useAuth();
  const { addNotification } = useNotifications();

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  // No renderizar nada si no está autenticado (mientras redirige)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Todos los usuarios pueden ofrecer servicios ahora
  // Ya no necesitamos verificar isProvider

  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '',
    description: '',
    price: 0,
    image: '',
    durationMinutes: 60,
    bookingWindowDays: 30,
    zones: [],
    availability: {
      monday: { enabled: false, timeSlots: [] },
      tuesday: { enabled: false, timeSlots: [] },
      wednesday: { enabled: false, timeSlots: [] },
      thursday: { enabled: false, timeSlots: [] },
      friday: { enabled: false, timeSlots: [] },
      saturday: { enabled: false, timeSlots: [] },
      sunday: { enabled: false, timeSlots: [] }
    }
  });

  const [currentZone, setCurrentZone] = useState({
    province: '',
    locality: '',
    neighborhood: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const provinces = getProvinces();
  const localities = getLocalitiesObject();

  const timeOptions = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const dayLabels = {
    monday: 'Lunes',
    tuesday: 'Martes', 
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addZone = () => {
    if (!currentZone.province || !currentZone.locality) {
      setErrors(prev => ({
        ...prev,
        zone: 'Selecciona provincia y localidad'
      }));
      return;
    }

    const newZone = {
      province: currentZone.province,
      locality: currentZone.locality,
      ...(currentZone.neighborhood && { neighborhood: currentZone.neighborhood })
    };

    setFormData(prev => ({
      ...prev,
      zones: [...prev.zones, newZone]
    }));

    setCurrentZone({ province: '', locality: '', neighborhood: '' });
    setErrors(prev => ({ ...prev, zone: '' }));
  };

  const removeZone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      zones: prev.zones.filter((_, i) => i !== index)
    }));
  };

  const toggleDayAvailability = (day: keyof FormData['availability']) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          enabled: !prev.availability[day].enabled,
          timeSlots: !prev.availability[day].enabled ? [] : prev.availability[day].timeSlots
        }
      }
    }));
  };

  const addTimeSlot = (day: keyof FormData['availability']) => {
    const newSlot = { start: '09:00', end: '17:00' };
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          timeSlots: [...prev.availability[day].timeSlots, newSlot]
        }
      }
    }));
  };

  const removeTimeSlot = (day: keyof FormData['availability'], index: number) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          timeSlots: prev.availability[day].timeSlots.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const updateTimeSlot = (
    day: keyof FormData['availability'], 
    index: number, 
    field: 'start' | 'end', 
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          timeSlots: prev.availability[day].timeSlots.map((slot, i) => 
            i === index ? { ...slot, [field]: value } : slot
          )
        }
      }
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'El título es requerido';
      if (!formData.category) newErrors.category = 'Selecciona una categoría';
      if (!formData.price || formData.price <= 0) newErrors.price = 'El precio debe ser mayor a 0';
  if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
  if (formData.description.length < 100) newErrors.description = 'La descripción debe tener al menos 100 caracteres';
    }

    if (step === 2) {
      if (formData.zones.length === 0) newErrors.zones = 'Agrega al menos una zona de cobertura';
    }

    if (step === 3) {
      const hasAvailability = Object.values(formData.availability).some(day => day.enabled);
      if (!hasAvailability) newErrors.availability = 'Selecciona al menos un día disponible';
      // Validar duración y ventana de reservas en el paso 3 (moved here)
      if (!formData.durationMinutes || formData.durationMinutes <= 0) newErrors.durationMinutes = 'La duración debe ser mayor a 0 minutos';
      if (!formData.bookingWindowDays || formData.bookingWindowDays <= 0) newErrors.bookingWindowDays = 'Debes indicar el tiempo permitido para ofrecer turnos';
      
      // Validar que cada día habilitado tenga horarios
      Object.entries(formData.availability).forEach(([day, config]) => {
        if (config.enabled && config.timeSlots.length === 0) {
          newErrors[`${day}_slots`] = `Agrega horarios para ${dayLabels[day as keyof typeof dayLabels]}`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      // Convertir availability al formato esperado por el backend: { day: ['HH:MM-HH:MM', ...], ... }
      const availabilityObj: Record<string, string[]> = {};
      Object.entries(formData.availability).forEach(([day, config]: any) => {
        if (config.enabled && Array.isArray(config.timeSlots) && config.timeSlots.length) {
          availabilityObj[day] = config.timeSlots.map((ts: any) => `${ts.start}-${ts.end}`);
        }
      });

      const serviceData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price) || 0,
        duration_minutes: Number(formData.durationMinutes) || 60,
        booking_window_days: Number(formData.bookingWindowDays) || 30,
        zones: formData.zones,
        availability: availabilityObj,
  image_url: formData.image
      };

      const result = await createService(serviceData as any);
      
      if (result.success) {
        addNotification({
          type: 'success',
          message: '¡Servicio creado exitosamente!'
        });
        navigate('/my-services');
      } else {
        addNotification({
          type: 'error',
          message: result.error || 'Error al crear el servicio'
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Error inesperado al crear el servicio'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título del servicio *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ej: Plomería profesional para el hogar"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categoría *
        </label>
        <select
          value={formData.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Selecciona una categoría</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Precio por servicio *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            min="0"
            step="100"
            value={formData.price}
            onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
            className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0"
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Precio estimado por servicio completo
        </p>
        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
      </div>

      {/* duration and booking window moved to Step 3 */}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción del servicio *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe detalladamente qué servicios ofreces, tu experiencia y qué hace único tu trabajo..."
        />
        <p className="text-sm text-gray-500 mt-1">
          {formData.description.length}/500 caracteres (mínimo 100)
        </p>
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL de imagen (opcional)
        </label>
        <input
          type="url"
          value={formData.image}
          onChange={(e) => handleInputChange('image', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://ejemplo.com/imagen.jpg"
        />
        <p className="text-sm text-gray-500 mt-1">
          Agrega una imagen representativa de tu servicio
        </p>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Zonas de cobertura
        </h3>
        <p className="text-blue-700">
          Define las áreas donde brindas tu servicio. Los clientes podrán encontrarte cuando busquen en estas zonas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provincia
          </label>
          <select
            value={currentZone.province}
            onChange={(e) => setCurrentZone(prev => ({ 
              ...prev, 
              province: e.target.value, 
              locality: '',
              neighborhood: ''
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecciona provincia</option>
            {provinces.map(prov => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Localidad
          </label>
          <select
            value={currentZone.locality}
            onChange={(e) => setCurrentZone(prev => ({ ...prev, locality: e.target.value, neighborhood: '' }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!currentZone.province}
          >
            <option value="">Selecciona localidad</option>
            {currentZone.province && localities[currentZone.province]?.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Barrio (opcional)
          </label>
          <input
            type="text"
            value={currentZone.neighborhood}
            onChange={(e) => setCurrentZone(prev => ({ ...prev, neighborhood: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: Palermo"
          />
        </div>
      </div>

      <button
        onClick={addZone}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="h-5 w-5 mr-2" />
        Agregar zona
      </button>

      {errors.zone && <p className="text-red-500 text-sm">{errors.zone}</p>}

      {/* Lista de zonas agregadas */}
      {formData.zones.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Zonas agregadas:</h4>
          <div className="space-y-2">
            {formData.zones.map((zone, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-600 mr-2" />
                  <span>
                    {zone.province}, {zone.locality}
                    {zone.neighborhood && ` - ${zone.neighborhood}`}
                  </span>
                </div>
                <button
                  onClick={() => removeZone(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {errors.zones && <p className="text-red-500 text-sm">{errors.zones}</p>}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          Disponibilidad horaria
        </h3>
        <p className="text-green-700">
          Define tus horarios de trabajo para cada día de la semana. Los clientes podrán solicitar servicios en estos horarios.
        </p>
      </div>

      <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duración estimada (minutos)</label>
              <select
                value={formData.durationMinutes}
                onChange={(e) => handleInputChange('durationMinutes', parseInt(e.target.value || '0', 10) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.durationMinutes ? 'border-red-500' : 'border-gray-300'}`}
              >
                {[30, 60, 120, 150, 180].map(v => (
                  <option key={v} value={v}>{v} minutos</option>
                ))}
              </select>
              {errors.durationMinutes && <p className="text-red-500 text-sm mt-1">{errors.durationMinutes}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiempo permitido para ofrecer turnos (días)</label>
              <select
                value={formData.bookingWindowDays}
                onChange={(e) => handleInputChange('bookingWindowDays', parseInt(e.target.value || '0', 10) || 0)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                {[30, 60, 90, 120].map(v => (
                  <option key={v} value={v}>{v} días</option>
                ))}
              </select>
            </div>
          </div>

        {Object.entries(formData.availability).map(([day, config]) => (
          <div key={day} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={() => toggleDayAvailability(day as keyof FormData['availability'])}
                  className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-lg font-medium">
                  {dayLabels[day as keyof typeof dayLabels]}
                </span>
              </label>
              {config.enabled && (
                <button
                  onClick={() => addTimeSlot(day as keyof FormData['availability'])}
                  className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar horario
                </button>
              )}
            </div>

            {config.enabled && (
              <div className="space-y-2">
                {config.timeSlots.map((slot, index) => (
                  <div key={index} className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-gray-50 p-3 rounded">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
                      <Clock className="h-5 w-5 text-gray-600" />
                      <select
                        value={slot.start}
                        onChange={(e) => updateTimeSlot(day as keyof FormData['availability'], index, 'start', e.target.value)}
                        className="w-full md:w-28 px-2 py-1 border border-gray-300 rounded"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <span className="text-gray-500 md:mx-2">hasta</span>
                      <select
                        value={slot.end}
                        onChange={(e) => updateTimeSlot(day as keyof FormData['availability'], index, 'end', e.target.value)}
                        className="w-full md:w-28 px-2 py-1 border border-gray-300 rounded"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => removeTimeSlot(day as keyof FormData['availability'], index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
                {config.timeSlots.length === 0 && (
                  <p className="text-gray-500 text-sm">
                    Agrega al menos un horario para este día
                  </p>
                )}
              </div>
            )}
            
            {errors[`${day}_slots`] && (
              <p className="text-red-500 text-sm mt-2">{errors[`${day}_slots`]}</p>
            )}
          </div>
        ))}
      </div>

      {errors.availability && <p className="text-red-500 text-sm">{errors.availability}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver al dashboard
          </button>
          
          <div className="flex items-center">
            <Save className="h-8 w-8 text-blue-600 mr-4" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Crear nuevo servicio
              </h1>
              <p className="text-gray-600">
                Publica tu servicio para que los clientes puedan encontrarte
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step
                    ? 'bg-blue-600 border-blue-600 text-white'  
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div className={`w-24 h-1 mx-4 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Datos básicos</span>
            <span>Zonas de cobertura</span>
            <span>Disponibilidad</span>
          </div>
        </div>

        {/* Form content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 1}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {loading ? 'Creando...' : 'Crear servicio'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}