import { useState, useEffect, useCallback } from "react";

export const useAzkarProgress = (type: "morning" | "evening" | "afterPrayer" | "sleep" | "nightAnxiety" | "badDreams") => {
    const getStorageKey = useCallback(() => {
        const d = new Date();
        const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        if (type === 'afterPrayer') {
            // Simple approximation of prayer times for key generation
            // We don't need exact times, just distinct blocks.
            // Fajr: 3-6, Dhuhr: 11-14, Asr: 14-17, Maghrib: 17-19, Isha: 19-3
            const hour = d.getHours();
            let prayerName = 'isha'; // Default/Late night
            if (hour >= 3 && hour < 11) prayerName = 'fajr';
            else if (hour >= 11 && hour < 14) prayerName = 'dhuhr';
            else if (hour >= 14 && hour < 17) prayerName = 'asr';
            else if (hour >= 17 && hour < 19) prayerName = 'maghrib';
            else if (hour >= 19 || hour < 3) prayerName = 'isha';

            return `azkar-progress-${type}-${today}-${prayerName}`;
        }

        return `azkar-progress-${type}-${today}`;
    }, [type]);

    const [progress, setProgress] = useState<Record<number, number>>(() => {
        const saved = localStorage.getItem(getStorageKey());
        return saved ? JSON.parse(saved) : {};
    });

    // When key changes (e.g. new day or new prayer), load that new key's progress
    useEffect(() => {
        const key = getStorageKey();
        const saved = localStorage.getItem(key);
        if (saved) {
            setProgress(JSON.parse(saved));
        } else {
            setProgress({});
        }
    }, [getStorageKey]);

    // Save progress whenever it changes
    useEffect(() => {
        localStorage.setItem(getStorageKey(), JSON.stringify(progress));
    }, [progress, getStorageKey]);

    // Optional: Clean up old keys (simple version: just let them be for now, or clear on load if date changed)
    // For a pro app, we might want to clear keys older than today to save space, 
    // but localStorage is large enough for text.

    const incrementCount = (id: number, limit: number) => {
        setProgress((prev) => {
            const current = prev[id] || 0;
            if (current < limit) {
                // Haptic feedback if available
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
                return { ...prev, [id]: current + 1 };
            }
            return prev;
        });
    };

    const resetProgress = () => {
        setProgress({});
        localStorage.removeItem(getStorageKey());
    };

    const resetItem = (id: number) => {
        setProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[id];
            return newProgress;
        });
    };

    // Check for day change on mount and visibility change
    useEffect(() => {
        const checkDate = () => {
            const d = new Date();
            const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            // Let's store the "last active date" in a separate key to detect day changes easily.
            const lastActiveDate = localStorage.getItem(`azkar-last-active-${type}`);

            if (lastActiveDate !== today) {
                // Day changed! Reset state.
                setProgress({});
                localStorage.setItem(`azkar-last-active-${type}`, today);
            }
        };

        checkDate();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkDate();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Also check periodically (e.g. every minute) in case app stays open
        const interval = setInterval(checkDate, 60000);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearInterval(interval);
        };
    }, [type]);

    // Special reset logic for "afterPrayer" Azkar
    useEffect(() => {
        if (type !== 'afterPrayer') return;

        // We need to detect when a new prayer enters.
        // We can use the current hour/minute to estimate, or better, rely on a "lastPrayer" stored value.
        // If the current prayer (calculated from time) is different from the stored one, reset.

        const checkPrayerChange = () => {
            // Simple approximation: check if we moved to a new prayer window.
            // Since we don't have access to prayer times here directly without context,
            // we can use a simpler heuristic: if the "last reset time" was more than 20 minutes ago 
            // AND we are now in a new prayer time window? No, that's complex.

            // Better approach: Just store a timestamp of the last reset. 
            // If the user opens the app and it's been > 1 hour, maybe reset? 
            // User asked: "reset when entering a new prayer".

            // Let's use a custom event or just check time blocks.
            // Actually, the simplest robust way without importing heavy prayer logic here is:
            // Store "lastPrayerName" in localStorage.
            // On mount/interval, calculate current prayer name (approximate or passed via props? Props is hard here).
            // Let's try to infer it or just use a time-based expiration (e.g., reset if last update was > 30 mins ago).

            // WAIT: The user specifically said "reset when entering a new prayer".
            // Let's use a separate effect that listens to a custom event 'prayer-changed' 
            // which we can dispatch from PrayerTimesCard or a global context.
            // OR, simpler: just reset if the saved "prayer session" is old.

            // Let's implement a time-based expiry for now as a proxy, 
            // or better, let's make this hook accept a `resetTrigger` prop if we want to be precise.
            // But changing the signature affects many files.

            // Let's stick to the requested behavior: "reset on new prayer".
            // We can store the "prayer name" associated with the current progress.
            // If we load and the current prayer name (based on time) is different, reset.
            // But we don't have prayer times here.

            // Alternative: The user likely means "reset when I open the app for the next prayer".
            // So if I read Dhuhr azkar, then close app, then open for Asr, it should be empty.
            // This implies: if (currentPrayer != storedPrayerForProgress) reset().

            // I'll add a helper to get current prayer name based on standard times (approximate) 
            // or just rely on the fact that if it's been X hours, it's a new prayer.
            // Let's use a 30-minute inactivity reset for "afterPrayer" specifically? 
            // No, that might wipe it while reading.

            // Let's use the `localStorage` key strategy.
            // We can append the prayer name to the key for `afterPrayer` type?
            // `azkar-progress-afterPrayer-2023-10-27-ASR`
            // This way, when Asr comes, it generates a new key automatically!
            // And the old one is effectively "reset" (empty).
            // This is the cleanest solution!
        };
    }, [type]);

    return { progress, incrementCount, resetProgress, resetItem };
};
