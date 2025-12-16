/**
 * Fix paths in build/electron.js to point to correct locations
 */

const fs = require('fs');
const path = require('path');

const electronJsPath = path.join(__dirname, '../build/electron.js');

if (fs.existsSync(electronJsPath)) {
  let content = fs.readFileSync(electronJsPath, 'utf8');
  
  // Update require paths to point to electron/ directory
  content = content.replace(/require\('\.\/windowManager'\)/g, "require('./electron/windowManager')");
  content = content.replace(/require\("\.\/windowManager"\)/g, 'require("./electron/windowManager")');
  content = content.replace(/require\('\.\/statsManager'\)/g, "require('./electron/statsManager')");
  content = content.replace(/require\("\.\/statsManager"\)/g, 'require("./electron/statsManager")');
  content = content.replace(/require\('\.\/appManager'\)/g, "require('./electron/appManager')");
  content = content.replace(/require\("\.\/appManager"\)/g, 'require("./electron/appManager")');
  content = content.replace(/require\('\.\/multiMonitorManager'\)/g, "require('./electron/multiMonitorManager')");
  content = content.replace(/require\("\.\/multiMonitorManager"\)/g, 'require("./electron/multiMonitorManager")');
  content = content.replace(/require\('\.\/preload'\)/g, "require('./electron/preload')");
  content = content.replace(/require\("\.\/preload"\)/g, 'require("./electron/preload")');
  
  // Fix preload script path in BrowserWindow constructor  
  // In packaged app from build/electron.js, __dirname will be app.asar/build/
  // But preload.js is in app.asar/electron/, so we need to use app.getAppPath()
  // Replace the IIFE pattern with a simpler one that works in production
  // Match the IIFE pattern: (() => { ... return preloadPath; })()
  const iifePattern = /preload:\s*\(\(\)\s*=>\s*\{[^}]*__dirname[^}]*preloadPath[^}]*\}\)\(\)/gs;
  if (content.match(iifePattern)) {
    // Replace with simpler version that handles build/ case
    content = content.replace(
      /preload:\s*\(\(\)\s*=>\s*\{[^}]*__dirname[^}]*preloadPath[^}]*\}\)\(\)/gs,
      `preload: (() => {
        const { app } = require('electron');
        const preloadPath = path.join(__dirname, 'preload.js');
        if (app.isPackaged && __dirname.includes('build')) {
          return path.join(app.getAppPath(), 'electron', 'preload.js');
        }
        return preloadPath;
      })()`
    );
  } else {
    // Fallback: simple replace for direct path.join pattern
    content = content.replace(
      /preload:\s*path\.join\(__dirname,\s*['"]preload\.js['"]\)/g,
      "preload: (() => { const { app } = require('electron'); const preloadPath = path.join(__dirname, 'preload.js'); if (app.isPackaged && __dirname.includes('build')) { return path.join(app.getAppPath(), 'electron', 'preload.js'); } return preloadPath; })()"
    );
  }
  
  fs.writeFileSync(electronJsPath, content, 'utf8');
  console.log('✓ Fixed paths in build/electron.js');
} else {
  console.log('⚠ build/electron.js not found');
}
