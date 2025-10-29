# Android Deployment Checklist

Complete guide for deploying TaskFlow to the Google Play Store.

## 📋 Pre-Deployment Checklist

### 1. App Configuration

- [ ] Update version in `android/app/build.gradle`:
  ```gradle
  versionCode 1
  versionName "1.0.0"
  ```

- [ ] Verify app name in `android/app/src/main/res/values/strings.xml`

- [ ] Check package ID in `capacitor.config.ts` (e.g., `com.taskflow.app`)

- [ ] Update app description and metadata

### 2. Assets

- [ ] Create app icon (512x512 PNG)
  - Use Android Studio Image Asset Studio
  - Generate all required sizes

- [ ] Create feature graphic (1024x500 PNG)
  - For Play Store listing

- [ ] Create screenshots (at least 2)
  - Phone: 1080x1920 or 1080x2340
  - Tablet: 1536x2048 (optional)

- [ ] Create splash screen
  - Update `android/app/src/main/res/drawable/splash.png`

### 3. Code Quality

- [ ] Remove all console.log statements
- [ ] Remove debug code
- [ ] Test all features thoroughly
- [ ] Check for memory leaks
- [ ] Verify offline functionality
- [ ] Test cloud sync
- [ ] Test haptic feedback
- [ ] Verify analytics tracking

### 4. Security

- [ ] Review all permissions in AndroidManifest.xml
- [ ] Ensure HTTPS for all network requests
- [ ] Validate environment variables
- [ ] Check for hardcoded secrets
- [ ] Enable ProGuard/R8 obfuscation

### 5. Testing

- [ ] Test on multiple devices
- [ ] Test on different Android versions (min: API 22)
- [ ] Test in portrait and landscape
- [ ] Test with different screen sizes
- [ ] Test with slow network
- [ ] Test offline mode
- [ ] Test app lifecycle (background/foreground)
- [ ] Test deep links (if applicable)

## 🔑 Signing Configuration

### 1. Generate Release Keystore

```bash
keytool -genkey -v -keystore taskflow-release-key.keystore \
  -alias taskflow \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Important**: Store keystore securely! You cannot update your app without it.

### 2. Create key.properties

Create `android/key.properties`:

```properties
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=taskflow
storeFile=../taskflow-release-key.keystore
```

Add to `.gitignore`:
```
android/key.properties
*.keystore
```

### 3. Configure build.gradle

Edit `android/app/build.gradle`:

```gradle
// Add before android block
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... existing config

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
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

## 🏗️ Building Release

### 1. Clean Build

```bash
cd android
./gradlew clean
cd ..
```

### 2. Build Web App

```bash
npm run build
```

### 3. Sync Capacitor

```bash
npx cap sync android
```

### 4. Build App Bundle (Recommended)

```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

### 5. Or Build APK

```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

## 🧪 Testing Release Build

### Install APK on Device

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Test Thoroughly

- [ ] App launches correctly
- [ ] All features work
- [ ] No crashes
- [ ] Performance is good
- [ ] Haptics work
- [ ] Cloud sync works
- [ ] Analytics track correctly

## 📱 Google Play Console Setup

### 1. Create Developer Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Pay one-time $25 registration fee
3. Complete account setup

### 2. Create App

1. Click "Create app"
2. Fill in app details:
   - App name: TaskFlow
   - Default language: English
   - App or game: App
   - Free or paid: Free

### 3. Store Listing

**App details:**
- Short description (80 chars max)
- Full description (4000 chars max)
- App icon (512x512 PNG)
- Feature graphic (1024x500 PNG)
- Screenshots (2-8 images)

**Categorization:**
- App category: Productivity
- Tags: task management, to-do, productivity

**Contact details:**
- Email
- Website (optional)
- Privacy policy URL

### 4. Content Rating

1. Complete questionnaire
2. Get rating (likely "Everyone")

### 5. Target Audience

- Target age: 13+
- Store presence: Available

