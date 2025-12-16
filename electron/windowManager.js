/**
 * Window Manager
 * 
 * Handles all window-related operations:
 * - Fullscreen mode
 * - Always on top
 * - Disabling controls during break
 * - Blocking keyboard shortcuts during break
 */

const { BrowserWindow, globalShortcut } = require('electron');

class WindowManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.isBreakMode = false;
    this.emergencyShortcutRegistered = false;
    this.lockedBounds = null; // Store locked bounds during break
    
    // Register emergency exit shortcut (Ctrl + Shift + B)
    this.registerEmergencyShortcut();
    
    // Prevent window movement during break mode
    this.setupMovePrevention();
  }
  
  /**
   * Setup event handlers to prevent window movement during break mode
   */
  setupMovePrevention() {
    if (!this.mainWindow) return;
    
    // Prevent window from being moved
    this.mainWindow.on('will-move', (event) => {
      if (this.isBreakMode) {
        event.preventDefault();
        // Force window back to locked position
        if (this.lockedBounds) {
          this.mainWindow.setBounds(this.lockedBounds);
        }
      }
    });
  }

  /**
   * Register emergency exit shortcut for safety
   * This allows user to exit break mode in case of emergency
   */
  registerEmergencyShortcut() {
    const emergencyShortcut = 'CommandOrControl+Shift+B';
    
    const ret = globalShortcut.register(emergencyShortcut, () => {
      console.log('Emergency exit shortcut triggered');
      this.exitBreakMode();
      // Also send message to renderer to exit break mode
      if (this.mainWindow) {
        this.mainWindow.webContents.send('emergency-exit');
      }
    });

    if (ret) {
      this.emergencyShortcutRegistered = true;
      console.log('Emergency exit shortcut registered: Ctrl+Shift+B (or Cmd+Shift+B on Mac)');
    } else {
      console.error('Failed to register emergency exit shortcut');
    }
  }

  /**
   * Enter break mode
   * - Sets fullscreen
   * - Makes window always on top
   * - Disables window controls
   */
  enterBreakMode() {
    if (!this.mainWindow) return;
    
    this.isBreakMode = true;
    
    // Ensure window is shown and focused before setting fullscreen
    if (!this.mainWindow.isVisible()) {
      this.mainWindow.show();
    }
    this.mainWindow.focus();
    
    // Get screen dimensions to ensure full coverage
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.size; // Use full screen size, not work area
    
    // Store the locked bounds to prevent movement
    this.lockedBounds = { x: 0, y: 0, width, height };
    
    // First, maximize the window to ensure it covers the screen
    this.mainWindow.setBounds(this.lockedBounds);
    
    // Disable window controls first (before fullscreen)
    this.mainWindow.setClosable(false);
    this.mainWindow.setMinimizable(false);
    this.mainWindow.setMaximizable(false);
    this.mainWindow.setResizable(false);
    this.mainWindow.setMovable(false); // Prevent dragging the window
    
    // Set fullscreen - this ensures it covers the entire screen including menu bar area
    setTimeout(() => {
      // Use native fullscreen mode (covers entire screen, hides menu bar)
      this.mainWindow.setFullScreen(true);
      
      // On macOS, ensure it appears on all spaces/desktops
      if (process.platform === 'darwin') {
        this.mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      }
      
      // Wait for fullscreen to activate, then set always on top
      setTimeout(() => {
        // Make window always on top during break - this ensures it overlays everything
        // Use 'screen-saver' level for maximum priority (highest level, overlays everything)
        this.mainWindow.setAlwaysOnTop(true, 'screen-saver');
        
        // Lock window position again after fullscreen
        this.mainWindow.setMovable(false);
        if (this.lockedBounds) {
          this.mainWindow.setBounds(this.lockedBounds);
        }
        
        // Bring window to front and ensure it's focused
        this.mainWindow.moveTop();
        this.mainWindow.focus();
        this.mainWindow.show();
        
        // One more check to ensure it's on top and locked (sometimes needed on macOS)
        if (process.platform === 'darwin') {
          setTimeout(() => {
            this.mainWindow.setAlwaysOnTop(true, 'screen-saver');
            this.mainWindow.setMovable(false);
            if (this.lockedBounds) {
              this.mainWindow.setBounds(this.lockedBounds);
            }
            this.mainWindow.moveTop();
          }, 100);
        }
      }, 200);
      
      // Periodically check and lock window position during break mode
      // This prevents any attempts to move the window
      if (this.positionLockInterval) {
        clearInterval(this.positionLockInterval);
      }
      this.positionLockInterval = setInterval(() => {
        if (this.isBreakMode && this.lockedBounds) {
          const currentBounds = this.mainWindow.getBounds();
          // If window has been moved, force it back
          if (currentBounds.x !== this.lockedBounds.x || 
              currentBounds.y !== this.lockedBounds.y ||
              currentBounds.width !== this.lockedBounds.width ||
              currentBounds.height !== this.lockedBounds.height) {
            this.mainWindow.setBounds(this.lockedBounds);
            this.mainWindow.setMovable(false);
            this.mainWindow.moveTop();
          }
        }
      }, 500); // Check every 500ms
    }, 100);
    
    // Block keyboard shortcuts during break
    // Note: Some system shortcuts may still work, but we try to block common ones
    this.blockKeyboardShortcuts();
    
    console.log('Break mode entered - fullscreen and locked');
  }

  /**
   * Exit break mode
   * - Exits fullscreen
   * - Minimizes window to background
   * - Restores normal window behavior
   */
  exitBreakMode() {
    if (!this.mainWindow) return;
    
    this.isBreakMode = false;
    
    // Clear position lock interval
    if (this.positionLockInterval) {
      clearInterval(this.positionLockInterval);
      this.positionLockInterval = null;
    }
    
    // Clear locked bounds
    this.lockedBounds = null;
    
    // Remove always on top first
    this.mainWindow.setAlwaysOnTop(false);
    
    // Exit fullscreen
    this.mainWindow.setFullScreen(false);
    
    // On macOS, restore normal workspace behavior
    if (process.platform === 'darwin') {
      this.mainWindow.setVisibleOnAllWorkspaces(false);
    }
    
    // Restore window controls
    this.mainWindow.setClosable(true);
    this.mainWindow.setMinimizable(true);
    this.mainWindow.setMaximizable(true);
    this.mainWindow.setResizable(true);
    this.mainWindow.setMovable(true); // Allow dragging again after break
    
    // Minimize/hide window to background so user can continue working
    // Small delay to ensure fullscreen exits first
    setTimeout(() => {
      // On macOS, hide the window (goes to dock but doesn't minimize)
      if (process.platform === 'darwin') {
        this.mainWindow.hide();
      } else {
        // On Windows/Linux, minimize the window
        this.mainWindow.minimize();
      }
    }, 300);
    
    // Unblock keyboard shortcuts
    this.unblockKeyboardShortcuts();
    
    console.log('Break mode exited - normal window behavior restored');
  }

  /**
   * Block common keyboard shortcuts during break
   * Prevents users from bypassing the break screen
   */
  blockKeyboardShortcuts() {
    // Try to block common quit shortcuts (may not work on all systems)
    // Note: System-level shortcuts are harder to block, but we try
    const shortcutsToBlock = [
      'CommandOrControl+Q',
      'CommandOrControl+W',
      'Alt+F4', // Windows/Linux
    ];

    shortcutsToBlock.forEach(shortcut => {
      globalShortcut.register(shortcut, () => {
        console.log(`Blocked shortcut: ${shortcut}`);
        // Return false or do nothing to block
      });
    });
  }

  /**
   * Unblock keyboard shortcuts after break
   */
  unblockKeyboardShortcuts() {
    // Unregister all shortcuts except emergency one
    globalShortcut.unregisterAll();
    
    // Re-register emergency shortcut
    this.registerEmergencyShortcut();
  }

  /**
   * Cleanup when app is closing
   */
  cleanup() {
    // Clear position lock interval
    if (this.positionLockInterval) {
      clearInterval(this.positionLockInterval);
      this.positionLockInterval = null;
    }
    
    globalShortcut.unregisterAll();
    this.emergencyShortcutRegistered = false;
  }
}

module.exports = WindowManager;
