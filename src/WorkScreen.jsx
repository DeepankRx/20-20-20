/**
 * Work Screen Component
 * 
 * Displayed during the 20-minute work period.
 * Shows remaining work time and encourages focus.
 */

import React from 'react';
import Timer from './Timer';

function WorkScreen({ timeRemaining, onOpenSettings, onOpenStats }) {
  // Convert milliseconds to minutes for display
  const minutesRemaining = Math.ceil(timeRemaining / 60000);

  // Handle go to break button click
  const handleGoToBreak = () => {
    if (window.electronAPI && window.electronAPI.goToBreak) {
      window.electronAPI.goToBreak();
    }
  };

  return (
    <div className="screen work-screen">
      {/* Settings and Stats Buttons */}
      <div className="top-buttons">
        <button 
          className="settings-button-icon"
          onClick={onOpenStats}
          title="Statistics"
          aria-label="Open statistics"
        >
          📊
        </button>
        <button 
          className="settings-button-icon"
          onClick={onOpenSettings}
          title="Settings"
          aria-label="Open settings"
        >
          ⚙️
        </button>
      </div>
      
      <div className="screen-content">
        <h1 className="screen-title">Work Time</h1>
        <p className="screen-subtitle">Focus on your work</p>
        
        <div className="timer-container">
          <Timer timeRemaining={timeRemaining} showSeconds={true} size="large" />
          <p className="timer-label">until break</p>
        </div>

        <div className="info-box">
          <p className="info-text">
            Your break will start automatically when the timer reaches zero
          </p>
        </div>

        {/* Go to Break Button */}
        <div className="button-container">
          <button 
            className="action-button go-to-break-button"
            onClick={handleGoToBreak}
            title="Start break immediately"
          >
            Go to Break
          </button>
        </div>

        <div className="tip-box">
          <p className="tip-text">
            💡 Remember: Take a 20-second break every 20 minutes to protect your eyes
          </p>
        </div>
      </div>
    </div>
  );
}

export default WorkScreen;
