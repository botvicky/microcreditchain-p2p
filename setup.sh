#!/usr/bin/env bash

# Quick setup script for local development (FastAPI backend + Expo frontend)

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Setting up backend (ai-service)..."
cd "$ROOT_DIR/ai-service"
if [ -f requirements.txt ]; then
  python -m pip install --upgrade pip
  python -m pip install -r requirements.txt
fi

echo "Backend requirements installed. Ensure you have a PostgreSQL instance and DATABASE_URL set."

echo "
To run the backend locally:
  cd ai-service
  uvicorn main:app --reload --host 0.0.0.0 --port 8000
"

echo "Setting up frontend (app)..."
cd "$ROOT_DIR/app"
if [ -f package.json ]; then
  npm install
fi

echo "Frontend dependencies installed. To launch the Expo app run:"
echo "  cd app; npx expo start"

echo "Setup complete. Review CONFIGURATION.md for environment variables and further instructions."

exit 0
