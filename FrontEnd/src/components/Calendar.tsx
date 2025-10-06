import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  apiDays?: Array<any> | null; // Si la API devolvió el array `days` (aunque esté vacío), pasar aquí para usar has_availability
  minDate: string; // Fecha mínima seleccionable (hoy)
  maxDate: string; // Fecha máxima seleccionable (30 días)
  serviceAvailability: any; // Horarios del servicio por día de la semana
}

interface CalendarDay {
  date: string;
  day: number;
  isCurrentMonth: boolean;
  isAvailable: boolean;
  isSelected: boolean;
  isToday: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  apiDays,
  minDate,
  maxDate,
  serviceAvailability
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Función para normalizar la disponibilidad del servicio
  const normalizeAvailability = (availability: any) => {
    const dayOrder = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    const normalized: Record<string, { available: boolean; timeSlots: Array<{start:string;end:string}> }> = {};

    // Inicializar días como no disponibles por defecto
    dayOrder.forEach(d => {
      normalized[d] = { available: false, timeSlots: [] };
    });

    if (!availability || typeof availability !== 'object') return normalized;

    const entries = Object.entries(availability);
    const entriesWithSlots: Array<[string, any]> = [];
    const entriesWithAvailableFalse: Array<[string, any]> = [];

    for (const [key, val] of entries) {
      if (!val) continue;
      const entry: any = val;
      
      if ((Array.isArray(entry.timeSlots) && entry.timeSlots.length) || (entry.start && entry.end)) {
        entriesWithSlots.push([key, val]);
      } else if (entry.available === false) {
        entriesWithAvailableFalse.push([key, val]);
      } else {
        entriesWithSlots.push([key, val]);
      }
    }

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

    for (const [key, val] of entriesWithAvailableFalse) {
      const entry: any = val;
      const maybeDay = entry.day || key;
      const day = String(maybeDay).toLowerCase();
      if (!normalized[day]) continue;

      if (normalized[day].timeSlots.length === 0) {
        normalized[day].available = false;
        normalized[day].timeSlots = [];
      }
    }

    return normalized;
  };

  // Función para verificar si un día está disponible según el servicio
  const isDateAvailableByService = (date: string): boolean => {
    if (!serviceAvailability) return false;

    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayKeys[dayOfWeek];

    const norm = normalizeAvailability(serviceAvailability);
    const dayEntry = norm[dayKey];
    return !!(dayEntry && dayEntry.timeSlots && dayEntry.timeSlots.length > 0);
  };

  // Generar días del calendario
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
  // const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDate = new Date(firstDayOfMonth);

  // Ajustar al primer lunes de la semana (Lunes como primer día)
  const dayOfWeek = firstDayOfMonth.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startDate.setDate(startDate.getDate() - daysToSubtract);

    const days: CalendarDay[] = [];
    const today = new Date().toISOString().split('T')[0];

    // Generar 42 días (6 semanas)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const isCurrentMonth = date.getMonth() === month;
      const isInRange = dateStr >= minDate && dateStr <= maxDate;
      // Si la API devolvió el objeto `days` (aunque esté vacío), usar ese dato de has_availability como autoritativo
      const apiDaysProvided = Array.isArray(apiDays);
      let isAvailableByApi: boolean | null = null;
      if (apiDaysProvided) {
        const found = apiDays!.find((d: any) => d && d.date === dateStr);
        isAvailableByApi = !!(found && found.has_availability);
      }

      const isAvailableByService = isDateAvailableByService(dateStr);

      const isAvailable = isCurrentMonth && isInRange && (
        apiDaysProvided ? !!isAvailableByApi : !!isAvailableByService
      );

      days.push({
        date: dateStr,
        day: date.getDate(),
        isCurrentMonth,
        isAvailable,
        isSelected: dateStr === selectedDate,
        isToday: dateStr === today
      });
    }

    return days;
  };

  const days = generateCalendarDays();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Nombres en español (abreviados) - Mié con tilde y Sáb para claridad
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const handleDayClick = (day: CalendarDay) => {
    if (day.isAvailable) {
      onDateSelect(day.date);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-1 hover:bg-gray-100 rounded-md"
          type="button"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h3 className="text-lg font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-1 hover:bg-gray-100 rounded-md"
          type="button"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Nombres de los días */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((dayName) => (
          <div key={dayName} className="text-center text-sm font-medium text-gray-500 py-2">
            {dayName}
          </div>
        ))}
      </div>

      {/* Días del calendario */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDayClick(day)}
            disabled={!day.isAvailable}
            type="button"
            className={`
              w-10 h-10 text-sm rounded-lg transition-colors duration-150
              ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}
              ${day.isToday ? 'font-bold' : ''}
              ${day.isSelected 
                ? 'bg-blue-600 text-white' 
                : day.isAvailable 
                  ? 'hover:bg-blue-100 cursor-pointer' 
                  : 'text-gray-300 cursor-not-allowed'
              }
              ${!day.isAvailable && day.isCurrentMonth ? 'bg-gray-100' : ''}
            `}
          >
            {day.day}
          </button>
        ))}
      </div>

      {/* Leyenda */}
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span>Día seleccionado</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-100 rounded border border-gray-200"></div>
          <span>Día no disponible</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;