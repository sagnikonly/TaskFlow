import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

/**
 * Configure status bar for Android
 * Ensures proper visibility and prevents content overlap
 */
export const setupStatusBar = async () => {
  // Only run on native platforms
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Prevent WebView from overlaying under status bar
    await StatusBar.setOverlaysWebView({ overlay: false });

    // Check localStorage first, then check DOM class
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || 
                   (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Apply theme to DOM if not already applied
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Set initial style based on theme
    await StatusBar.setStyle({ 
      style: isDark ? Style.Dark : Style.Light 
    });

    // Set status bar background color to match app theme
    if (Capacitor.getPlatform() === 'android') {
      // Light mode: white background with dark icons
      // Dark mode: dark background with light icons
      await StatusBar.setBackgroundColor({ 
        color: isDark ? '#1C0A1E' : '#FFFFFF' 
      });
    }

    console.log('✅ Status bar configured successfully', { isDark, savedTheme });
  } catch (error) {
    console.error('❌ Error configuring status bar:', error);
  }
};

/**
 * Update status bar when theme changes
 */
export const updateStatusBarTheme = async (isDark: boolean) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await StatusBar.setStyle({ 
      style: isDark ? Style.Dark : Style.Light 
    });

    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ 
        color: isDark ? '#1C0A1E' : '#FFFFFF' 
      });
    }
  } catch (error) {
    console.error('❌ Error updating status bar theme:', error);
  }
};

/**
 * Show status bar
 */
export const showStatusBar = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await StatusBar.show();
  } catch (error) {
    console.error('❌ Error showing status bar:', error);
  }
};

/**
 * Hide status bar
 */
export const hideStatusBar = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await StatusBar.hide();
  } catch (error) {
    console.error('❌ Error hiding status bar:', error);
  }
};
