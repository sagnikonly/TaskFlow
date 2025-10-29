# TaskFlow - Beautiful Task Management App

A modern, feature-rich task management application built with React, TypeScript, and Supabase. Now available as a native Android app!

## 📱 Platforms

- 🌐 **Web App** - Progressive Web App with offline support
- 🤖 **Android App** - Native Android app built with Capacitor

## Project info

**URL**: https://lovable.dev/projects/8c5955fc-7c56-4745-a12f-794385f52b40

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8c5955fc-7c56-4745-a12f-794385f52b40) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Backend & Edge Functions)
- Google Gemini AI (Step Up Analysis)

## Features

### 🎯 Smart Task Management
- Create tasks with progress counters
- Set priorities and recurrence patterns
- Track completion history
- Category-based organization

### 🚀 Intelligent Step Up System
The app features an AI-powered "Step Up" system that automatically suggests goal increases when you're ready:

- **Minimal Design**: No intrusive buttons - suggestions appear as a small icon next to tasks
- **AI Analysis**: Uses Google Gemini to analyze your completion patterns, streaks, and progress
- **Personalized**: Considers your profile (target exam/goal) and task notes
- **Smart Timing**: Only suggests increases after 7+ days of consistent completion (75%+ rate)
- **Gradual Growth**: Recommends 10-25% increases to avoid overwhelming you

See [STEP_UP_FEATURE.md](./STEP_UP_FEATURE.md) for detailed documentation.

### 📊 Analytics & Insights
- Heat map visualization of task completion
- Category-based statistics
- Streak tracking
- Progress monitoring

### 🎨 Beautiful Material 3 Design
- Dark/Light mode support
- Multiple color themes (Purple, Blue, Green, Orange, Pink)
- Smooth animations and transitions
- Mobile-first responsive design

### 👤 User Profile
- Set target exams or goals
- Add personal objectives
- AI uses this for contextual suggestions

## Setup

### 1. Install Dependencies
```sh
npm install
```

### 2. Configure Supabase
Create a `.env` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Deploy Edge Functions
```sh
supabase functions deploy analyze-step-up
supabase functions deploy check-step-up-suggestions
```

### 4. Add Gemini API Key
1. Get your API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Open the app and go to Settings
3. Add your API key in the "Gemini API Key" section

### 5. Run Development Server
```sh
npm run dev
```

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8c5955fc-7c56-4745-a12f-794385f52b40) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## 🤖 Android App

TaskFlow is now available as a native Android app built with Capacitor!

### Quick Start

```bash
# Build and open in Android Studio
npm run android:build
npm run android:open

# Or build and run directly
npm run android:run
```

### Features

- ✅ Native Android performance
- ✅ Haptic feedback (vibration)
- ✅ Offline support
- ✅ Cloud sync with Supabase
- ✅ All web features included
- ✅ Material Design UI
- ✅ Dark mode support

### Documentation

- **[ANDROID_QUICK_START.md](./ANDROID_QUICK_START.md)** - Quick reference for common commands
- **[ANDROID_SETUP_GUIDE.md](./ANDROID_SETUP_GUIDE.md)** - Complete setup instructions
- **[ANDROID_README.md](./ANDROID_README.md)** - Full Android app documentation
- **[ANDROID_DEPLOYMENT.md](./ANDROID_DEPLOYMENT.md)** - Google Play Store deployment guide

### Requirements

- Node.js 16+
- Android Studio (latest)
- JDK 11+
- Android SDK

### Building for Production

See [ANDROID_DEPLOYMENT.md](./ANDROID_DEPLOYMENT.md) for complete instructions on:
- Creating signed APKs
- Building app bundles
- Publishing to Google Play Store
- Testing and optimization

---

Built with ❤️ using React, TypeScript, Capacitor, and Supabase
