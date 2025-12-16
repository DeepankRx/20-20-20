/**
 * Multi-Monitor Manager
 * 
 * Creates break windows on all available displays
 */

const { BrowserWindow, screen } = require('electron');
const path = require('path');
const { app } = require('electron');

class MultiMonitorManager {
  constructor() {
    this.breakWindows = [];
  }

  /**
   * Create break windows on all displays
   */
  createBreakWindowsOnAllDisplays(timeRemaining, onBreakEnd) {
    const displays = screen.getAllDisplays();
    
    // Close any existing break windows
    this.closeAllBreakWindows();

    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
    
    displays.forEach((display, index) => {
      const { width, height, x, y } = display.bounds;
      
      const breakWindow = new BrowserWindow({
        x,
        y,
        width,
        height,
        fullscreen: true,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: index > 0, // Only show main window in taskbar
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          // Preload path - handle both dev and production
          preload: (() => {
            const { app } = require('electron');
            const preloadPath = path.join(__dirname, 'preload.js');
            // In packaged app, if __dirname is build/, go to electron/preload.js
            if (app.isPackaged && __dirname.includes('build')) {
              return path.join(app.getAppPath(), 'electron', 'preload.js');
            }
            return preloadPath;
          })(),
        },
      });

      // Load React app
      if (isDev) {
        breakWindow.loadURL('http://localhost:3000');
      } else {
        const { app } = require('electron');
        // Use app.getAppPath() to get correct path in production
        const indexPath = path.join(app.getAppPath(), 'build', 'index.html');
        breakWindow.loadFile(indexPath).catch(err => {
          console.error('Error loading index.html in break window:', err);
          // Fallback to relative path
          const fallbackPath = path.join(__dirname, '..', 'build', 'index.html');
          breakWindow.loadFile(fallbackPath);
        });
      }

      // Make window non-movable and non-resizable
      breakWindow.setMovable(false);
      breakWindow.setResizable(false);
      breakWindow.setClosable(false);
      breakWindow.setMinimizable(false);
      breakWindow.setMaximizable(false);

      // Set fullscreen and always on top
      breakWindow.setFullScreen(true);
      breakWindow.setAlwaysOnTop(true, 'screen-saver');
      if (process.platform === 'darwin') {
        breakWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      }

      // Send break start event
      breakWindow.webContents.once('did-finish-load', () => {
        breakWindow.webContents.send('break-start');
        breakWindow.webContents.send('break-timer-update', timeRemaining);
      });

      // Prevent closing
      breakWindow.on('close', (event) => {
        event.preventDefault();
      });

      this.breakWindows.push(breakWindow);
    });

    return this.breakWindows;
  }

  /**
   * Update timer on all break windows
   */
  updateBreakTimer(timeRemaining) {
    this.breakWindows.forEach(window => {
      if (window && !window.isDestroyed()) {
        window.webContents.send('break-timer-update', timeRemaining);
      }
    });
  }

  /**
   * Send break end event to all break windows
   */
  sendBreakEnd() {
    this.breakWindows.forEach(window => {
      if (window && !window.isDestroyed()) {
        window.webContents.send('break-end');
      }
    });
  }

  /**
   * Close all break windows
   */
  closeAllBreakWindows() {
    this.breakWindows.forEach(window => {
      if (window && !window.isDestroyed()) {
        window.destroy();
      }
    });
    this.breakWindows = [];
  }
}

module.exports = MultiMonitorManager;
