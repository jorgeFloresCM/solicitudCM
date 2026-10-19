# HU-07 · Reportes e historial con filtros

| | |
|---|---|
| **Formulario** | Filtros de la pantalla Reportes (`/reportes`): Desde, Hasta, Estado, Unidad |
| **Prioridad** | Media |
| **Roles** | Encargado, Jefe de Sistemas, Directivo, Administrador, Consulta |
| **Estado** | ✅ Hecho (con pendientes) |
| **Endpoints** | `GET /api/boletas?desde=&hasta=&estado=&unidad=` |

## Historia

**Como** encargado, directivo o jefe de sistemas,
**quiero** consultar las boletas atendidas y pendientes filtrando por fechas, estado y unidad,
**para** revisar el historial y rendir cuentas de la atención por período y por oficina.

## Formulario (filtros)

| Campo | Tipo | Obligatorio | Comportamiento |
|---|---|---|---|
| Desde | fecha | No | Incluye ese día |
| Hasta | fecha | No | Incluye ese día |
| Estado | lista | No | Todos · Pendiente · Asignada · En atención · Resuelta |
| Unidad | lista | No | Todas · unidades del catálogo (HU-04) |

## Criterios de aceptación

- [x] **Dado** que entro sin filtros, **entonces** veo todas las boletas, con tres contadores: *en reporte*, *pendientes* y *resueltas*.
- [x] **Dado** que cambio cualquier filtro, **entonces** la tabla y los contadores se actualizan de inmediato; el filtrado lo hace la base de datos, no el navegador.
- [x] **Dado** que combino filtros (p. ej. Resuelta + del 01/10 al 05/10), **entonces** solo veo las boletas que cumplen **todos**.
- [x] **Dado** que ninguna boleta cumple, **entonces** veo «No hay resultados con los filtros seleccionados».
- [x] **Dado** cada fila, **entonces** muestro ID, fecha, unidad, tipo de error, técnico (o «—»), prioridad y estado.
- [x] **Dado** un rol sin acceso (Técnico, Solicitante), **entonces** no ve la opción de Reportes.
- [ ] **Dado** un reporte filtrado, **cuando** pulso «Exportar», **entonces** descargo el resultado en Excel/CSV o PDF. *(Pendiente. Probablemente lo primero que pedirá un directivo.)*
- [ ] **Dado** el filtro Estado, **entonces** incluye también *Observada*. *(Pendiente, junto con la decisión de HU-06.)*
- [ ] **Dado** muchos resultados, **entonces** la tabla se pagina. *(Pendiente)*
- [ ] **Dado** que quiero filtrar por técnico o por tipo de error. *(Pendiente)*

## Reglas de negocio

- La fecha filtrada es la **fecha de registro** de la boleta.
- Si «Desde» es posterior a «Hasta», el resultado queda vacío (hoy no se muestra un aviso específico).

## Referencias de código

`frontend/app/(app)/reportes/page.tsx` · `frontend/components/hooks.ts` (`useBoletas`) · `backend/src/boletas/boletas.module.ts` (`listar`)

## Cómo probar a mano

1. Entrar como `cvargas@cmag.gov.bo` (Directivo).
2. Filtrar Estado = Resuelta → una sola boleta del seed.
3. Poner Desde = 2026-10-06 → se ven solo las boletas posteriores a esa fecha.
4. Probar una combinación sin resultados.
