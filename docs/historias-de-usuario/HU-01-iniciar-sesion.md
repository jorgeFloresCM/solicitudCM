# HU-01 · Iniciar y cerrar sesión

| | |
|---|---|
| **Formulario** | Login (`/`) |
| **Prioridad** | Alta |
| **Roles** | Todos |
| **Estado** | ✅ Hecho (con un pendiente menor) |
| **Endpoints** | `POST /api/auth/login` · `GET /api/auth/me` · `POST /api/auth/logout` |

## Historia

**Como** usuario de la institución,
**quiero** ingresar con mi correo institucional y mi contraseña,
**para** acceder solo a las opciones del sistema que corresponden a mi rol y que mis acciones queden a mi nombre.

## Formulario

| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| Correo institucional | correo | Sí | Formato de correo válido |
| Contraseña | contraseña | Sí | — |

## Criterios de aceptación

- [x] **Dado** un usuario activo con credenciales correctas, **cuando** pulsa «Ingresar», **entonces** entra al Dashboard y su sesión dura 8 horas.
- [x] **Dado** un correo o contraseña incorrectos, **cuando** pulsa «Ingresar», **entonces** ve «Correo o contraseña incorrectos» y permanece en el login.
- [x] **Dado** un usuario con estado *Inactivo*, **cuando** intenta ingresar, **entonces** ve el mismo mensaje genérico (el sistema no revela qué correos existen).
- [x] **Dado** que el botón está procesando la petición, **entonces** aparece deshabilitado («Ingresando…») para evitar envíos dobles.
- [x] **Dado** un usuario con sesión, **cuando** pulsa «Cerrar sesión», **entonces** la sesión termina y vuelve al login; las pantallas ya no cargan datos.
- [x] **Dado** una sesión vencida o un usuario desactivado mientras navega, **cuando** hace cualquier acción, **entonces** vuelve al login.
- [x] **Dado** un usuario sin sesión, **cuando** abre una pantalla interna (`/dashboard`, etc.), **entonces** es enviado al login.
- [ ] **Dado** que se superan 10 intentos de login en un minuto, **entonces** el sistema bloquea temporalmente y muestra un mensaje en español claro. *(El bloqueo existe; el mensaje que se ve aún es el técnico de la librería. Pendiente.)*

## Reglas de negocio

- Las contraseñas se guardan con hash (bcrypt) y nunca viajan al navegador.
- La sesión es una cookie `httpOnly` (JavaScript no puede leerla). El rol se consulta al servidor en cada petición: si el administrador cambia el rol o desactiva al usuario, el cambio rige de inmediato.
- El rol **no se elige** en el login: lo define el administrador (ver HU-02).

## Fuera de alcance (backlog)

- Recuperar contraseña por correo.
- Que cada usuario cambie su propia contraseña (hoy solo lo hace el administrador desde HU-02).
- Doble factor de autenticación.

## Referencias de código

`frontend/app/page.tsx` · `frontend/app/(app)/layout.tsx` · `backend/src/auth/auth.module.ts` · `backend/src/common/auth.guard.ts`

## Cómo probar a mano

1. Entrar con `mquispe@cmag.gov.bo` / `Cambiar123!` → llega al Dashboard.
2. Probar contraseña errónea → mensaje de error.
3. Probar `emolina@cmag.gov.bo` (inactiva) → mismo mensaje.
4. Cerrar sesión y abrir `/dashboard` directamente → vuelve al login.
