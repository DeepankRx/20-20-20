/**
 * Application Manager
 * 
 * Handles:
 * - Getting the currently active application (before break)
 * - Restoring the previous application (after skip/break)
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class AppManager {
  constructor() {
    this.previousApp = null;
    this.savePreviousApp();
  }

  /**
   * Get the currently active application (macOS/Windows)
   * Returns the bundle identifier or app name
   */
  async getActiveApp() {
    if (process.platform === 'darwin') {
      // macOS: Use AppleScript
      try {
        const { stdout } = await execAsync(
          `osascript -e 'tell application "System Events" to get bundle identifier of first application process whose frontmost is true'`
        );
        const bundleId = stdout.trim();
        
        const { stdout: nameStdout } = await execAsync(
          `osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true'`
        );
        const appName = nameStdout.trim();
        
        return {
          bundleId,
          name: appName,
          platform: 'darwin'
        };
      } catch (error) {
        console.error('Error getting active app (macOS):', error);
        return null;
      }
    } else if (process.platform === 'win32') {
      // Windows: App restoration is limited - just return a placeholder
      // Windows app restoration would require complex native APIs
      // For now, we'll skip it on Windows (macOS handles this better)
      console.log('App restoration on Windows is limited');
      return null;
    } else {
      // Linux - not implemented yet
      console.warn('App restoration not yet implemented for this platform');
      return null;
    }
  }

  /**
   * Save the current active application
   */
  async savePreviousApp() {
    this.previousApp = await this.getActiveApp();
    console.log('Saved previous app:', this.previousApp);
  }

  /**
   * Restore the previous application (bring it to front)
   */
  async restorePreviousApp() {
    if (!this.previousApp) {
      console.log('No previous app to restore');
      return;
    }

    try {
      if (this.previousApp.platform === 'darwin' && process.platform === 'darwin') {
        // macOS: Activate the previous application by bundle ID
        if (this.previousApp.bundleId) {
          await execAsync(
            `osascript -e 'tell application id "${this.previousApp.bundleId}" to activate'`
          );
          console.log('Restored app (macOS):', this.previousApp.name);
          return;
        }
        // Fallback to name
        if (this.previousApp.name) {
          await execAsync(
            `osascript -e 'tell application "${this.previousApp.name}" to activate'`
          );
          console.log('Restored app by name (macOS):', this.previousApp.name);
        }
      } else if (this.previousApp.platform === 'win32' && process.platform === 'win32') {
        // Windows: App restoration is limited
        console.log('App restoration on Windows is not fully implemented');
      }
    } catch (error) {
      console.error('Error restoring app:', error);
    }
  }
}

module.exports = AppManager;
