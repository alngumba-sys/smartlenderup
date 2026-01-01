# SmartLenderUp - Deployment Guide

This guide walks you through deploying SmartLenderUp from Figma Make to your production server.

## 🎯 Overview

SmartLenderUp uses `figma:asset` imports in Figma Make, but these need to be converted to local paths for production deployment.

## 📋 Prerequisites

- Node.js 18+ installed
- Access to your actual logo and image files
- A web server (you're using www.smartlenderup.com)

---

## 🚀 Deployment Steps

### 1️⃣ Download Code from Figma Make

Click the download button in Figma Make to get your latest code as a ZIP file.

### 2️⃣ Extract and Install Dependencies

```bash
# Extract the ZIP file
unzip smartlenderup.zip
cd smartlenderup

# Install dependencies
npm install
```

### 3️⃣ Convert Images for Local Build

```bash
# Run the automatic conversion script
node scripts/convert-to-local-images.js
```

You'll see output like:
```
╔════════════════════════════════════════════════════╗
║   SmartLenderUp - Local Image Converter           ║
╚════════════════════════════════════════════════════╝

✅ App.tsx - 1 replacement(s)
✅ components/LoginPage.tsx - 4 replacement(s)
✅ components/MotherCompanyHome.tsx - 4 replacement(s)
...

═══════════════════════════════════════════════════
✨ Conversion Complete!
═══════════════════════════════════════════════════
```

### 4️⃣ Add Your Image Files

Copy your actual images to `public/images/`:

```bash
# Create the directory (if not created by script)
mkdir -p public/images

# Copy your images
cp /path/to/your/smartlenderup-logo.png public/images/
cp /path/to/your/laptop-dashboard.png public/images/
cp /path/to/your/ai-insights.png public/images/
cp /path/to/your/consortium-logo.png public/images/
cp /path/to/your/scissorup-logo.png public/images/
cp /path/to/your/salesup-logo.png public/images/
```

**Required Images:**
- `smartlenderup-logo.png` - Your main SmartLenderUp logo
- `laptop-dashboard.png` - Dashboard preview image
- `ai-insights.png` - AI insights preview image
- `consortium-logo.png` - Consortium logo
- `scissorup-logo.png` - ScissorUp logo
- `salesup-logo.png` - SalesUp logo

### 5️⃣ Build for Production

```bash
# Build the application
npm run build
```

You should see:
```
✓ built in 5.23s
dist/index.html                   X.XX kB
dist/assets/index-XXXXX.js        XXX.XX kB
...
```

### 6️⃣ Test Locally (Optional but Recommended)

```bash
# Preview the production build
npm run preview
```

Open http://localhost:4173 and verify:
- ✅ All logos display correctly
- ✅ Images load properly
- ✅ No console errors
- ✅ All features work as expected

### 7️⃣ Deploy to Server

Upload the `dist/` folder to your web server:

```bash
# Example using SCP
scp -r dist/* user@smartlenderup.com:/var/www/html/

# Or using FTP/SFTP client
# Upload the entire contents of the dist/ folder
```

### 8️⃣ Verify Production Site

Visit https://www.smartlenderup.com and check:
- ✅ Site loads without errors
- ✅ SSL certificate is active (HTTPS)
- ✅ All images display
- ✅ Login functionality works
- ✅ Navigation works correctly

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file for production settings:

```env
# API Configuration
VITE_API_URL=https://api.smartlenderup.com
VITE_BACKEND_URL=https://backend.smartlenderup.com

# Supabase Configuration (if using)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# M-Pesa Configuration
VITE_MPESA_CONSUMER_KEY=your_consumer_key
VITE_MPESA_CONSUMER_SECRET=your_consumer_secret
VITE_MPESA_SHORTCODE=your_shortcode
VITE_MPESA_PASSKEY=your_passkey
```

**⚠️ Important:** Never commit `.env` files to Git!

### Backend API Setup

If you're using the backend from https://github.com/alngumba-sys/smartlenderup.git:

1. Clone the backend repository
2. Configure environment variables
3. Deploy to your backend server
4. Update `VITE_API_URL` in your frontend `.env`

---

## 🔄 Updating Your Site

When you make changes in Figma Make:

1. Download the latest code
2. Run the conversion script again
3. Copy images to `public/images/`
4. Build and deploy

```bash
node scripts/convert-to-local-images.js
npm run build
scp -r dist/* user@smartlenderup.com:/var/www/html/
```

---

## ⚠️ Common Issues

### Issue: Build fails with "Cannot resolve figma:asset"

**Solution:** You forgot to run the conversion script!
```bash
node scripts/convert-to-local-images.js
npm run build
```

### Issue: Images show as broken on deployed site

**Solution:** Check that images are in the right place:
```bash
ls -la public/images/
# Should show all 6 required images
```

### Issue: "404 Not Found" errors in browser console

**Solution:** Images paths must start with `/images/` not `./images/`
The conversion script handles this automatically.

### Issue: Site shows but logos are missing

**Solution:** Make sure you copied the actual image files:
```bash
# Verify images exist
ls -la dist/images/
```

---

## 🎨 Image Requirements

### Logo Files
- **Format:** PNG with transparent background
- **Size:** 150x50px (or higher resolution, will be scaled)
- **Color:** Should work on dark background (#020838)

### Preview Images
- **Format:** PNG or JPG
- **Laptop Dashboard:** 1200x800px recommended
- **AI Insights:** 800x600px recommended

---

## 📊 Performance Optimization

### Image Optimization

Compress your images before deployment:

```bash
# Using ImageMagick
convert smartlenderup-logo.png -quality 85 -strip smartlenderup-logo.png

# Or use online tools like TinyPNG, Squoosh, etc.
```

### Build Optimization

The build is already optimized with:
- ✅ Code splitting
- ✅ Tree shaking
- ✅ Minification
- ✅ CSS optimization

---

## 🔐 Security Checklist

Before deploying:
- [ ] Remove any test/debug code
- [ ] Verify API keys are in environment variables
- [ ] Enable HTTPS/SSL on your server
- [ ] Set proper CORS headers on backend API
- [ ] Configure rate limiting
- [ ] Set up monitoring/logging

---

## 📞 Support

### Helpful Links
- **GitHub Repository:** https://github.com/alngumba-sys/smartlenderup.git
- **Live Site:** https://www.smartlenderup.com
- **API Documentation:** (in backend repo)

### Contact
For deployment issues, consult your development team or hosting provider.

---

## 🎉 Success!

Once deployed, your SmartLenderUp platform will be live and accessible at:
**https://www.smartlenderup.com**

Enjoy your fully functional microfinance platform! 🚀
