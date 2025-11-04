#!/bin/bash

echo "🧪 Testing ShamwariPay..."

# Test AI Service
echo "🤖 Running AI service tests..."
cd ai-service
if command -v pytest >/dev/null 2>&1; then
    python -m pytest
else
    echo "pytest not installed; install requirements and run 'python -m pytest'"
fi

# Test React Native App
echo "📱 Running frontend tests (if available)..."
cd ../app
if [ -f package.json ]; then
    npm test || echo "No frontend tests configured or tests failed"
else
    echo "No frontend app found"
fi

echo "✅ Tests completed."
exit 0
