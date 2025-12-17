import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import WidgetBridge from "@/lib/widget-bridge";
import { useLanguage } from "@/contexts/LanguageContext";

interface PrayerTimesData {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    city: string;
}

export const useWidgetUpdater = (prayerTimes: PrayerTimesData | null) => {
    const { language } = useLanguage();

    useEffect(() => {
        if (!prayerTimes || !Capacitor.isNativePlatform()) return;

        const updateWidget = async () => {
            try {
                // 1. Calculate Next Prayer
                const now = new Date();
                const prayers = [
                    { name: "Fajr", arabicName: "الفجر", time: prayerTimes.fajr },
                    { name: "Dhuhr", arabicName: "الظهر", time: prayerTimes.dhuhr },
                    { name: "Asr", arabicName: "العصر", time: prayerTimes.asr },
                    { name: "Maghrib", arabicName: "المغرب", time: prayerTimes.maghrib },
                    { name: "Isha", arabicName: "العشاء", time: prayerTimes.isha },
                ];

                let nextPrayer = null;

                // Sort prayers by time to be safe, though they come ordered usually.
                // Actually they are strings "HH:mm".

                for (const prayer of prayers) {
                    const [h, m] = prayer.time.split(':').map(Number);
                    const prayerDate = new Date();
                    prayerDate.setHours(h, m, 0, 0);

                    if (prayerDate > now) {
                        nextPrayer = prayer;
                        break;
                    }
                }

                // If no prayer left today, next is Fajr tomorrow
                if (!nextPrayer) {
                    nextPrayer = prayers[0]; // Fajr
                }

                // Format Time (12h)
                const [h, m] = nextPrayer.time.split(':').map(Number);
                const ampm = h >= 12 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
                const h12 = h % 12 || 12;
                const formattedTime = `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;

                // Name
                const prayerName = language === 'ar' ? nextPrayer.arabicName : nextPrayer.name;

                // 2. Hijri Date
                const hijriDate = new Intl.DateTimeFormat(language === 'ar' ? "ar-SA" : "en-US", {
                    calendar: "islamic-umalqura",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }).format(now);

                // 3. Location
                const locationName = prayerTimes.city;

                // 4. Send to Native
                const formatTime = (time: string) => {
                    const [h, m] = time.split(':').map(Number);
                    const h12 = h % 12 || 12;
                    // We just want compact time for the row, maybe no AM/PM to save space? 
                    // Or just short AM/PM. Let's send simple "04:30" and rely on user knowing it's fajr.
                    // Actually user requested "Nano Banana Pro" - minimalist.
                    // Let's send 12h format without suffix if space is tight, or with suffix if possible.
                    // The layout has space.
                    const ampm = h >= 12 ? (language === 'ar' ? 'م' : 'PM') : (language === 'ar' ? 'ص' : 'AM');
                    return `${h12}:${m.toString().padStart(2, '0')}`; // Minimalist: Just time. Use bold/color for context.
                };

                await WidgetBridge.updateWidgetData({
                    fajr: formatTime(prayerTimes.fajr),
                    dhuhr: formatTime(prayerTimes.dhuhr),
                    asr: formatTime(prayerTimes.asr),
                    maghrib: formatTime(prayerTimes.maghrib),
                    isha: formatTime(prayerTimes.isha),
                    nextPrayerName: prayerName, // Used for highlighting
                    nextPrayerTime: formattedTime, // Not used in new layout but good to keep
                    hijriDate: hijriDate,
                    locationName: locationName
                });
                console.log("Widget updated:", { prayerName, formattedTime, hijriDate, locationName });

            } catch (e) {
                console.error("Failed to update widget:", e);
            }
        };

        // Update immediately
        updateWidget();

        // Check every minute
        const interval = setInterval(updateWidget, 60000);

        return () => clearInterval(interval);

    }, [prayerTimes, language]);
};

