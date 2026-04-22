#!/usr/bin/env bash
set -euo pipefail

SERVICE=${1:-}
if [ -z "$SERVICE" ]; then
  echo "Usage: $0 <service>"
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$REPO_ROOT/virtual-ai-presenter/backend/$SERVICE"
VENV_DIR="$REPO_ROOT/.venv/$SERVICE"

if [ ! -d "$BACKEND_DIR" ]; then
  echo "Service not found: $SERVICE"
  exit 1
fi

python3 -m venv "$VENV_DIR"
"$VENV_DIR/bin/python" -m pip install --upgrade pip
"$VENV_DIR/bin/pip" install -r "$BACKEND_DIR/requirements.txt"

cd "$BACKEND_DIR"
"$VENV_DIR/bin/python" main.py
