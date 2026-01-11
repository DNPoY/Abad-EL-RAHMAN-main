import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light) => {
    try {
        if (Capacitor.isNativePlatform()) {
            await Haptics.impact({ style });
        } else {
            // Optional: Web Vibration API fallback
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(style === ImpactStyle.Heavy ? 20 : 10);
            }
        }
    } catch (error) {
        console.error("Haptic feedback error:", error);
    }
};
