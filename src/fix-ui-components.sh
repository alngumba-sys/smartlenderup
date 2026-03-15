#!/bin/bash

# Fix all UI component imports by removing @version syntax
# This resolves the WebAssembly compilation error

echo "🔧 Fixing all UI component imports..."

# Array of patterns to fix
declare -a patterns=(
  "s/@radix-ui\/react-alert-dialog@[0-9.]*/@radix-ui\/react-alert-dialog/g"
  "s/@radix-ui\/react-aspect-ratio@[0-9.]*/@radix-ui\/react-aspect-ratio/g"
  "s/@radix-ui\/react-avatar@[0-9.]*/@radix-ui\/react-avatar/g"
  "s/@radix-ui\/react-checkbox@[0-9.]*/@radix-ui\/react-checkbox/g"
  "s/@radix-ui\/react-collapsible@[0-9.]*/@radix-ui\/react-collapsible/g"
  "s/@radix-ui\/react-context-menu@[0-9.]*/@radix-ui\/react-context-menu/g"
  "s/@radix-ui\/react-dialog@[0-9.]*/@radix-ui\/react-dialog/g"
  "s/@radix-ui\/react-dropdown-menu@[0-9.]*/@radix-ui\/react-dropdown-menu/g"
  "s/@radix-ui\/react-hover-card@[0-9.]*/@radix-ui\/react-hover-card/g"
  "s/@radix-ui\/react-label@[0-9.]*/@radix-ui\/react-label/g"
  "s/@radix-ui\/react-menubar@[0-9.]*/@radix-ui\/react-menubar/g"
  "s/@radix-ui\/react-navigation-menu@[0-9.]*/@radix-ui\/react-navigation-menu/g"
  "s/@radix-ui\/react-popover@[0-9.]*/@radix-ui\/react-popover/g"
  "s/@radix-ui\/react-progress@[0-9.]*/@radix-ui\/react-progress/g"
  "s/@radix-ui\/react-radio-group@[0-9.]*/@radix-ui\/react-radio-group/g"
  "s/@radix-ui\/react-scroll-area@[0-9.]*/@radix-ui\/react-scroll-area/g"
  "s/@radix-ui\/react-select@[0-9.]*/@radix-ui\/react-select/g"
  "s/@radix-ui\/react-separator@[0-9.]*/@radix-ui\/react-separator/g"
  "s/@radix-ui\/react-slider@[0-9.]*/@radix-ui\/react-slider/g"
  "s/@radix-ui\/react-slot@[0-9.]*/@radix-ui\/react-slot/g"
  "s/@radix-ui\/react-switch@[0-9.]*/@radix-ui\/react-switch/g"
  "s/@radix-ui\/react-tabs@[0-9.]*/@radix-ui\/react-tabs/g"
  "s/@radix-ui\/react-toast@[0-9.]*/@radix-ui\/react-toast/g"
  "s/@radix-ui\/react-toggle@[0-9.]*/@radix-ui\/react-toggle/g"
  "s/@radix-ui\/react-toggle-group@[0-9.]*/@radix-ui\/react-toggle-group/g"
  "s/@radix-ui\/react-tooltip@[0-9.]*/@radix-ui\/react-tooltip/g"
  "s/lucide-react@[0-9.]*/lucide-react/g"
  "s/class-variance-authority@[0-9.]*/class-variance-authority/g"
  "s/react-day-picker@[0-9.]*/react-day-picker/g"
  "s/embla-carousel-react@[0-9.]*/embla-carousel-react/g"
  "s/recharts@[0-9.]*/recharts/g"
  "s/cmdk@[0-9.]*/cmdk/g"
  "s/vaul@[0-9.]*/vaul/g"
  "s/input-otp@[0-9.]*/input-otp/g"
  "s/react-resizable-panels@[0-9.]*/react-resizable-panels/g"
  "s/next-themes@[0-9.]*/next-themes/g"
)

# Find all .tsx and .ts files
files=$(find . -type f \( -name "*.tsx" -o -name "*.ts" \) ! -path "*/node_modules/*" ! -path "*/.git/*")

count=0

for file in $files; do
  for pattern in "${patterns[@]}"; do
    # Use sed to replace in place
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # macOS
      sed -i '' "$pattern" "$file"
    else
      # Linux
      sed -i "$pattern" "$file"
    fi
  done
  
  count=$((count + 1))
done

echo "✅ Fixed $count files!"
echo ""
echo "📋 Next steps:"
echo "   rm -rf node_modules/.vite"
echo "   npm install"
echo "   npm run dev"
