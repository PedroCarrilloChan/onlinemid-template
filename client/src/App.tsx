import React, { useState, useEffect } from 'react';

// tsParticles es una librería ligera para crear fondos animados.
// Necesitarás instalarla en tu proyecto: npm install react-tsparticles tsparticles
import { tsParticles } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";


// --- Componente de Fondo Inmersivo ---
// Este componente crea el fondo de partículas estrelladas que se usará en toda la aplicación.
function ParticleBackground() {
  useEffect(() => {
    // useEffect se asegura de que el código de partículas se ejecute solo una vez cuando el componente se monta.
    loadSlim(tsParticles).then((engine) => {
      engine.load({
        id: "tsparticles",
        options: {
          background: {
            color: { value: "#0d1a2c" }, // El mismo azul oscuro de tu marca
          },
          fpsLimit: 60,
          particles: {
            number: {
              value: 150, // Menos partículas para un look más limpio
              density: { enable: true, value_area: 800 },
            },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: {
              value: 0.3,
              random: true,
              anim: { enable: true, speed: 0.5, opacity_min: 0.1, sync: false },
            },
            size: {
              value: { min: 0.5, max: 1.5 },
              random: true,
            },
            move: {
              enable: false, // Las partículas no se mueven, solo parpadean
            },
          },
          interactivity: { events: { onhover: { enable: false } } },
          detectRetina: true,
        },
      });
    });
  }, []);

  return <div id="tsparticles" className="fixed top-0 left-0 w-full h-full -z-10" />;
}


// --- Componente para el Formulario de Login ---
// Rediseñado con el efecto "glass" para ser consistente con la marca.
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Hubo un problema al iniciar sesión.');
      }
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-white">OnlineMid Portal</h2>
        <p className="text-center text-gray-400">Acceso para Clientes</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-300">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-1 text-white bg-white/10 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[#0062FF]"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-300">Contraseña</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 text-white bg-white/10 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[#0062FF]"
            />
          </div>
          {error && <p className="text-sm text-center text-red-400">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 font-bold text-white bg-[#0062FF] rounded-md hover:bg-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-600"
            >
              {loading ? 'Ingresando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// --- Componente Base del Layout del Dashboard ---
// Proporciona la estructura consistente para todas las páginas del portal.
function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-10 bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">OnlineMid Portal</h1>
          <button className="text-gray-300 hover:text-white transition-colors">Cerrar Sesión</button>
        </div>
      </header>
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  )
}


// --- Componente para el Panel de Control (después del login) ---
function Dashboard() {
  return (
    <DashboardLayout>
      <h2 className="text-3xl font-bold mb-6">¡Bienvenido a tu Portal!</h2>
      <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
        <p className="text-gray-300">Aquí podrás editar el contenido de tu página web.</p>
        {/* Aquí construiremos los formularios para editar los textos, imágenes, etc. */}
      </div>
    </DashboardLayout>
  );
}


// --- Componente Principal de la Aplicación ---
// Decide qué mostrar: el login o el dashboard.
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    // Toda la aplicación tiene el fondo de partículas.
    <div className="relative">
      <ParticleBackground />
      <div className="relative z-10">
        {isLoggedIn ? <Dashboard /> : <LoginForm onLoginSuccess={handleLoginSuccess} />}
      </div>
    </div>
  );
}

