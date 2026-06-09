#!/bin/bash
# Compila el frontend (export estático) y lo despliega en httpdocs/ (raíz del repo).
# Node 20 vive fuera del repo en ../.local/node20 (el Node del sistema es v12).
set -euo pipefail

cd "$(dirname "$0")"
export PATH="$(cd .. && pwd)/../.local/node20/bin:$PATH"

npm run build

# _next se reemplaza entero para no acumular chunks viejos de builds anteriores
rm -rf ../_next
rsync -a out/ ../

echo "Deploy OK → $(cd .. && pwd)"
