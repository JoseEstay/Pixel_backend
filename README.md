# Pixel_backend

API REST en desarrollo para administrar categorías y productos. Está construida con Node.js, Express y PostgreSQL, con validación de datos mediante Zod.

## Estado del proyecto

Las operaciones CRUD de productos y categorías están implementadas. La autenticación incluye registro e inicio de sesión con hash de contraseñas, JWT en una cookie HTTP-only, cierre de sesión y una ruta protegida. Es una implementación en desarrollo y no debe considerarse lista para producción.

## Tecnologías

- Node.js y Express 5
- PostgreSQL y `pg`
- Zod para validar solicitudes
- bcrypt para el hash de contraseñas
- jsonwebtoken para crear y validar JWT

## Requisitos

- Node.js
- pnpm
- PostgreSQL

## Configuración local

1. Instala las dependencias:

   ```bash
   pnpm install
   ```

2. Crea un archivo local `.env` en la raíz del proyecto con la configuración de tu PostgreSQL y una clave JWT propia:

   ```env
   PORT=3002
   DB_USER=tu_usuario_local
   DB_PASSWORD=tu_contraseña_local
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=tu_base_de_datos
   JWT_SECRET=tu_clave_secreta_local
   ```

   Usa tus propios valores. El archivo `.env` está excluido de Git; no publiques contraseñas, claves JWT ni otras credenciales.

3. Prepara en PostgreSQL las tablas que usan los modelos del proyecto. Este repositorio no incluye migraciones de base de datos.

4. Inicia el servidor en modo desarrollo:

   ```bash
   pnpm dev
   ```

   El servidor usa el puerto `3002` por defecto. Puedes cambiarlo con `PORT`.

## Endpoints

Las solicitudes que crean o actualizan recursos reciben JSON.

### Categorías

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/categories` | Listar categorías |
| GET | `/categories/:id` | Obtener una categoría |
| POST | `/categories` | Crear una categoría |
| PUT | `/categories/:id` | Reemplazar los datos de una categoría |
| PATCH | `/categories/:id` | Actualizar parcialmente una categoría |
| DELETE | `/categories/:id` | Eliminar una categoría |

### Productos

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/products` | Listar productos |
| GET | `/products/:id` | Obtener un producto |
| POST | `/products` | Crear un producto |
| PUT | `/products/:id` | Reemplazar los datos de un producto |
| PATCH | `/products/:id` | Actualizar parcialmente un producto |
| DELETE | `/products/:id` | Eliminar un producto |

### Autenticación

| Método | Ruta | Acción |
| --- | --- | --- |
| POST | `/auth/signup` | Registrar un usuario |
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/logout` | Cerrar sesión y borrar la cookie |
| GET | `/auth/protected` | Probar acceso con sesión autenticada |

La sesión se entrega en una cookie HTTP-only. Las solicitudes de navegador que modifican datos deben proceder de un origen permitido.

## Seguridad

- No subas archivos `.env`, contraseñas, tokens ni credenciales.
- Configura la clave `JWT_SECRET` y los datos de PostgreSQL localmente mediante variables de entorno.
- La autenticación y sus medidas de seguridad siguen en desarrollo; revisa y adapta la configuración antes de usarla en producción.
- 
