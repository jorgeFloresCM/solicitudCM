# Guía de subida inicial a Git (5 integrantes)

Objetivo: que el código que ya tenemos entre al repositorio **repartido en 5 partes**, cada una subida por una persona con su propio usuario de git, para que el aporte de cada quien aparezca en *Insights → Contributors*.

> Si solo suben 4 personas, la **Parte 5** (documentación) se la queda la Persona 1 y se sube junto con la Parte 1.

## 1. Reparto

| Parte | Persona | Contenido | Archivos | Rama |
|---|---|---|---|---|
| 1 | Líder | Base: config de backend y frontend, entidades, seed, hooks, UI, `lib/`, docker-compose, README | 27 | `main` (commit inicial) |
| 2 | Persona 2 | Login, usuarios y catálogos (API + pantallas), guard de autenticación, layout con menú | 7 | `feature/subida-parte-2` |
| 3 | Persona 3 | Boletas, estadísticas, dashboard, solicitudes y reportes | 6 | `feature/subida-parte-3` |
| 4 | Persona 4 | Respaldos, `app.module.ts`, `main.ts` (conecta todos los módulos) | 4 | `feature/subida-parte-4` |
| 5 | Persona 5 | CONTRIBUTING, plantillas de issues/PR, historias de usuario, script de issues, esta guía | 16 | `feature/subida-parte-5` |

Las listas exactas de archivos están en `scripts/partes/parte-N.txt`.

## 2. Orden de fusión (importante)

`1 → 2 → 3 → 5 → 4`

La Parte 4 se fusiona **al final** porque `app.module.ts` importa todos los módulos; si entra antes, el backend no compila. Las partes 2, 3 y 5 no se pisan entre sí (no comparten archivos), así que pueden prepararse en paralelo y solo esperar a que la 1 esté en `main`.

## 3. Antes de empezar (todos)

1. Tener el **proyecto completo** en una carpeta, p. ej. `~/Downloads/sgi` (el zip que se comparte **sin** `node_modules`, `.next`, `dist`, `.env` ni `uploads`).
2. Tener cuenta de GitHub y haber aceptado la invitación al repositorio.
3. Configurar identidad **igual a la de GitHub** (si el correo no coincide, el aporte no se cuenta):

```bash
git config --global user.name  "Tu Nombre"
git config --global user.email "correo-de-tu-cuenta-github@ejemplo.com"
```

## 4. Persona 1 (Líder): crea el repo y sube la Parte 1

1. En GitHub: **New repository** (vacío, sin README ni .gitignore). Invitar a los otros 4 en *Settings → Collaborators*.
2. En la terminal:

```bash
git clone https://github.com/ORG/sgi.git
cd sgi
git branch -M main
~/Downloads/sgi/scripts/subir-parte.sh 1 ~/Downloads/sgi
git commit -m "chore: estructura base del proyecto (parte 1)"
git push -u origin main
```

3. Activar protección de `main` (*Settings → Branches → Add rule*): exigir Pull Request y 1 aprobación. A partir de aquí nadie empuja directo a `main`.
4. Avisar al grupo: **"la base ya está en main"**.

## 5. Personas 2, 3, 4 y 5

Cambia `N` por el número de tu parte.

```bash
git clone https://github.com/ORG/sgi.git
cd sgi
git switch -c feature/subida-parte-N
~/Downloads/sgi/scripts/subir-parte.sh N ~/Downloads/sgi
```

El script copia solo los archivos de tu parte y los deja en `git add`. Revisa la lista que imprime y haz el commit.

**Partes 2, 3 y 4 (tienen backend y frontend): dos commits**

```bash
~/Downloads/sgi/scripts/subir-parte.sh N ~/Downloads/sgi backend
git commit -m "feat(MODULO): API de MODULO (parte N)"
~/Downloads/sgi/scripts/subir-parte.sh N ~/Downloads/sgi frontend
git commit -m "feat(MODULO): pantallas de MODULO (parte N)"
```

Para la Parte 5 basta un commit:

```bash
~/Downloads/sgi/scripts/subir-parte.sh 5 ~/Downloads/sgi
git commit -m "docs: guías, plantillas e historias de usuario (parte 5)"
```

Luego:

```bash
git push -u origin feature/subida-parte-N
```

En GitHub aparece el botón **Compare & pull request** → describir qué contiene tu parte → pedir revisión a otro integrante.

## 6. Fusionar los Pull Requests

- Respetar el orden `2 → 3 → 5 → 4`.
- Usar **"Create a merge commit"** o **"Rebase and merge"**. **No** "Squash and merge": junta tus commits en uno y se pierde el detalle.
- Después de cada fusión, quien sigue hace `git pull origin main` en su rama si GitHub avisa de conflictos (no debería haberlos: ningún archivo está en dos partes).

## 7. Verificación final

Cuando las 5 partes estén en `main`, cualquiera lo comprueba en un clon limpio:

```bash
git clone https://github.com/ORG/sgi.git && cd sgi
git ls-files | wc -l        # debe dar 60
git shortlog -sne            # debe mostrar a los 5 integrantes
```

Después seguir el `README.md` para levantar el proyecto. Con el repo completo, la Persona 5 puede correr `scripts/crear-issues.sh --crear` (necesita `gh auth login`) para crear los issues de las historias de usuario.

## 8. Reglas para que el aporte cuente

- Cada quien hace sus commits con **su** usuario; nadie sube partes de otros.
- Cada integrante debe poder **explicar su módulo** (qué hace, qué endpoints o pantallas tiene).
- Nunca subir `.env`, `node_modules`, `uploads/` ni contraseñas reales (el `.gitignore` ya los excluye).
- Desde la primera historia nueva se trabaja como indica `CONTRIBUTING.md`: un issue, una rama, un PR.

## 9. Problemas frecuentes

| Síntoma | Causa / solución |
|---|---|
| El script dice "Configura primero tu identidad" | Falta `git config user.name` / `user.email`. |
| El script dice "Estás en 'main'" | Crea tu rama con `git switch -c feature/subida-parte-N`. |
| Mi nombre no sale en Contributors | El correo de git no está agregado a tu cuenta de GitHub (*Settings → Emails*). |
| `git push` rechazado en `main` | Correcto: `main` está protegido. Sube tu rama y abre PR. |
| Conflicto al fusionar | No debería ocurrir; avisar al líder antes de resolver. |
