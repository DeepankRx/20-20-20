# White Screen Debugging Guide

If you see a white screen in production build:

## Quick Fix Steps

1. **Temporarily enable DevTools** (already done in code - line 142 in main.js)
   - Uncomment: `mainWindow.webContents.openDevTools();`
   - Rebuild and run
   - Check Console tab for errors

2. **Check Common Issues:**

   - **Asset paths**: Make sure `homepage: "./"` is in package.json ✅ (already done)
   - **File paths**: The code uses `path.join(__dirname, '..', 'build', 'index.html')` which should work
   - **ASAR archive**: Electron's loadFile() handles ASAR automatically

3. **Check Console Errors:**
   - Look for 404 errors (files not found)
   - Look for CORS errors
   - Look for JavaScript errors

## Common Causes

1. **Missing homepage field** - Fixed ✅
2. **Incorrect file paths in packaged app** - Should be fixed with current code
3. **React Router issues** - Not applicable (no routing)
4. **Asset loading issues** - Should be fixed with relative paths

## Testing

After building, check the console output when the app starts. The code logs:
- `__dirname` value
- Path being used to load index.html
- Any failed load errors

If DevTools shows errors, share them and we can fix the specific issue.
