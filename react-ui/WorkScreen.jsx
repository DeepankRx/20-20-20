/**
 * Work Screen Component
 * 
 * Displayed during the 20-minute work period.
 * Shows remaining work time and encourages focus.
 */

import React from 'react';
import Timer from './Timer';

function WorkScreen({ timeRemaining }) {
  // Convert milliseconds to minutes for display
  const minutesRemaining = Math.ceil(timeRemaining / 60000);

  return (
    <div className="screen work-screen">
      <div className="screen-content">
        <h1 className="screen-title">Work Time</h1>
        <p className="screen-subtitle">Focus on your work</p>
        
        <div className="timer-container">
          <Timer timeRemaining={timeRemaining} showSeconds={false} size="large" />
          <p className="timer-label">minutes until break</p>
        </div>

        <div className="info-box">
          <p className="info-text">
            Your break will start automatically in {minutesRemaining} minute{minutesRemaining !== 1 ? 's' : ''}
          </p>
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
