import React, { useState, useEffect } from 'react';

// --- Componentes de la Página Web ---

// Componente para la sección principal (Hero)
function HeroSection({ content }) {
    return (
        <section className="min-h-screen flex items-center justify-center text-center bg-gray-900 text-white p-6">
            <div>
                <h1 className="text-5xl md:text-7xl font-bold">{content.hero_title || 'Título de Bienvenida'}</h1>
                <p className="text-xl md:text-2xl mt-4 text-gray-300">{content.hero_subtitle || 'Un subtítulo atractivo sobre tu negocio.'}</p>
            </div>
        </section>
    );
}

// Componente para la sección de servicios
function ServicesSection({ content }) {
    const services = [
        { title: content.service1_title, desc: content.service1_desc },
        { title: content.service2_title, desc: content.service2_desc },
        { title: content.service3_title, desc: content.service3_desc },
    ];

    return (
        <section className="py-20 bg-gray-800 text-white p-6">
            <div className="container mx-auto text-center">
                <h2 className="text-4xl font-bold mb-12">{content.services_title || 'Nuestros Servicios'}</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <div key={index} className="bg-gray-700 p-8 rounded-lg">
                            <h3 className="text-2xl font-bold mb-4">{service.title || `Servicio ${index + 1}`}</h3>
                            <p className="text-gray-300">{service.desc || 'Descripción detallada del servicio que ofreces.'}</p>
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
        // Para pruebas locales, podríamos hardcodear un dominio de prueba.
        // const domain = 'test.com'; // Ojo: Reemplazar en producción
        const domain = window.location.hostname;

        // 2. Llamamos a nuestra API pública para pedir el contenido
        // AVISO: Reemplaza 'portal.onlinemid.com' con el dominio real de tu portal
        const apiUrl = `https://portal.onlinemid.com/api/public/content?domain=${domain}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`El sitio para "${domain}" no ha sido configurado o no se encuentra.`);
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
  }, []); // El array vacío asegura que esto se ejecute solo una vez, al cargar la página

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Cargando sitio...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-center p-6">
        <div>
            <h1 className="text-3xl font-bold text-red-500">Error</h1>
            <p className="mt-2 text-gray-300">{error}</p>
            <p className="mt-4 text-sm text-gray-500">Contacte al administrador del sitio.</p>
        </div>
    </div>;
  }

  return (
    <div>
      {/* 3. Renderizamos los componentes pasándoles el contenido dinámico */}
      <HeroSection content={content} />
      <ServicesSection content={content} />
      {/* Aquí podrías añadir más componentes como Footer, Contacto, etc. */}
    </div>
  );
}
