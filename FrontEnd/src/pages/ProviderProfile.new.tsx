import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Since we don't have provider data from backend yet, show a message
  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Proveedor no encontrado</h2>
          <p className="text-gray-600 mb-4">El ID del proveedor no es válido.</p>
          <button
            onClick={() => navigate('/services')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Ver Servicios
          </button>
        </div>
      </div>
    );
  }

  // Placeholder until we implement backend provider profiles
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Perfil de Proveedor</h2>
        <p className="text-gray-600 mb-4">
          Esta funcionalidad se implementará cuando tengamos la integración completa con el backend.
        </p>
        <p className="text-sm text-gray-500 mb-4">ID del proveedor: {id}</p>
        <button
          onClick={() => navigate('/services')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Ver Servicios
        </button>
      </div>
    </div>
  );
}
