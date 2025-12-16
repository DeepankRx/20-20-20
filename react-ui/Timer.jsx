/**
 * Timer Component
 * 
 * Displays a countdown timer with large, readable numbers
 * Can display in different formats (seconds, minutes:seconds)
 */

import React from 'react';

function Timer({ timeRemaining, showSeconds = true, size = 'large' }) {
  // Convert milliseconds to seconds
  const totalSeconds = Math.ceil(timeRemaining / 1000);
  
  // Calculate minutes and seconds
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Format time based on whether we want to show seconds
  const formatTime = () => {
    if (showSeconds) {
      // Format as MM:SS
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
      // Just show minutes
      return `${minutes}`;
    }
  };

  const timerClass = `timer timer-${size}`;

  return (
    <div className={timerClass}>
      {formatTime()}
    </div>
  );
}

export default Timer;
