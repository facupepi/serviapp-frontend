import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getProvinces, getLocalitiesObject } from '../data/argentina';

const Profile: React.FC = () => {
  const { user, updateUserProfile, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', locality: '', province: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const provinces = getProvinces();
  const localitiesObj = getLocalitiesObject();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        locality: user.locality || '',
        province: user.province || '',
        phone: user.phone || ''
      });
    }
  }, [user, isAuthenticated, navigate]);

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
        setMessage('Perfil actualizado correctamente');
      }
    } catch (err) {
      setError('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Mi Perfil</h2>
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
            <input name="phone" value={form.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}
          {message && <div className="text-sm text-green-600">{message}</div>}

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
