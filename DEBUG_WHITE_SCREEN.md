# Debugging White Screen in Production Build

If you see a white screen in the production build, follow these steps:

## Quick Fix - Enable DevTools Temporarily

1. Open `electron/main.js`
2. Find the line: `// mainWindow.webContents.openDevTools();`
3. Uncomment it to: `mainWindow.webContents.openDevTools();`
4. Rebuild: `npm run build:mac`
5. Open the app and check the Console tab in DevTools for errors
6. Fix the errors, then comment out DevTools again

## Common Issues

### 1. Path Issues
- Check Console for 404 errors on JS/CSS files
- Verify `homepage: "./"` is in package.json
- Ensure paths in build/index.html are relative (./static/...)

### 2. Missing Files
- Check that build/static/js/ and build/static/css/ exist
- Verify electron files are copied to build/electron/

### 3. JavaScript Errors
- Check Console for runtime errors
- Common: undefined variables, missing modules, etc.

## Verify Build Structure

The built app should have this structure in app.asar:
```
app.asar/
├── build/
│   ├── index.html
│   └── static/
│       ├── js/
│       └── css/
├── electron/
│   ├── main.js
│   ├── preload.js
│   └── ...
└── package.json
```
