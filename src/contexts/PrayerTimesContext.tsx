import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';
import { useSettings } from "@/contexts/SettingsContext";
import { useLanguage } from "@/contexts/LanguageContext";

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

interface PrayerTimesContextType {
    prayerTimes: PrayerTimesData | null;
    nextPrayer: NextPrayer | null;
    loading: boolean;
    refreshLocation: () => void;
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

            const calculatedTimes = {
                fajr: formatTime(prayerTimesCalc.fajr),
                sunrise: formatTime(prayerTimesCalc.sunrise),
                dhuhr: formatTime(prayerTimesCalc.dhuhr),
                asr: formatTime(prayerTimesCalc.asr),
                maghrib: formatTime(prayerTimesCalc.maghrib),
                isha: formatTime(prayerTimesCalc.isha),
                city: locationMode === "manual" ? "Manual Location" : "Local Location",
                country: "",
            };

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
    }, [calculationMethod, locationMode, madhab]);

    const refreshLocation = useCallback(() => {
        setLoading(true);
        if (locationMode === "manual") {
            calculatePrayerTimes(manualLatitude, manualLongitude);
        } else if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    localStorage.setItem('lastKnownLocation', JSON.stringify({ latitude, longitude }));
                    calculatePrayerTimes(latitude, longitude);
                },
                (error) => {
                    console.warn("Location fetch failed, using cache/defaults", error);
                    if (localStorage.getItem('cachedPrayerTimes')) {
                        // Keep existing data 
                        setLoading(false);
                    } else {
                        setLoading(false);
                    }
                },
                { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
            );
        }
    }, [calculatePrayerTimes, locationMode, manualLatitude, manualLongitude]);

    // Initial Load
    useEffect(() => {
        // 1. Try cache
        const cachedData = localStorage.getItem('cachedPrayerTimes');
        if (cachedData) {
            try {
                const { times } = JSON.parse(cachedData) as { times: PrayerTimesData; date: string };
                setPrayerTimes(times);
                setLoading(false);
            } catch (e) { /* ignore */ }
        }

        // 2. Fetch fresh
        refreshLocation();
    }, [calculationMethod, madhab, locationMode, manualLatitude, manualLongitude, refreshLocation]);

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
        <PrayerTimesContext.Provider value={{ prayerTimes, nextPrayer, loading, refreshLocation }}>
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
