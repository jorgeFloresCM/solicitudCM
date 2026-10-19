# HU-10 · Visualizar y eliminar respaldos

| | |
|---|---|
| **Formulario** | Botones «ver» y «eliminar» de cada tarjeta en `/respaldos` (ventana modal visor) |
| **Prioridad** | Media |
| **Roles** | Ver: cualquier usuario con sesión que acceda a Respaldos · Eliminar: Administrador, Técnico o quien lo subió |
| **Estado** | ✅ Hecho |
| **Endpoints** | `GET /api/respaldos/:id/archivo` · `DELETE /api/respaldos/:id` |

## Historia

**Como** técnico o administrador,
**quiero** abrir un respaldo sin descargarlo y eliminar los que se subieron por error,
**para** revisar rápido la evidencia de una boleta y mantener el archivo ordenado.

## Criterios de aceptación

- [x] **Dado** un respaldo de imagen, **cuando** pulso el ojo, **entonces** se abre en una ventana modal a buen tamaño.
- [x] **Dado** un respaldo PDF, **cuando** pulso el ojo, **entonces** se muestra el PDF dentro de la ventana modal.
- [x] **Dado** que cierro la ventana (botón X o clic fuera), **entonces** vuelvo a la lista.
- [x] **Dado** un respaldo, **cuando** pulso eliminar, **entonces** el sistema me pide confirmar («esta acción no se puede deshacer»).
- [x] **Dado** que confirmo, **entonces** el respaldo desaparece de la lista y también el archivo del servidor.
- [x] **Dado** que cancelo la confirmación, **entonces** no se borra nada.
- [x] **Dado** un usuario que no es Administrador ni Técnico ni el autor, **cuando** intenta eliminar, **entonces** el servidor lo rechaza (403) y se muestra el mensaje.
- [x] **Dado** una persona sin sesión, **cuando** abre la dirección directa de un respaldo, **entonces** recibe «No autenticado» y no puede ver el archivo.
- [ ] **Dado** un respaldo eliminado, **entonces** queda registro de quién lo eliminó y cuándo. *(Pendiente; hoy se borra de forma definitiva.)*
- [ ] **Dado** un respaldo, **entonces** puedo descargarlo. *(Pendiente)*

## Reglas de negocio

- La eliminación es **definitiva** (no hay papelera).
- Al eliminarse una boleta (hoy no hay forma de hacerlo desde el sistema), sus respaldos se eliminarían con ella en la base de datos.

## Referencias de código

`frontend/app/(app)/respaldos/page.tsx` (`Modal`, `eliminar`) · `backend/src/respaldos/respaldos.module.ts` (`archivo`, `eliminar`)

## Cómo probar a mano

1. Subir una imagen y un PDF (HU-09) y abrir cada uno con el ojo.
2. Eliminar uno cancelando la confirmación → sigue ahí. Repetir confirmando → desaparece.
3. Con otro usuario de rol Consulta que no lo subió: no debe poder eliminarlo.
