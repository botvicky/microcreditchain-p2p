#!/bin/bash

echo "🚀 Deploying MicroCreditChain P2P..."

# Check if required tools are installed
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    fi
}

echo "🔍 Checking prerequisites..."
check_command "firebase"
check_command "gcloud"
check_command "expo"

# Deploy Firebase Functions
echo "📦 Deploying Firebase Functions..."
cd firebase-functions
npm install
npm run build
firebase deploy --only functions
cd ..

# Deploy Firestore Rules
echo "🔒 Deploying Firestore Rules..."
firebase deploy --only firestore:rules

# Deploy Storage Rules
echo "💾 Deploying Storage Rules..."
firebase deploy --only storage

# Deploy AI Service to Google Cloud Run
echo "🤖 Deploying AI Service..."
cd ai-service
gcloud run deploy ai-analyzer \
  --source . \
  --region=us-central1 \
  --allow-unauthenticated \
  --memory=1Gi \
  --cpu=1 \
  --max-instances=10
cd ..

# Build and deploy React Native app
echo "📱 Building React Native app..."
cd app
npm install
echo "Building for Android..."
expo build:android --type apk
echo "Building for iOS..."
expo build:ios --type archive
cd ..

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Test the deployed functions"
echo "2. Upload the built apps to app stores"
echo "3. Configure push notifications"
echo "4. Set up monitoring and analytics"
