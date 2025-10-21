import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getProvinces, getLocalitiesObject } from '../data/argentina';

const Profile: React.FC = () => {
  const { user, updateUserProfile, getUserProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', locality: '', province: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const provinces = getProvinces();
  const localitiesObj = getLocalitiesObject();

  // Cargar perfil del usuario al montar el componente
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const resp = await getUserProfile();
        if (resp.success && resp.data) {
          setForm({
            name: resp.data.name || '',
            email: resp.data.email || '',
            locality: resp.data.locality || '',
            province: resp.data.province || '',
            phone: resp.data.phone || ''
          });
        } else if (user) {
          // Fallback a datos del contexto si falla la carga
          setForm({
            name: user.name || '',
            email: user.email || '',
            locality: user.locality || '',
            province: user.province || '',
            phone: user.phone || ''
          });
        }
      } catch (err) {
        console.error('Error cargando perfil:', err);
        // Usar datos del contexto como fallback
        if (user) {
          setForm({
            name: user.name || '',
            email: user.email || '',
            locality: user.locality || '',
            province: user.province || '',
            phone: user.phone || ''
          });
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const resp = await updateUserProfile(form);
      if (!resp.success) {
        setError(resp.error || 'Error actualizando perfil');
      } else {
        setMessage(resp.message || 'Perfil actualizado correctamente');
        // Limpiar el mensaje después de 5 segundos
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (err) {
      setError('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Mi Perfil</h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {message && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">{message}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input name="name" value={form.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Provincia</label>
              <select name="province" value={form.province} onChange={(e) => { setForm(prev => ({ ...prev, province: e.target.value, locality: '' })); }} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                <option value="">Seleccionar provincia</option>
                {provinces.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
                {/* Si la provincia actual del usuario no está en la lista, mostrarla como opción seleccionada */}
                {form.province && !provinces.includes(form.province) && (
                  <option value={form.province}>{form.province}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Localidad</label>
              <select name="locality" value={form.locality} onChange={(e) => setForm(prev => ({ ...prev, locality: e.target.value }))} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                <option value="">Seleccionar localidad</option>
                {(form.province && localitiesObj[form.province]) ? localitiesObj[form.province].map(l => (
                  <option key={l} value={l}>{l}</option>
                )) : null}
                {/* Si la localidad actual no está en la lista de la provincia seleccionada, mostrarla */}
                {form.locality && (!form.province || !localitiesObj[form.province] || !localitiesObj[form.province].includes(form.locality)) && (
                  <option value={form.locality}>{form.locality}</option>
                )}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="+54 9 11 1234-5678" />
          </div>

          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={() => navigate('/dashboard')}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
