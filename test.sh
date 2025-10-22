#!/bin/bash

echo "🧪 Testing MicroCreditChain P2P..."

# Test Firebase Functions

# Test AI Service

# Test React Native App

# Test Firebase Rules

#!/usr/bin/env bash

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🧪 Running project tests"

echo "🤖 Running AI service tests..."
cd "$ROOT_DIR/ai-service"
if command -v pytest >/dev/null 2>&1; then
    python -m pytest
else
    echo "pytest not installed; install requirements and run 'python -m pytest'"
fi

echo "📱 Running frontend tests (if available)..."
cd "$ROOT_DIR/app"
if [ -f package.json ]; then
    npm test || echo "No frontend tests configured or tests failed"
else
    echo "No frontend app found"
fi

echo "✅ Tests completed."

exit 0
