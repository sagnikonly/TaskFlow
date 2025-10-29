import { useCallback } from 'react';
import { triggerHaptic, cancelHaptic, type HapticPattern } from '@/lib/haptics';

/**
 * Custom hook for haptic feedback
 * Provides a simple interface to trigger haptic patterns
 */
export const useHaptics = () => {
  const haptic = useCallback((pattern: HapticPattern) => {
    triggerHaptic(pattern);
  }, []);

  const cancel = useCallback(() => {
    cancelHaptic();
  }, []);

  return {
    haptic,
    cancel,
  };
};
