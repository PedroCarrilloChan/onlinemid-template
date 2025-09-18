// Nota de Seguridad Importante:
// Este es un ejemplo simplificado. En una aplicación real, NUNCA debes guardar
// las contraseñas en texto plano en la base de datos. Debes usar una librería
// como 'bcrypt' para "hashear" la contraseña antes de guardarla y para compararla
// durante el login. Además, para manejar la sesión, deberías generar un Token JWT.
// ¡Este es un excelente siguiente paso para investigar y fortalecer tu plataforma!

// Esta es la estructura básica que define una Cloudflare Function
interface Env {
  DB: D1Database; // Así TypeScript sabe que 'DB' es nuestra base de datos D1
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    // 1. Obtener los datos del cuerpo de la petición (el formulario de login)
    const { email, password } = await context.request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Correo y contraseña son requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Acceder a nuestra base de datos D1
    const db = context.env.DB;

    // 3. Buscar al usuario en la tabla 'Usuarios' por su email
    const userQuery = db.prepare("SELECT * FROM Usuarios WHERE email = ?");
    const user = await userQuery.bind(email).first();

    // 4. Verificar si el usuario existe y si la contraseña coincide
    //    (Recuerda, en un sistema real, aquí compararías el hash de la contraseña)
    if (!user || user.password_hash !== password) {
      return new Response(JSON.stringify({ error: 'Credenciales inválidas' }), {
        status: 401, // 401 significa "No Autorizado"
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 5. Si todo es correcto, enviamos una respuesta de éxito.
    //    (Aquí es donde generarías y devolverías un token JWT)
    return new Response(JSON.stringify({ 
        success: true, 
        message: 'Inicio de sesión exitoso',
        // En un futuro: token: 'jwt_token_generado_aqui' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
