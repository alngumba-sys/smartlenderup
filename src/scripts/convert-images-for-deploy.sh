#!/bin/bash

# Script to convert figma:asset imports to production-ready paths
# Run this before deploying to Netlify

echo "🖼️  Converting images for production deployment..."

# Create public/images directory if it doesn't exist
mkdir -p public/images

echo ""
echo "📥 STEP 1: Download your images"
echo "================================"
echo "You need to manually download these images and place them in public/images/:"
echo ""
echo "1. SmartLenderUp Logo:"
echo "   - In Figma Make, right-click the logo in the navigation"
echo "   - Save as: public/images/smartlenderup-logo.png"
echo ""
echo "2. Laptop Dashboard:"
echo "   - In Figma Make, right-click the laptop screenshot"
echo "   - Save as: public/images/laptop-dashboard.png"
echo ""
echo "Press ENTER when you have downloaded both images..."
read

# Check if images exist
if [ ! -f "public/images/smartlenderup-logo.png" ]; then
    echo "❌ Error: public/images/smartlenderup-logo.png not found!"
    echo "   Please download the logo and save it to public/images/"
    exit 1
fi

if [ ! -f "public/images/laptop-dashboard.png" ]; then
    echo "❌ Error: public/images/laptop-dashboard.png not found!"
    echo "   Please download the laptop image and save it to public/images/"
    exit 1
fi

echo "✅ Both images found!"
echo ""
echo "🔧 STEP 2: Creating production version of files..."

# Create backup of original files
cp components/LoginPage.tsx components/LoginPage.figma-backup.tsx
cp components/MotherCompanyHome.tsx components/MotherCompanyHome.figma-backup.tsx
cp App.tsx App.figma-backup.tsx

# Replace imports in LoginPage.tsx
sed -i.tmp 's|import abcLogo from '"'"'figma:asset/09c4fb0bee355dd36ef162b16888a598745d0152.png'"'"';|const abcLogo = "/images/smartlenderup-logo.png";|g' components/LoginPage.tsx
sed -i.tmp 's|import smartLenderLogo from '"'"'figma:asset/fd18aa8c77f7b0374c9ef5d44e370cbe0bc4832b.png'"'"';|const smartLenderLogo = "/images/smartlenderup-logo.png";|g' components/LoginPage.tsx
sed -i.tmp 's|import laptopImage from '"'"'figma:asset/0bd33989a074d3dca1562004fa3fa4873d63a5f7.png'"'"';|const laptopImage = "/images/laptop-dashboard.png";|g' components/LoginPage.tsx
sed -i.tmp 's|import aiInsightsImage from '"'"'figma:asset/e84e64fe3068a0b12ba739c2961bc2f26a775b78.png'"'"';|const aiInsightsImage = "https://images.unsplash.com/photo-1750365919971-7dd273e7b317?w=1200\&h=800\&fit=crop";|g' components/LoginPage.tsx

# Replace in MotherCompanyHome.tsx
sed -i.tmp 's|import consortiumLogo from '"'"'figma:asset/49270d62af7b635a9c8e6fd00e8b4473223ce62d.png'"'"';|const consortiumLogo = "/images/smartlenderup-logo.png";|g' components/MotherCompanyHome.tsx
sed -i.tmp 's|import scissorUpLogo from '"'"'figma:asset/60ce682323d016a6ce4fb3386d6389162cc1985b.png'"'"';|const scissorUpLogo = "/images/smartlenderup-logo.png";|g' components/MotherCompanyHome.tsx
sed -i.tmp 's|import smartLenderUpLogo from '"'"'figma:asset/fd18aa8c77f7b0374c9ef5d44e370cbe0bc4832b.png'"'"';|const smartLenderUpLogo = "/images/smartlenderup-logo.png";|g' components/MotherCompanyHome.tsx
sed -i.tmp 's|import salesUpLogo from '"'"'figma:asset/5635f9c39e606e609ee49836faa65f68db3f05cf.png'"'"';|const salesUpLogo = "/images/smartlenderup-logo.png";|g' components/MotherCompanyHome.tsx

# Replace in App.tsx
sed -i.tmp 's|import abcLogo from '"'"'figma:asset/09c4fb0bee355dd36ef162b16888a598745d0152.png'"'"';|const abcLogo = "/images/smartlenderup-logo.png";|g' App.tsx

# Replace in all report files
for file in components/reports/*.tsx; do
    sed -i.tmp 's|import logo from '"'"'figma:asset/09c4fb0bee355dd36ef162b16888a598745d0152.png'"'"';|const logo = "/images/smartlenderup-logo.png";|g' "$file"
done

# Clean up temp files
rm -f components/LoginPage.tsx.tmp
rm -f components/MotherCompanyHome.tsx.tmp
rm -f App.tsx.tmp
rm -f components/reports/*.tmp

echo "✅ Files updated for production!"
echo ""
echo "🏗️  STEP 3: Building for production..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "🧪 STEP 4: Testing locally..."
    echo "Run: npm run preview"
    echo "Then visit: http://localhost:4173"
    echo ""
    echo "If everything looks good, deploy with:"
    echo "  git add public/images/ components/ App.tsx"
    echo "  git commit -m 'Fix: Use production-ready images'"
    echo "  git push origin main"
    echo ""
    echo "📝 Note: To restore figma:asset imports for Figma Make, run:"
    echo "  cp components/LoginPage.figma-backup.tsx components/LoginPage.tsx"
    echo "  cp components/MotherCompanyHome.figma-backup.tsx components/MotherCompanyHome.tsx"
    echo "  cp App.figma-backup.tsx App.tsx"
else
    echo ""
    echo "❌ Build failed! Restoring original files..."
    cp components/LoginPage.figma-backup.tsx components/LoginPage.tsx
    cp components/MotherCompanyHome.figma-backup.tsx components/MotherCompanyHome.tsx
    cp App.figma-backup.tsx App.tsx
    exit 1
fi
