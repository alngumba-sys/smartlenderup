# GitHub Deployment Guide for SmartLenderUp

## Prerequisites
- Git installed on your local machine
- GitHub account: alngumba-sys
- Repository: https://github.com/alngumba-sys/smartlenderup

---

## Option 1: Push from Local Machine (Recommended)

### Step 1: Download Your Code from Figma Make
1. In Figma Make, click the **Download** button (top right)
2. Save the ZIP file to your computer
3. Extract the ZIP file to a folder (e.g., `smartlenderup-figma`)

### Step 2: Clone Your GitHub Repository
Open terminal/command prompt and run:

```bash
# Clone your repository
git clone https://github.com/alngumba-sys/smartlenderup.git

# Navigate into the folder
cd smartlenderup
```

### Step 3: Replace All Files
```bash
# Delete all existing files (except .git folder)
# On Windows:
del /s /q *.*
rmdir /s /q node_modules

# On Mac/Linux:
find . -not -path './.git/*' -not -name '.git' -delete

# Copy all files from Figma Make download
# Replace PATH_TO_EXTRACTED_ZIP with your actual path
# On Windows:
xcopy "C:\PATH_TO_EXTRACTED_ZIP\*" . /E /I /Y

# On Mac/Linux:
cp -r ~/Downloads/smartlenderup-figma/* .
```

### Step 4: Create .gitignore File
Create a file named `.gitignore` in the root directory with this content:

```
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
*~

# OS
.DS_Store
Thumbs.db

# Supabase
.supabase/
```

### Step 5: Commit and Push to GitHub
```bash
# Add all files
git add .

# Commit with a message
git commit -m "Complete migration from Figma Make - Updated to live Supabase"

# Push to GitHub (this will OVERWRITE everything)
git push origin main --force
```

**Note:** The `--force` flag will overwrite everything on GitHub with your local version.

---

## Option 2: Push from Figma Make (If Supported)

If Figma Make has direct GitHub integration:

1. Click the **Deploy** or **Export to GitHub** button
2. Authenticate with GitHub
3. Select repository: `alngumba-sys/smartlenderup`
4. Choose to overwrite existing files
5. Click **Deploy**

---

## Verification Steps

After pushing to GitHub:

1. **Visit your repository**: https://github.com/alngumba-sys/smartlenderup
2. **Check the files**: Make sure all files are updated
3. **Check the commit**: Should show your latest commit message
4. **Check timestamp**: Should be today's date

---

## Deploy to Vercel (Optional)

To deploy your app live:

### Step 1: Connect GitHub to Vercel
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **New Project**
4. Import `alngumba-sys/smartlenderup`

### Step 2: Configure Environment Variables
In Vercel project settings, add:

```
VITE_SUPABASE_URL=https://yrsnylrcgejnrxphjvtf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyc255bHJjZ2VqbnJ4cGhqdnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMTAxNDIsImV4cCI6MjA4MjU4NjE0Mn0.RCcfK0ObcSCnwqW_bD7c4M7DSN_SCTPT6QK7LXi4R9o
```

**DO NOT** add the service role key to Vercel (security risk).

### Step 3: Deploy
1. Click **Deploy**
2. Wait for build to complete
3. Visit your live URL

---

## Troubleshooting

### "Authentication failed"
```bash
# Configure Git with your credentials
git config --global user.name "alngumba-sys"
git config --global user.email "your-email@example.com"

# If using personal access token:
git remote set-url origin https://YOUR_TOKEN@github.com/alngumba-sys/smartlenderup.git
```

### "Permission denied"
- Make sure you're logged into the correct GitHub account
- Create a Personal Access Token: GitHub Settings → Developer Settings → Personal Access Tokens
- Use the token as your password when pushing

### "Repository not found"
- Double check the repository URL
- Make sure it's public or you have access

---

## Summary

1. ✅ Download code from Figma Make
2. ✅ Clone GitHub repository
3. ✅ Replace all files
4. ✅ Create .gitignore
5. ✅ Commit and push with `--force`
6. ✅ Verify on GitHub
7. ✅ (Optional) Deploy to Vercel

---

**Need help?** Contact GitHub support or leave an issue in your repository.
