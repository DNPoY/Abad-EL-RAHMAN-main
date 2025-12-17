import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePrayerNotifications } from "@/hooks/usePrayerNotifications";
import { useSettings } from "@/contexts/SettingsContext";
import { Clock, MapPin, Bell, BellOff, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';
import { Capacitor } from "@capacitor/core";
import WidgetBridge from "@/lib/widget-bridge";
import { cn } from "@/lib/utils";
import { SettingsDialog } from "@/components/SettingsDialog";
import { useWidgetUpdater } from "@/hooks/useWidgetUpdater";

interface PrayerTime {
  name: string;
  time: string;
  key: string;
}

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

// Convert 24-hour format to 12-hour format with AM/PM
const convertTo12Hour = (time24: string): string => {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
};

// Helper to get just the time part (e.g., "12:34")
const getTimeOnly = (time24: string): string => {
  const [hours, minutes] = time24.split(":").map(Number);
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")}`;
}

// Helper to get just the period (e.g., "PM")
const getPeriod = (time24: string): string => {
  const [hours] = time24.split(":").map(Number);
  return hours >= 12 ? "م" : "ص"; // Arabic AM/PM for the design
}


export const PrayerTimesCard = () => {
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

  // If we have cached data, we don't show the full screen loading spinner.
  // We'll just update in the background.
  const [loading, setLoading] = useState<boolean>(() => !localStorage.getItem('cachedPrayerTimes'));

  const [nextPrayer, setNextPrayer] = useState<{ name: string; timeLeft: string } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    fajr: true, sunrise: true, dhuhr: true, asr: true, maghrib: true, isha: true
  });

  // Update current time every second for the big clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Optimize: Load cache synchronously/immediately and fetch in background
  useEffect(() => {
    const calculatePrayerTimes = (latitude: number, longitude: number) => {
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

        const prayerTimes = new PrayerTimes(coordinates, date, params);
        const formatTime = (date: Date) => `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;

        const calculatedTimes = {
          fajr: formatTime(prayerTimes.fajr),
          sunrise: formatTime(prayerTimes.sunrise),
          dhuhr: formatTime(prayerTimes.dhuhr),
          asr: formatTime(prayerTimes.asr),
          maghrib: formatTime(prayerTimes.maghrib),
          isha: formatTime(prayerTimes.isha),
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
    };

    // 1. Try to load from cache immediately
    const cachedData = localStorage.getItem('cachedPrayerTimes');
    if (cachedData) {
      try {
        const { times, date } = JSON.parse(cachedData) as { times: PrayerTimesData; date: string };
        const today = new Date().toDateString();
        // Even if date is old, showing *something* is better than a spinner for 10s.
        // We will update it in a moment anyway.
        setPrayerTimes(times);
        setLoading(false);
      } catch (e) { /* ignore */ }
    }

    // 2. Determine location source
    if (locationMode === "manual") {
      calculatePrayerTimes(manualLatitude, manualLongitude);
    } else if ("geolocation" in navigator) {
      // Use last known location immediately if available
      const cachedLocation = localStorage.getItem('lastKnownLocation');
      if (cachedLocation) {
        try {
          const parsed = JSON.parse(cachedLocation);
          const lat = parsed.latitude || parsed.lat;
          const lng = parsed.longitude || parsed.lng;
          if (lat && lng) {
            calculatePrayerTimes(lat, lng);
          }
        } catch (e) { /* ignore */ }
      }

      // 3. Fetch fresh location in background
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          localStorage.setItem('lastKnownLocation', JSON.stringify({ latitude, longitude }));
          calculatePrayerTimes(latitude, longitude);
        },
        (error) => {
          console.warn("Location fetch failed, using cache/defaults", error);
          if (!localStorage.getItem('cachedPrayerTimes')) setLoading(false);
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
      );
    }
  }, [language, calculationMethod, madhab, locationMode, manualLatitude, manualLongitude]);

  useEffect(() => {
    if (!prayerTimes) return;
    const calculateNextPrayer = () => {
      const now = new Date();
      const prayers = [
        { name: t.fajr, time: prayerTimes.fajr },
        { name: t.dhuhr, time: prayerTimes.dhuhr },
        { name: t.asr, time: prayerTimes.asr },
        { name: t.maghrib, time: prayerTimes.maghrib },
        { name: t.isha, time: prayerTimes.isha },
      ];

      let foundNext = false;

      for (const prayer of prayers) {
        // Robust time parsing: handles "HH:mm" (24h)
        const [hoursStr, minutesStr] = prayer.time.split(":");
        if (!hoursStr || !minutesStr) continue;

        const hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);

        const prayerTime = new Date();
        prayerTime.setHours(hours, minutes, 0, 0);

        // If today's prayer time is in the past, continue
        if (prayerTime <= now) continue;

        const diff = prayerTime.getTime() - now.getTime();
        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);

        setNextPrayer({
          name: prayer.name,
          timeLeft: `${hoursLeft}:${minutesLeft.toString().padStart(2, "0")}:${secondsLeft.toString().padStart(2, "0")}`
        });
        foundNext = true;
        break;
      }

      if (!foundNext) {
        // If no prayers left today, show countdown to tomorrow's Fajr
        // Assuming Fajr time is same for tomorrow for simplicity (or should trigger refreshed calculation)
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
          timeLeft: `${hoursLeft}:${minutesLeft.toString().padStart(2, "0")}:${secondsLeft.toString().padStart(2, "0")}`
        });
      }
    };

    calculateNextPrayer();
    const interval = setInterval(calculateNextPrayer, 1000); // Verify every second for smoother countdown
    return () => clearInterval(interval);
  }, [prayerTimes, t]);

  // Update Widget
  useWidgetUpdater(prayerTimes);

  const toggleNotification = (key: string) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success(notifications[key] ? t.notificationsDisabled : t.notificationsEnabled);
  };

  if (loading) return <div className="h-64 flex items-center justify-center text-[#FFD700] animate-pulse">Loading...</div>;
  if (!prayerTimes) return <div className="text-center text-white">{t.enableLocation}</div>;

  const prayersList = [
    { key: 'fajr', name: t.fajr, time: prayerTimes.fajr },
    { key: 'sunrise', name: t.sunrise, time: prayerTimes.sunrise },
    { key: 'dhuhr', name: t.dhuhr, time: prayerTimes.dhuhr },
    { key: 'asr', name: t.asr, time: prayerTimes.asr },
    { key: 'maghrib', name: t.maghrib, time: prayerTimes.maghrib },
    { key: 'isha', name: t.isha, time: prayerTimes.isha },
  ];

  const formatBigClock = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return { time: `${hours}:${minutes.toString().padStart(2, '0')}`, period: ampm };
  };

  const bigClock = formatBigClock(currentTime);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Main Widget Card */}
      <div className="relative overflow-hidden rounded-[2rem] bg-emerald-deep text-white shadow-[0_20px_40px_-10px_rgba(9,66,49,0.5)]">
        {/* Internal texture/gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent pointer-events-none" />

        <div className="relative z-10 p-6 flex flex-col items-center justify-center text-center">
          {/* Location Pill */}
          <div className="bg-emerald-900/40 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 mb-6 border border-white/5 cursor-pointer hover:bg-emerald-900/60 transition-colors">
            <MapPin className="w-3.5 h-3.5 text-gold-matte" />
            <span className="text-xs font-tajawal tracking-wide text-emerald-100/90">{prayerTimes.city}</span>
          </div>

          {/* Main Time Display */}
          <div className="mb-2">
            <h2 className="text-sm font-tajawal text-emerald-200/80 mb-1 font-medium tracking-wider uppercase">
              {nextPrayer ? (language === "ar" ? "الصلاة القادمة" : "Next Prayer") : t.dhuhr}
            </h2>
            <div className="flex items-baseline justify-center gap-2" dir="ltr">
              <span className="text-6xl font-bold font-tajawal tracking-tighter text-white drop-shadow-md">
                {bigClock.time}
              </span>
              <span className="text-xl font-medium text-gold-matte">
                {bigClock.period}
              </span>
            </div>
          </div>

          {/* Next Prayer Info */}
          <div className="mt-4 flex flex-col items-center">
            <p className="text-2xl font-tajawal font-bold text-gold-matte mb-1">
              {nextPrayer ? nextPrayer.name : t.dhuhr}
            </p>
            <p className="text-sm text-emerald-200/60 bg-emerald-950/30 px-3 py-1 rounded-lg">
              {language === "ar" ? "متبقي" : "Remaining"}: <span className="font-mono text-emerald-100">{nextPrayer ? nextPrayer.timeLeft : "--:--"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Prayers List - Modern Horizontal Scroll or Stack */}
      <div className="grid grid-cols-1 gap-3 px-1">
        {prayersList.map((prayer) => {
          const isNext = nextPrayer && nextPrayer.name === prayer.name;

          return (
            <div
              key={prayer.key}
              className={cn(
                "group relative flex items-center justify-between p-4 rounded-2xl transition-all duration-300",
                isNext
                  ? "bg-emerald-deep text-white shadow-lg shadow-emerald-deep/20 scale-[1.02]"
                  : "bg-white text-emerald-deep hover:bg-emerald-50 shadow-sm hover:shadow-md border border-emerald-deep/5"
              )}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleNotification(prayer.key)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    isNext
                      ? "bg-white/10 text-gold-matte hover:bg-white/20"
                      : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  )}
                >
                  {notifications[prayer.key] ? <Bell className="w-5 h-5 fill-current" /> : <BellOff className="w-5 h-5 opacity-50" />}
                </button>

                <span className={cn(
                  "text-lg font-bold font-tajawal",
                  isNext ? "text-white" : "text-emerald-deep"
                )}>
                  {prayer.name}
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className={cn(
                  "text-2xl font-bold font-tajawal tracking-tight",
                  isNext ? "text-white" : "text-emerald-deep"
                )}>
                  {getTimeOnly(prayer.time)}
                </span>
                <span className={cn(
                  "text-xs font-medium",
                  isNext ? "text-emerald-200" : "text-emerald-deep/60"
                )}>
                  {getPeriod(prayer.time)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
