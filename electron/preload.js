/**
 * Preload Script
 * 
 * This script runs in a context that has access to both the DOM
 * and Node.js APIs. It acts as a bridge between the renderer (React)
 * and the main process (Electron).
 * 
 * Security: We expose only the specific APIs we need to the React app
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Listen for messages from main process
  onWorkTimerUpdate: (callback) => {
    ipcRenderer.on('work-timer-update', (event, timeRemaining) => {
      callback(timeRemaining);
    });
  },
  
  onBreakTimerUpdate: (callback) => {
    ipcRenderer.on('break-timer-update', (event, timeRemaining) => {
      callback(timeRemaining);
    });
  },
  
  onBreakStart: (callback) => {
    ipcRenderer.on('break-start', () => {
      callback();
    });
  },
  
  onBreakEnd: (callback) => {
    ipcRenderer.on('break-end', () => {
      callback();
    });
  },
  
  onWorkStart: (callback) => {
    ipcRenderer.on('work-start', () => {
      callback();
    });
  },
  
  // Emergency exit handler
  onEmergencyExit: (callback) => {
    ipcRenderer.on('emergency-exit', () => {
      callback();
    });
  },
  
  // Send requests to main process
  skipBreak: () => {
    ipcRenderer.send('skip-break');
  },
  
  goToBreak: () => {
    ipcRenderer.send('go-to-break');
  },
  
  updateSettings: (settings) => {
    ipcRenderer.send('update-settings', settings);
  },
  
  getSettings: () => {
    return ipcRenderer.invoke('get-settings');
  },
  
  // Statistics API
  getStats: () => {
    return ipcRenderer.invoke('get-stats');
  },
  
  resetStats: () => {
    ipcRenderer.send('reset-stats');
  },
  
  // Auto-start API
  getAutoStart: () => {
    return ipcRenderer.invoke('get-auto-start');
  },
  
  setAutoStart: (enabled) => {
    ipcRenderer.send('set-auto-start', enabled);
  },
  
  // Remove listeners to prevent memory leaks
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
