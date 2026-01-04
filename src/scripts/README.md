# SmartLenderUp - Image Conversion Scripts

This folder contains helper scripts for managing the transition from Figma Make to local development.

## 📁 Files

### `convert-to-local-images.js`
Converts all `figma:asset` imports to local `/images/` paths for production builds.

## 🚀 Quick Start

After downloading your code from Figma Make:

### Step 1: Run the conversion script
```bash
node scripts/convert-to-local-images.js
```

### Step 2: Add your images
Copy your actual image files to `public/images/`:

```
public/images/
├── smartlenderup-logo.png    # Your SmartLenderUp logo
├── laptop-dashboard.png      # Dashboard preview image
├── ai-insights.png           # AI insights preview
├── consortium-logo.png       # Consortium logo
├── scissorup-logo.png        # ScissorUp logo
└── salesup-logo.png          # SalesUp logo
```

### Step 3: Build and deploy
```bash
npm run build
npm run preview  # Test locally first
```

### Step 4: Deploy to your server
```bash
# Upload the dist/ folder to your web server
# or use your preferred deployment method
```

## 📝 What the Script Does

The conversion script:
1. ✅ Scans all `.tsx` files for `figma:asset` imports
2. ✅ Replaces them with local `/images/` paths
3. ✅ Creates the `public/images/` directory if needed
4. ✅ Shows a summary of all changes made

## ⚠️ Important Notes

- **Run this ONLY on downloaded code** - Don't run it in Figma Make!
- **Backup first** - Make a copy of your code before running
- **One-way conversion** - You'll need to re-download from Figma Make to get `figma:asset` imports back
- **Add actual images** - The script only updates the code, you still need to add the image files

## 🔄 Converting Back to Figma Make

If you need to go back to Figma Make:
1. Re-download the latest code from Figma Make
2. Don't run the conversion script
3. The `figma:asset` imports will work automatically

## 🆘 Troubleshooting

### Build fails with "Cannot find module"
- Make sure all image files are in `public/images/`
- Check that filenames match exactly (case-sensitive)

### Images don't show on deployed site
- Verify images are in the `dist/images/` folder after build
- Check browser console for 404 errors
- Ensure paths start with `/images/` not `./images/`

### Script doesn't find files
- Run from project root directory
- Check that file paths match your project structure

## 📞 Support

For issues or questions:
- Check the main README.md
- Review the deployment documentation
- Contact your development team
