import React, { useState, useEffect, useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

// --- Componente de Fondo Inmersivo ---
function ParticleBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  // Opciones para las partículas, alineadas con tu branding
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

// --- Componentes de la Página Web Dinámica ---

function HeroSection({ content }) {
    return (
        <section className="min-h-screen flex items-center justify-center text-center text-white p-6">
            <div className="max-w-4xl">
                <h1 className="text-5xl md:text-7xl font-bold font-nunito">{content.hero_title || 'Título de Bienvenida Profesional'}</h1>
                <p className="text-xl md:text-2xl mt-6 text-gray-300 font-roboto">{content.hero_subtitle || 'Un subtítulo atractivo que describe tu negocio y atrae a tus clientes.'}</p>
            </div>
        </section>
    );
}

function ServicesSection({ content }) {
    const services = [
        { title: content.service1_title, desc: content.service1_desc },
        { title: content.service2_title, desc: content.service2_desc },
        { title: content.service3_title, desc: content.service3_desc },
    ];

    return (
        <section className="py-20 text-white p-6">
            <div className="container mx-auto text-center">
                <h2 className="text-4xl font-bold font-nunito mb-12">{content.services_title || 'Nuestros Servicios'}</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                         <div key={index} className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-left">
                            <h3 className="text-2xl font-bold font-nunito mb-4 text-[#0348eb]">{service.title || `Servicio Profesional ${index + 1}`}</h3>
                            <p className="text-gray-300 font-roboto">{service.desc || 'Descripción detallada del servicio que ofreces para convencer a tus clientes.'}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// --- Componente Principal de la Aplicación "Camaleón" ---
export default function App() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContentForDomain = async () => {
      try {
        // 1. Detectamos el dominio actual del visitante
        // PARA PRUEBAS: Forzamos el dominio a ser 'test.com' para que coincida con nuestra base de datos.
        const domain = 'test.com'; 
        // EN PRODUCCIÓN: Usaríamos la siguiente línea en su lugar.
        // const domain = window.location.hostname;

        // 2. Llamamos a nuestra API pública para pedir el contenido
        // AVISO: Reemplaza 'onlinemidweb.pages.dev' con el dominio de tu portal
        const apiUrl = `https://onlinemidweb.pages.dev/api/public/content?domain=${domain}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `El sitio para "${domain}" no ha sido configurado.`);
        }
        const data = await response.json();
        setContent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContentForDomain();
  }, []);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center text-white">
            <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap'); body { font-family: 'Roboto', sans-serif; background-color: #222222; }`}</style>
            <p>Cargando sitio...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen flex items-center justify-center text-white text-center p-6">
            <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700&family=Roboto:wght@400&display=swap'); body { font-family: 'Roboto', sans-serif; background-color: #222222; } .font-nunito { font-family: 'Nunito', sans-serif; }`}</style>
            <div>
                <h1 className="text-3xl font-bold text-red-500 font-nunito">Error al Cargar</h1>
                <p className="mt-2 text-gray-300">{error}</p>
                <p className="mt-4 text-sm text-gray-500">Por favor, contacte al administrador del sitio.</p>
            </div>
        </div>
    );
  }

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

      <main className="relative z-10">
        <HeroSection content={content} />
        <ServicesSection content={content} />
        {/* Aquí es donde añadirías más componentes dinámicos como Footer, Contacto, Galería, etc. */}
      </main>
    </div>
  );
}

