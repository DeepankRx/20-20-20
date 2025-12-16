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
  const totalBreakTime = 20 * 1000; // 20 seconds in milliseconds

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
      <div className="screen-content">
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
