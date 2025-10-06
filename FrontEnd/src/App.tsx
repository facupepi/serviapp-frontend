import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Header from './components/Header';
import Hero from './components/Hero';
import ServiceCategories from './components/ServiceCategories';
import FeaturedProviders from './components/FeaturedProviders';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import NotificationContainer from './components/NotificationContainer';
import ServicesPage from './pages/ServicesPage';
import FavoritesPage from './pages/FavoritesPage';
import UserRequestsPage from './pages/UserRequestsPage';
import ProviderRequestsPage from './pages/ProviderRequestsPage';
import ProviderProfile from './pages/ProviderProfile';
import Dashboard from './pages/Dashboard';
import ServiceDetailPage from './pages/ServiceDetail';
import OfferService from './pages/OfferService';
import MyServices from './pages/MyServices';
import EditService from './pages/EditService';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AboutUs from './pages/AboutUs';
import HowItWorksPage from './pages/HowItWorksPage';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Help from './pages/Help';
import Profile from './pages/Profile';

function App() {
  return (
    <NotificationProvider>
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
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/my-requests" element={<UserRequestsPage />} />
                <Route path="/received-requests" element={<ProviderRequestsPage />} />
                <Route path="/service/:id" element={<ServiceDetailPage />} />
                <Route path="/services/:id" element={<ServiceDetailPage />} />
                <Route path="/provider/:id" element={<ProviderProfile />} />
                <Route path="/offer-service" element={<OfferService />} />
                <Route path="/my-services" element={<MyServices />} />
                <Route path="/edit-service/:serviceId" element={<EditService />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/help" element={<Help />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
            <Footer />
            <NotificationContainer />
          </div>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;