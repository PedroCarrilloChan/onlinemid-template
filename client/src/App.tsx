import React, { useState } from 'react';

// Este es el componente principal de tu aplicación de portal.
// Se ha corregido un error eliminando la importación de un archivo CSS que no se utiliza.

// --- Componente para el Formulario de Login ---
function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Esta es la llamada a la API que creamos en la carpeta /functions
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Hubo un problema al iniciar sesión.');
      }

      // Si el login es exitoso, llamamos a la función del componente padre
      onLoginSuccess();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-white">OnlineMid Portal</h2>
        <p className="text-center text-gray-400">Acceso para Clientes</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-300">Correo Electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-300">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-sm text-center text-red-400">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500"
            >
              {loading ? 'Ingresando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// --- Componente para el Panel de Control (después del login) ---
function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-4xl font-bold mb-4">¡Bienvenido a tu Portal!</h1>
            <p className="text-gray-300">Aquí podrás editar el contenido de tu página web.</p>
            {/* Aquí construiremos los formularios para editar el contenido */}
        </div>
    );
}


// --- Componente Principal de la Aplicación ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Esta función se pasa al LoginForm para que pueda cambiar el estado
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // Renderiza un componente u otro dependiendo del estado de login
  return (
    <>
      {isLoggedIn ? <Dashboard /> : <LoginForm onLoginSuccess={handleLoginSuccess} />}
    </>
  );
}

