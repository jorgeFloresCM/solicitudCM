#!/usr/bin/env bash
# Crea un issue de GitHub por cada historia de usuario (docs/historias-de-usuario/HU-*.md).
#
#   ./scripts/crear-issues.sh           simulación: solo muestra qué crearía
#   ./scripts/crear-issues.sh --crear   crea los issues
#
# Requiere el GitHub CLI (brew install gh) y haber ejecutado `gh auth login`.
# Es seguro repetirlo: omite los issues cuyo título ya existe.
set -euo pipefail

cd "$(dirname "$0")/.."
DIR="docs/historias-de-usuario"
CREAR=false
[[ "${1:-}" == "--crear" ]] && CREAR=true

shopt -s nullglob
archivos=("$DIR"/HU-*.md)
if [[ ${#archivos[@]} -eq 0 ]]; then
  echo "No se encontraron historias en $DIR" >&2
  exit 1
fi

if $CREAR; then
  command -v gh >/dev/null || { echo "Falta el GitHub CLI: brew install gh" >&2; exit 1; }
  gh auth status >/dev/null 2>&1 || { echo "Ejecuta primero: gh auth login" >&2; exit 1; }
  gh label create historia-de-usuario --color 0070E0 --description "Historia de usuario" --force >/dev/null
fi

for f in "${archivos[@]}"; do
  titulo="$(head -n 1 "$f" | sed 's/^# *//')"          # "HU-03 · Registrar boleta de error"

  if ! $CREAR; then
    echo "[simulación] crearía: $titulo   ($f)"
    continue
  fi

  if gh issue list --state all --limit 200 --json title --jq '.[].title' | grep -Fxq -- "$titulo"; then
    echo "omitido (ya existe): $titulo"
    continue
  fi

  # El cuerpo es el archivo sin su primera línea (el título ya va en el issue)
  cuerpo="$(mktemp)"
  tail -n +2 "$f" > "$cuerpo"
  gh issue create --title "$titulo" --body-file "$cuerpo" --label historia-de-usuario
  rm -f "$cuerpo"
done

if ! $CREAR; then
  echo
  echo "Para crearlos de verdad: ./scripts/crear-issues.sh --crear"
fi
