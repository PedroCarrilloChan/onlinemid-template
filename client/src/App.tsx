import React, { useState, useCallback, useEffect } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

// --- Componente de Fondo Inmersivo ---
function ParticleBackground() {
  const particlesInit = useCallback(async (engine) => { await loadSlim(engine); }, []);

  const particlesOptions = {
      fpsLimit: 60,
      particles: {
        number: { value: 100, density: { enable: true, value_area: 800 } },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: { value: 0.2, random: true, anim: { enable: true, speed: 0.4, opacity_min: 0.05, sync: false } },
        size: { value: { min: 0.5, max: 1.2 }, random: true },
        move: { enable: false },
      },
      interactivity: { events: { onhover: { enable: false } } },
      detectRetina: true,
  };

  return <Particles id="tsparticles" init={particlesInit} options={particlesOptions} className="fixed top-0 left-0 w-full h-full -z-10" />;
}

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
      // Usamos las credenciales de prueba para simular el login por ahora
      if (email === 'test@onlinemid.com' && password === 'password') {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error de inicio de sesión.');
        onLoginSuccess();
      } else {
        throw new Error('Credenciales inválidas.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg">
        <h2 className="text-4xl font-bold text-center text-white font-nunito">OnlineMid Portal</h2>
        <p className="text-center text-gray-400 font-roboto">Acceso para Clientes</p>
        <form onSubmit={handleSubmit} className="space-y-6 font-roboto">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-300">Correo Electrónico</label>
            <input
              id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-1 text-white bg-white/10 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[#0348eb]"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-300">Contraseña</label>
            <input
              id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 text-white bg-white/10 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[#0348eb]"
            />
          </div>
          {error && <p className="text-sm text-center text-red-400">{error}</p>}
          <div>
            <button
              type="submit" disabled={loading}
              className="w-full px-4 py-3 font-bold text-white bg-[#0348eb] rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:bg-gray-600"
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
function DashboardLayout({ onLogout, children }) {
  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-10 bg-black/30 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold font-nunito">OnlineMid Portal</h1>
          <button onClick={onLogout} className="font-roboto text-gray-300 hover:text-white transition-colors">Cerrar Sesión</button>
        </div>
      </header>
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  )
}

// --- Componente Principal del Editor del Dashboard ---
function DashboardEditor({ onLogout }) {
    return (
        <DashboardLayout onLogout={onLogout}>
            <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                <h2 className="text-3xl font-bold font-nunito">Editor de Contenido</h2>
                <p className="mt-4 text-gray-300 font-roboto">¡Bienvenido! Próximamente aquí podrás editar el contenido de tu página web.</p>
            </div>
        </DashboardLayout>
    );
}


// --- Componente Principal de la Aplicación ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="relative">
      {/* Estilos globales y fuentes de la marca */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800&family=Roboto:wght@400;500&display=swap');
        body { 
            font-family: 'Roboto', sans-serif; 
            background-color: #222222; 
            background-image: 
                radial-gradient(circle at 100% 100%, rgba(3, 72, 235, 0.1), transparent 50%), 
                radial-gradient(circle at 0% 100%, rgba(3, 72, 235, 0.05), transparent 60%); 
            background-attachment: fixed; 
        }
        .font-nunito { font-family: 'Nunito', sans-serif; }
        .font-roboto { font-family: 'Roboto', sans-serif; }
      `}</style>

      <ParticleBackground />

      <div className="relative z-10">
        {isLoggedIn ? (
          <DashboardEditor onLogout={handleLogout} />
        ) : (
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </div>
  );
}

