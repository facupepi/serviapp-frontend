import { useNavigate } from 'react-router-dom';
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
  GraduationCap
} from 'lucide-react';

const categories = [
  { name: 'Hogar y Reparaciones', icon: Wrench, count: 150, color: 'bg-blue-100 text-blue-600' },
  { name: 'Electricidad', icon: Zap, count: 80, color: 'bg-yellow-100 text-yellow-600' },
  { name: 'Limpieza', icon: Sparkles, count: 120, color: 'bg-green-100 text-green-600' },
  { name: 'Jardinería', icon: TreePine, count: 65, color: 'bg-emerald-100 text-emerald-600' },
  { name: 'Pintura', icon: Paintbrush, count: 90, color: 'bg-purple-100 text-purple-600' },
  { name: 'Fotografía', icon: Camera, count: 45, color: 'bg-pink-100 text-pink-600' },
  { name: 'Automotriz', icon: Car, count: 70, color: 'bg-gray-100 text-gray-600' },
  { name: 'Tecnología', icon: Laptop, count: 55, color: 'bg-indigo-100 text-indigo-600' },
  { name: 'Mudanzas', icon: Home, count: 35, color: 'bg-orange-100 text-orange-600' },
  { name: 'Eventos', icon: Users, count: 40, color: 'bg-red-100 text-red-600' },
  { name: 'Bienestar', icon: Heart, count: 30, color: 'bg-rose-100 text-rose-600' },
  { name: 'Educación', icon: GraduationCap, count: 25, color: 'bg-cyan-100 text-cyan-600' },
];

export default function ServiceCategories() {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/services?category=${encodeURIComponent(categoryName)}`);
  };
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              >
                <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">
                  {category.name}
                </h3>
                <p className="text-gray-500 text-sm">
                  {category.count} servicios
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}