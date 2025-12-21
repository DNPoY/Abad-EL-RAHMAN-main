import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePrayerTimes } from "@/contexts/PrayerTimesContext";
import { useNotification } from "@/contexts/NotificationContext";
import { MapPin, Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const { prayerTimes, nextPrayer, loading } = usePrayerTimes();
  const { settings, updateSettings } = useNotification();

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for the big clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleNotification = (key: string) => {
    // Check if it's a valid prayer key for settings
    if (key === 'sunrise') return; // Usually sunrise doesn't have a notification/adhan

    const current = settings.enabledPrayers[key as keyof typeof settings.enabledPrayers];
    if (current === undefined) return;

    updateSettings({
      enabledPrayers: {
        ...settings.enabledPrayers,
        [key]: !current
      }
    });
    toast.success(!current ? (language === "ar" ? "تم تفعيل التنبيهات" : "Notifications enabled") : (language === "ar" ? "تم تعطيل التنبيهات" : "Notifications disabled"));
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
    <div className="space-y-4 animate-fade-in-up">
      {/* Main Widget Card */}
      <div className="relative overflow-hidden rounded-[2rem] bg-emerald-deep text-white shadow-[0_15px_30px_-10px_rgba(9,66,49,0.5)]">
        {/* Internal texture/gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent pointer-events-none" />

        <div className="relative z-10 p-5 flex flex-col items-center justify-center text-center">
          {/* Location Pill */}
          <div className="bg-emerald-900/40 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 mb-2 border border-white/5 cursor-pointer hover:bg-emerald-900/60 transition-colors">
            <MapPin className="w-3 h-3 text-gold-matte" />
            <span className="text-[10px] font-tajawal tracking-wide text-emerald-100/90">{prayerTimes.city}</span>
          </div>

          {/* Main Time Display */}
          <div className="mb-2">
            <h2 className="text-xs font-tajawal text-emerald-200/80 mb-0.5 font-medium tracking-wider uppercase">
              {nextPrayer ? (language === "ar" ? "الصلاة القادمة" : "Next Prayer") : t.dhuhr}
            </h2>
            <div className="flex items-baseline justify-center gap-1.5" dir="ltr">
              <span className="text-6xl font-bold font-tajawal tracking-tighter text-white drop-shadow-md">
                {bigClock.time}
              </span>
              <span className="text-xl font-medium text-gold-matte">
                {bigClock.period}
              </span>
            </div>
          </div>

          {/* Next Prayer Info */}
          <div className="mt-1 flex flex-col items-center">
            <p className="text-2xl font-tajawal font-bold text-gold-matte mb-1">
              {nextPrayer ? nextPrayer.name : t.dhuhr}
            </p>
            <p className="text-xs text-emerald-200/60 bg-emerald-950/30 px-2.5 py-0.5 rounded-md">
              <span className="font-mono text-emerald-100">{nextPrayer ? nextPrayer.timeLeft : "--:--"}</span> : {language === "ar" ? "متبقي" : "Remaining"}
            </p>
          </div>
        </div>
      </div>

      {/* Prayers List - Compact Stack */}
      {/* Prayers List - Compact Stack */}
      <div className="grid grid-cols-1 gap-2 px-1">
        {prayersList.map((prayer) => {
          const isNext = nextPrayer && nextPrayer.key === prayer.key;
          const isNotificationEnabled = settings.enabledPrayers[prayer.key as keyof typeof settings.enabledPrayers];
          const showBell = prayer.key !== 'sunrise';

          return (
            <div
              key={prayer.key}
              className={cn(
                "group relative flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300",
                isNext
                  ? "bg-emerald-deep text-white shadow-md shadow-emerald-deep/20 scale-[1.01]"
                  : "bg-white text-emerald-deep hover:bg-emerald-50 shadow-sm border border-emerald-deep/5"
              )}
            >
              <div className="flex items-center gap-3">
                {showBell && (
                  <button
                    onClick={() => toggleNotification(prayer.key)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                      isNext
                        ? "bg-white/10 text-gold-matte hover:bg-white/20"
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    )}
                  >
                    {isNotificationEnabled ? <Bell className="w-4 h-4 fill-current" /> : <BellOff className="w-4 h-4 opacity-50" />}
                  </button>
                )}
                {!showBell && <div className="w-8" />}

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
                  "text-[10px] font-medium",
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
