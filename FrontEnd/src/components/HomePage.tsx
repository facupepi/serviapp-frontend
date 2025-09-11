import Hero from './Hero';
import ServiceCategories from './ServiceCategories';
import FeaturedProviders from './FeaturedProviders';
import HowItWorks from './HowItWorks';
import FiltersSidebar from './FiltersSidebar';

export default function HomePage() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <Hero />

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar with Filters */}
          <aside className="hidden lg:block flex-shrink-0">
            <FiltersSidebar />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <ServiceCategories />
            <div className="mt-16">
              <FeaturedProviders />
            </div>
            <div className="mt-16">
              <HowItWorks />
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Filters - Show on small screens */}
      <div className="lg:hidden px-4 sm:px-6 pb-8">
        <FiltersSidebar />
      </div>
    </div>
  );
}
