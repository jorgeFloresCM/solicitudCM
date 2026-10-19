# HU-06 · Bandeja de solicitudes: asignar técnico y cambiar estado

| | |
|---|---|
| **Formulario** | Controles de cada tarjeta en la bandeja (`/solicitudes`): lista «Asignar técnico» y lista «Estado», más el filtro por estado |
| **Prioridad** | Alta |
| **Roles** | Jefe de Sistemas, Administrador, Técnico |
| **Estado** | ✅ Hecho (con pendientes) |
| **Endpoints** | `GET /api/boletas` · `PATCH /api/boletas/:id` · `GET /api/catalogos` |

## Historia

**Como** jefe de sistemas o técnico,
**quiero** ver las boletas entrantes, asignarlas a un técnico y actualizar su estado,
**para** que cada problema tenga un responsable y se sepa en qué punto de la atención está.

## Controles

| Control | Opciones | Efecto |
|---|---|---|
| Filtro (arriba) | Todas · Pendiente · Asignada · En atención · Resuelta | Solo cambia lo que se ve |
| Asignar técnico | Técnicos activos | Guarda el responsable de la boleta |
| Estado | Pendiente · Asignada · En atención · Resuelta | Guarda el nuevo estado |

## Criterios de aceptación

- [x] **Dado** que abro la bandeja, **entonces** veo las boletas de la más reciente a la más antigua, con ID, prioridad, estado, fecha, tipo de error, unidad, descripción y solicitante.
- [x] **Dado** una boleta *Pendiente*, **cuando** le asigno un técnico, **entonces** pasa automáticamente a *Asignada*.
- [x] **Dado** una boleta en otro estado (p. ej. *En atención*), **cuando** le asigno o cambio de técnico, **entonces** el estado **no** cambia.
- [x] **Dado** una boleta, **cuando** cambio su estado, **entonces** se guarda en la base de datos y se mantiene al recargar la página.
- [x] **Dado** que marco una boleta como *Resuelta*, **entonces** se registra la fecha y hora de resolución (alimenta el «tiempo promedio de atención» del Dashboard).
- [x] **Dado** que reabro una boleta *Resuelta* (cambio a otro estado), **entonces** se borra su fecha de resolución.
- [x] **Dado** que el servidor rechaza el cambio (p. ej. sesión vencida o permisos), **entonces** veo el mensaje de error sobre la lista.
- [x] **Dado** un rol sin permiso (Consulta, Directivo…), **entonces** no ve «Solicitudes» y la API rechaza el cambio (403).
- [ ] **Dado** una boleta, **entonces** puedo ver el historial de cambios (quién asignó, quién cambió el estado y cuándo). *(Pendiente)*
- [ ] **Dado** que un técnico entra, **entonces** puede filtrar «solo mis boletas». *(Pendiente)*
- [ ] **Dado** el estado *Observada* (existe en el sistema), **entonces** puede elegirse desde la bandeja. *(Pendiente: hoy solo está en el backend; confirmar si se usa.)*

## Reglas de negocio

- Solo pueden asignarse usuarios con rol *Técnico* y estado *Activo*.
- Cualquier técnico puede reasignar o cambiar cualquier boleta (no solo las suyas). **A confirmar con el equipo** si debe restringirse.

## Fuera de alcance (backlog)

- Comentarios o notas de atención dentro de la boleta.
- Aviso al técnico al recibir una asignación y al solicitante cuando se resuelve.
- Tiempos objetivo (SLA) por prioridad.

## Referencias de código

`frontend/app/(app)/solicitudes/page.tsx` · `frontend/components/hooks.ts` (`useBoletas`) · `backend/src/boletas/boletas.module.ts` (`PATCH`)

## Cómo probar a mano

1. Entrar como administradora, abrir Solicitudes.
2. Asignar un técnico a una boleta *Pendiente* → debe pasar a *Asignada*.
3. Cambiarla a *Resuelta* y revisar que el Dashboard muestre un tiempo promedio.
4. Recargar la página: los cambios deben mantenerse.
