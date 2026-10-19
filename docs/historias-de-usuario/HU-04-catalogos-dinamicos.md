# HU-04 · Catálogos dinámicos (unidades y tipos de error)

| | |
|---|---|
| **Formulario** | Listas desplegables de «Registro de boleta», «Usuarios» y filtros de «Reportes». **Falta** la pantalla de administración |
| **Prioridad** | Media |
| **Roles** | Lectura: todos · Administración: Administrador |
| **Estado** | 🟡 Parcial: los catálogos se leen de la base de datos, pero aún no se pueden editar desde el sistema |
| **Endpoints** | `GET /api/catalogos` |

## Historia

**Como** administrador,
**quiero** mantener las listas de unidades y tipos de error desde el sistema,
**para** no depender de un desarrollador cada vez que cambia una oficina o aparece un nuevo tipo de problema.

## Criterios de aceptación

Parte ya hecha:

- [x] **Dado** cualquier formulario con lista de unidades o tipos de error, **entonces** las opciones salen de la base de datos (tablas `unidades` y `tipos_error`), no del código.
- [x] **Dado** un catálogo con un elemento marcado como inactivo, **entonces** ya no se ofrece en los formularios nuevos.
- [x] **Dado** la lista de técnicos al asignar boletas, **entonces** sale de los usuarios activos con rol *Técnico*.

Parte pendiente (esta es la historia por construir):

- [ ] **Dado** que soy administrador, **cuando** abro «Catálogos», **entonces** veo las unidades y los tipos de error en dos listas.
- [ ] **Dado** el formulario «Nuevo elemento» (campo: nombre, obligatorio, único), **cuando** guardo, **entonces** aparece de inmediato en los formularios de todo el sistema.
- [ ] **Dado** un elemento existente, **cuando** lo renombro, **entonces** el cambio se refleja en las listas. *(Decidir: ¿las boletas antiguas conservan el nombre viejo? Hoy la boleta guarda el texto, no una referencia.)*
- [ ] **Dado** un elemento que ya no se usa, **cuando** lo desactivo, **entonces** deja de ofrecerse pero las boletas históricas lo conservan.
- [ ] **Dado** un usuario que no es administrador, **entonces** no ve la opción ni puede llamar a la API de edición.

## Reglas de negocio

- Nunca se borra un elemento de catálogo en uso: se desactiva.
- Los nombres son únicos dentro de su catálogo.

## Pendiente de decidir con el equipo

- Si una boleta debe guardar una **referencia** al catálogo (más robusto al renombrar) o el **texto** (como hoy).
- Quién puede administrar los catálogos además del Administrador (¿Jefe de Sistemas?).

## Referencias de código

`backend/src/catalogos/catalogos.module.ts` · `backend/src/entities/index.ts` (`Unidad`, `TipoError`) · `backend/src/database/seed.ts` (datos iniciales)

## Cómo probar a mano (parte hecha)

1. Abrir «Nueva Boleta» y confirmar que las listas muestran las unidades y tipos del seed.
2. En la base de datos, poner `activo = false` a una unidad y recargar: ya no debe aparecer.
