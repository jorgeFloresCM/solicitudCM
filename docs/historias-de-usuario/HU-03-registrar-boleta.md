# HU-03 · Registrar boleta de error

| | |
|---|---|
| **Formulario** | Registro de boleta de error (`/boletas`) |
| **Prioridad** | Alta |
| **Roles** | Solicitante, Administrador, Encargado, Consulta |
| **Estado** | ✅ Hecho (con pendientes) |
| **Endpoints** | `POST /api/boletas` · `POST /api/respaldos` (adjuntos) · `GET /api/catalogos` |

## Historia

**Como** funcionario de una unidad,
**quiero** registrar una boleta describiendo el problema que tengo y adjuntar mis respaldos,
**para** que la Unidad de Informática lo atienda y yo pueda hacerle seguimiento.

## Formulario

| Campo | Tipo | Obligatorio | Validación / comportamiento |
|---|---|---|---|
| Nombre del solicitante | texto | Sí | Mínimo 2 caracteres. Se precarga con mi nombre, editable (por si registro a nombre de otra persona) |
| Unidad solicitante | lista | Sí | Catálogo de unidades (HU-04) |
| Tipo de error | lista | Sí | Catálogo de tipos de error (HU-04) |
| Prioridad | lista | Sí | Alta (impide el trabajo) · Media (afecta parcialmente, por defecto) · Baja (consulta general) |
| Descripción detallada | texto largo | Sí | Mínimo 3 caracteres |
| Respaldos digitalizados | archivos | No | PDF, PNG, JPG o WEBP · máx. 10 MB c/u · hasta 10 archivos |

## Criterios de aceptación

- [x] **Dado** el formulario completo, **cuando** pulso «Registrar boleta», **entonces** se crea la boleta en estado *Pendiente*, con la fecha de hoy y un número `BOL-AAAA-NNN`, y veo la confirmación con ese número.
- [x] **Dado** que dos personas registran boletas al mismo tiempo, **entonces** cada una recibe un número distinto (el número se genera de forma atómica en la base de datos).
- [x] **Dado** que adjunto archivos válidos, **cuando** registro la boleta, **entonces** quedan asociados a la boleta nueva y los veo en Respaldos (HU-09).
- [x] **Dado** que la boleta se crea pero un adjunto falla, **entonces** la boleta **no se pierde** y veo un aviso indicando que puedo adjuntar el archivo luego en Respaldos.
- [x] **Dado** un campo obligatorio vacío, **cuando** intento enviar, **entonces** el navegador me lo señala y no se envía.
- [x] **Dado** que se está enviando, **entonces** el botón se deshabilita («Registrando…»).
- [x] **Dado** que soy Administrador, Jefe de Sistemas o Técnico, **cuando** termino, **entonces** voy a la bandeja de Solicitudes; los demás roles van al Dashboard (no tienen acceso a la bandeja).
- [x] **Dado** un rol sin permiso para crear boletas (p. ej. Técnico), **entonces** no ve la opción «Nueva Boleta» y la API rechaza la petición.
- [ ] **Dado** una boleta creada, **entonces** el solicitante recibe un aviso por correo con su número. *(Pendiente)*
- [ ] **Dado** que quiero ver mis propias boletas, **entonces** existe una vista «Mis boletas». *(Pendiente: hoy todos los roles ven todas las boletas en Reportes/Dashboard)*

## Reglas de negocio

- El número de boleta reinicia cada año (`BOL-2026-001`, `BOL-2027-001`…).
- La fecha de registro es la del día en la zona horaria `America/La_Paz` (configurable con `APP_TZ`).
- Una boleta siempre nace *Pendiente* y sin técnico.
- Se guarda quién la registró (usuario en sesión), independiente del nombre de «solicitante» escrito.

## Fuera de alcance (backlog)

- Notificaciones por correo.
- Vista «Mis boletas».
- Editar o anular una boleta ya registrada.

## Referencias de código

`frontend/app/(app)/boletas/page.tsx` · `backend/src/boletas/boletas.module.ts` · `backend/src/respaldos/respaldos.module.ts`

## Cómo probar a mano

1. Entrar como `jperez@cmag.gov.bo` (Consulta) y registrar una boleta con un PDF adjunto.
2. Verificar en el Dashboard que sube el total y que aparece en «Últimas boletas».
3. Entrar como administrador y ver la boleta en Solicitudes con su respaldo en Respaldos.
4. Entrar como técnico (`arojas@cmag.gov.bo`): no debe aparecer «Nueva Boleta».
