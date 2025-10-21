#!/bin/bash

# 🚀 SMOKE TEST RUNNER
# Run after every code change to catch major breakage

echo "🧪 Running Smoke Tests..."

# Check if dev server is running
if ! curl -s http://localhost:5174 > /dev/null; then
    echo "❌ Dev server not running on localhost:5174"
    echo "   Start with: npm run dev"
    exit 1
fi

# Run smoke tests
npx playwright test tests/smoke.test.js --reporter=list

if [ $? -eq 0 ]; then
    echo "✅ All smoke tests passed! Safe to continue coding."
else
    echo "❌ Smoke tests failed! Fix issues before continuing."
    exit 1
fi
