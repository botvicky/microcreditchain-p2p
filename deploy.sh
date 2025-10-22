#!/usr/bin/env bash

# Deployment helper script (guidance) for FastAPI backend and Expo app

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Deploying FastAPI backend (ai-service)..."

cd "$ROOT_DIR/ai-service"

echo "This script will not perform a full production deploy automatically.
Choose one of the following options and run the commands manually:

1) Deploy to Google Cloud Run (example):
   docker build -t gcr.io/<PROJECT-ID>/ai-analyzer:latest .
   docker push gcr.io/<PROJECT-ID>/ai-analyzer:latest
   gcloud run deploy ai-analyzer --image gcr.io/<PROJECT-ID>/ai-analyzer:latest --region=us-central1 --platform=managed --allow-unauthenticated

2) Deploy to any container platform: build and push Docker image and configure environment variables (DATABASE_URL, SECRET_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET).

3) Deploy using a VM or Kubernetes: create appropriate deployment manifests and configure secrets.
"

echo "Expo app build instructions (Android/iOS):"
cd "$ROOT_DIR/app"
echo "To build the app binary or run in production mode, use Expo's build commands or EAS Build:
  npx expo prebuild  # optional
  npx eas build --platform android
  npx eas build --platform ios
"

echo "Deployment guidance completed. Review CONFIGURATION.md for production notes."

exit 0
