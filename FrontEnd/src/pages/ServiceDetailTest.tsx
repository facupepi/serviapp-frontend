import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Service } from '../types/api';

export default function ServiceDetailTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, getServiceById } = useAuth();
  
  const [serviceData, setServiceData] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🚀 ServiceDetailTest iniciado:', {
    id,
    isAuthenticated,
    userEmail: user?.email,
    currentPath: window.location.pathname
  });

  useEffect(() => {
    console.log('🔍 ServiceDetailTest useEffect:', { id, isAuthenticated });
    
    const loadService = async () => {
      if (!id) {
        console.log('❌ No hay ID');
        setError('ID de servicio no válido');
        setLoading(false);
        return;
      }

      console.log('🔄 Cargando servicio:', id);
      try {
        const result = await getServiceById(id);
        console.log('📋 Resultado getServiceById:', result);
        
        if (result.success && result.data) {
          setServiceData(result.data);
          setError(null);
        } else {
          setError(result.error || 'Error desconocido');
        }
      } catch (error) {
        console.error('❌ Error catch:', error);
        setError('Error inesperado');
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [id, getServiceById]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando servicio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error: {error}</h2>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-4">
            Test - Detalle del Servicio
          </h1>
          
          <div className="space-y-4">
            <p><strong>ID:</strong> {id}</p>
            <p><strong>Usuario autenticado:</strong> {isAuthenticated ? 'Sí' : 'No'}</p>
            <p><strong>Email del usuario:</strong> {user?.email || 'No disponible'}</p>
            <p><strong>Título del servicio:</strong> {serviceData?.title || 'No disponible'}</p>
            <p><strong>Descripción:</strong> {serviceData?.description || 'No disponible'}</p>
            <p><strong>Precio:</strong> ${serviceData?.price || 'No disponible'}</p>
            <p><strong>Estado:</strong> {serviceData?.status || 'No disponible'}</p>
          </div>

          <div className="mt-8">
            <button
              onClick={() => navigate('/services')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Volver a servicios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
