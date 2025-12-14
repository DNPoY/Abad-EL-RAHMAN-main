import { useState, useEffect } from 'react';

export interface MissedPrayers {
    fajr: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
}

const STORAGE_KEY = 'missed_prayers';

export const useMissedPrayers = () => {
    const [missedPrayers, setMissedPrayers] = useState<MissedPrayers>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved
            ? JSON.parse(saved)
            : { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(missedPrayers));
    }, [missedPrayers]);

    const increment = (prayer: keyof MissedPrayers) => {
        setMissedPrayers((prev) => ({ ...prev, [prayer]: prev[prayer] + 1 }));
    };

    const decrement = (prayer: keyof MissedPrayers) => {
        setMissedPrayers((prev) => ({
            ...prev,
            [prayer]: Math.max(0, prev[prayer] - 1),
        }));
    };

    const reset = () => {
        setMissedPrayers({ fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 });
    };

    return { missedPrayers, increment, decrement, reset };
};
