# Cloudflare Pages Functions

Este directorio contiene las funciones serverless para Cloudflare Pages.

## Estructura

- `api/[[path]].ts` - Router principal para todas las rutas API con prefijo `/api/*`
- `shared/storage.ts` - Capa de almacenamiento con soporte para D1, KV y memoria
- `_middleware.ts` - Middleware global para CORS

## Configuración de Storage

### Opción 1: Cloudflare D1 (Recomendado)
```bash
# Crear base de datos D1
wrangler d1 create onlinemid-portal-db

# Ejecutar migraciones
wrangler d1 execute onlinemid-portal-db --file=./migrations/0001_initial.sql
```

### Opción 2: Cloudflare KV
```bash
# Crear namespaces KV
wrangler kv:namespace create "USERS_KV"
wrangler kv:namespace create "USERNAME_INDEX_KV"
```

### Opción 3: Memoria (Desarrollo)
Sin configuración necesaria, pero los datos no persisten entre invocaciones.

## Endpoints API

- `GET /api/users/:id` - Obtener usuario por ID
- `GET /api/users/username/:username` - Obtener usuario por nombre de usuario
- `POST /api/users` - Crear nuevo usuario

## Variables de Entorno

- `DB` - Binding para base de datos D1
- `USERS_KV` - Namespace KV para datos de usuarios
- `USERNAME_INDEX_KV` - Namespace KV para índice de nombres de usuario