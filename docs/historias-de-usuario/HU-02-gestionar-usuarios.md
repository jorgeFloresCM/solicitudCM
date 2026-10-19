# HU-02 · Gestionar usuarios

| | |
|---|---|
| **Formulario** | Crear / Editar usuario (ventana modal en `/usuarios`) |
| **Prioridad** | Alta |
| **Roles** | Administrador |
| **Estado** | ✅ Hecho (con pendientes) |
| **Endpoints** | `GET /api/usuarios` · `POST /api/usuarios` · `PATCH /api/usuarios/:id` |

## Historia

**Como** administrador del sistema,
**quiero** ver, crear y editar usuarios (incluida su contraseña, rol y estado),
**para** controlar quién puede entrar y qué puede hacer cada persona.

## Formulario

| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| Nombre completo | texto | Sí | Mínimo 2 caracteres |
| Correo institucional | correo | Sí | Formato válido; **único** en el sistema (no distingue mayúsculas) |
| Contraseña inicial / Nueva contraseña | contraseña | Al crear: sí. Al editar: no | Mínimo 8 caracteres. Al editar, vacío = no cambiarla |
| Unidad | lista | Sí | Valores del catálogo de unidades (HU-04) |
| Rol | lista | Sí | Administrador, Técnico, Consulta, Jefe de Sistemas, Directivo, Encargado, Solicitante |
| Estado | lista | Sí | Activo / Inactivo |

## Criterios de aceptación

- [x] **Dado** que soy administrador, **cuando** abro Usuarios, **entonces** veo la lista con nombre, correo, unidad, rol y estado.
- [x] **Dado** el formulario de creación completo y válido, **cuando** pulso «Guardar», **entonces** el usuario aparece en la lista y puede iniciar sesión con la contraseña indicada.
- [x] **Dado** un correo que ya existe, **cuando** guardo, **entonces** veo «Ya existe un usuario con ese correo» dentro del formulario.
- [x] **Dado** una contraseña de menos de 8 caracteres, **cuando** guardo, **entonces** veo el aviso y no se crea el usuario.
- [x] **Dado** que edito un usuario y dejo la contraseña vacía, **cuando** guardo, **entonces** su contraseña anterior sigue siendo válida.
- [x] **Dado** que edito un usuario y escribo una contraseña nueva, **cuando** guardo, **entonces** la anterior deja de funcionar.
- [x] **Dado** un usuario puesto en *Inactivo*, **cuando** intenta ingresar o ya tenía sesión, **entonces** pierde el acceso de inmediato.
- [x] **Dado** que soy administrador, **cuando** intento desactivarme o quitarme el rol de Administrador, **entonces** el sistema lo impide (evita dejar el sistema sin administrador).
- [x] **Dado** un usuario que no es administrador, **cuando** intenta entrar a `/usuarios` o llamar la API, **entonces** es rechazado (403) y el menú ni siquiera muestra la opción.
- [ ] **Dado** muchos usuarios, **entonces** puedo buscar y filtrar por nombre, rol o estado. *(Pendiente)*

## Reglas de negocio

- Los usuarios **no se eliminan**; se desactivan, para conservar el historial de boletas.
- Los técnicos que aparecen al asignar boletas (HU-06) son los usuarios con rol *Técnico* y estado *Activo*.
- El correo se guarda siempre en minúsculas.

## Fuera de alcance (backlog)

- Búsqueda, filtros y paginación en la lista.
- Importación masiva desde Excel/CSV.
- Registro de auditoría (quién cambió qué y cuándo).

## Referencias de código

`frontend/app/(app)/usuarios/page.tsx` · `backend/src/usuarios/usuarios.module.ts` · `backend/src/entities/index.ts` (entidad `Usuario`)

## Cómo probar a mano

1. Como administrador, crear «Pedro Test» con rol Solicitante y contraseña de 8+ caracteres.
2. Cerrar sesión y entrar con él.
3. Volver como administrador, ponerlo *Inactivo* y confirmar que ya no puede entrar.
4. Intentar desactivar a la propia administradora → debe rechazarlo.
