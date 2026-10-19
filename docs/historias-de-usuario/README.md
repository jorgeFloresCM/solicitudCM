# Historias de usuario

Una historia por formulario (o grupo de controles) del sistema. Cada una vive en su propio archivo para que el equipo pueda editarla y revisarla con **pull requests**, igual que el código.

Los números **HU-xx** son los del Sprint 1 original (ver `README.md` de la raíz), por eso no son consecutivos: HU-05 (menú por rol) y HU-08 (dashboard) no son formularios y no tienen archivo aquí.

## Índice

| ID | Historia | Formulario / pantalla | Roles | Estado |
|---|---|---|---|---|
| [HU-01](HU-01-iniciar-sesion.md) | Iniciar y cerrar sesión | Login | Todos | ✅ Hecho (1 pendiente menor) |
| [HU-02](HU-02-gestionar-usuarios.md) | Gestionar usuarios | Crear / editar usuario | Administrador | ✅ Hecho (pendientes: búsqueda) |
| [HU-03](HU-03-registrar-boleta.md) | Registrar boleta de error | Registro de boleta | Solicitante, Administrador, Encargado, Consulta | ✅ Hecho (pendientes: correo, «Mis boletas») |
| [HU-04](HU-04-catalogos-dinamicos.md) | Catálogos dinámicos | Listas desplegables (falta pantalla de administración) | Administrador | 🟡 Parcial |
| [HU-06](HU-06-asignar-y-atender-solicitudes.md) | Asignar técnico y cambiar estado | Bandeja de solicitudes | Jefe de Sistemas, Administrador, Técnico | ✅ Hecho (pendientes: historial) |
| [HU-07](HU-07-reportes-con-filtros.md) | Reportes con filtros | Filtros de reportes | Encargado, Jefe de Sistemas, Directivo, Administrador, Consulta | ✅ Hecho (pendiente: exportar) |
| [HU-09](HU-09-cargar-respaldos.md) | Cargar respaldos | Carga de respaldos | Solicitante, Técnico, Administrador | ✅ Hecho (pendientes menores) |
| [HU-10](HU-10-visualizar-y-eliminar-respaldos.md) | Visualizar y eliminar respaldos | Visor y botón eliminar | Según HU | ✅ Hecho |

**Trabajo pendiente más valioso para repartir al equipo** (cada punto está detallado como casilla sin marcar dentro de su historia):

1. HU-04 — pantalla para administrar unidades y tipos de error.
2. HU-07 — exportar reportes a Excel/PDF.
3. HU-06 — historial de cambios de una boleta y «solo mis boletas» para técnicos.
4. HU-03 — aviso por correo al registrar y «Mis boletas».
5. HU-01 — mensaje en español cuando se bloquea el login por exceso de intentos.

## Cómo está escrita cada historia

- **Historia**: «Como … quiero … para …».
- **Formulario**: tabla de campos con tipo, obligatoriedad y validaciones.
- **Criterios de aceptación**: formato *Dado / Cuando / Entonces*. Casilla marcada `[x]` = ya funciona; `[ ]` = pendiente.
- **Reglas de negocio**, **fuera de alcance**, **referencias de código** y **cómo probar a mano**.

## Cómo trabajar con ellas

1. Cada historia se publica como un *issue* (ver `scripts/crear-issues.sh` y [`CONTRIBUTING.md`](../../CONTRIBUTING.md)). Las casillas se ven en GitHub como una barra de progreso.
2. Quien toma una casilla pendiente crea su rama `feature/HU-xx-…`, la implementa y, **en el mismo pull request**, marca la casilla en el archivo `.md`.
3. Si una regla cambia, se cambia primero aquí (PR de documentación) y se discute antes de programar.
4. Una historia nueva se copia de la plantilla `docs/historias-de-usuario/_plantilla.md` con el siguiente número libre (HU-11, HU-12…).
