#!/bin/bash

# ========================================
# SmartLenderUp - Prepare for GitHub Push
# This script helps prepare the code for GitHub
# ========================================

echo "🚀 SmartLenderUp - GitHub Preparation Script"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "   Please run this script from the project root directory."
    exit 1
fi

echo "✅ Found package.json - we're in the right place"
echo ""

# Step 1: Check for service role key in supabase.ts
echo "📋 Step 1: Checking for sensitive keys..."
if grep -q "service_role" lib/supabase.ts && ! grep -q "PASTE_YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE" lib/supabase.ts; then
    echo "⚠️  WARNING: Service role key detected in lib/supabase.ts"
    echo "   This should NOT be pushed to GitHub!"
    echo ""
    echo "   Options:"
    echo "   1. Replace it with: PASTE_YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE"
    echo "   2. Use environment variables instead"
    echo ""
    read -p "   Continue anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted. Please fix the service role key first."
        exit 1
    fi
else
    echo "✅ No sensitive keys detected (or placeholder is in place)"
fi
echo ""

# Step 2: Check if .gitignore exists
echo "📋 Step 2: Checking .gitignore..."
if [ ! -f ".gitignore" ]; then
    echo "⚠️  .gitignore not found! Creating one..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Supabase
.supabase/
EOF
    echo "✅ Created .gitignore"
else
    echo "✅ .gitignore exists"
fi
echo ""

# Step 3: Initialize git if needed
echo "📋 Step 3: Checking Git initialization..."
if [ ! -d ".git" ]; then
    echo "⚠️  Git not initialized. Initializing now..."
    git init
    git remote add origin https://github.com/alngumba-sys/smartlenderup.git
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi
echo ""

# Step 4: Check git remote
echo "📋 Step 4: Checking Git remote..."
if git remote -v | grep -q "alngumba-sys/smartlenderup"; then
    echo "✅ Git remote is correct"
else
    echo "⚠️  Git remote not set correctly. Setting now..."
    git remote add origin https://github.com/alngumba-sys/smartlenderup.git 2>/dev/null || 
    git remote set-url origin https://github.com/alngumba-sys/smartlenderup.git
    echo "✅ Git remote updated"
fi
echo ""

# Step 5: Show git status
echo "📋 Step 5: Current Git Status"
echo "=============================="
git status --short
echo ""

# Step 6: Ready to push
echo "=============================================="
echo "✅ Pre-push checks complete!"
echo ""
echo "📦 Next steps:"
echo "   1. Review the changes above"
echo "   2. Run: git add ."
echo "   3. Run: git commit -m 'Complete migration from Figma Make'"
echo "   4. Run: git push origin main --force"
echo ""
echo "⚠️  WARNING: Using --force will OVERWRITE everything on GitHub!"
echo ""
read -p "Do you want to proceed with git add now? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📦 Adding files to git..."
    git add .
    echo "✅ Files added!"
    echo ""
    echo "Next, run:"
    echo "   git commit -m 'Complete migration from Figma Make - Live deployment'"
    echo "   git push origin main --force"
else
    echo "Skipped. You can manually run: git add ."
fi

echo ""
echo "🎉 Done! Ready to push to GitHub."
