# SGI — Sistema de Gestión de Solicitudes
## Unidad de Informática · Consejo de la Magistratura

Monorepo con dos aplicaciones:

| Carpeta | Qué es | Puerto |
|---|---|---|
| `frontend/` | Next.js 14 (App Router) + TypeScript + Tailwind (el proyecto original, ahora conectado a la API) | 3000 |
| `backend/` | API REST con **NestJS** + **TypeORM** + **PostgreSQL** | 4000 |

El navegador solo habla con el frontend: Next reenvía `/api/*` al backend (ver `frontend/next.config.js`). Así la cookie de sesión es del mismo origen y no hace falta configurar CORS.

## Requisitos
- Node.js 18+ y npm
- PostgreSQL 14+ (o Docker, para usar el `docker-compose.yml` incluido)

## Puesta en marcha

```bash
# 1) Base de datos (con Docker; si ya tienes PostgreSQL, crea una BD "sgi" y ajusta DATABASE_URL)
docker compose up -d

# 2) Backend
cd backend
cp .env.example .env          # y cambia JWT_SECRET:  openssl rand -hex 32
npm install
npm run seed                  # crea tablas y datos iniciales
npm run start:dev             # http://localhost:4000/api

# 3) Frontend (otra terminal)
cd frontend
npm install
npm run dev                   # http://localhost:3000
```

### Usuarios iniciales (contraseña: `Cambiar123!`, configurable con `SEED_PASSWORD`)

| Correo | Rol |
|---|---|
| mquispe@cmag.gov.bo | Administrador |
| arojas@cmag.gov.bo, jcalderon@cmag.gov.bo, apedrana@cmag.gov.bo, rsoto@cmag.gov.bo, mcartagena@cmag.gov.bo | Técnico |
| jperez@cmag.gov.bo, lparedes@cmag.gov.bo | Consulta |
| cvargas@cmag.gov.bo | Directivo |
| emolina@cmag.gov.bo | Consulta (inactiva, no puede entrar) |

**Cambia estas contraseñas antes de usar el sistema con datos reales** (Usuarios → Editar → Nueva contraseña).

## Estructura del backend

```
backend/src/
  main.ts                    arranque, prefijo /api, validación global, cookies
  app.module.ts              módulos + guards globales (límite de peticiones y autenticación)
  common/auth.guard.ts       sesión por cookie JWT + roles (@Roles) + rutas públicas (@Public)
  entities/index.ts          tablas: usuarios, unidades, tipos_error, boletas, respaldos, secuencias
  auth/                      POST /auth/login · GET /auth/me · POST /auth/logout
  usuarios/                  CRUD de usuarios (solo Administrador)
  catalogos/                 GET /catalogos (unidades, tipos de error, técnicos, roles)  — HU-04
  boletas/                   GET/POST /boletas · PATCH /boletas/:id (asignar técnico, cambiar estado)
  respaldos/                 subida, visor y borrado de PDF/imágenes
  estadisticas/              GET /estadisticas (dashboard)
  database/seed.ts           datos iniciales
```

## Permisos por rol (los aplica el backend, no solo el menú)

| Acción | Roles permitidos |
|---|---|
| Gestionar usuarios | Administrador |
| Crear boleta | Solicitante, Administrador, Encargado, Consulta |
| Asignar técnico / cambiar estado | Jefe de Sistemas, Administrador, Técnico |
| Ver boletas, reportes, dashboard, catálogos | cualquier usuario con sesión |
| Eliminar respaldo | Administrador, Técnico o quien lo subió |

## Decisiones y detalles a tener en cuenta
- **Contraseñas** con bcrypt; nunca salen en las respuestas de la API. El login tiene límite de 10 intentos por minuto.
- **Sesión**: cookie `httpOnly` con JWT de 8 h. El usuario se relee de la BD en cada petición, así que desactivar a alguien le corta el acceso de inmediato.
- **Número de boleta** (`BOL-AAAA-NNN`): lo genera la base con un contador atómico por año; varias boletas simultáneas no pueden repetir número.
- **Tiempo promedio de atención** del dashboard ahora se calcula (antes era un texto fijo): media de resolución − creación de las boletas resueltas.
- **Respaldos**: se guardan en `backend/uploads/` con nombre generado por el servidor; en la BD queda solo el nombre original, tipo y tamaño. Solo PDF, PNG, JPG y WEBP, máx. 10 MB. No hay URL pública: se sirven únicamente con sesión. **Incluye esa carpeta en tus copias de seguridad** junto con la BD.
- **Catálogos**: corregí erratas en los datos iniciales (“Caambio de Estado”, “Valoradoss”, “tecnico”). Las unidades y tipos de error ahora son tablas (`unidades`, `tipos_error`); aún no hay pantalla para editarlas.
- **Rol Consulta**: no tenía ninguna opción de menú en el prototipo; ahora ve Dashboard, Nueva Boleta y Reportes.
- **Técnicos**: la lista para asignar sale de los usuarios con rol Técnico activos (ya no es una lista fija en el código).
- Actualicé Next.js de 14.2.5 a 14.2.35 (la 14.2.5 tiene avisos de seguridad).

## Para producción
1. `DB_SYNCHRONIZE=false` y manejar el esquema con migraciones de TypeORM (con `true` TypeORM modifica las tablas al arrancar; solo para desarrollo).
2. `JWT_SECRET` largo y aleatorio; `COOKIE_SECURE=true` y servir todo por HTTPS.
3. `BACKEND_URL` en el entorno del frontend si el backend no está en `localhost:4000`.
4. Compilar: `npm run build` en cada carpeta; arrancar con `npm start`.
