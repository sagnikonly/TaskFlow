# TaskFlow Android App

A beautiful and intuitive task management app built with React, TypeScript, and Capacitor.

## 🎯 Features

### Core Features
- ✅ **Task Management** - Create, edit, complete, and delete tasks
- ✅ **Smart Organization** - Organize by subjects with custom icons
- ✅ **Priority Levels** - High, Medium, Low priority tasks
- ✅ **Due Dates** - Set and track task deadlines
- ✅ **Search & Filter** - Quickly find tasks

### Advanced Features
- 📊 **Analytics Dashboard** - Track productivity and completion rates
- 🎯 **Goal Tracking** - Set and monitor daily/weekly goals
- 🔥 **Productivity Heatmap** - Visualize your productivity patterns
- 🤖 **AI-Powered Step-Up** - Get intelligent task suggestions
- 📈 **Subject Analytics** - Detailed insights per subject

### Mobile Features
- 📱 **Native Android App** - Smooth, native performance
- 🔔 **Haptic Feedback** - Tactile feedback for interactions
- 🌙 **Dark Mode** - Easy on the eyes
- 💾 **Offline Support** - Works without internet
- ☁️ **Cloud Sync** - Sync across devices with Supabase
- 🎨 **Beautiful UI** - Modern, intuitive design

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v16+)
2. **Android Studio** (latest)
3. **JDK** 11+
4. **Android SDK** (via Android Studio)

### Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Build the app
npm run build

# 3. Sync with Android
npx cap sync android

# 4. Open in Android Studio
npm run android:open

# 5. Run on device/emulator
# Click the green play button in Android Studio
```

### NPM Scripts

```bash
npm run android:build    # Build web app and sync to Android
npm run android:open     # Open project in Android Studio
npm run android:run      # Build, sync, and run on device
```

## 📱 App Structure

```
android/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── AndroidManifest.xml    # App configuration
│   │       ├── assets/                # Web app files
│   │       ├── res/                   # Resources (icons, etc)
│   │       └── java/                  # Native code
│   └── build.gradle                   # Build configuration
└── build.gradle                       # Project configuration
```

## 🔧 Configuration

### App Identity

- **App Name**: TaskFlow
- **Package ID**: com.taskflow.app
- **Version**: Defined in `android/app/build.gradle`

### Capacitor Plugins

The app uses these Capacitor plugins:

- `@capacitor/app` - App lifecycle and state
- `@capacitor/haptics` - Vibration feedback
- `@capacitor/splash-screen` - Launch screen
- `@capacitor/status-bar` - Status bar styling

### Permissions

Configured in `AndroidManifest.xml`:

- `INTERNET` - Network access for cloud sync
- `VIBRATE` - Haptic feedback
- `ACCESS_NETWORK_STATE` - Check connectivity

## 🎨 Customization

### Change App Icon

1. Prepare icon (512x512 PNG)
2. Use Android Studio's Image Asset Studio:
   - Right-click `res` → New → Image Asset
   - Select Launcher Icons
   - Upload your icon

### Change App Name

Edit `android/app/src/main/res/values/strings.xml`:

```xml
<string name="app_name">Your App Name</string>
```

### Change Package ID

1. Update `capacitor.config.ts`:
   ```typescript
   appId: 'com.yourcompany.app'
   ```

2. Sync:
   ```bash
   npx cap sync android
   ```

## 🏗️ Building for Production

### Generate Keystore

```bash
keytool -genkey -v -keystore taskflow-release-key.keystore \
  -alias taskflow -keyalg RSA -keysize 2048 -validity 10000
```

### Configure Signing

Create `android/key.properties`:

```properties
storePassword=YOUR_PASSWORD
keyPassword=YOUR_PASSWORD
keyAlias=taskflow
storeFile=../taskflow-release-key.keystore
```

### Build Release APK

```bash
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

### Build App Bundle (for Play Store)

```bash
cd android
./gradlew bundleRelease
```

Bundle location: `android/app/build/outputs/bundle/release/app-release.aab`

## 🧪 Testing

### Run on Emulator

1. Open Android Studio
2. AVD Manager → Create Virtual Device
3. Select device and system image
4. Click Run

### Run on Physical Device

1. Enable Developer Options on your device
2. Enable USB Debugging
3. Connect via USB
4. Click Run in Android Studio

### Debug with Chrome DevTools

1. Run app on device
2. Open Chrome: `chrome://inspect`
3. Click "Inspect" on your app

## 🐛 Troubleshooting

### Gradle Build Failed

```bash
cd android
./gradlew clean
./gradlew build
```

### SDK Not Found

```bash
# Add to ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Device Not Detected

```bash
adb devices
adb kill-server
adb start-server
```

### App Crashes on Launch

1. Check logs in Android Studio (Logcat)
2. Rebuild:
   ```bash
   npm run build
   npx cap sync android
   ```

### Haptics Not Working

- Ensure device supports vibration
- Check VIBRATE permission in AndroidManifest.xml
- Test on physical device (emulators may not support haptics)

## 📊 Performance Optimization

### Reduce APK Size

1. Enable ProGuard in `build.gradle`:
   ```gradle
   buildTypes {
       release {
           minifyEnabled true
           shrinkResources true
       }
   }
   ```

2. Use App Bundle instead of APK

### Improve Load Time

1. Enable code splitting in Vite
2. Optimize images
3. Use lazy loading for routes

## 🔐 Security

### Best Practices

- ✅ Use HTTPS for all network requests
- ✅ Store sensitive data in encrypted storage
- ✅ Validate all user inputs
- ✅ Keep dependencies updated
- ✅ Use ProGuard for code obfuscation

### Environment Variables

Store sensitive data in `.env`:

```env
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

Never commit `.env` to version control!

## 📚 Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com)
- [React Documentation](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on Android
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check `ANDROID_SETUP_GUIDE.md` for detailed setup
- Check `ANDROID_QUICK_START.md` for quick reference
- Review Capacitor documentation
- Check Android Studio logs (Logcat)

## 🎉 What's Next?

- [ ] Test all features on physical device
- [ ] Customize app icon and splash screen
- [ ] Set up signing for release
- [ ] Test cloud sync functionality
- [ ] Optimize performance
- [ ] Prepare for Play Store submission
- [ ] Add iOS support (optional)

---

Built with ❤️ using React, TypeScript, Capacitor, and Supabase
