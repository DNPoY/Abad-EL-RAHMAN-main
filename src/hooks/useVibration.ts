import { useCallback } from 'react';
import { VIBRATION_PATTERNS } from '@/lib/constants';

type VibrationPattern = number | number[];

/**
 * Custom hook for haptic feedback using the Vibration API
 * Provides consistent vibration patterns across the app
 */
export const useVibration = () => {
    const vibrate = useCallback((pattern?: VibrationPattern) => {
        if (!navigator.vibrate) {
            return false;
        }

        try {
            if (pattern) {
                navigator.vibrate(pattern);
            } else {
                navigator.vibrate(VIBRATION_PATTERNS.LIGHT);
            }
            return true;
        } catch (error) {
            console.warn('Vibration API error:', error);
            return false;
        }
    }, []);

    const vibrateLight = useCallback(() => {
        vibrate(VIBRATION_PATTERNS.LIGHT);
    }, [vibrate]);

    const vibrateMedium = useCallback(() => {
        vibrate(VIBRATION_PATTERNS.MEDIUM);
    }, [vibrate]);

    const vibrateHeavy = useCallback(() => {
        vibrate(VIBRATION_PATTERNS.HEAVY);
    }, [vibrate]);

    const vibrateSuccess = useCallback(() => {
        vibrate(VIBRATION_PATTERNS.SUCCESS);
    }, [vibrate]);

    const vibrateLongPress = useCallback(() => {
        vibrate(VIBRATION_PATTERNS.LONG_PRESS);
    }, [vibrate]);

    const cancel = useCallback(() => {
        if (navigator.vibrate) {
            navigator.vibrate(0);
        }
    }, []);

    return {
        vibrate,
        vibrateLight,
        vibrateMedium,
        vibrateHeavy,
        vibrateSuccess,
        vibrateLongPress,
        cancel,
    };
};
