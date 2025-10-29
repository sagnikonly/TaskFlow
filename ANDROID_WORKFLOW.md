# 🔄 Android Development Workflow

## 📱 Development Cycle

```
┌─────────────────────────────────────────────────────────┐
│                   DEVELOPMENT WORKFLOW                   │
└─────────────────────────────────────────────────────────┘

1. EDIT CODE
   │
   ├─ Edit React components in src/
   ├─ Update styles, add features
   └─ Test in web browser (npm run dev)
   │
   ▼

2. BUILD WEB APP
   │
   └─ npm run build
      │
      └─ Creates dist/ folder with optimized files
   │
   ▼

3. SYNC TO ANDROID
   │
   └─ npx cap sync android
      │
      ├─ Copies dist/ to android/app/src/main/assets/
      ├─ Updates plugins
      └─ Syncs configuration
   │
   ▼

4. RUN ON DEVICE
   │
   ├─ Option A: npm run android:run (automated)
   ├─ Option B: npx cap open android → Click play
   └─ Option C: Android Studio → Run button
   │
   ▼

5. TEST & DEBUG
   │
   ├─ Test features on device/emulator
   ├─ Check Logcat for errors
   └─ Use Chrome DevTools (chrome://inspect)
   │
   ▼

6. ITERATE
   │
   └─ Go back to step 1
```

## 🚀 Quick Commands

### One-Line Development

```bash
# Edit code → Build → Sync → Run
npm run android:run
```

### Step-by-Step

```bash
# 1. Build web app
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Open Android Studio
npx cap open android

# 4. Click the green play button ▶️
```

## 🎯 Common Workflows

### Workflow 1: Quick Testing

```bash
# Make changes in src/
npm run android:build  # Build + Sync
# Then run from Android Studio
```

### Workflow 2: Live Reload (Advanced)

```bash
# 1. Start dev server
npm run dev

# 2. Update capacitor.config.ts
server: {
  url: 'http://YOUR_IP:8080',
  cleartext: true
}

# 3. Sync and run
npx cap sync android
npx cap run android

# Now changes reload automatically!
```

### Workflow 3: Production Build

```bash
# 1. Build optimized version
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Build release APK
cd android
./gradlew assembleRelease

# APK at: android/app/build/outputs/apk/release/
```

## 🔧 File Changes Flow

```
┌──────────────┐
│  src/*.tsx   │  Your React code
└──────┬───────┘
       │ npm run build
       ▼
┌──────────────┐
│    dist/     │  Optimized web files
└──────┬───────┘
       │ npx cap sync android
       ▼
┌──────────────────────────────────┐
│ android/app/src/main/assets/     │  Android assets
└──────┬───────────────────────────┘
       │ Android Studio build
       ▼
┌──────────────┐
│     APK      │  Installable app
└──────────────┘
```

## 📦 What Gets Synced?

```
npx cap sync android does:

✅ Copy dist/ → android/app/src/main/assets/public/
✅ Update capacitor.config.json
✅ Install/update Capacitor plugins
✅ Update AndroidManifest.xml (if needed)
✅ Sync native dependencies
```

## 🎨 Customization Workflow

### Change App Icon

```bash
# 1. Prepare icon (512x512 PNG)
# 2. Open Android Studio
npm run android:open

# 3. Right-click res → New → Image Asset
# 4. Upload icon
# 5. Rebuild and run
```

### Change App Name

```bash
# 1. Edit android/app/src/main/res/values/strings.xml
<string name="app_name">New Name</string>

# 2. Rebuild
cd android
./gradlew clean
./gradlew build
```

### Add Permissions

```bash
# 1. Edit android/app/src/main/AndroidManifest.xml
<uses-permission android:name="android.permission.CAMERA" />

# 2. Sync
npx cap sync android

# 3. Rebuild and run
```

## 🐛 Debug Workflow

```
┌─────────────────┐
│  Issue Found    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Check Android Studio       │
│  Logcat for errors          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Fix code in src/           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  npm run android:build      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Run again and test         │
└─────────────────────────────┘
```

## 🚢 Release Workflow

```
1. PREPARE
   ├─ Update version in android/app/build.gradle
   ├─ Test thoroughly
   └─ Update release notes

2. SIGN
   ├─ Generate keystore (one time)
   ├─ Configure signing in build.gradle
   └─ Store keystore securely

3. BUILD
   ├─ npm run build
   ├─ npx cap sync android
   └─ cd android && ./gradlew bundleRelease

4. TEST RELEASE
   ├─ Install APK on device
   └─ Test all features

5. DEPLOY
   ├─ Upload to Play Console
   ├─ Fill store listing
   └─ Submit for review
```

## 💡 Pro Tips

### Speed Up Development

```bash
# Use build script for quick iterations
npm run android:build

# Keep Android Studio open
# Just click Run after each build
```

### Avoid Common Mistakes

```bash
# ❌ Don't forget to build
npx cap sync android  # This won't update your code!

# ✅ Always build first
npm run build
npx cap sync android

# ✅ Or use the combined command
npm run android:build
```

### Clean Build When Stuck

```bash
# Clean everything
cd android
./gradlew clean
cd ..
rm -rf dist
npm run build
npx cap sync android
```

## 🎯 Cheat Sheet

| Task | Command |
|------|---------|
| Build web | `npm run build` |
| Sync to Android | `npx cap sync android` |
| Open Android Studio | `npm run android:open` |
| Build + Sync | `npm run android:build` |
| Build + Sync + Run | `npm run android:run` |
| Clean build | `cd android && ./gradlew clean` |
| Release APK | `cd android && ./gradlew assembleRelease` |
| Release Bundle | `cd android && ./gradlew bundleRelease` |

## 📚 Learn More

- **Quick Start**: `ANDROID_QUICK_START.md`
- **Full Setup**: `ANDROID_SETUP_GUIDE.md`
- **Documentation**: `ANDROID_README.md`
- **Deployment**: `ANDROID_DEPLOYMENT.md`

---

**Remember**: Edit → Build → Sync → Run → Test → Repeat 🔄
