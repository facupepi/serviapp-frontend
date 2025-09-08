import { useNavigate } from 'react-router-dom';

export default function TestResetPassword() {
  const navigate = useNavigate();

  const testToken = 'test-token-12345'; // Token de prueba temporal

  const navigateToReset = () => {
    navigate(`/reset-password/${testToken}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          🧪 Test Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Esta página simula el enlace que llegaría por email
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <h3 className="font-bold">⚠️ Página de Testing</h3>
              <p className="text-sm mt-1">
                Esta página simula el enlace que el usuario recibiría por email después de solicitar 
                la recuperación de contraseña.
              </p>
            </div>

            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              <h4 className="font-semibold">📧 Flujo Real:</h4>
              <ol className="text-sm mt-1 list-decimal list-inside space-y-1">
                <li>Usuario solicita recuperación en /forgot-password</li>
                <li>Backend envía email con enlace</li>
                <li>Enlace apunta a: /reset-password/[token-real]</li>
                <li>Usuario hace click y llega a formulario de reset</li>
              </ol>
            </div>

            <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-3 rounded">
              <h4 className="font-semibold">🔧 Token de Prueba:</h4>
              <p className="text-sm font-mono mt-1 bg-gray-200 px-2 py-1 rounded">
                {testToken}
              </p>
            </div>

            <button
              onClick={navigateToReset}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              🔗 Simular Click en Email (Ir a Reset Password)
            </button>

            <div className="text-center">
              <button
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Volver a Forgot Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
