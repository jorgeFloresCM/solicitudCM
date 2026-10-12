# SGI — Sistema de Gestión de Solicitudes
## Unidad de Informática · Consejo de la Magistratura

Proyecto Next.js 14 (App Router) + TypeScript + Tailwind CSS con estilo gráfico PayPal.
Cubre las historias de usuario del Sprint 1 (HU-01 a HU-10).

## Requisitos
- Node.js 18+ y npm

## Instalación
```bash
npm install
npm run dev
```
Abrir http://localhost:3000

## Estructura
- `app/page.tsx` — Login con selección de rol (HU-01)
- `app/(app)/layout.tsx` — Shell con menú de navegación por rol (HU-01, HU-05)
- `app/(app)/dashboard/page.tsx` — Dashboard estadístico (HU-08)
- `app/(app)/usuarios/page.tsx` — Gestión visual de usuarios (HU-02)
- `app/(app)/boletas/page.tsx` — Registro de boletas y catálogos dinámicos (HU-03, HU-04)
- `app/(app)/solicitudes/page.tsx` — Bandeja y asignación de técnicos (HU-06)
- `app/(app)/reportes/page.tsx` — Reportes con filtros fecha/estado/unidad (HU-07)
- `app/(app)/respaldos/page.tsx` — Carga de respaldos y visor modal (HU-09, HU-10)
- `lib/data.ts` — Tipos, catálogos y datos mock (localStorage, listo para migrar a API)
- `components/ui.tsx` — Kit de componentes estilo PayPal

## Datos
La persistencia usa localStorage. Para producción, sustituir `lib/data.ts`
por Route Handlers + base de datos (p. ej. Prisma + PostgreSQL).
