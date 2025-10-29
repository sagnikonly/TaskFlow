# Android Quick Start

## 🚀 Quick Commands

```bash
# Build and sync
npm run android:build

# Open in Android Studio
npm run android:open

# Build and run on device
npm run android:run
```

## 📱 First Time Setup

1. **Install Android Studio** from https://developer.android.com/studio

2. **Install SDK** (via Android Studio):
   - Open Android Studio
   - Settings → Android SDK
   - Install SDK Platform 33+

3. **Set Environment Variables** (add to ~/.zshrc):
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

4. **Build and Run**:
   ```bash
   npm install
   npm run android:build
   npm run android:open
   ```

## 🔧 Development Workflow

```bash
# 1. Make code changes in src/

# 2. Build web app
npm run build

# 3. Sync to Android
npx cap sync android

# 4. Run on device
npx cap run android
```

## 📦 What's Included

- ✅ Native Android app
- ✅ Haptic feedback (vibration)
- ✅ Splash screen
- ✅ Status bar control
- ✅ App lifecycle hooks
- ✅ Offline support
- ✅ All web features

## 🎯 Key Files

- `capacitor.config.ts` - Capacitor configuration
- `android/` - Native Android project
- `android/app/src/main/AndroidManifest.xml` - App permissions
- `android/app/build.gradle` - Build configuration

## 🐛 Common Issues

**Gradle build failed?**
```bash
cd android && ./gradlew clean && cd ..
```

**Device not detected?**
```bash
adb devices
```

**Need to reset?**
```bash
rm -rf android
npx cap add android
npx cap sync android
```

## 📖 Full Documentation

See `ANDROID_SETUP_GUIDE.md` for complete instructions.
