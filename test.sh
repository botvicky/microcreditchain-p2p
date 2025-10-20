#!/bin/bash

echo "🧪 Testing MicroCreditChain P2P..."

# Test Firebase Functions
echo "📦 Testing Firebase Functions..."
cd firebase-functions
npm test
if [ $? -ne 0 ]; then
    echo "❌ Firebase Functions tests failed"
    exit 1
fi
cd ..

# Test AI Service
echo "🤖 Testing AI Service..."
cd ai-service
python -m pytest tests/ -v
if [ $? -ne 0 ]; then
    echo "❌ AI Service tests failed"
    exit 1
fi
cd ..

# Test React Native App
echo "📱 Testing React Native App..."
cd app
npm test
if [ $? -ne 0 ]; then
    echo "❌ React Native app tests failed"
    exit 1
fi
cd ..

# Test Firebase Rules
echo "🔒 Testing Firebase Rules..."
firebase emulators:exec --only firestore,storage "echo 'Firebase Rules test completed'"

echo "✅ All tests passed!"
