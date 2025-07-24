import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import ServiceCategories from './components/ServiceCategories';
import FeaturedProviders from './components/FeaturedProviders';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import ServicesPage from './pages/ServicesPage';
import FavoritesPage from './pages/FavoritesPage';
import UserRequestsPage from './pages/UserRequestsPage';
import ProviderRequestsPage from './pages/ProviderRequestsPage';
import ProviderProfile from './pages/ProviderProfile';
import Dashboard from './pages/Dashboard';
import ServiceDetailPage from './pages/ServiceDetail';
import OfferService from './pages/OfferService';
import MyServices from './pages/MyServices';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AboutUs from './pages/AboutUs';
import HowItWorksPage from './pages/HowItWorksPage';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Help from './pages/Help';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={
                <>
                  <Hero />
                  <ServiceCategories />
                  <FeaturedProviders />
                  <HowItWorks />
                </>
              } />
              <Route path="/servicios" element={<ServicesPage />} />
              <Route path="/favoritos" element={<FavoritesPage />} />
              <Route path="/mis-solicitudes" element={<UserRequestsPage />} />
              <Route path="/solicitudes-recibidas" element={<ProviderRequestsPage />} />
              <Route path="/servicio/:id" element={<ServiceDetailPage />} />
              <Route path="/servicios/:id" element={<ServiceDetailPage />} />
              <Route path="/proveedor/:id" element={<ProviderProfile />} />
              <Route path="/ofrecer-servicio" element={<OfferService />} />
              <Route path="/mis-servicios" element={<MyServices />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />
              <Route path="/recuperar-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/sobre-nosotros" element={<AboutUs />} />
              <Route path="/como-funciona" element={<HowItWorksPage />} />
              <Route path="/terminos-y-condiciones" element={<TermsAndConditions />} />
              <Route path="/politica-de-privacidad" element={<PrivacyPolicy />} />
              <Route path="/ayuda" element={<Help />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;