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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error de inicio de sesión.');
      onLoginSuccess();
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

// --- Componente Principal del Editor del Dashboard (AHORA CONECTADO A LA API) ---
function DashboardEditor({ onLogout }) {
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Efecto para cargar los datos del sitio al iniciar
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch('/api/content');
                if (!response.ok) throw new Error('No se pudo cargar el contenido.');
                const data = await response.json();
                setContent(data);
            } catch (err) {
                setError('Error al cargar datos. Intente recargar la página.');
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setContent(prevContent => ({ ...prevContent, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        setError('');
        try {
            const response = await fetch('/api/content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content)
            });
            if (!response.ok) throw new Error('No se pudieron guardar los cambios.');
            setMessage('¡Contenido guardado con éxito!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setError('Error al guardar. Intente de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <DashboardLayout onLogout={onLogout}><div className="text-center p-12">Cargando editor...</div></DashboardLayout>;
    }

    return (
        <DashboardLayout onLogout={onLogout}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold font-nunito">Editor de Contenido</h2>
                <button onClick={handleSave} disabled={saving} className="px-6 py-2 font-bold text-white bg-[#0348eb] rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-500">
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>

            {message && <div className="bg-green-500/20 text-green-300 p-3 rounded-md mb-6 text-center">{message}</div>}
            {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-md mb-6 text-center">{error}</div>}

            <div className="space-y-8">
                <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <h3 className="text-xl font-bold font-nunito mb-4 border-b border-white/10 pb-2">Sección Principal (Hero)</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Título Principal</label>
                            <input type="text" name="hero_title" value={content.hero_title || ''} onChange={handleInputChange} className="w-full px-4 py-2 text-white bg-white/10 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[#0348eb]" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Subtítulo</label>
                            <textarea name="hero_subtitle" value={content.hero_subtitle || ''} onChange={handleInputChange} rows="3" className="w-full px-4 py-2 text-white bg-white/10 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[#0348eb]" />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

// --- Componente Principal de la Aplicación ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleLoginSuccess = () => { setIsLoggedIn(true); };
  const handleLogout = () => { setIsLoggedIn(false); };

  return (
    <div className="relative">
       <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800&family=Roboto:wght@400;500&display=swap');
        body { font-family: 'Roboto', sans-serif; background-color: #222222; background-image: radial-gradient(circle at 100% 100%, rgba(3, 72, 235, 0.1), transparent 50%), radial-gradient(circle at 0% 100%, rgba(3, 72, 235, 0.05), transparent 60%); background-attachment: fixed; }
        .font-nunito { font-family: 'Nunito', sans-serif; }
        .font-roboto { font-family: 'Roboto', sans-serif; }
      `}</style>
      <ParticleBackground />
      <div className="relative z-10">
        {isLoggedIn ? <DashboardEditor onLogout={handleLogout} /> : <LoginForm onLoginSuccess={handleLoginSuccess} />}
      </div>
    </div>
  );
}

