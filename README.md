# TaskFlow - Intelligent Task Management App

A modern, AI-powered task management application built with React, TypeScript, and Supabase. Available as both a web app and native Android app with Firebase Hosting and cloud synchronization.

## 🌟 Features

### � WSmart Task Management
- Create tasks with progress counters and priorities
- Set recurrence patterns and track completion history
- Category-based organization with custom icons
- Real-time cloud synchronization across devices

### 🤖 AI-Powered Step Up System
TaskFlow features an intelligent "Step Up" system powered by Google Gemini AI:
- **Smart Analysis**: Analyzes completion patterns, streaks, and progress
- **Personalized Suggestions**: Considers your profile and goals for contextual recommendations
- **Gradual Growth**: Suggests 10-25% goal increases when you're ready
- **Minimal Design**: Non-intrusive suggestions that appear when appropriate

### 📊 Advanced Analytics
- Interactive heat map visualization of task completion
- Category-based statistics and insights
- Streak tracking and progress monitoring
- Goal achievement analytics

### 🎨 Beautiful Material 3 Design
- Dark/Light mode support with system preference detection
- Multiple color themes (Purple, Blue, Green, Orange, Pink)
- Smooth animations and haptic feedback
- Mobile-first responsive design

### 👤 Personalized Experience
- User profiles with target exams or goals
- Personal objectives and notes
- AI-driven contextual suggestions

## 🚀 Live Demo

**Web App**: [https://task-flow30.web.app](https://task-flow30.web.app)

## 📱 Platforms

- 🌐 **Web App** - Progressive Web App with offline support
- 🤖 **Android App** - Native Android app built with Capacitor
- ☁️ **Firebase Hosting** - Fast, global CDN delivery

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui, Tailwind CSS, Radix UI
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **Hosting**: Firebase Hosting
- **Mobile**: Capacitor for Android
- **AI**: Google Gemini API
- **Analytics**: Recharts for data visualization

## 🏗️ Setup & Installation

### Prerequisites
- Node.js 16+ and npm
- Supabase account
- Firebase account
- Google AI Studio API key

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
npm install
```

### 2. Environment Configuration
Create a `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
```bash
# Run Supabase migrations
supabase db reset

# Deploy Edge Functions
supabase functions deploy analyze-step-up
supabase functions deploy check-step-up-suggestions
```

### 4. Development Server
```bash
npm run dev
```

### 5. Configure AI Features
1. Get your API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Open the app → Settings → Add your Gemini API key

## 🚀 Deployment

### Web Deployment (Firebase Hosting)
```bash
# Build and deploy to Firebase
npm run deploy

# Deploy to preview channel
npm run deploy:preview
```

### Android App
```bash
# Build and open in Android Studio
npm run android:build
npm run android:open

# Build and run directly
npm run android:run
```

## 📱 Android App Features

- ✅ Native Android performance with Capacitor
- ✅ Haptic feedback and native UI elements
- ✅ Offline support with cloud sync
- ✅ Material Design 3 compliance
- ✅ All web features included
- ✅ Google Play Store ready

### Android Requirements
- Android Studio (latest)
- JDK 11+
- Android SDK API 24+

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run deploy       # Build and deploy to Firebase
npm run android:build # Build Android app
npm run android:open  # Open in Android Studio
npm run android:run   # Build and run Android app
```

## 🏗️ Project Structure

```
taskflow/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   ├── contexts/      # React contexts
│   └── integrations/  # External service integrations
├── supabase/
│   ├── functions/     # Edge functions
│   └── migrations/    # Database migrations
├── android/           # Android app files
├── firebase.json      # Firebase configuration
└── capacitor.config.ts # Capacitor configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.com/)
- Hosted on [Firebase](https://firebase.google.com/)
- AI features by [Google Gemini](https://ai.google.dev/)

---

**TaskFlow** - Intelligent task management for achieving your goals 🎯