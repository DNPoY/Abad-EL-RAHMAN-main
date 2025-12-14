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

      for (const prayer of prayers) {
        const [hours, minutes] = prayer.time.split(":").map(Number);
        const prayerTime = new Date();
        prayerTime.setHours(hours, minutes, 0, 0);
        if (prayerTime > now) {
          const diff = prayerTime.getTime() - now.getTime();
          const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
          const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setNextPrayer({ name: prayer.name, timeLeft: `${hoursLeft}:${minutesLeft.toString().padStart(2, "0")}` });
          return;
        }
      }
      // Fallback for next day Fajr
      setNextPrayer({ name: t.fajr, timeLeft: "--:--" });
    };
    calculateNextPrayer();
    const interval = setInterval(calculateNextPrayer, 60000);
    return () => clearInterval(interval);
  }, [prayerTimes, t]);

  // Update Widget
  useEffect(() => {
    if (prayerTimes && Capacitor.isNativePlatform()) {
      const formatForWidget = (time24: string) => {
        const [hours, minutes] = time24.split(":").map(Number);
        const period = hours >= 12 ? "م" : "ص";
        const hours12 = hours % 12 || 12;
        return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
      };

      WidgetBridge.updateWidgetData({
        fajr: formatForWidget(prayerTimes.fajr),
        dhuhr: formatForWidget(prayerTimes.dhuhr),
        asr: formatForWidget(prayerTimes.asr),
        maghrib: formatForWidget(prayerTimes.maghrib),
        isha: formatForWidget(prayerTimes.isha),
      }).catch(err => console.error("Failed to update widget:", err));
    }
  }, [prayerTimes]);

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
    <div className="space-y-6">
      {/* Big Clock Section */}
      <div className="text-center py-4 relative">
        <div className="flex items-baseline justify-center gap-2 text-white" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
          <span className="text-2xl font-bold">{bigClock.period}</span>
          <span className="text-8xl font-bold tracking-tighter font-sans">{bigClock.time}</span>
        </div>
        <h2 className="text-3xl font-bold text-white mt-[-10px] font-amiri" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          {nextPrayer ? nextPrayer.name : t.dhuhr}
        </h2>

        {/* Location Indicator & Edit */}
        <div className="flex items-center justify-center gap-2 mt-2 text-white/80 text-sm">
          <MapPin className="w-4 h-4" />
          <span>{prayerTimes.city}</span>
          <SettingsDialog trigger={
            <button className="text-white underline text-xs hover:text-white/80 transition-colors">
              {t.settings}
            </button>
          } />
        </div>
      </div>

      {/* Prayer List - White Bars */}
      <div className="space-y-3">
        {prayersList.map((prayer) => (
          <div
            key={prayer.key}
            className="relative min-h-[4rem] w-full isolate transform-gpu"
            style={{
              willChange: 'transform',
              transform: 'translateZ(0)'
            }}
          >
            {/* White Bar Background */}
            <div
              className="absolute inset-0 rounded-full border border-white/80"
              style={{
                background: '#F5F5F5', // Solid fallback
                backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #E0E0E0 100%)',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
            >
            </div>

            {/* Content Container */}
            <div className="relative h-full flex items-center justify-between px-4 py-2 z-10">
              {/* Left: Notification Toggle */}
              <button
                onClick={() => toggleNotification(prayer.key)}
                className="flex-shrink-0 w-10 h-10 rounded-full bg-[#094231] flex items-center justify-center text-white border border-white/30 hover:bg-[#073628] transition-colors"
              >
                {notifications[prayer.key] ? <Bell className="w-5 h-5 fill-current" /> : <BellOff className="w-5 h-5" />}
              </button>

              {/* Center: Time & Period */}
              <div
                className="flex flex-nowrap items-center justify-end gap-1 text-[#094231] font-bold text-xl ml-auto mr-4 text-right"
                style={{ textShadow: 'none' }} // Ensure no shadow on text to avoid artifacts
              >
                <span className="text-sm sm:text-base pt-1">{getPeriod(prayer.time)}</span>
                <span className="text-2xl sm:text-3xl font-sans leading-none">{getTimeOnly(prayer.time)}</span>
              </div>

              {/* Right: Prayer Name */}
              <div className="text-[#094231] font-bold text-xl sm:text-2xl font-amiri min-w-[30%] text-right truncate">
                {prayer.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
