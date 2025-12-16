/**
 * Settings Component
 * 
 * Allows users to customize work duration (hours, minutes, seconds)
 * and break duration (seconds)
 */

import React, { useState, useEffect } from 'react';

function Settings({ isOpen, onClose, onSave }) {
  // Default values: 20 minutes work, 20 seconds break
  const [workHours, setWorkHours] = useState(0);
  const [workMinutes, setWorkMinutes] = useState(20);
  const [workSeconds, setWorkSeconds] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(20);
  const [autoStart, setAutoStart] = useState(true);

  // Load saved settings on mount
  useEffect(() => {
    if (isOpen) {
      // Try to get settings from Electron first, then fallback to localStorage
      const loadSettings = async () => {
        try {
          let settings = null;
          
          // Try Electron API first
          if (window.electronAPI && window.electronAPI.getSettings) {
            settings = await window.electronAPI.getSettings();
          }
          
          // Fallback to localStorage
          if (!settings) {
            const savedSettings = localStorage.getItem('breakReminderSettings');
            if (savedSettings) {
              settings = JSON.parse(savedSettings);
            }
          }
          
          if (settings) {
            const workMs = settings.workDuration || 20 * 60 * 1000;
            const breakMs = settings.breakDuration || 20 * 1000;
            
            // Convert work duration to hours, minutes, seconds
            const totalWorkSeconds = Math.floor(workMs / 1000);
            const hours = Math.floor(totalWorkSeconds / 3600);
            const minutes = Math.floor((totalWorkSeconds % 3600) / 60);
            const seconds = totalWorkSeconds % 60;
            
            setWorkHours(hours);
            setWorkMinutes(minutes);
            setWorkSeconds(seconds);
            setBreakSeconds(Math.floor(breakMs / 1000));
          }
          
          // Load auto-start setting
          if (window.electronAPI && window.electronAPI.getAutoStart) {
            const autoStartEnabled = await window.electronAPI.getAutoStart();
            setAutoStart(autoStartEnabled);
          }
        } catch (e) {
          console.error('Error loading settings:', e);
        }
      };
      
      loadSettings();
    }
  }, [isOpen]);

  const handleSave = () => {
    // Calculate total milliseconds
    const workDuration = (workHours * 3600 + workMinutes * 60 + workSeconds) * 1000;
    const breakDuration = breakSeconds * 1000;

    // Validate: must have at least 1 second for work and break
    if (workDuration < 1000) {
      alert('Work duration must be at least 1 second');
      return;
    }
    if (breakDuration < 1000) {
      alert('Break duration must be at least 1 second');
      return;
    }

    const settings = {
      workDuration,
      breakDuration,
    };

    // Save to localStorage
    localStorage.setItem('breakReminderSettings', JSON.stringify(settings));

    // Send to Electron main process
    if (window.electronAPI && window.electronAPI.updateSettings) {
      window.electronAPI.updateSettings(settings);
    }
    
    // Update auto-start setting
    if (window.electronAPI && window.electronAPI.setAutoStart) {
      window.electronAPI.setAutoStart(autoStart);
    }

    // Call parent callback
    if (onSave) {
      onSave(settings);
    }

    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={handleCancel}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2 className="settings-title">Timer Settings</h2>
          <button className="settings-close" onClick={handleCancel}>×</button>
        </div>

        <div className="settings-content">
          {/* Work Duration */}
          <div className="settings-section">
            <h3 className="settings-section-title">Work Duration</h3>
            <p className="settings-description">
              How long to work before taking a break
            </p>
            <div className="duration-inputs">
              <div className="duration-input-group">
                <label>Hours</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={workHours}
                  onChange={(e) => setWorkHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="duration-input"
                />
              </div>
              <div className="duration-input-group">
                <label>Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={workMinutes}
                  onChange={(e) => setWorkMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="duration-input"
                />
              </div>
              <div className="duration-input-group">
                <label>Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={workSeconds}
                  onChange={(e) => setWorkSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="duration-input"
                />
              </div>
            </div>
          </div>

          {/* Break Duration */}
          <div className="settings-section">
            <h3 className="settings-section-title">Break Duration</h3>
            <p className="settings-description">
              How long the break should last
            </p>
            <div className="duration-inputs">
              <div className="duration-input-group break-input">
                <label>Seconds</label>
                <input
                  type="number"
                  min="1"
                  value={breakSeconds}
                  onChange={(e) => setBreakSeconds(Math.max(1, parseInt(e.target.value) || 1))}
                  className="duration-input"
                />
              </div>
            </div>
          </div>

          {/* Auto-Start Setting */}
          <div className="settings-section">
            <h3 className="settings-section-title">Auto-Start</h3>
            <p className="settings-description">
              Automatically launch the app when your computer starts
            </p>
            <div className="settings-toggle-container">
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={autoStart}
                  onChange={(e) => setAutoStart(e.target.checked)}
                  className="settings-toggle-input"
                />
                <span className="settings-toggle-slider"></span>
                <span className="settings-toggle-label">
                  {autoStart ? 'Enabled' : 'Disabled'}
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="settings-button settings-button-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button className="settings-button settings-button-save" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
