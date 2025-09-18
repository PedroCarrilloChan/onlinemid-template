// Interfaz para definir el entorno, incluyendo nuestra base de datos D1.
interface Env {
  DB: D1Database;
}

// NOTA IMPORTANTE SOBRE SEGURIDAD:
// Este es un ejemplo para empezar. En un sistema de producción real, necesitarías
// un sistema de tokens (JWT) para verificar la identidad del usuario en cada petición
// y asegurarte de que solo pueda editar el contenido de su propio sitio.
// Por ahora, simularemos que siempre trabajamos con un sitio de prueba.

/**
 * Maneja las peticiones GET para obtener el contenido de un sitio.
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;

    // SIMULACIÓN: En un sistema real, obtendrías el sitioId del token del usuario.
    // Por ahora, usaremos un ID fijo para nuestro sitio de prueba.
    const sitioIdDePrueba = 'sitio_test_001'; 

    // Preparamos la consulta para obtener todo el contenido de un sitio específico.
    const stmt = db.prepare("SELECT clave, valor FROM ContenidoWeb WHERE sitio_id = ?");
    const { results } = await stmt.bind(sitioIdDePrueba).all();

    // Convertimos el resultado (un array de objetos) en un solo objeto clave-valor.
    const contentObject = results.reduce((obj, item) => {
      obj[item.clave] = item.valor;
      return obj;
    }, {});

    return new Response(JSON.stringify(contentObject), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error al obtener contenido:", error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

/**
 * Maneja las peticiones PUT para actualizar el contenido de un sitio.
 */
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const newContent = await context.request.json();

    // SIMULACIÓN: ID fijo para nuestro sitio de prueba.
    const sitioIdDePrueba = 'sitio_test_001';

    // Preparamos una sentencia de actualización. 
    // "UPSERT": si la clave ya existe, la actualiza; si no, la inserta.
    const stmt = db.prepare(
      "INSERT INTO ContenidoWeb (sitio_id, clave, valor) VALUES (?, ?, ?) ON CONFLICT(sitio_id, clave) DO UPDATE SET valor = excluded.valor"
    );

    // Creamos un array de sentencias para ejecutarlas todas juntas en una transacción.
    const batch = Object.entries(newContent).map(([key, value]) => 
        stmt.bind(sitioIdDePrueba, key, value)
    );

    await db.batch(batch);

    return new Response(JSON.stringify({ success: true, message: 'Contenido actualizado' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error al guardar contenido:", error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