### 6. Privacy & Security

- Privacy policy URL (required)
- Data safety form
- Permissions declaration

### 7. App Content

- COVID-19 contact tracing
- Data safety
- Government apps
- Financial features
- Health features

## 🚀 Release Process

### 1. Create Release

1. Go to "Production" → "Create new release"
2. Upload app bundle (.aab file)
3. Add release notes
4. Review and rollout

### 2. Release Notes Template

```
Version 1.0.0

🎉 Initial Release

Features:
• Beautiful task management
• Smart organization with subjects
• Priority levels and due dates
• Analytics dashboard
• AI-powered suggestions
• Cloud sync across devices
• Haptic feedback
• Dark mode support
• Offline functionality

We'd love to hear your feedback!
```

### 3. Rollout Options

- **Staged rollout**: Start with 20%, gradually increase
- **Full rollout**: Release to all users immediately

### 4. Review Process

- Google reviews your app (1-7 days)
- Fix any issues if rejected
- Resubmit if needed

## 📊 Post-Launch

### Monitor

- [ ] Check crash reports
- [ ] Monitor user reviews
- [ ] Track analytics
- [ ] Monitor performance metrics

### Respond

- [ ] Reply to user reviews
- [ ] Fix reported bugs
- [ ] Plan updates based on feedback

### Update

- [ ] Increment version numbers
- [ ] Build new release
- [ ] Upload to Play Console
- [ ] Add release notes

## 🔄 Update Process

### Version Numbering

```gradle
// android/app/build.gradle
versionCode 2        // Increment by 1
versionName "1.0.1"  // Semantic versioning
```

### Build and Upload

```bash
# 1. Update version
# 2. Make changes
npm run build
npx cap sync android

# 3. Build release
cd android
./gradlew bundleRelease

# 4. Upload to Play Console
# 5. Add release notes
# 6. Submit for review
```

## 🛡️ Security Best Practices

- [ ] Never commit keystore to git
- [ ] Store keystore in secure location
- [ ] Backup keystore (you cannot recover it!)
- [ ] Use environment variables for secrets
- [ ] Enable ProGuard/R8
- [ ] Review all permissions
- [ ] Use HTTPS only
- [ ] Implement certificate pinning (optional)

## 📝 Required Documents

### Privacy Policy

Must include:
- What data you collect
- How you use it
- How you protect it
- Third-party services (Supabase)
- User rights

### Terms of Service (Optional)

- Usage terms
- Liability
- User responsibilities

## 🎯 Optimization Tips

### Reduce APK Size

```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
    }
}
```

### Improve Performance

- Enable R8 optimization
- Use ProGuard rules
- Optimize images
- Lazy load components
- Use code splitting

### Better User Experience

- Fast app startup
- Smooth animations
- Responsive UI
- Offline support
- Clear error messages

## 🆘 Common Issues

### Build Failed

```bash
cd android
./gradlew clean
rm -rf .gradle
./gradlew build
```

### Signing Failed

- Check key.properties path
- Verify keystore password
- Ensure keystore file exists

### Upload Rejected

- Check version code is higher
- Verify signing configuration
- Review Play Console errors

### App Rejected

- Review rejection reason
- Fix issues
- Resubmit

## 📚 Resources

- [Google Play Console](https://play.google.com/console)
- [Android App Bundle](https://developer.android.com/guide/app-bundle)
- [Launch Checklist](https://developer.android.com/distribute/best-practices/launch/launch-checklist)
- [Play Store Guidelines](https://play.google.com/about/developer-content-policy/)

## ✅ Final Checklist

Before submitting:

- [ ] All features tested
- [ ] No crashes or bugs
- [ ] App icon looks good
- [ ] Screenshots are high quality
- [ ] Store listing is complete
- [ ] Privacy policy is published
- [ ] Release build is signed
- [ ] Version numbers are correct
- [ ] Release notes are written
- [ ] Keystore is backed up

Good luck with your launch! 🚀
