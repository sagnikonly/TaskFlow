# Android App Setup Guide

This guide will help you build and run the TaskFlow Android app using Capacitor.

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v16 or higher)
2. **Android Studio** (latest version)
3. **Java Development Kit (JDK)** 11 or higher
4. **Android SDK** (installed via Android Studio)

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Web App

```bash
npm run build
```

### 3. Sync with Android

```bash
npx cap sync android
```

## Android Studio Setup

### 1. Configure Android SDK

1. Open Android Studio
2. Go to **Settings/Preferences** → **Appearance & Behavior** → **System Settings** → **Android SDK**
3. Ensure you have the following installed:
   - Android SDK Platform 33 (or latest)
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
   - Android Emulator

### 2. Set Environment Variables

Add these to your `~/.zshrc` or `~/.bash_profile`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Then reload:
```bash
source ~/.zshrc
```

## Building and Running

### Option 1: Using NPM Scripts (Recommended)

```bash
# Build and sync
npm run android:build

# Open in Android Studio
npm run android:open

# Build, sync, and run on device/emulator
npm run android:run
```

### Option 2: Using Capacitor CLI

```bash
# Open Android Studio
npx cap open android

# Run on device/emulator
npx cap run android
```

### Option 3: Using Android Studio

1. Open the project:
   ```bash
   npm run android:open
   ```
2. Wait for Gradle sync to complete
3. Select a device/emulator from the dropdown
4. Click the **Run** button (green play icon)

## Creating a Signed APK

### 1. Generate a Keystore

```bash
keytool -genkey -v -keystore taskflow-release-key.keystore -alias taskflow -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configure Signing

Create `android/key.properties`:

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=taskflow
storeFile=../taskflow-release-key.keystore
```

### 3. Update `android/app/build.gradle`

Add before the `android` block:

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Add inside the `android` block:

```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
        storePassword keystoreProperties['storePassword']
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### 4. Build Release APK

```bash
cd android
./gradlew assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## Customization

### App Icon

1. Place your icon in `android/app/src/main/res/mipmap-*` folders
2. Or use Android Studio's **Image Asset Studio**:
   - Right-click `res` folder → **New** → **Image Asset**
   - Choose **Launcher Icons**
   - Upload your icon

### Splash Screen

1. Edit `android/app/src/main/res/values/styles.xml`
2. Or place splash images in `android/app/src/main/res/drawable-*` folders

### App Name

Edit `android/app/src/main/res/values/strings.xml`:

```xml
<string name="app_name">TaskFlow</string>
```

### Permissions

Edit `android/app/src/main/AndroidManifest.xml` to add permissions:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.VIBRATE" />
```

## Troubleshooting

### Gradle Build Failed

```bash
cd android
./gradlew clean
./gradlew build
```

### SDK Not Found

Ensure `ANDROID_HOME` is set correctly:
```bash
echo $ANDROID_HOME
```

### Device Not Detected

```bash
adb devices
adb kill-server
adb start-server
```

### Clear Cache

```bash
cd android
./gradlew clean
rm -rf .gradle
```

## Development Workflow

1. Make changes to your React code
2. Build the web app: `npm run build`
3. Sync with Android: `npx cap sync android`
4. Run the app: `npm run android:run`

### Live Reload (Development)

For faster development, you can use live reload:

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Update `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'http://YOUR_LOCAL_IP:8080',
     cleartext: true
   }
   ```

3. Sync and run:
   ```bash
   npx cap sync android
   npx cap run android
   ```

## Features Enabled

The Android app includes:

- ✅ Native haptic feedback
- ✅ Splash screen
- ✅ Status bar customization
- ✅ App lifecycle management
- ✅ HTTPS scheme for security
- ✅ Offline support
- ✅ Local storage
- ✅ Cloud sync with Supabase

## Next Steps

1. Test the app on a physical device
2. Customize the app icon and splash screen
3. Configure signing for release builds
4. Test all features (haptics, sync, analytics)
5. Prepare for Google Play Store submission

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)
