/**
 * Electron Main Process
 * 
 * This is the main entry point for the Electron application.
 * It runs in Node.js and manages:
 * - Creating and controlling application windows
 * - Managing timers (20 minutes work, 20 seconds break)
 * - Window behavior (fullscreen, always on top, etc.)
 * - Communication with the React UI (renderer process)
 */

const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const WindowManager = require('./windowManager');
const StatsManager = require('./statsManager');
const AppManager = require('./appManager');
const MultiMonitorManager = require('./multiMonitorManager');

// Default timing (in milliseconds)
let WORK_DURATION = 20 * 60 * 1000; // 20 minutes
let BREAK_DURATION = 20 * 1000; // 20 seconds

// Settings file path
const SETTINGS_FILE = path.join(app.getPath('userData'), 'settings.json');

// Global references
let mainWindow = null;
let windowManager = null;
let workTimer = null;
let breakTimer = null;
let isBreakMode = false;
let statsManager = null;
let appManager = null;
let multiMonitorManager = null;
let workStartTime = null;
let breakStartTime = null;

/**
 * Load settings from file or use defaults
 */
function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const settingsData = fs.readFileSync(SETTINGS_FILE, 'utf8');
      const settings = JSON.parse(settingsData);
      
      if (settings.workDuration && settings.workDuration >= 1000) {
        WORK_DURATION = settings.workDuration;
      }
      if (settings.breakDuration && settings.breakDuration >= 1000) {
        BREAK_DURATION = settings.breakDuration;
      }
      
      console.log('Settings loaded:', { WORK_DURATION, BREAK_DURATION });
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

/**
 * Save settings to file
 */
function saveSettings(settings) {
  try {
    // Ensure userData directory exists
    const userDataDir = app.getPath('userData');
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }
    
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    
    // Update global duration variables
    if (settings.workDuration && settings.workDuration >= 1000) {
      WORK_DURATION = settings.workDuration;
    }
    if (settings.breakDuration && settings.breakDuration >= 1000) {
      BREAK_DURATION = settings.breakDuration;
    }
    
    console.log('Settings saved:', settings);
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// Load settings when app starts
loadSettings();

// Initialize managers
statsManager = new StatsManager();
appManager = new AppManager();
multiMonitorManager = new MultiMonitorManager();

/**
 * Create the main application window
 */
function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // Security: Enable context isolation and disable node integration
      nodeIntegration: false,
      contextIsolation: true,
      // Preload script acts as bridge between main and renderer
      preload: path.join(__dirname, 'preload.js'),
    },
    // Start in fullscreen for better experience
    fullscreen: false, // We'll manage fullscreen manually
    frame: true,
    title: '20-20-20 Break Reminder',
  });

  // Initialize window manager
  windowManager = new WindowManager(mainWindow);

  // Load the React app
  // In development, load from React dev server
  // In production, load from built files
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    cleanup();
    mainWindow = null;
    windowManager = null;
  });

  // Prevent closing during break mode (unless emergency exit)
  mainWindow.on('close', (event) => {
    if (isBreakMode) {
      event.preventDefault();
      console.log('Window close blocked during break mode');
    }
  });

  // Start the work timer when window is ready
  mainWindow.once('ready-to-show', () => {
    startWorkTimer();
  });
}

/**
 * Start the work timer (duration set by WORK_DURATION)
 */
function startWorkTimer() {
  const minutes = Math.floor(WORK_DURATION / 60000);
  const seconds = Math.floor((WORK_DURATION % 60000) / 1000);
  console.log(`Starting work timer: ${minutes}m ${seconds}s (${WORK_DURATION}ms)...`);
  isBreakMode = false;
  
  // Record work time if we just finished a break
  if (breakStartTime && statsManager) {
    const breakDuration = Date.now() - breakStartTime;
    statsManager.recordBreakTime(breakDuration);
    breakStartTime = null;
  }
  
  // Record work start time
  workStartTime = Date.now();
  
  // Notify renderer that work has started
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('work-start');
  }

  let timeRemaining = WORK_DURATION;
  
  // Clear any existing timers
  clearInterval(workTimer);
  clearInterval(breakTimer);
  
  // Update UI every second with remaining time
  workTimer = setInterval(() => {
    timeRemaining -= 1000;
    
    // Send update to renderer process
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('work-timer-update', timeRemaining);
    }
    
    // When work timer reaches zero, start break
    if (timeRemaining <= 0) {
      clearInterval(workTimer);
      // Record work time before starting break
      if (workStartTime && statsManager) {
        const workDuration = Date.now() - workStartTime;
        statsManager.recordWorkTime(workDuration);
        workStartTime = null;
      }
      startBreakTimer();
    }
  }, 1000);
}

/**
 * Start the break timer (duration set by BREAK_DURATION)
 */
