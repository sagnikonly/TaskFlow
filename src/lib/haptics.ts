/**
 * Haptics Utility Library
 * Provides vibration feedback for Android devices using Capacitor Haptics API
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export type HapticPattern = 
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'error'
  | 'selection'
  | 'longPress'
  | 'notification';

interface HapticPatternConfig {
  pattern: number | number[];
  description: string;
}

// Haptic patterns optimized for different interaction types
export const HAPTIC_PATTERNS: Record<HapticPattern, HapticPatternConfig> = {
  light: {
    pattern: 10,
    description: 'Subtle feedback for hover, focus, or minor interactions',
  },
  medium: {
    pattern: 20,
    description: 'Standard feedback for button presses and toggles',
  },
  heavy: {
    pattern: 30,
    description: 'Strong feedback for important actions',
  },
  success: {
    pattern: [50, 50, 100],
    description: 'Celebratory pattern for successful actions',
  },
  error: {
    pattern: [100, 50, 100, 50, 100],
    description: 'Alert pattern for errors or destructive actions',
  },
  selection: {
    pattern: 15,
    description: 'Quick feedback for navigation and selection',
  },
  longPress: {
    pattern: [0, 100, 50, 100],
    description: 'Pattern for long press interactions',
  },
  notification: {
    pattern: [100, 100, 100],
    description: 'Attention-grabbing pattern for notifications',
  },
};

/**
 * Check if the device supports vibration
 */
export const isHapticsSupported = (): boolean => {
  // Capacitor Haptics is available on native platforms
  return true;
};

/**
 * Check if user prefers reduced motion (accessibility)
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get haptics preferences from localStorage
 */
export const getHapticsPreferences = () => {
  const enabled = localStorage.getItem('haptics_enabled');
  const intensity = localStorage.getItem('haptics_intensity');
  
  return {
    enabled: enabled === null ? true : enabled === 'true',
    intensity: intensity ? parseInt(intensity, 10) : 100,
  };
};

/**
 * Save haptics preferences to localStorage
 */
export const setHapticsPreferences = (enabled: boolean, intensity: number) => {
  localStorage.setItem('haptics_enabled', enabled.toString());
  localStorage.setItem('haptics_intensity', intensity.toString());
};

/**
 * Trigger haptic feedback using Capacitor Haptics API
 */
export const triggerHaptic = async (pattern: HapticPattern): Promise<void> => {
  // Check user preferences
  const { enabled } = getHapticsPreferences();
  
  if (!enabled || prefersReducedMotion()) {
    return;
  }

  try {
    switch (pattern) {
      case 'light':
      case 'selection':
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      
      case 'heavy':
      case 'longPress':
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
      
      case 'success':
        await Haptics.notification({ type: NotificationType.Success });
        break;
      
      case 'error':
        await Haptics.notification({ type: NotificationType.Error });
        break;
      
      case 'notification':
        await Haptics.notification({ type: NotificationType.Warning });
        break;
      
      default:
        await Haptics.impact({ style: ImpactStyle.Medium });
    }
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
};

/**
 * Cancel any ongoing vibration
 */
export const cancelHaptic = async (): Promise<void> => {
  try {
    await Haptics.vibrate({ duration: 0 });
  } catch (error) {
    console.warn('Cancel haptic failed:', error);
  }
};
