# Guía de trabajo colaborativo en git

Pensada para un equipo pequeño. La idea central: **una historia de usuario = un issue = una rama = un pull request**.

## 1. Publicar el proyecto por primera vez (lo hace una sola persona)

1. Crea un repositorio **vacío** en GitHub (sin README ni .gitignore) y copia su URL.
2. En la carpeta del proyecto:

```bash
cd ~/Downloads/sgi
git init -b main
git add .
git status                      # revisa la lista antes de seguir
git ls-files | grep -E "(^|/)\.env$|node_modules|uploads/"   # NO debe imprimir nada
git commit -m "chore: proyecto inicial SGI (frontend Next.js + backend NestJS)"
git remote add origin <URL-DEL-REPOSITORIO>
git push -u origin main
```

3. En GitHub → **Settings → Collaborators** invita al equipo.
4. En GitHub → **Settings → Branches → Add rule** para `main`: exigir *pull request* con 1 aprobación. Así nadie sube directo a `main`.
5. Crea los issues de las historias (ver sección 6).

> Si el archivo `.env` aparece en `git status`, **detente**: contiene el secreto de sesión. Debe estar ignorado (lo cubre el `.gitignore` de la raíz).

## 2. Primera vez de cada integrante

```bash
git clone <URL-DEL-REPOSITORIO>
cd sgi
```

Luego sigue «Puesta en marcha» del `README.md`. Cada persona tiene **su propia base de datos local** (`docker compose up -d` + `npm run seed`), así que nadie pisa los datos de otro.

> Si en tu máquina el puerto 5432 está ocupado por otro Postgres, usa el 5433 en `docker-compose.yml` y en tu `backend/.env`. **Si ese cambio es para todo el equipo, hazlo también en `backend/.env.example`** y súbelo en un PR.

## 3. Flujo diario

```bash
git switch main && git pull                      # 1. parte siempre de main actualizado
git switch -c feature/HU-04-admin-catalogos      # 2. una rama por historia (o por casilla)
# ... programas, pruebas ...
git add -A
git commit -m "feat(catalogos): listar unidades y tipos de error (HU-04)"
git push -u origin feature/HU-04-admin-catalogos # 3. sube tu rama
# 4. abre el Pull Request en GitHub (se llena solo con la plantilla)
```

### Nombres de rama
| Prefijo | Para |
|---|---|
| `feature/HU-xx-descripcion` | Implementar una historia o una casilla de ella |
| `fix/descripcion` | Corregir un error |
| `docs/descripcion` | Solo documentación (incluye cambios a las historias) |

### Mensajes de commit
Formato `tipo(modulo): qué hace (HU-xx)`, en minúscula y en presente.

| Tipo | Uso |
|---|---|
| `feat` | Funcionalidad nueva |
| `fix` | Corrección de error |
| `docs` | Documentación |
| `refactor` | Cambio interno sin cambiar el comportamiento |
| `test` | Pruebas |
| `chore` | Configuración, dependencias, tareas de mantenimiento |

Ejemplos: `feat(boletas): enviar aviso al registrar (HU-03)` · `fix(respaldos): rechazar archivos vacíos (HU-09)`.

## 4. Pull request

- Título: `HU-04: administrar catálogos` (o `Fix: …`).
- En la descripción pon `Closes #N` (número del issue) para que se cierre solo al fusionar.
- **Antes de pedir revisión**:
  - `npm run build` pasa en `backend/` y en `frontend/` (según lo que tocaste).
  - Probaste a mano los criterios de aceptación de la historia.
  - Marcaste las casillas `[x]` que ahora cumple, **en el archivo `.md` de la historia, dentro del mismo PR**.
  - Si añadiste una variable de entorno, está en `backend/.env.example` y documentada.
- Se fusiona con **Squash and merge** tras 1 aprobación. Borra la rama después.
- Quien revisa mira: ¿cumple los criterios?, ¿valida en el **backend** (no solo en el formulario)?, ¿respeta los permisos por rol?

## 5. Cómo evitar conflictos

- **Repartan por historia o por módulo**, no por archivo. Dos personas en la misma pantalla es lo que más conflictos genera.
- Estos archivos los tocan casi todos: `frontend/components/ui.tsx`, `frontend/components/hooks.ts`, `frontend/lib/data.ts`, `backend/src/entities/index.ts`, `backend/src/common/roles.ts`. Cambios pequeños, PR rápidos y fusionar pronto.
- Para actualizar tu rama con lo último de `main`:
  ```bash
  git fetch origin
  git merge origin/main          # o: git rebase origin/main si ya lo dominas
  ```
- Ramas de vida corta (idealmente 1–3 días).

## 6. Crear los issues a partir de las historias

Con el [GitHub CLI](https://cli.github.com) (`brew install gh` y `gh auth login`):

```bash
./scripts/crear-issues.sh           # solo muestra qué haría (simulación)
./scripts/crear-issues.sh --crear   # crea un issue por cada HU-xx.md
```

Cada issue lleva el texto completo de la historia; las casillas `[ ]` se ven como una barra de progreso. Es seguro repetirlo: omite los que ya existen. Sin `gh`, copia el contenido de cada archivo en un issue nuevo desde la web.

Opcional: **Projects → New project → Board** con columnas *Por hacer / En curso / En revisión / Hecho*.

## 7. Cambios en la base de datos

Hoy `DB_SYNCHRONIZE=true` hace que TypeORM cree y modifique tablas solo al arrancar. Es cómodo, pero con varias personas:

- **Avisa en el PR** cuando cambies `backend/src/entities/index.ts` (qué tabla/columna).
- Para que alguien aplique tu cambio le basta con traer tu rama y reiniciar el backend. Si choca, puede recrear su base local: `docker compose down -v && docker compose up -d` en la raíz y luego `npm run seed` en `backend/`.
- **Antes de producción** conviene pasar a migraciones de TypeORM (`DB_SYNCHRONIZE=false`); queda como tarea del equipo.

## 8. Reglas del repositorio

- **Nunca** subir `.env`, la carpeta `uploads/`, `node_modules/` ni `.next/` (ya están en `.gitignore`).
- Las contraseñas del seed (`Cambiar123!`) son solo para desarrollo.
- No subir datos reales de personas ni boletas.
- Una historia nueva o un cambio de regla se discute primero en el issue y se refleja en el `.md`.

## 9. Definición de «hecho»

Una historia (o casilla) está hecha cuando:

- [ ] Cumple sus criterios de aceptación, probados a mano.
- [ ] La validación y los permisos por rol están **en el backend**.
- [ ] `npm run build` pasa.
- [ ] El `.md` de la historia está actualizado.
- [ ] Un compañero revisó y aprobó el PR.
