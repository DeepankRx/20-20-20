/**
 * Main App Component
 * 
 * Manages the overall application state and switches between
 * Work mode and Break mode based on timer states from Electron
 */

import React, { useState, useEffect } from 'react';
import WorkScreen from './WorkScreen';
import BreakScreen from './BreakScreen';
import Settings from './Settings';
import Stats from './Stats';

function App() {
  // Track whether we're in break mode or work mode
  const [isBreakMode, setIsBreakMode] = useState(false);
  // Time remaining in current phase (in milliseconds)
  const [timeRemaining, setTimeRemaining] = useState(20 * 60 * 1000); // Start with 20 minutes
  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // Stats modal state
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  useEffect(() => {
    // Check if electronAPI is available (it won't be in regular browser)
    if (!window.electronAPI) {
      console.warn('Electron API not available. Running in browser mode.');
      return;
    }

    // Listen for work timer updates (countdown during work time)
    window.electronAPI.onWorkTimerUpdate((timeRemaining) => {
      setTimeRemaining(timeRemaining);
      setIsBreakMode(false);
    });

    // Listen for break timer updates (countdown during break)
    window.electronAPI.onBreakTimerUpdate((timeRemaining) => {
      setTimeRemaining(timeRemaining);
      setIsBreakMode(true);
    });

    // Listen for break start event
    window.electronAPI.onBreakStart(() => {
      setIsBreakMode(true);
    });

    // Listen for break end event
    window.electronAPI.onBreakEnd(() => {
      setIsBreakMode(false);
    });

    // Listen for work start event
    window.electronAPI.onWorkStart(() => {
      setIsBreakMode(false);
    });

    // Listen for emergency exit
    window.electronAPI.onEmergencyExit(() => {
      setIsBreakMode(false);
    });

    // Cleanup: Remove listeners when component unmounts
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('work-timer-update');
        window.electronAPI.removeAllListeners('break-timer-update');
        window.electronAPI.removeAllListeners('break-start');
        window.electronAPI.removeAllListeners('break-end');
        window.electronAPI.removeAllListeners('work-start');
        window.electronAPI.removeAllListeners('emergency-exit');
      }
    };
  }, []);

  // Handle settings save
  const handleSettingsSave = (settings) => {
    console.log('Settings saved:', settings);
    // Settings are sent to Electron main process via IPC in Settings component
  };

  // Render appropriate screen based on mode
  return (
    <div className="app">
      {isBreakMode ? (
        <BreakScreen timeRemaining={timeRemaining} />
      ) : (
        <WorkScreen 
          timeRemaining={timeRemaining} 
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
        />
      )}
      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSettingsSave}
      />
      <Stats
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
      />
    </div>
  );
}

export default App;
