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
  
  // Calculate hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Format time based on whether we want to show seconds and if there are hours
  const formatTime = () => {
    if (showSeconds) {
      // If there are hours, show HH:MM:SS format
      if (hours > 0) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      } else {
        // Otherwise show MM:SS format
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }
    } else {
      // Just show minutes (or hours and minutes if there are hours)
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${minutes}m`;
      }
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
