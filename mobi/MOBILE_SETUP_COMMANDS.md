# Mobile App Setup Commands

This document contains all the terminal commands needed to install dependencies and run the mobile application after cloning from a GitHub repository.

## Prerequisites

Make sure you have the following installed on your system:
- Node.js (version 18 or higher)
- npm or yarn package manager
- Expo CLI (`npm install -g @expo/cli`)
- For iOS development: Xcode (macOS only)
- For Android development: Android Studio

## Installation Commands

### 1. Navigate to the mobile directory
```bash
cd mobi
```

### 2. Install dependencies
```bash
npm install
```

### 3. Verify installation
```bash
npm list --depth=0
```

## Development Commands

### Start the development server
```bash
npm start
```

### Run on specific platforms
```bash
# For Android
npm run android

# For iOS (macOS only)
npm run ios

# For web
npm run web
```

### Development with dev client
```bash
npm run dev
```

### Lint the code
```bash
npm run lint
```

## Additional Setup (if needed)

### Reset project (if encountering issues)
```bash
npm run reset-project
```

### Clear Expo cache
```bash
expo r -c
```

### Install Expo CLI globally (if not already installed)
```bash
npm install -g @expo/cli
```

## Environment Setup

1. Make sure you have the latest version of Expo CLI:
   ```bash
   npm install -g @expo/cli@latest
   ```

2. Login to Expo (if needed for publishing):
   ```bash
   expo login
   ```

## Troubleshooting

### If you encounter dependency conflicts:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### If Metro bundler issues occur:
```bash
npx expo start --clear
```

### For Android build issues:
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

### For iOS build issues (macOS only):
```bash
cd ios
pod install
cd ..
npx expo run:ios
```

## Production Build Commands

### Build for Android
```bash
expo build:android
```

### Build for iOS
```bash
expo build:ios
```

### EAS Build (recommended for production)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## Notes

- The app uses Expo SDK 54
- React Native version: 0.81.4
- React version: 19.1.0
- TypeScript is configured for development
- The app supports Android, iOS, and web platforms

## Quick Start Summary

For a fresh clone of the repository, run these commands in sequence:
```bash
cd mobi
npm install
npm start
```

Then scan the QR code with the Expo Go app on your mobile device or use an emulator.

