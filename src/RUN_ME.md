# RUN THIS COMMAND

## Mac/Linux:
```bash
chmod +x START.sh && ./START.sh
```

## Windows:
```cmd
START.bat
```

## Or Copy/Paste:

**Mac/Linux:**
```bash
pkill -9 node; rm -rf node_modules/.vite .vite dist; npm run dev
```

**Windows PowerShell:**
```powershell
taskkill /F /IM node.exe; rm -r node_modules\.vite,.vite,dist -ErrorAction SilentlyContinue; npm run dev
```

---

**Then open:** http://localhost:5173

**If browser shows error:** Press F12 → Right-click refresh → "Empty Cache and Hard Reload"

---

**Done!** ✅
