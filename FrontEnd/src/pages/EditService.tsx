import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Clock, 
  Plus, 
  X,
  Save,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import logger from '../utils/logger';
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
  durationMinutes?: number;
  bookingWindowDays?: number;
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

export default function EditService() {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const { isAuthenticated, user, updateService, getServiceById, categories } = useAuth();
  const { addNotification } = useNotifications();

  // Datos de provincias y localidades
  const provinces = getProvinces();
  const localitiesData = getLocalitiesObject();
  const [serviceData, setServiceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize all state hooks at the top level
  const [formData, setFormData] = useState<FormData>(() => ({
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
      sunday: { enabled: false, timeSlots: [] },
    }
  }));
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Convertir datos del servicio al formato del formulario
  const initializeFormData = useCallback((): FormData => {
    if (!serviceData) {
      return {
        title: '',
        category: '',
        description: '',
        price: 0,
        image: '',
        zones: [],
        availability: {
          monday: { enabled: false, timeSlots: [] },
          tuesday: { enabled: false, timeSlots: [] },
          wednesday: { enabled: false, timeSlots: [] },
          thursday: { enabled: false, timeSlots: [] },
          friday: { enabled: false, timeSlots: [] },
          saturday: { enabled: false, timeSlots: [] },
          sunday: { enabled: false, timeSlots: [] },
        }
      };
    }

    // Soportar claves numéricas y de día
    const dayMap: Record<string, keyof FormData['availability']> = {
      '0': 'monday',
      '1': 'tuesday',
      '2': 'wednesday',
      '3': 'thursday',
      '4': 'friday',
      '5': 'saturday',
      '6': 'sunday',
      monday: 'monday',
      tuesday: 'tuesday',
      wednesday: 'wednesday',
      thursday: 'thursday',
      friday: 'friday',
      saturday: 'saturday',
      sunday: 'sunday',
    };
    const availabilityMap: FormData['availability'] = {
      monday: { enabled: false, timeSlots: [] },
      tuesday: { enabled: false, timeSlots: [] },
      wednesday: { enabled: false, timeSlots: [] },
      thursday: { enabled: false, timeSlots: [] },
      friday: { enabled: false, timeSlots: [] },
      saturday: { enabled: false, timeSlots: [] },
      sunday: { enabled: false, timeSlots: [] },
    };
    if (serviceData.availability) {
      Object.entries(serviceData.availability).forEach(([key, schedule]: [string, any]) => {
        // Si la clave es numérica y el objeto tiene 'day', usar ese valor
        let dayKey: keyof FormData['availability'] | undefined = undefined;
        if (!isNaN(Number(key)) && schedule && typeof schedule.day === 'string') {
          dayKey = schedule.day.toLowerCase() as keyof FormData['availability'];
        } else {
          dayKey = dayMap[key];
        }
        if (!dayKey) return;
        
        // Manejar el formato del backend: { "friday": ["09:00-17:00"] }
        if (Array.isArray(schedule)) {
          const timeSlots = schedule.map((timeRange: string) => {
            const [start, end] = timeRange.split('-');
            return { start: start.trim(), end: end.trim() };
          }).filter(slot => slot.start && slot.end);
          
          if (timeSlots.length > 0) {
            availabilityMap[dayKey] = {
              enabled: true,
              timeSlots
            };
          }
        }
        // Formato anterior con timeSlots object
        else if (Array.isArray(schedule.timeSlots) && schedule.timeSlots.length > 0) {
          availabilityMap[dayKey] = {
            enabled: true,
            timeSlots: schedule.timeSlots.map((slot: any) => ({ start: slot.start, end: slot.end }))
          };
        } else if (schedule && schedule.start && schedule.end) {
          availabilityMap[dayKey] = {
            enabled: true,
            timeSlots: [{ start: schedule.start, end: schedule.end }]
          };
        } else if (schedule && schedule.available === false) {
          // Solo poner available: false si no hay timeSlots ya definidos
          if (!availabilityMap[dayKey].enabled || availabilityMap[dayKey].timeSlots.length === 0) {
            availabilityMap[dayKey] = {
              enabled: false,
              timeSlots: []
            };
          }
        }
      });
    }
    const initialData = {
      title: serviceData.title || '',
      category: serviceData.category || '',
      description: serviceData.description || '',
      price: Number(serviceData.price) || 0,
      image: serviceData.image_url || '',
      durationMinutes: Number(serviceData.duration_minutes) || 60,
      bookingWindowDays: Number(serviceData.booking_window_days) || 30,
      zones: serviceData.zones || [],
      availability: availabilityMap
    };
    return initialData;
  }, [serviceData]);

  // Transformar datos del formulario al formato que espera el backend
  const transformDataForAPI = (data: FormData) => {
    const transformed: any = {
      title: data.title,
      category: data.category,
      description: data.description,
      price: Number(data.price),
      duration_minutes: Number(data.durationMinutes) || 60,
      booking_window_days: Number(data.bookingWindowDays) || 30,
      image: data.image,
      zones: data.zones,
      availability: {}
    };
    // Enviar availability en formato del backend: { day: ["HH:MM-HH:MM"] }
    (Object.keys(data.availability) as Array<keyof typeof data.availability>).forEach((day) => {
      const dayData = data.availability[day];
      if (dayData.enabled && dayData.timeSlots.length > 0) {
        // Convertir timeSlots a formato string "HH:MM-HH:MM"
        transformed.availability[day] = dayData.timeSlots.map(slot => `${slot.start}-${slot.end}`);
      }
      // Si el día no está habilitado, no incluirlo en el objeto availability
    });
    return transformed;
  };
  
  // Redirigir si no está autenticado
  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Cargar el servicio a editar
  useEffect(() => {
    if (!isAuthenticated || !user || !serviceId) {
      return;
    }

    const loadService = async () => {
      setLoading(true);
      try {
        const result = await getServiceById(serviceId);
        if (result.success && result.data) {
          setServiceData(result.data);
        } else {
          addNotification({
            type: 'error',
            message: result.error || 'Error al cargar el servicio'
          });
          navigate('/my-services');
        }
      } catch (error) {
        addNotification({
          type: 'error',
          message: 'Error al cargar el servicio'
        });
        navigate('/my-services');
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [getServiceById, serviceId, addNotification, navigate, isAuthenticated, user]);

  // Actualizar formData cuando serviceData se cargue
  useEffect(() => {
    if (serviceData) {
      setFormData(initializeFormData());
    }
  }, [serviceData, initializeFormData]);

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

  // Mostrar loading mientras se carga el servicio
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando servicio...</p>
        </div>
      </div>
    );
  }

  // Verificar si el servicio existe
  if (!serviceData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Servicio no encontrado</h2>
          <p className="text-gray-600 mb-4">El servicio que intentas editar no existe o no tienes permisos para modificarlo.</p>
          <button
            onClick={() => navigate('/my-services')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Mis Servicios
          </button>
        </div>
      </div>
    );
  }

  // Validaciones
  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    } else if (formData.title.length < 5) {
      newErrors.title = 'El título debe tener al menos 5 caracteres';
    }

    if (!formData.category) {
      newErrors.category = 'La categoría es obligatoria';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    } else if (formData.description.length < 100) {
      newErrors.description = 'La descripción debe tener al menos 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};

    if (formData.zones.length === 0) {
      newErrors.zones = 'Debes agregar al menos una zona de cobertura';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: { [key: string]: string } = {};

    const hasAvailability = Object.values(formData.availability).some(day => 
      day.enabled && day.timeSlots.length > 0
    );

    if (!hasAvailability) {
      newErrors.availability = 'Debes configurar al menos un día y horario de disponibilidad';
    }

    // Validar duración y ventana de reservas en el paso 3
    if (!formData.durationMinutes || formData.durationMinutes <= 0) {
      newErrors.durationMinutes = 'La duración debe ser mayor a 0 minutos';
    }
    if (!formData.bookingWindowDays || formData.bookingWindowDays <= 0) {
      newErrors.bookingWindowDays = 'Debes indicar el tiempo permitido para ofrecer turnos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Funciones para manejar zonas
  const addZone = () => {
    setFormData(prev => ({
      ...prev,
      zones: [...prev.zones, { province: '', locality: '', neighborhood: '' }]
    }));
  };

  const updateZone = (index: number, field: keyof typeof formData.zones[0], value: string) => {
    setFormData(prev => ({
      ...prev,
      zones: prev.zones.map((zone, i) => 
        i === index ? { ...zone, [field]: value } : zone
      )
    }));
  };

  const removeZone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      zones: prev.zones.filter((_, i) => i !== index)
    }));
  };

  // Funciones para manejar disponibilidad
  const toggleDay = (day: keyof typeof formData.availability) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          enabled: !prev.availability[day].enabled,
          timeSlots: !prev.availability[day].enabled ? [{ start: '09:00', end: '17:00' }] : []
        }
      }
    }));
  };

  const addTimeSlot = (day: keyof typeof formData.availability) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          timeSlots: [...prev.availability[day].timeSlots, { start: '09:00', end: '17:00' }]
        }
      }
    }));
  };

  const updateTimeSlot = (day: keyof typeof formData.availability, slotIndex: number, field: 'start' | 'end', value: string) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          timeSlots: prev.availability[day].timeSlots.map((slot, i) => 
            i === slotIndex ? { ...slot, [field]: value } : slot
          )
        }
      }
    }));
  };

  const removeTimeSlot = (day: keyof typeof formData.availability, slotIndex: number) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          timeSlots: prev.availability[day].timeSlots.filter((_, i) => i !== slotIndex)
        }
      }
    }));
  };

  // Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep3()) return;

    setIsSubmitting(true);

    try {
      // Usar la función de transformación para obtener el formato correcto
      const transformedData = transformDataForAPI(formData);
      
  // Use logger for debug info
  logger.debug('Datos transformados para enviar al backend:', transformedData);

      const result = await updateService(serviceId!, transformedData);
      
      if (result.success) {
        addNotification({
          type: 'success',
          message: 'Servicio actualizado exitosamente'
        });
        navigate('/my-services');
      } else {
        addNotification({
          type: 'error',
          message: result.error || 'Error al actualizar el servicio'
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Error al actualizar el servicio'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const dayNames = {
    monday: 'Lunes',
    tuesday: 'Martes', 
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Fixed loading indicator */}
      {isSubmitting && (
        <div className="fixed bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center z-50">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Procesando...
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <button
            onClick={() => navigate('/my-services')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver a Mis Servicios
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Servicio</h1>
              <p className="text-gray-600 mt-2">
                Actualiza la información de tu servicio
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600">
                Paso {currentStep} de 3
              </span>
              <span className="text-sm text-gray-500">
                {currentStep === 1 && 'Información básica'}
                {currentStep === 2 && 'Zonas de cobertura'}
                {currentStep === 3 && 'Disponibilidad'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Step 1: Información básica */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Información básica del servicio
              </h2>

              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Título del servicio *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Plomería profesional para el hogar"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Precio *
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={formData.price === 0 ? '' : formData.price}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        setFormData(prev => ({ ...prev, price: 0 }));
                      } else {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                          setFormData(prev => ({ ...prev, price: numValue }));
                        }
                      }
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.price ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción detallada *
                  </label>
                    <textarea
                    id="description"
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Describe en detalle tu servicio, experiencia, herramientas que utilizas, etc. (mínimo 100 caracteres)"
                  />
                  <div className="flex justify-between mt-1">
                    {errors.description && (
                      <p className="text-sm text-red-600">{errors.description}</p>
                    )}
                    <p className="text-sm text-gray-500 ml-auto">
                      {formData.description.length}/100 caracteres mínimo
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de imagen (opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Agrega una imagen representativa de tu servicio
                  </p>
                </div>

                {/* duration and booking window moved to Step 3 */}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={async () => {
                    if (validateStep1()) {
                      setIsSubmitting(true);
                      try {
                        const result = await updateService(serviceId!, transformDataForAPI(formData));
                        if (result.success) {
                          addNotification({
                            type: 'success',
                            message: 'Información básica guardada'
                          });
                        }
                      } catch (error) {
                        addNotification({
                          type: 'error',
                          message: 'Error al guardar'
                        });
                      } finally {
                        setIsSubmitting(false);
                      }
                    }
                  }}
                  disabled={isSubmitting}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Zonas de cobertura */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Zonas de cobertura
              </h2>

              <div className="space-y-4">
                {formData.zones.map((zone, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium text-gray-900">Zona {index + 1}</h3>
                      {formData.zones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeZone(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Provincia *
                        </label>
                        <select
                          value={zone.province}
                          onChange={(e) => updateZone(index, 'province', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Seleccionar</option>
                          {provinces.map(province => (
                            <option key={province} value={province}>
                              {province}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Localidad *
                        </label>
                        <select
                          value={zone.locality}
                          onChange={(e) => updateZone(index, 'locality', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={!zone.province}
                        >
                          <option value="">Seleccionar</option>
                          {zone.province && localitiesData[zone.province]?.map((locality: string) => (
                            <option key={locality} value={locality}>
                              {locality}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Barrio (opcional)
                        </label>
                        <input
                          type="text"
                          value={zone.neighborhood || ''}
                          onChange={(e) => updateZone(index, 'neighborhood', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Barrio específico"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addZone}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Agregar otra zona de cobertura
                </button>

                {errors.zones && (
                  <p className="text-sm text-red-600">{errors.zones}</p>
                )}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800"
                >
                  Anterior
                </button>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={async () => {
                      if (validateStep2()) {
                        setIsSubmitting(true);
                        try {
                          const result = await updateService(serviceId!, transformDataForAPI(formData));
                          if (result.success) {
                            addNotification({
                              type: 'success',
                              message: 'Zonas de cobertura guardadas'
                            });
                          }
                        } catch (error) {
                          addNotification({
                            type: 'error',
                            message: 'Error al guardar'
                          });
                        } finally {
                          setIsSubmitting(false);
                        }
                      }
                    }}
                    disabled={isSubmitting}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Disponibilidad */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Disponibilidad y horarios
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duración estimada (minutos)</label>
                    <select
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value || '0', 10) || 0 }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.durationMinutes ? 'border-red-300' : 'border-gray-300'}`}
                    >
                      {[30, 60, 120, 150, 180].map(v => (
                        <option key={v} value={v}>{v} minutos</option>
                      ))}
                    </select>
                    {errors.durationMinutes && <p className="text-sm text-red-600 mt-1">{errors.durationMinutes}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tiempo permitido para ofrecer turnos (días)</label>
                    <select
                      value={formData.bookingWindowDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, bookingWindowDays: parseInt(e.target.value || '0', 10) || 0 }))}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {[30, 60, 90, 120].map(v => (
                        <option key={v} value={v}>{v} días</option>
                      ))}
                    </select>
                    {errors.bookingWindowDays && <p className="text-sm text-red-600 mt-1">{errors.bookingWindowDays}</p>}
                  </div>
                </div>

                <div className="mt-4" />

                {Object.entries(formData.availability).map(([day, dayData]) => (
                  <div key={day} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={day}
                          checked={dayData.enabled}
                          onChange={() => toggleDay(day as keyof typeof formData.availability)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={day} className="ml-3 text-lg font-medium text-gray-900">
                          {dayNames[day as keyof typeof dayNames]}
                        </label>
                      </div>
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>

                    {dayData.enabled && (
                      <div className="space-y-3">
                        {dayData.timeSlots.map((slot, slotIndex) => (
                          <div key={slotIndex} className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
                              <input
                                type="time"
                                value={slot.start}
                                onChange={(e) => updateTimeSlot(day as keyof typeof formData.availability, slotIndex, 'start', e.target.value)}
                                className="w-full md:w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <span className="text-gray-500 md:mx-2">hasta</span>
                              <input
                                type="time"
                                value={slot.end}
                                onChange={(e) => updateTimeSlot(day as keyof typeof formData.availability, slotIndex, 'end', e.target.value)}
                                className="w-full md:w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            {dayData.timeSlots.length > 1 && (
                              <div className="flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => removeTimeSlot(day as keyof typeof formData.availability, slotIndex)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addTimeSlot(day as keyof typeof formData.availability)}
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Agregar horario
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {errors.availability && (
                  <p className="text-sm text-red-600">{errors.availability}</p>
                )}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800"
                >
                  Anterior
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
