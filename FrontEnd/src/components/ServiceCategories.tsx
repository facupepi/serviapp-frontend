import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Wrench, 
  Zap, 
  Sparkles, 
  TreePine, 
  Paintbrush, 
  Camera,
  Car,
  Laptop,
  Home,
  Users,
  Heart,
  GraduationCap,
  Hammer,
  Settings,
  Dumbbell,
  Music,
  Languages,
  MoreHorizontal
} from 'lucide-react';

// Mapeo de iconos para categorías
const categoryIcons: { [key: string]: any } = {
  'Limpieza': Sparkles,
  'Jardinería': TreePine,
  'Plomería': Wrench,
  'Electricidad': Zap,
  'Carpintería': Hammer,
  'Pintura': Paintbrush,
  'Mecánica': Settings,
  'Tecnología': Laptop,
  'Educación': GraduationCap,
  'Salud': Heart,
  'Belleza': Heart,
  'Mascotas': Heart,
  'Transporte': Car,
  'Eventos': Users,
  'Fotografía': Camera,
  'Cocina': Home,
  'Fitness': Dumbbell,
  'Música': Music,
  'Idiomas': Languages,
  'Otros': MoreHorizontal,
};

// Mapeo de colores para categorías
const categoryColors: { [key: string]: string } = {
  'Limpieza': 'bg-green-100 text-green-600',
  'Jardinería': 'bg-emerald-100 text-emerald-600',
  'Plomería': 'bg-blue-100 text-blue-600',
  'Electricidad': 'bg-yellow-100 text-yellow-600',
  'Carpintería': 'bg-orange-100 text-orange-600',
  'Pintura': 'bg-purple-100 text-purple-600',
  'Mecánica': 'bg-gray-100 text-gray-600',
  'Tecnología': 'bg-indigo-100 text-indigo-600',
  'Educación': 'bg-cyan-100 text-cyan-600',
  'Salud': 'bg-red-100 text-red-600',
  'Belleza': 'bg-pink-100 text-pink-600',
  'Mascotas': 'bg-amber-100 text-amber-600',
  'Transporte': 'bg-slate-100 text-slate-600',
  'Eventos': 'bg-rose-100 text-rose-600',
  'Fotografía': 'bg-violet-100 text-violet-600',
  'Cocina': 'bg-teal-100 text-teal-600',
  'Fitness': 'bg-lime-100 text-lime-600',
  'Música': 'bg-fuchsia-100 text-fuchsia-600',
  'Idiomas': 'bg-sky-100 text-sky-600',
  'Otros': 'bg-neutral-100 text-neutral-600',
};

export default function ServiceCategories() {
  const navigate = useNavigate();
  const { categories } = useAuth();
  // Nota: logs de debug removidos para evitar ruido en consola

  // Función para obtener icono de categoría
  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || MoreHorizontal;
  };

  // Función para obtener color de categoría con fallback dinámico
  const getCategoryColor = (category: string) => {
    if (categoryColors[category]) {
      return categoryColors[category];
    }
    
    // Generar colores dinámicos para categorías no definidas
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-red-100 text-red-600',
      'bg-yellow-100 text-yellow-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600',
      'bg-teal-100 text-teal-600',
      'bg-orange-100 text-orange-600',
      'bg-cyan-100 text-cyan-600'
    ];
    
    // Usar el hash del nombre de categoría para asignar un color consistente
    const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const handleCategoryClick = (categoryName: string) => {
    const params = new URLSearchParams();
    params.set('category', categoryName);
    params.set('categoria', categoryName); // También en español para compatibilidad
    navigate(`/services?${params.toString()}`);
  };

  // No mostrar nada si las categorías aún no están cargadas
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explora nuestras categorías
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Encuentra profesionales especializados en cualquier área que necesites
            </p>
            <div className="animate-pulse">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-32 h-24 bg-gray-200 rounded-xl mx-auto"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explora nuestras categorías
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encuentra profesionales especializados en cualquier área que necesites
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => {
            const Icon = getCategoryIcon(category);
            const colorClass = getCategoryColor(category);
            
            return (
              <div
                key={`${category}-${index}`}
                onClick={() => handleCategoryClick(category)}
                className="group bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                    {category}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}