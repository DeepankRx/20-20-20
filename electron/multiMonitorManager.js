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
          preload: path.join(__dirname, 'preload.js'),
        },
      });

      // Load React app
      if (isDev) {
        breakWindow.loadURL('http://localhost:3000');
      } else {
        breakWindow.loadFile(path.join(__dirname, '../build/index.html'));
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
