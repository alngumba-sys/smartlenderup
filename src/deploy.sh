#!/bin/bash

# SmartLenderUp - Quick Deployment Script
# This script helps you deploy your platform to production

echo "🚀 SmartLenderUp - Production Deployment"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed. Please install Git first.${NC}"
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${BLUE}Step 1: Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo -e "${BLUE}Step 2: Building for production...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"
echo ""

echo -e "${BLUE}Step 3: Git repository setup${NC}"
echo ""

# Check if already a git repo
if [ ! -d .git ]; then
    echo "Initializing Git repository..."
    git init
    echo -e "${GREEN}✅ Git initialized${NC}"
else
    echo -e "${YELLOW}⚠️  Git repository already exists${NC}"
fi

# Create .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    echo "Creating .gitignore..."
    cat > .gitignore << EOF
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
dist/
build/

# Environment variables
.env
.env.local
.env.production
.env.development

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Misc
.vercel
.netlify
EOF
    echo -e "${GREEN}✅ .gitignore created${NC}"
fi

# Add all files
git add .

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  No changes to commit${NC}"
else
    git commit -m "Production build - SmartLenderUp platform"
    echo -e "${GREEN}✅ Changes committed${NC}"
fi

echo ""
echo -e "${GREEN}========================================"
echo "✅ Production build complete!"
echo "========================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "Option 1 - Deploy to Vercel (Recommended):"
echo "  1. Go to https://vercel.com"
echo "  2. Sign up with GitHub"
echo "  3. Click 'Add New Project'"
echo "  4. Import this repository"
echo "  5. Click 'Deploy'"
echo "  ✅ Live in 2 minutes!"
echo ""
echo "Option 2 - Deploy to Netlify:"
echo "  1. Go to https://netlify.com"
echo "  2. Click 'Add new site'"
echo "  3. Import from Git"
echo "  4. Select this repository"
echo "  5. Click 'Deploy site'"
echo "  ✅ Live in 2 minutes!"
echo ""
echo "Option 3 - Manual deployment:"
echo "  npx vercel --prod"
echo ""
echo -e "${YELLOW}📁 Your production files are in the 'dist' folder${NC}"
echo ""
echo -e "${BLUE}For detailed instructions, see GO_LIVE_GUIDE.md${NC}"
echo ""

# Ask if user wants to preview
read -p "Would you like to preview the production build locally? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Starting local production preview...${NC}"
    echo -e "${GREEN}Preview will be available at: http://localhost:4173${NC}"
    echo ""
    npm run preview
fi
