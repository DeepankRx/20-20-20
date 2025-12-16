/**
 * Statistics Manager
 * 
 * Tracks:
 * - Total work time
 * - Total break time
 * - Number of breaks taken
 * - Number of breaks skipped
 * - Session data
 */

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const STATS_FILE = path.join(app.getPath('userData'), 'stats.json');

class StatsManager {
  constructor() {
    this.stats = this.loadStats();
  }

  /**
   * Load statistics from file
   */
  loadStats() {
    try {
      if (fs.existsSync(STATS_FILE)) {
        const statsData = fs.readFileSync(STATS_FILE, 'utf8');
        return JSON.parse(statsData);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
    
    // Default stats structure
    return {
      totalWorkTime: 0,      // Total milliseconds worked
      totalBreakTime: 0,     // Total milliseconds on break
      totalTimeOnLaptop: 0,  // Total milliseconds app was running
      breaksTaken: 0,        // Number of breaks completed
      breaksSkipped: 0,      // Number of breaks skipped
      currentSessionStart: Date.now(), // When current session started
      lastUpdated: Date.now()
    };
  }

  /**
   * Save statistics to file
   */
  saveStats() {
    try {
      const userDataDir = app.getPath('userData');
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
      }
      
      this.stats.lastUpdated = Date.now();
      fs.writeFileSync(STATS_FILE, JSON.stringify(this.stats, null, 2));
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  }

  /**
   * Record work time
   */
  recordWorkTime(durationMs) {
    this.stats.totalWorkTime += durationMs;
    this.stats.totalTimeOnLaptop += durationMs;
    this.saveStats();
  }

  /**
   * Record break time
   */
  recordBreakTime(durationMs) {
    this.stats.totalBreakTime += durationMs;
    this.stats.totalTimeOnLaptop += durationMs;
    this.stats.breaksTaken += 1;
    this.saveStats();
  }

  /**
   * Record a skipped break
   */
  recordSkippedBreak() {
    this.stats.breaksSkipped += 1;
    this.saveStats();
  }

  /**
   * Get current statistics
   */
  getStats() {
    // Update total time on laptop (current session time)
    const sessionTime = Date.now() - this.stats.currentSessionStart;
    const currentTotalTime = this.stats.totalTimeOnLaptop + sessionTime;
    
    return {
      ...this.stats,
      totalTimeOnLaptop: currentTotalTime,
      // Format times for display
      formattedWorkTime: this.formatTime(this.stats.totalWorkTime),
      formattedBreakTime: this.formatTime(this.stats.totalBreakTime),
      formattedTotalTime: this.formatTime(currentTotalTime)
    };
  }

  /**
   * Format milliseconds to readable time string
   */
  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalWorkTime: 0,
      totalBreakTime: 0,
      totalTimeOnLaptop: 0,
      breaksTaken: 0,
      breaksSkipped: 0,
      currentSessionStart: Date.now(),
      lastUpdated: Date.now()
    };
    this.saveStats();
  }
}

module.exports = StatsManager;
