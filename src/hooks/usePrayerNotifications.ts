import { useEffect, useRef, useCallback } from "react";
import { useNotification } from "@/contexts/NotificationContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Capacitor } from '@capacitor/core';

interface PrayerTimeProp {
  name: string;
  time: string;
  arabicName: string;
}

interface UsePrayerNotificationsProps {
  prayerTimes: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  } | null;
}

export const usePrayerNotifications = ({ prayerTimes }: UsePrayerNotificationsProps) => {
  const { settings: notifSettings } = useNotification();
  const { t, language } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);




  // --------------------------------------------------------
  // 2. Play Adhan Function (Audio)
  // --------------------------------------------------------
  const playAdhan = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const adhanSounds = {
      makkah: "/sounds/adhan_makkah.mp3",
      madinah: "/sounds/adhan_madinah.mp3",
      egypt: "/sounds/adhan_egypt.mp3",
    };
    audioRef.current.src = adhanSounds[notifSettings.adhanSound];
    audioRef.current.volume = 0.7;
    audioRef.current.play().catch((error) => {
      console.error("Error playing adhan:", error);
    });
  }, [notifSettings.adhanSound]);


  // --------------------------------------------------------
  // 3. Foreground Checks (Web & Open App)
  // --------------------------------------------------------
  useEffect(() => {
    if (!notifSettings.enabled || !prayerTimes) return;

    const prayers: PrayerTimeProp[] = [
      { name: "fajr", time: prayerTimes.fajr, arabicName: t.fajr },
      { name: "dhuhr", time: prayerTimes.dhuhr, arabicName: t.dhuhr },
      { name: "asr", time: prayerTimes.asr, arabicName: t.asr },
      { name: "maghrib", time: prayerTimes.maghrib, arabicName: t.maghrib },
      { name: "isha", time: prayerTimes.isha, arabicName: t.isha },
    ];

    const checkPrayerTime = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      prayers.forEach((prayer) => {
        if (!notifSettings.enabledPrayers[prayer.name as keyof typeof notifSettings.enabledPrayers]) return;

        const [hours, minutes] = prayer.time.split(":").map(Number);
        const prayerTimeMinutes = hours * 60 + minutes;
        const reminderTimeMinutes = prayerTimeMinutes - notifSettings.reminderMinutes;

        // Reminder Check
        if (currentTime === reminderTimeMinutes) {
          if (!Capacitor.isNativePlatform() && "Notification" in window && Notification.permission === "granted") {
            const title = language === "ar" ? `تنبيه: ${prayer.arabicName}` : `Reminder: ${prayer.arabicName}`;
            const body = language === "ar" ? `بعد ${notifSettings.reminderMinutes} دقائق` : `In ${notifSettings.reminderMinutes} minutes`;
            new Notification(title, { body, icon: "/favicon.ico", badge: "/favicon.ico", tag: `reminder-${prayer.name}` });
          }
        }

        // Adhan Check
        if (currentTime === prayerTimeMinutes) {
          if (!Capacitor.isNativePlatform() && "Notification" in window && Notification.permission === "granted") {
            const title = language === "ar" ? `حان الآن موعد صلاة ${prayer.arabicName}` : `It's time for ${prayer.arabicName}`;
            new Notification(title, { body: language === "ar" ? "حي على الصلاة" : "Come to prayer", icon: "/favicon.ico", badge: "/favicon.ico", tag: `adhan-${prayer.name}`, requireInteraction: true });
          }
          playAdhan(); // Plays audio in foreground
        }
      });
    };

    checkIntervalRef.current = setInterval(checkPrayerTime, 60000);
    checkPrayerTime(); // Initial check

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [notifSettings, prayerTimes, language, t, playAdhan]);

  return { playAdhan };
};
