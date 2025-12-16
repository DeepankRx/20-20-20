/**
 * Statistics Component
 * 
 * Displays:
 * - Total work time
 * - Total break time
 * - Total time on laptop
 * - Breaks taken
 * - Breaks skipped
 */

import React, { useState, useEffect } from 'react';

function Stats({ isOpen, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadStats();
      // Refresh stats every 5 seconds
      const interval = setInterval(loadStats, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadStats = async () => {
    try {
      if (window.electronAPI && window.electronAPI.getStats) {
        const statsData = await window.electronAPI.getStats();
        setStats(statsData);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
      if (window.electronAPI && window.electronAPI.resetStats) {
        window.electronAPI.resetStats();
        loadStats();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal stats-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2 className="settings-title">Statistics</h2>
          <button className="settings-close" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          {loading ? (
            <div className="stats-loading">Loading statistics...</div>
          ) : stats ? (
            <>
              {/* Time Statistics */}
              <div className="stats-section">
                <h3 className="stats-section-title">Time Tracking</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">Total Work Time</div>
                    <div className="stat-value">{stats.formattedWorkTime || '0s'}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Total Break Time</div>
                    <div className="stat-value">{stats.formattedBreakTime || '0s'}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Total Time on Laptop</div>
                    <div className="stat-value">{stats.formattedTotalTime || '0s'}</div>
                  </div>
                </div>
              </div>

              {/* Break Statistics */}
              <div className="stats-section">
                <h3 className="stats-section-title">Break Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">Breaks Taken</div>
                    <div className="stat-value stat-value-large">{stats.breaksTaken || 0}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Breaks Skipped</div>
                    <div className="stat-value stat-value-large">{stats.breaksSkipped || 0}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Break Completion Rate</div>
                    <div className="stat-value">
                      {stats.breaksTaken + stats.breaksSkipped > 0
                        ? `${Math.round((stats.breaksTaken / (stats.breaksTaken + stats.breaksSkipped)) * 100)}%`
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="stats-error">Unable to load statistics</div>
          )}
        </div>

        <div className="settings-footer">
          <button 
            className="settings-button settings-button-reset" 
            onClick={handleReset}
            disabled={!stats || loading}
          >
            Reset Statistics
          </button>
          <button className="settings-button settings-button-save" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default Stats;
