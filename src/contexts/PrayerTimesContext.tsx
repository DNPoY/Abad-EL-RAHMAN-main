import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';
import { useSettings } from "@/contexts/SettingsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWidgetUpdater } from "@/hooks/useWidgetUpdater";
import { PrayerVerificationService } from "@/lib/prayer-verification";

interface PrayerTimesData {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    city: string;
    country: string;
}

interface NextPrayer {
    name: string;
    timeLeft: string;
    key: string; // 'fajr', 'dhuhr', etc. for robust comparison
    time: string; // The time of the next prayer
}

export type CorrectionMap = { [key: string]: number };

interface PrayerTimesContextType {
    prayerTimes: PrayerTimesData | null;
    nextPrayer: NextPrayer | null;
    loading: boolean;
    refreshLocation: () => void;
    checkVerification: () => void;
    corrections: CorrectionMap;
}

const PrayerTimesContext = createContext<PrayerTimesContextType | undefined>(undefined);

export const PrayerTimesProvider = ({ children }: { children: ReactNode }) => {
    const { t, language } = useLanguage();
    const { calculationMethod, madhab, locationMode, manualLatitude, manualLongitude } = useSettings();

    const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(() => {
        try {
            const cached = localStorage.getItem('cachedPrayerTimes');
            if (cached) {
                return JSON.parse(cached).times;
            }
        } catch (e) { console.error("Cache parse error", e); }
        return null;
    });

    const [loading, setLoading] = useState<boolean>(() => !localStorage.getItem('cachedPrayerTimes'));
    const [nextPrayer, setNextPrayer] = useState<NextPrayer | null>(null);
    const [corrections, setCorrections] = useState<CorrectionMap>(() => {
        try {
            return JSON.parse(localStorage.getItem("prayerCorrections") || "{}");
        } catch { return {}; }
    });

    // Sync Widget
    useWidgetUpdater(prayerTimes);

    const applyCorrections = (times: PrayerTimesData, corrs: CorrectionMap): PrayerTimesData => {
        const newTimes = { ...times };
        const keys = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

        keys.forEach(key => {
            const offset = corrs[key];
            if (offset) {
                const [h, m] = newTimes[key as keyof PrayerTimesData].split(":").map(Number);
                const date = new Date();
                date.setHours(h, m + offset);
                newTimes[key as keyof PrayerTimesData] = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
            }
        });
        return newTimes;
    };

    const calculatePrayerTimes = useCallback((latitude: number, longitude: number) => {
        try {
            const coordinates = new Coordinates(latitude, longitude);
            const date = new Date();
            let params = CalculationMethod.MuslimWorldLeague();
            switch (calculationMethod) {
                case 3: params = CalculationMethod.MuslimWorldLeague(); break;
                case 2: params = CalculationMethod.NorthAmerica(); break;
                case 5: params = CalculationMethod.Egyptian(); break;
                case 4: params = CalculationMethod.UmmAlQura(); break;
                case 1: params = CalculationMethod.Karachi(); break;
                case 7: params = CalculationMethod.Tehran(); break;
                case 0: params = CalculationMethod.Tehran(); break;
                default: params = CalculationMethod.MuslimWorldLeague();
            }

            if (madhab === "hanafi") {
                params.madhab = Madhab.Hanafi;
            } else {
                params.madhab = Madhab.Shafi;
            }

            const prayerTimesCalc = new PrayerTimes(coordinates, date, params);
            const formatTime = (date: Date) => `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;

            let calculatedTimes = {
                fajr: formatTime(prayerTimesCalc.fajr),
                sunrise: formatTime(prayerTimesCalc.sunrise),
                dhuhr: formatTime(prayerTimesCalc.dhuhr),
                asr: formatTime(prayerTimesCalc.asr),
                maghrib: formatTime(prayerTimesCalc.maghrib),
                isha: formatTime(prayerTimesCalc.isha),
                city: locationMode === "manual" ? "Manual Location" : "Local Location",
                country: "",
            };

            // Apply Corrections
            calculatedTimes = applyCorrections(calculatedTimes, corrections);

            setPrayerTimes(calculatedTimes);
            localStorage.setItem('cachedPrayerTimes', JSON.stringify({
                times: calculatedTimes,
                date: new Date().toDateString()
            }));
            setLoading(false);
        } catch (error) {
            console.error("Error calculating prayer times:", error);
            setLoading(false);
        }
    }, [calculationMethod, locationMode, madhab, corrections]);

    const checkVerification = useCallback(async () => {
        if (!prayerTimes) return;

        let lat = manualLatitude;
        let lng = manualLongitude;

        if (locationMode === "auto") {
            const cached = JSON.parse(localStorage.getItem('lastKnownLocation') || '{}');
            if (cached.latitude) {
                lat = cached.latitude;
                lng = cached.longitude;
            }
        }

        if (!lat || !lng) return;

        // Use Madhab enum to number
        const madhabNum = madhab === "hanafi" ? 2 : 1;

        if (PrayerVerificationService.shouldVerify()) {
            const newCorrections = await PrayerVerificationService.verify({
                latitude: lat,
                longitude: lng,
                method: calculationMethod,
                madhab: madhabNum
            }, prayerTimes as unknown as { [key: string]: string });

            if (newCorrections) {
                setCorrections(newCorrections);
                // Re-calculate checks implicitly via dependency on `corrections` in `calculatePrayerTimes`? 
                // No, calculatePrayerTimes depends on corrections state, but we need to trigger it.
                // Actually, we should just update state and let useEffect re-trigger if dependent.
                // But calculatePrayerTimes dependency IS the callback itself.
                calculatePrayerTimes(lat, lng);
            }
        }
    }, [prayerTimes, calculationMethod, madhab, manualLatitude, manualLongitude, locationMode, calculatePrayerTimes]);


    const refreshLocation = useCallback(() => {
        // Only show loading if we have absolutely no data
        if (!prayerTimes) setLoading(true);

        if (locationMode === "manual") {
            calculatePrayerTimes(manualLatitude, manualLongitude);
        } else if ("geolocation" in navigator) {
            // Optimization: Try to use last known location immediately while waiting for fresh fix
            const lastKnown = localStorage.getItem('lastKnownLocation');
            if (lastKnown) {
                try {
                    const { latitude, longitude } = JSON.parse(lastKnown);
                    // Update times immediately using last known location
                    calculatePrayerTimes(latitude, longitude);
                } catch (e) {
                    console.error("Error parsing last location", e);
                }
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    localStorage.setItem('lastKnownLocation', JSON.stringify({ latitude, longitude }));
                    calculatePrayerTimes(latitude, longitude);
                },
                (error) => {
                    console.warn("Location fetch failed, using cache/defaults", error);
                    setLoading(false);
                },
                { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
            );
        }
    }, [calculatePrayerTimes, locationMode, manualLatitude, manualLongitude, prayerTimes]);

    // Initial Load
    useEffect(() => {
        // 1. Try cache for instant render
        const cachedData = localStorage.getItem('cachedPrayerTimes');
        if (cachedData) {
            try {
                const { times } = JSON.parse(cachedData) as { times: PrayerTimesData; date: string };
                setPrayerTimes(times);
                // Don't set loading false here, it's already initialized based on cache presence
            } catch (e) { /* ignore */ }
        }

        // 2. Refresh (Background update)
        // We use a small timeout to ensure the render cycle completes with cached data first
        const timer = setTimeout(() => {
            refreshLocation();
        }, 100);

        // 3. Trigger Verification Check (Tahqiq)
        setTimeout(() => {
            checkVerification();
        }, 5000); // Wait 5s to ensure everything is settled

        return () => clearTimeout(timer);
    }, [calculationMethod, madhab, locationMode, manualLatitude, manualLongitude]);

    // Next Prayer Logic
    useEffect(() => {
        if (!prayerTimes) return;

        const calculateNextPrayer = () => {
            const now = new Date();
            const prayers = [
                { name: t.fajr, time: prayerTimes.fajr, key: 'fajr' },
                { name: t.dhuhr, time: prayerTimes.dhuhr, key: 'dhuhr' },
                { name: t.asr, time: prayerTimes.asr, key: 'asr' },
                { name: t.maghrib, time: prayerTimes.maghrib, key: 'maghrib' },
                { name: t.isha, time: prayerTimes.isha, key: 'isha' },
            ];

            let foundNext = false;

            for (const prayer of prayers) {
                const [hoursStr, minutesStr] = prayer.time.split(":");
                if (!hoursStr || !minutesStr) continue;

                const hours = parseInt(hoursStr, 10);
                const minutes = parseInt(minutesStr, 10);

                const prayerTime = new Date();
                prayerTime.setHours(hours, minutes, 0, 0);

                if (prayerTime <= now) continue;

                const diff = prayerTime.getTime() - now.getTime();
                const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
                const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);

                setNextPrayer({
                    name: prayer.name,
                    timeLeft: `${hoursLeft}:${minutesLeft.toString().padStart(2, "0")}:${secondsLeft.toString().padStart(2, "0")}`,
                    key: prayer.key,
                    time: prayer.time
                });
                foundNext = true;
                break;
            }

            if (!foundNext) {
                // Next is Fajr tomorrow
                const [fajrHours, fajrMinutes] = prayerTimes.fajr.split(":").map(Number);
                const tomorrowFajr = new Date();
                tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
                tomorrowFajr.setHours(fajrHours, fajrMinutes, 0, 0);

                const diff = tomorrowFajr.getTime() - now.getTime();
                const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
                const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);

                setNextPrayer({
                    name: t.fajr,
                    timeLeft: `${hoursLeft}:${minutesLeft.toString().padStart(2, "0")}:${secondsLeft.toString().padStart(2, "0")}`,
                    key: 'fajr',
                    time: prayerTimes.fajr
                });
            }
        };

        calculateNextPrayer();
        const interval = setInterval(calculateNextPrayer, 1000);
        return () => clearInterval(interval);

    }, [prayerTimes, t]);

    return (
        <PrayerTimesContext.Provider value={{ prayerTimes, nextPrayer, loading, refreshLocation, checkVerification, corrections }}>
            {children}
        </PrayerTimesContext.Provider>
    );
};

export const usePrayerTimes = () => {
    const context = useContext(PrayerTimesContext);
    if (!context) {
        throw new Error("usePrayerTimes must be used within a PrayerTimesProvider");
    }
    return context;
};
