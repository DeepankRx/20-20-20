# Icon Setup Guide

The app will work without a custom icon (Electron will use a default), but to add a custom icon:

## Quick Setup (Recommended)

1. **Create or download an icon** (512x512 or 1024x1024 PNG)
2. **Use an online converter**: Upload your PNG to https://cloudconvert.com/png-to-icns
3. **Save as**: `build/icon.icns`
4. **Rebuild**: Run `npm run build:mac`

## Manual Setup

1. Create PNG files in these sizes:
   - 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024
   - Also create @2x versions (32x32, 64x64, etc.)

2. Place them in `build/icon.iconset/` with names:
   - `icon_16x16.png`, `icon_16x16@2x.png`
   - `icon_32x32.png`, `icon_32x32@2x.png`
   - etc.

3. Run:
   ```bash
   cd build
   iconutil -c icns icon.iconset -o icon.icns
   ```

4. Rebuild the app

## Design Suggestions

- Eye icon with "20-20-20" text
- Gradient background (matching app colors: #667eea to #764ba2)
- Simple, recognizable design
- Ensure it looks good at small sizes (16x16)