function startBreakTimer() {
  console.log(`Starting ${BREAK_DURATION / 1000}-second break timer...`);
  isBreakMode = true;
  
  // Record break start time
  breakStartTime = Date.now();
  
  // Save current app before break
  if (appManager) {
    appManager.savePreviousApp();
  }
  
  // Create break windows on all monitors
  let timeRemaining = BREAK_DURATION;
  if (multiMonitorManager) {
    multiMonitorManager.createBreakWindowsOnAllDisplays(timeRemaining, () => {
      // This callback is not used, but kept for compatibility
    });
  }
  
  // Also use main window for break (fallback if multi-monitor fails)
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    if (!mainWindow.isVisible()) {
      mainWindow.show();
    }
    
    // Enter break mode (fullscreen, lock window)
    if (windowManager) {
      windowManager.enterBreakMode();
    }
    
    // Notify renderer that break has started
    mainWindow.webContents.send('break-start');
  }
  
  // Update UI every second with remaining time
  breakTimer = setInterval(() => {
    timeRemaining -= 1000;
    
    // Send update to all break windows (multi-monitor)
    if (multiMonitorManager) {
      multiMonitorManager.updateBreakTimer(timeRemaining);
    }
    
    // Send update to main window renderer process
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('break-timer-update', timeRemaining);
    }
    
    // When break timer reaches zero, start work again
    if (timeRemaining <= 0) {
      clearInterval(breakTimer);
      
      // Close all break windows (multi-monitor)
      if (multiMonitorManager) {
        multiMonitorManager.closeAllBreakWindows();
      }
      
      // Exit break mode
      if (windowManager) {
        windowManager.exitBreakMode();
      }
      
      // Notify renderer that break has ended
      if (multiMonitorManager) {
        multiMonitorManager.sendBreakEnd();
      }
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('break-end');
      }
      
      // Record break time
      if (breakStartTime && statsManager) {
        const breakDuration = Date.now() - breakStartTime;
        statsManager.recordBreakTime(breakDuration);
        breakStartTime = null;
      }
      
      // Start work timer again
      startWorkTimer();
    }
  }, 1000);
}

/**
 * Cleanup resources when app closes
 */
function cleanup() {
  clearInterval(workTimer);
  clearInterval(breakTimer);
  
  // Record final work time if session is ending
  if (workStartTime && statsManager) {
    const workDuration = Date.now() - workStartTime;
    statsManager.recordWorkTime(workDuration);
  }
  
  // Close all break windows
  if (multiMonitorManager) {
    multiMonitorManager.closeAllBreakWindows();
  }
  
  if (windowManager) {
    windowManager.cleanup();
  }
  
  isBreakMode = false;
}

// App event handlers

// When Electron has finished initialization
app.whenReady().then(() => {
  // Enable auto-start on system login (macOS/Windows)
  // On macOS, this adds the app to Login Items automatically
  // On Windows, this adds the app to Startup folder
  app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: false, // Start visible
    name: app.getName(),
    args: [], // No special arguments needed
  });
  
  console.log('Auto-start enabled - app will launch on system login');

  createWindow();

  // macOS: Show window when dock icon is clicked (if hidden)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      // If window exists but is hidden, show it
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  // On macOS, apps typically stay active even when all windows are closed
  if (process.platform !== 'darwin') {
    cleanup();
    app.quit();
  }
});

// Cleanup before app quits
app.on('before-quit', () => {
  cleanup();
});

// Handle IPC messages from renderer

// Emergency exit request
ipcMain.on('emergency-exit-request', () => {
  if (windowManager) {
    windowManager.exitBreakMode();
  }
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('break-end');
  }
  startWorkTimer();
});

// Skip break - exit break mode and start work timer
ipcMain.on('skip-break', async () => {
  console.log('Skip break requested');
  
  // Record skipped break
  if (statsManager) {
    statsManager.recordSkippedBreak();
  }
  
  // Clear break timer
  clearInterval(breakTimer);
  
  // Close all break windows (multi-monitor)
  if (multiMonitorManager) {
    multiMonitorManager.closeAllBreakWindows();
  }
  
  // Exit break mode
  if (windowManager) {
    windowManager.exitBreakMode();
  }
  
  // Notify renderer that break has ended
  if (multiMonitorManager) {
    multiMonitorManager.sendBreakEnd();
  }
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('break-end');
  }
  
  // Restore previous application
  if (appManager) {
    await appManager.restorePreviousApp();
  }
  
  // Clear break start time (we're skipping, so don't record break time)
  breakStartTime = null;
  
  // Start work timer
  startWorkTimer();
});

// Go to break - manually trigger break mode
ipcMain.on('go-to-break', () => {
  console.log('Go to break requested');
  // Clear work timer
  clearInterval(workTimer);
  
  // Start break timer immediately
  startBreakTimer();
});

// Update settings from renderer
ipcMain.on('update-settings', (event, settings) => {
  console.log('Settings update requested:', settings);
  saveSettings(settings);
  
  // If we're currently in work mode, restart the timer with new duration
  if (!isBreakMode && workTimer) {
    clearInterval(workTimer);
    startWorkTimer();
  }
});

// Get settings (for renderer to load initial values)
ipcMain.handle('get-settings', () => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const settingsData = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return JSON.parse(settingsData);
    }
  } catch (error) {
    console.error('Error getting settings:', error);
  }
  return { workDuration: WORK_DURATION, breakDuration: BREAK_DURATION };
});

// Get statistics
ipcMain.handle('get-stats', () => {
  if (statsManager) {
    return statsManager.getStats();
  }
  return null;
});

// Reset statistics
ipcMain.on('reset-stats', () => {
  if (statsManager) {
    statsManager.resetStats();
  }
});

// Get auto-start status
ipcMain.handle('get-auto-start', () => {
  const loginItemSettings = app.getLoginItemSettings();
  return loginItemSettings.openAtLogin;
});

// Set auto-start status
ipcMain.on('set-auto-start', (event, enabled) => {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    openAsHidden: false,
    name: app.getName(),
    args: [],
  });
  console.log(`Auto-start ${enabled ? 'enabled' : 'disabled'}`);
});
