# 20-20-20

A macOS desktop application built with Electron and React that enforces the 20-20-20 eye care rule. After every 20 minutes of work, the app forces you to take a 20-second break to look at something 20 feet away.

## Features

- ✅ Automatic 20-minute work timer
- ✅ Fullscreen break screen with 20-second countdown
- ✅ Window locking during break (cannot close or minimize)
- ✅ Emergency exit shortcut (Ctrl+Shift+B or Cmd+Shift+B)
- ✅ Clean, minimal UI with calming colors
- ✅ Large, readable countdown timers
- ✅ Visual progress indicator during breaks

## Technology Stack

- **Electron** - Desktop app framework for window control and background processes
- **React** - Modern UI library for the user interface
- **Node.js** - Timer management and app logic

## Project Structure

```
/
├── electron/
│   ├── main.js           # Main Electron process (timer logic, window management)
│   ├── preload.js        # Bridge between main and renderer processes
│   └── windowManager.js  # Fullscreen and window control logic
├── src/
│   ├── App.jsx           # Main React component
│   ├── BreakScreen.jsx   # Break mode UI
│   ├── WorkScreen.jsx    # Work mode UI
│   ├── Timer.jsx         # Reusable timer component
│   ├── index.js          # React entry point
│   └── styles.css        # Application styles
├── public/
│   └── index.html        # HTML template
└── package.json          # Dependencies and scripts
```

## Installation

1. **Clone or download this project**

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Running the App

### Development Mode

Run both the React dev server and Electron together:

```bash
npm run dev
```

This will:
- Start the React development server on `http://localhost:3000`
- Launch the Electron app with hot-reloading enabled
- Open DevTools automatically for debugging

### Production Mode

Build the React app and run Electron:

```bash
npm run react-build
npm start
```

## Building for macOS

To create a distributable macOS application:

```bash
npm run build:mac
```

This will:
1. Build the React app for production
2. Package everything into a macOS `.dmg` file
3. Output will be in the `dist/` directory

## How It Works

### Timer Logic

- **Work Phase (20 minutes):**
  - App tracks time in the background
  - Displays remaining work time
  - Electron main process manages the timer

- **Break Phase (20 seconds):**
  - Automatically triggers after 20 minutes
  - Window goes fullscreen
  - Window controls are disabled
  - Shows countdown timer and eye-care message
  - Cannot be closed or minimized (except emergency exit)

- **Cycle:**
  - After break ends, work timer restarts automatically
  - Process repeats continuously while app is running

### Window Behavior

During **Work Mode:**
- Normal window behavior
- Can be minimized, closed, or resized

During **Break Mode:**
- Fullscreen mode (cannot exit)
- Always on top
- Close, minimize, and resize buttons disabled
- Keyboard shortcuts blocked (where possible)
- **Emergency exit:** Press `Ctrl+Shift+B` (or `Cmd+Shift+B` on Mac) to exit break mode

### Architecture

**Electron Main Process:**
- Runs in the background (Node.js environment)
- Manages timers using `setInterval`
- Controls window state (fullscreen, always on top)
- Sends timer updates to React UI via IPC

**React Renderer Process:**
- Displays the user interface
- Receives timer updates from main process
- Switches between Work and Break screens
- Reacts to user interactions (currently minimal, as breaks are enforced)

**Communication:**
- Uses Electron's IPC (Inter-Process Communication)
- Preload script provides secure bridge between main and renderer
- No direct Node.js access in renderer (security best practice)

## Customization

### Changing Timer Durations

Edit `electron/main.js`:

```javascript
const WORK_DURATION = 20 * 60 * 1000; // Change 20 to desired minutes
const BREAK_DURATION = 20 * 1000;     // Change 20 to desired seconds
```

### Styling

Edit `src/styles.css` to customize:
- Colors and gradients
- Font sizes
- Animations
- Layout

### Emergency Exit Shortcut

Edit `electron/windowManager.js`:

```javascript
const emergencyShortcut = 'CommandOrControl+Shift+B'; // Change to your preference
```

## Safety Features

- **Emergency Exit Shortcut:** Always available to exit break mode
- **Window Controls:** Restored after break ends
- **No Data Loss:** App doesn't save any sensitive data
- **Local Only:** All processing happens on your machine

## Troubleshooting

### App won't start
- Make sure all dependencies are installed: `npm install`
- Check that Node.js version is 16+ and npm is installed

### Timers not working
- Check browser console (DevTools) for errors
- Ensure Electron main process is running (check Terminal/Console)

### Window not going fullscreen
- Check macOS permissions for the app
- Try running: `npm start` in production mode instead of dev mode

### Emergency exit not working
- Try both `Ctrl+Shift+B` and `Cmd+Shift+B`
- Check that no other app is using that shortcut
- Restart the app if needed

## Future Enhancements (Optional)

Potential features you could add:
- Sound notification before break starts
- Pause/Resume button (currently disabled by default)
- Daily statistics (breaks taken, total focus time)
- Auto-start on macOS boot
- Customizable break messages
- Multiple break types (short break, long break)

## License

MIT License - Feel free to modify for personal use.

## Notes

- This app is designed for **personal use only**
- Not intended for App Store distribution
- macOS-focused (though Electron supports other platforms)
- Timer logic is simple and reliable, but may drift slightly over very long periods (restart app periodically for accuracy)

---

**Take care of your eyes! 👁️**
