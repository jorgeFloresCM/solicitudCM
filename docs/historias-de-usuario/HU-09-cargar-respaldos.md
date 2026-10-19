# HU-09 · Cargar respaldos digitalizados

| | |
|---|---|
| **Formulario** | Carga de respaldos (`/respaldos`) y el campo de adjuntos de «Registro de boleta» |
| **Prioridad** | Alta |
| **Roles** | Menú: Solicitante, Técnico, Administrador · La API acepta a cualquier usuario con sesión (así se puede adjuntar desde «Nueva Boleta») |
| **Estado** | ✅ Hecho (con pendientes) |
| **Endpoints** | `POST /api/respaldos` (multipart) · `GET /api/respaldos` |

## Historia

**Como** solicitante o técnico,
**quiero** adjuntar documentos escaneados o capturas de pantalla a una boleta,
**para** dejar constancia del problema o de su solución sin depender de papel o de correos.

## Formulario

| Campo | Tipo | Obligatorio | Validación |
|---|---|---|---|
| Boleta a la que se asociarán | lista | Sí | Boletas existentes (por defecto, la más reciente) |
| Archivos | selector múltiple | Sí | PDF, PNG, JPG/JPEG o WEBP · máx. **10 MB** c/u · hasta **10** por envío |

## Criterios de aceptación

- [x] **Dado** que elijo una boleta y archivos válidos, **cuando** los selecciono, **entonces** se suben, aparecen como tarjetas con su nombre, boleta y fecha, y siguen ahí al recargar.
- [x] **Dado** un archivo de tipo no permitido (p. ej. `.exe`), **entonces** se rechaza con un mensaje y no se guarda nada.
- [x] **Dado** un archivo cuyo tipo no coincide con su extensión, **entonces** se rechaza.
- [x] **Dado** un archivo de más de 10 MB, **entonces** se rechaza.
- [x] **Dado** una boleta que no existe, **entonces** el servidor responde error y **no deja archivos huérfanos** en disco.
- [x] **Dado** que subo varios archivos, **entonces** o se guardan todos o ninguno.
- [x] **Dado** un nombre con tildes o «ñ», **entonces** se muestra correctamente.
- [x] **Dado** que subo dos archivos con el mismo nombre, **entonces** no se pisan entre sí (el servidor les asigna un nombre interno único).
- [x] **Dado** que subo el mismo archivo otra vez, **entonces** puedo volver a seleccionarlo (el selector se limpia).
- [ ] **Dado** muchos respaldos, **entonces** puedo ver solo los de una boleta. *(Pendiente: hoy se listan todos.)*
- [ ] **Dado** una subida lenta, **entonces** veo una barra de progreso. *(Pendiente; hoy solo dice «Subiendo…».)*
- [ ] **Dado** que el texto dice «arrastra», **entonces** soporta arrastrar y soltar. *(Pendiente; hoy es solo clic.)*

## Reglas de negocio

- Los archivos se guardan en la carpeta `backend/uploads/` con un nombre generado por el servidor; en la base de datos queda el nombre original, el tipo y el tamaño. **Esa carpeta debe incluirse en las copias de seguridad.**
- No existe URL pública: para ver un archivo hay que tener sesión iniciada.

## Fuera de alcance (backlog)

- Análisis antivirus de los archivos.
- Almacenamiento en un servicio externo (S3, etc.) si el volumen crece.

## Referencias de código

`frontend/app/(app)/respaldos/page.tsx` · `frontend/app/(app)/boletas/page.tsx` · `backend/src/respaldos/respaldos.module.ts`

## Cómo probar a mano

1. Entrar como administradora, ir a Respaldos, elegir una boleta y subir un PDF y una imagen.
2. Intentar subir un `.exe` o `.zip` → debe rechazarse.
3. Recargar y confirmar que las tarjetas siguen ahí.
