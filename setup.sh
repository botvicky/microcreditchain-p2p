#!/bin/bash

echo "🚀 Setting up MicroCreditChain P2P..."

# Check if required tools are installed
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    fi
}

echo "🔍 Checking prerequisites..."
check_command "node"
check_command "npm"
check_command "expo"
check_command "firebase"
check_command "gcloud"
check_command "python3"

# Install app dependencies
echo "📦 Installing app dependencies..."
cd app
npm install
cd ..

# Install Firebase Functions dependencies
echo "📦 Installing Firebase Functions dependencies..."
cd firebase-functions
npm install
cd ..

# Install AI service dependencies
echo "📦 Installing AI service dependencies..."
cd ai-service
pip install -r requirements.txt
cd ..

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p app/src/components
mkdir -p app/src/screens/auth
mkdir -p app/src/screens/borrower
mkdir -p app/src/screens/lender
mkdir -p app/src/screens/admin
mkdir -p app/src/services
mkdir -p app/src/store
mkdir -p app/src/types
mkdir -p app/src/config

# Set up environment files
echo "⚙️ Setting up environment files..."
if [ ! -f "firebase-functions/.env" ]; then
    cp firebase-functions/.env.example firebase-functions/.env
    echo "📝 Created .env file. Please update it with your Firebase credentials."
fi

# Create Firebase project configuration
echo "🔥 Setting up Firebase configuration..."
if [ ! -f "firebase.json" ]; then
    cat > firebase.json << EOF
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "firebase-functions",
    "runtime": "nodejs18"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
EOF
fi

# Create Firestore indexes
echo "📊 Creating Firestore indexes..."
cat > firestore.indexes.json << EOF
{
  "indexes": [
    {
      "collectionGroup": "loanOffers",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "loanApplications",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "borrowerId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
EOF

# Create deployment script
echo "📝 Creating deployment script..."
cat > deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying MicroCreditChain P2P..."

# Deploy Firebase Functions
echo "🔥 Deploying Firebase Functions..."
cd firebase-functions
npm run build
cd ..
firebase deploy --only functions

# Deploy Firestore rules
echo "📊 Deploying Firestore rules..."
firebase deploy --only firestore:rules

# Deploy Storage rules
echo "💾 Deploying Storage rules..."
firebase deploy --only storage

# Deploy AI service
echo "🤖 Deploying AI service..."
cd ai-service
gcloud run deploy ai-analyzer --source . --region=us-central1 --platform=managed --allow-unauthenticated
cd ..

echo "✅ Deployment complete!"
EOF

chmod +x deploy.sh

# Create test script
echo "🧪 Creating test script..."
cat > test.sh << 'EOF'
#!/bin/bash

echo "🧪 Running tests..."

# Test Firebase Functions locally
echo "🔥 Testing Firebase Functions..."
cd firebase-functions
npm test
cd ..

# Test AI service locally
echo "🤖 Testing AI service..."
cd ai-service
python -m pytest
cd ..

# Test React Native app
echo "📱 Testing React Native app..."
cd app
npm test
cd ..

echo "✅ Tests complete!"
EOF

chmod +x test.sh

echo "✅ Setup complete!"
echo ""
echo "🎯 Project Structure:"
echo "├── app/                    # React Native Expo app"
echo "├── firebase-functions/     # Firebase Cloud Functions"
echo "├── ai-service/            # Python FastAPI AI service"
echo "├── deploy.sh              # Deployment script"
echo "├── test.sh                # Testing script"
echo "└── setup.sh               # This setup script"
echo ""
echo "📋 Next steps:"
echo "1. 🔧 Update firebase-functions/.env with your Firebase credentials"
echo "2. 🔧 Update app/src/config/firebase.ts with your Firebase config"
echo "3. 🔧 Update AI_SERVICE_URL in firebase-functions/src/ai-integration.ts"
echo "4. 🚀 Run './deploy.sh' to deploy everything"
echo "5. 📱 Run 'cd app && expo start' to start the development server"
echo ""
echo "🔑 Required Environment Variables:"
echo "   - FIREBASE_PROJECT_ID"
echo "   - FIREBASE_PRIVATE_KEY"
echo "   - FIREBASE_CLIENT_EMAIL"
echo "   - GMAIL_USER"
echo "   - GMAIL_APP_PASSWORD"
echo "   - AI_SERVICE_URL"
echo "   - VAPID_KEY"
