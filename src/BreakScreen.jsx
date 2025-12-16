/**
 * Break Screen Component
 * 
 * Displayed during the 20-second break period.
 * Takes fullscreen and shows countdown with eye-care message.
 * This is the critical screen that enforces the break.
 */

import React, { useEffect, useState } from 'react';
import Timer from './Timer';

function BreakScreen({ timeRemaining }) {
  const [progress, setProgress] = useState(0);
  // Get break duration from settings or use default
  const [totalBreakTime, setTotalBreakTime] = useState(20 * 1000); // 20 seconds default
  
  // Load break duration from settings
  useEffect(() => {
    const loadBreakDuration = async () => {
      try {
        if (window.electronAPI && window.electronAPI.getSettings) {
          const settings = await window.electronAPI.getSettings();
          if (settings && settings.breakDuration) {
            setTotalBreakTime(settings.breakDuration);
          }
        } else {
          const savedSettings = localStorage.getItem('breakReminderSettings');
          if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            if (settings.breakDuration) {
              setTotalBreakTime(settings.breakDuration);
            }
          }
        }
      } catch (e) {
        console.error('Error loading break duration:', e);
      }
    };
    loadBreakDuration();
  }, []);

  // Update progress for circular progress indicator
  useEffect(() => {
    const progressValue = ((totalBreakTime - timeRemaining) / totalBreakTime) * 100;
    setProgress(progressValue);
  }, [timeRemaining, totalBreakTime]);

  // Calculate radius and circumference for SVG circle
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="screen break-screen">
      {/* Blur overlay for glass effect */}
      <div className="break-glass-overlay"></div>
      
      <div className="screen-content break-content">
        <div className="break-header">
          <h1 className="screen-title break-title">Time for a Break!</h1>
        </div>

        {/* Circular Progress Ring with Timer */}
        <div className="timer-container break-timer-container">
          <div className="progress-ring-wrapper">
            <svg className="progress-ring" width="200" height="200">
              {/* Background circle */}
              <circle
                className="progress-ring-circle-bg"
                stroke="#333"
                strokeWidth="8"
                fill="transparent"
                r={radius}
                cx="100"
                cy="100"
              />
              {/* Progress circle */}
              <circle
                className="progress-ring-circle"
                stroke="#4CAF50"
                strokeWidth="8"
                fill="transparent"
                r={radius}
                cx="100"
                cy="100"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div className="progress-ring-timer">
              <Timer timeRemaining={timeRemaining} showSeconds={true} size="extra-large" />
            </div>
          </div>
        </div>

        {/* Main Message */}
        <div className="break-message">
          <h2 className="break-instruction">
            Look at something 20 feet away
          </h2>
          <p className="break-subinstruction">
            for 20 seconds
          </p>
        </div>

        {/* Eye Animation/Icon */}
        <div className="eye-animation">
          <div className="eye-icon">👁️</div>
        </div>

        {/* Skip Break Button */}
        <div className="button-container">
          <button 
            className="action-button skip-break-button"
            onClick={() => {
              if (window.electronAPI && window.electronAPI.skipBreak) {
                window.electronAPI.skipBreak();
              }
            }}
            title="Skip this break and continue working"
          >
            Skip Break
          </button>
        </div>

        {/* Safety Notice */}
        <div className="safety-notice">
          <p className="safety-text">
            Emergency exit: Press <kbd>Ctrl+Shift+B</kbd> (or <kbd>Cmd+Shift+B</kbd> on Mac)
          </p>
        </div>
      </div>
    </div>
  );
}

export default BreakScreen;
