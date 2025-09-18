import React, { useState, useEffect } from 'react';

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
export default function DashboardEditor({ onLogout }) {
    // Estado para manejar los datos del formulario
    const [content, setContent] = useState({
        heroTitle: '',
        heroSubtitle: '',
        servicesTitle: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Efecto para cargar los datos iniciales de la web del cliente
    useEffect(() => {
        // En una aplicación real, aquí harías fetch a tu API para obtener el contenido
        // fetch('/api/content') -> setContent(data)
        // Por ahora, simulamos la carga con datos de ejemplo
        setTimeout(() => {
            setContent({
                heroTitle: 'Dale a tu Negocio la Presencia Online que Merece.',
                heroSubtitle: 'Páginas Web Rápidas, Seguras y Sin Complicaciones.',
                servicesTitle: '¿Tu Página Web Actual te Frena?',
            });
            setLoading(false);
        }, 1500);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setContent(prevContent => ({
            ...prevContent,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        // En una aplicación real, aquí harías una petición POST/PUT a tu API para guardar
        // await fetch('/api/content', { method: 'PUT', body: JSON.stringify(content) })
        console.log('Guardando datos:', content);

        // Simulación de guardado
        setTimeout(() => {
            setSaving(false);
            setMessage('¡Contenido guardado con éxito!');
            setTimeout(() => setMessage(''), 3000); // Ocultar mensaje después de 3 segundos
        }, 2000);
    };

    if (loading) {
        return (
            <DashboardLayout onLogout={onLogout}>
                <div className="text-center p-12">Cargando editor...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout onLogout={onLogout}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold font-nunito">Editor de Contenido</h2>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 font-bold text-white bg-[#0348eb] rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-500"
                >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>

            {message && <div className="bg-green-500/20 text-green-300 p-3 rounded-md mb-6 text-center">{message}</div>}

            <div className="space-y-8">
                {/* Sección Hero */}
                <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <h3 className="text-xl font-bold font-nunito mb-4 border-b border-white/10 pb-2">Sección Principal (Hero)</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Título Principal</label>
                            <input 
                                type="text"
                                name="heroTitle"
                                value={content.heroTitle}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 text-white bg-white/10 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[#0348eb]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Subtítulo</label>
                            <textarea
                                name="heroSubtitle"
                                value={content.heroSubtitle}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-4 py-2 text-white bg-white/10 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[#0348eb]"
                            />
                        </div>
                    </div>
                </div>

                {/* Sección Servicios */}
                <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <h3 className="text-xl font-bold font-nunito mb-4 border-b border-white/10 pb-2">Sección de Servicios</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Título de la Sección</label>
                            <input 
                                type="text"
                                name="servicesTitle"
                                value={content.servicesTitle}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 text-white bg-white/10 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[#0348eb]"
                            />
                        </div>
                        {/* Aquí añadirías más campos para editar los 3 servicios, etc. */}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
