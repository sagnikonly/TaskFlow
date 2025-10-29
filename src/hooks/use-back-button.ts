import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';

interface BackButtonOptions {
  onBack?: () => void;
  priority?: number;
}

// Global stack to manage back button handlers
const backHandlerStack: Array<{ handler: () => boolean; priority: number }> = [];

export const useBackButton = (options: BackButtonOptions = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { onBack, priority = 0 } = options;

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
      return true; // Handled
    }
    return false; // Not handled
  }, [onBack]);

  useEffect(() => {
    // Add handler to stack
    const handler = { handler: handleBack, priority };
    backHandlerStack.push(handler);
    
    // Sort by priority (higher priority first)
    backHandlerStack.sort((a, b) => b.priority - a.priority);

    // Cleanup
    return () => {
      const index = backHandlerStack.indexOf(handler);
      if (index > -1) {
        backHandlerStack.splice(index, 1);
      }
    };
  }, [handleBack, priority]);

  return { handleBack };
};

// Global back button listener for Android
export const setupGlobalBackButton = (navigate: (path: string) => void, getCurrentPath: () => string) => {
  let backButtonListener: any = null;

  const initBackButton = async () => {
    // Remove existing listener if any
    if (backButtonListener) {
      backButtonListener.remove();
    }

    backButtonListener = await CapacitorApp.addListener('backButton', () => {
      const currentPath = getCurrentPath();

      // Check if any component has registered a handler
      if (backHandlerStack.length > 0) {
        // Execute the highest priority handler
        const handled = backHandlerStack[0].handler();
        if (handled) {
          return; // Handler took care of it
        }
      }

      // Default navigation logic
      if (currentPath === '/' || currentPath === '/auth') {
        // On home screen or auth, exit the app
        CapacitorApp.exitApp();
      } else {
        // On any other screen, go back to home
        navigate('/');
      }
    });
  };

  initBackButton();

  // Return cleanup function
  return () => {
    if (backButtonListener) {
      backButtonListener.remove();
    }
  };
};
