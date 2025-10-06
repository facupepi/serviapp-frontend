# Estructura Interna del Componente — ServiApp Frontend

Este documento explica la convención y la estructura interna recomendada para componentes en este repositorio (React + TypeScript + Tailwind).

Objetivo
- Proveer una guía clara para crear componentes consistentes, mantenibles y alineados con el código existente.

Convenciones generales
- Lenguaje y herramientas: React + TypeScript (tsx), TailwindCSS para estilos, Vite como bundler.
- Nomenclatura: archivos y componentes en PascalCase (ExampleComponent.tsx). Hooks y utilidades en camelCase (useAuth, parseLocalDate).
- Organización: componentes presentacionales en `src/components/`; páginas en `src/pages/`; context/providers en `src/contexts/`.
- Estilos: usar clases utilitarias de Tailwind; evitar estilos en línea y CSS globales cuando sea posible.

Estructura interna (contrato) de un componente UI
1) Encabezado y metadatos
- Exportar el componente como default o nombrado según uso. Preferir `export default function ComponentName(...) {}` para componentes de página. Para componentes reutilizables se puede usar `export const ComponentName: React.FC<Props> = ({ ... }) => {}`.
- Tipos: definir Props en el mismo archivo justo arriba del componente:
  - interface ComponentNameProps { ... }
  - Evitar `any`; usar tipos de `src/types` si aplicable.

2) Responsabilidades (single responsibility)
- Un componente UI debe encargarse sólo de:
  - Recibir props y renderizar la UI.
  - Emitir acciones a través de callbacks (onClick, onChange) o context.
- No colocar fetches o lógica de negocio compleja en componentes; mover esa lógica a `src/contexts/` o hooks (p. ej., `useAppointments`).

3) Estructura de código (orden recomendado dentro del archivo)
- Imports (ordenados: React, 3rd-party, src/ absolute imports)
- Tipos e interfaces
- Constantes y utilidades locales (p. ej., formatters)
- Component principal
  - Hooks de react (useState, useEffect) — mantener al inicio del cuerpo
  - Callbacks con useCallback s/ dependencias claras
  - Render (JSX)
- Subcomponentes menores pueden declararse debajo o en un archivo separado si son reutilizables.

4) Hooks y efectos
- Siempre declarar useEffect con dependencia mínima necesaria.
- Evitar efectos con dependencias que cambian en cada render (funciones no memorizadas, objetos nuevos).
- Si necesitas llamar una API, exponer la acción desde un context (`AuthContext`) o un hook `useAppointments` y llamarla desde el efecto sin re-declararla.

5) Acceso a datos y side-effects
- Los contexts (`src/contexts/AuthContext.tsx`, `NotificationContext.tsx`) manejan fetches y transformaciones.
- Los componentes piden datos via props o context y solo renderizan.

6) Estilos y UI
- Preferir clases utility de Tailwind.
- Para variantes de componentes (size, color) usar props y mapear a clases Tailwind mediante funciones pequeñas (p. ej., `const sizeClass = size === 'sm' ? 'p-2 text-sm' : 'p-4 text-base'`).
- Mantener la marca visual con tokens (colores en `tailwind.config.js`) y evitar hex literales.

7) Accesibilidad
- Inputs deben tener labels asociados.
- Botones deben usar `type="button"` cuando no son submit en formularios.
- Usar roles y ARIA donde sea útil para componentes dinámicos.

8) Tests y calidad
- Agregar tests unitarios cuando el componente contiene lógica importante (transformaciones, cálculos). Si el repo no tiene test infra, documentar la intención y crear pruebas si se añade Jest/Testing Library.

Ejemplo de patrón de componente (esqueleto)
- Archivo: `src/components/ExampleCard.tsx`

// ...existing code...

interface ExampleCardProps { title: string; onOpen: () => void }

export const ExampleCard: React.FC<ExampleCardProps> = ({ title, onOpen }) => {
  const handleOpen = useCallback(() => onOpen(), [onOpen]);
  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <button type="button" onClick={handleOpen} className="mt-2 text-indigo-600">Abrir</button>
    </div>
  );
};

Buenas prácticas específicas para este repo
- Fecha: usar helper `parseLocalDate(dateString: string)` para evitar shift de zona horaria cuando el backend envía `YYYY-MM-DD`.
- Notifications: preferir `NotificationContext` para emitir feedback en vez de props anidadas.
- API payloads: mapear camelCase <-> snake_case en `src/api/` o en los contexts que llaman la API.

Siguientes pasos recomendados
- Añadir utilitario compartido `src/utils/dates.ts` con `parseLocalDate` y `formatDateToApi`.
- Extraer componentes de tarjeta comunes a `src/components/cards/`.
- Añadir pequeña plantilla `COMPONENT_TEMPLATE.md` para scaffolding rápido.

---

Fechado: 2025-10-06
Autor: Equipo ServiApp (adaptado por el asistente)
