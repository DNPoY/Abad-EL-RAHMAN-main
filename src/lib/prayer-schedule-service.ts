import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import WidgetBridge from '@/lib/widget-bridge';
import { Coordinates, CalculationMethod, PrayerTimes, Madhab } from 'adhan';
import { toast } from "sonner";

export interface SchedulerOptions {
    manualLatitude: number;
    manualLongitude: number;
    calculationMethod: number;
    madhab: "shafi" | "hanafi";
    locationMode: "auto" | "manual";
    notifSettings: {
        enabled: boolean;
        enabledPrayers: {
            fajr: boolean;
            dhuhr: boolean;
            asr: boolean;
            maghrib: boolean;
            isha: boolean;
        };
        reminderMinutes: number;
        adhanSound: "makkah" | "madinah" | "egypt";
    };
    preAzanReminder: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t: any; // Translation object
    language: "ar" | "en";
    devMode: boolean;
}

export const PrayerScheduleService = {
    scheduleAlarms: async (options: SchedulerOptions) => {
        console.log("[PrayerScheduleService] scheduleAlarms called with options:", JSON.stringify(options, null, 2));

        if (!Capacitor.isNativePlatform()) {
            console.log("[PrayerScheduleService] Not native platform, skipping.");
            if (options.devMode) {
                toast.error("Scheduler Skipped: Not Native Platform", { duration: 10000 });
            }
            return { success: false, reason: "not_native" };
        }

        console.log("[PrayerScheduleService] Starting scheduling...");

        try {
            // Permission Check
            // Permission Check (Soft - Allows Azan scheduling even if notifications denied)
            let hasNotificationPerm = true;
            try {
                const perm = await LocalNotifications.checkPermissions();
                if (perm.display !== 'granted') {
                    const req = await LocalNotifications.requestPermissions();
                    if (req.display !== 'granted') {
                        console.log("[PrayerScheduleService] Notifications permission denied. Reminders will be skipped, but Azan Alarms will attempt to schedule.");
                        hasNotificationPerm = false;
                        if (options.devMode) {
                            toast.warning("Permissions Denied: Reminders skipped, scheduling Azan only.", { duration: 5000 });
                        }
                    }
                }
            } catch (permError) {
                console.error("Error checking permissions:", permError);
                hasNotificationPerm = false;
            }

            // Check Global Enabled
            if (!options.notifSettings.enabled) {
                console.log("[PrayerScheduleService] Notifications disabled. Cancelling all.");
                const pNames = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
                for (let i = 0; i < 7; i++) {
                    for (const p of pNames) {
                        await WidgetBridge.cancelAdhan({ prayerName: `${p}_${i}` });
                    }
                }
                await LocalNotifications.cancel({ notifications: [] });
                await LocalNotifications.cancel({ notifications: [] });
                if (options.devMode) {
                    toast.warning("Scheduler: Notifications Disabled (Cancelled All)", { duration: 10000 });
                }
                return { success: true, action: "cancelled_all" };
            }

            // Determine Location
            let lat = options.manualLatitude;
            let lng = options.manualLongitude;
            if (options.locationMode === 'auto') {
                try {
                    const cached = JSON.parse(localStorage.getItem('lastKnownLocation') || '{}');
                    if (cached.latitude && cached.longitude) {
                        lat = cached.latitude;
                        lng = cached.longitude;
                    }
                } catch (e) {
                    console.error("Error parsing cached location", e);
                }
            }

            if (!lat || !lng) {
                if (options.devMode) {
                    toast.error("Scheduler Skipped: No Location (Lat/Lng missing)", { duration: 10000 });
                }
                return { success: false, reason: "no_location" };
            }

            // Setup Adhan Parameters
            const coordinates = new Coordinates(lat, lng);
            let params = CalculationMethod.MuslimWorldLeague();
            switch (options.calculationMethod) {
                case 3: params = CalculationMethod.MuslimWorldLeague(); break;
                case 2: params = CalculationMethod.NorthAmerica(); break;
                case 5: params = CalculationMethod.Egyptian(); break;
                case 4: params = CalculationMethod.UmmAlQura(); break;
                case 1: params = CalculationMethod.Karachi(); break;
                case 7: params = CalculationMethod.Tehran(); break;
                case 0: params = CalculationMethod.Tehran(); break;
                default: params = CalculationMethod.MuslimWorldLeague();
            }
            params.madhab = options.madhab === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;

            const now = new Date();

            // Schedule for next 7 days
            let scheduledCount = 0;
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i);

                const prayers = new PrayerTimes(coordinates, date, params);
                const times = [
                    { name: "fajr", date: prayers.fajr },
                    { name: "dhuhr", date: prayers.dhuhr },
                    { name: "asr", date: prayers.asr },
                    { name: "maghrib", date: prayers.maghrib },
                    { name: "isha", date: prayers.isha },
                ];

                for (const prayer of times) {
                    // Skip if explicitly disabled
                    if (!options.notifSettings.enabledPrayers[prayer.name as keyof typeof options.notifSettings.enabledPrayers]) {
                        await WidgetBridge.cancelAdhan({ prayerName: `${prayer.name}_${i}` });
                        continue;
                    }

                    // Only schedule future times
                    if (prayer.date > now) {
                        const soundName = options.notifSettings.adhanSound === "makkah" ? "adhan_makkah" : options.notifSettings.adhanSound === "madinah" ? "adhan_madinah" : "adhan_egypt";
                        const uniqueKey = `${prayer.name}_${i}`;

                        if (!isNaN(prayer.date.getTime())) {
                            await WidgetBridge.scheduleAdhan({
                                prayerName: uniqueKey,
                                timestamp: prayer.date.getTime(),
                                soundName: soundName
                            });
                            scheduledCount++;
                        }
                    }
                }
            }

            // Reminders Logic (Preserved from original hook)
            if (hasNotificationPerm && (options.notifSettings.reminderMinutes > 0 || options.preAzanReminder)) {
                const remindersToSchedule = [];
                const arabicNames: Record<string, string> = { "fajr": options.t.fajr, "dhuhr": options.t.dhuhr, "asr": options.t.asr, "maghrib": options.t.maghrib, "isha": options.t.isha };

                for (let i = 0; i < 3; i++) {
                    const date = new Date();
                    date.setDate(date.getDate() + i);
                    const prayers = new PrayerTimes(coordinates, date, params);
                    const times = [
                        { name: "fajr", date: prayers.fajr },
                        { name: "dhuhr", date: prayers.dhuhr },
                        { name: "asr", date: prayers.asr },
                        { name: "maghrib", date: prayers.maghrib },
                        { name: "isha", date: prayers.isha },
                    ];

                    for (const prayer of times) {
                        if (options.notifSettings.enabledPrayers[prayer.name as keyof typeof options.notifSettings.enabledPrayers]) {
                            // Standard Reminder
                            if (options.notifSettings.reminderMinutes > 0) {
                                const reminderTime = new Date(prayer.date.getTime() - options.notifSettings.reminderMinutes * 60000);
                                if (reminderTime > now) {
                                    remindersToSchedule.push({
                                        title: options.language === "ar" ? `تنبيه: ${arabicNames[prayer.name]}` : `Reminder: ${prayer.name}`,
                                        body: options.language === "ar" ? `بعد ${options.notifSettings.reminderMinutes} دقائق` : `In ${options.notifSettings.reminderMinutes} minutes`,
                                        id: Math.floor(Math.random() * 1000000) + (i * 100),
                                        schedule: { at: reminderTime },
                                        channelId: 'prayer_reminder',
                                    });
                                }
                            }

                            // 9-Min Pre-Azan
                            if (options.preAzanReminder) {
                                const pre9MinTime = new Date(prayer.date.getTime() - 9 * 60000);
                                if (pre9MinTime > now) {
                                    remindersToSchedule.push({
                                        title: options.language === "ar" ? `اقتراب الصلاة: ${arabicNames[prayer.name]}` : `Prayer Approaching: ${prayer.name}`,
                                        body: options.language === "ar" ? `متبقي ٩ دقائق على الأذان` : `9 minutes remaining until Azan`,
                                        id: Math.floor(Math.random() * 1000000) + (i * 500) + 999,
                                        schedule: { at: pre9MinTime },
                                        channelId: 'prayer_reminder',
                                    });
                                }
                            }
                        }
                    }
                }
                if (remindersToSchedule.length > 0) {
                    await LocalNotifications.schedule({ notifications: remindersToSchedule });
                }
            }

            console.log(`[PrayerScheduleService] Scheduled ${scheduledCount} prayers.`);
            if (options.devMode) {
                if (scheduledCount === 0) {
                    toast.warning("Scheduler: 0 Prayers Scheduled (Check Dates/Enabled Prayers)", { duration: 10000 });
                } else {
                    toast.success(options.language === 'ar'
                        ? `تم جدولة ${scheduledCount} صلاة ومحاولة التنشيط`
                        : `Scheduled ${scheduledCount} prayers.`, { duration: 10000 });
                }
            }
            return { success: true, count: scheduledCount };

        } catch (error) {
            console.error("[PrayerScheduleService] Error:", error);
            if (options.devMode) {
                toast.error(options.language === 'ar'
                    ? `خطأ جدولة: ${error?.message || error}`
                    : `Schedule Error: ${error?.message || error}`, { duration: 10000 });
            }
            return { success: false, error: error };
        }
    }
};
