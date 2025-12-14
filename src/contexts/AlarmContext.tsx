import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useLanguage } from "./LanguageContext";
import { useSettings } from "./SettingsContext";
import { useNotification } from "./NotificationContext";

export type AlarmChallengeType = "normal" | "number" | "math";

interface AlarmContextType {
    isAlarmActive: boolean;
    alarmTime: string | null;
    challengeType: AlarmChallengeType;
    alarmSound: string;
    setAlarmTime: (time: string) => void;
    setChallengeType: (type: AlarmChallengeType) => void;
    setAlarmSound: (sound: string) => void;
    stopAlarm: () => void;
    isAlarmRinging: boolean;
}

const AlarmContext = createContext<AlarmContextType | undefined>(undefined);

export const AlarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [alarmTime, setAlarmTimeState] = useState<string | null>(null);
    const [challengeType, setChallengeTypeState] = useState<AlarmChallengeType>("normal");
    const [alarmSound, setAlarmSoundState] = useState<string>("default");
    const [isAlarmRinging, setIsAlarmRinging] = useState(false);

    // Helper to Convert HH:MM to Next Timestamp
    const calculateNextAlarm = (time: string): number => {
        const [hours, minutes] = time.split(":").map(Number);
        const now = new Date();
        const alarmDate = new Date();
        alarmDate.setHours(hours, minutes, 0, 0);

        if (alarmDate <= now) {
            alarmDate.setDate(alarmDate.getDate() + 1);
        }
        return alarmDate.getTime();
    };

    const setAlarmTime = useCallback(async (time: string) => {
        setAlarmTimeState(time);
        localStorage.setItem("alarmTime", time);

        if (time) {
            try {
                // Schedule Native Alarm
                const timestamp = calculateNextAlarm(time);

                // For native platforms, use the bridge
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((window as any).Capacitor?.isNativePlatform()) {
                    const { default: WidgetBridge } = await import("@/lib/widget-bridge");
                    await WidgetBridge.scheduleAlarm({ timestamp, soundName: alarmSound });
                }
            } catch (e) {
                console.error("Error scheduling native alarm", e);
            }
        }
    }, [alarmSound]);

    const setChallengeType = useCallback((type: AlarmChallengeType) => {
        setChallengeTypeState(type);
        localStorage.setItem("alarmChallengeType", type);
    }, []);

    const setAlarmSound = useCallback((sound: string) => {
        setAlarmSoundState(sound);
        localStorage.setItem("alarmSound", sound);
    }, []);

    const stopAlarm = useCallback(async () => {
        setIsAlarmRinging(false);
        // Stop Native Alarm
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).Capacitor?.isNativePlatform()) {
            try {
                const { default: WidgetBridge } = await import("@/lib/widget-bridge");
                await WidgetBridge.stopAlarm();
            } catch (e) {
                console.error("Error stopping native alarm", e);
            }
        }
    }, []);

    // Check on mount if we were launched by alarm (check simple time window)
    useEffect(() => {
        const checkLaunch = () => {
            const savedTime = localStorage.getItem("alarmTime");
            if (savedTime) {
                const now = new Date();
                const [h, m] = savedTime.split(":").map(Number);
                // If we are within 1 minute of the alarm time, assume it's ringing
                if (now.getHours() === h && Math.abs(now.getMinutes() - m) <= 1) {
                    setIsAlarmRinging(true);
                }
            }
        };
        checkLaunch();
    }, []); // Run ONLY on mount

    const { language, t } = useLanguage();
    const { calculationMethod, madhab, locationMode, manualLatitude, manualLongitude, preAzanReminder } = useSettings();
    const { settings: notifSettings } = useNotification();

    // --------------------------------------------------------
    // Global Native Background Scheduling (Rolling 7-Day Window)
    // --------------------------------------------------------
    useEffect(() => {
        const runScheduler = async () => {
            const { PrayerScheduleService } = await import('@/lib/prayer-schedule-service');
            await PrayerScheduleService.scheduleAlarms({
                manualLatitude,
                manualLongitude,
                calculationMethod,
                madhab,
                locationMode,
                notifSettings,
                preAzanReminder,
                t,
                language: language as "ar" | "en",
                devMode: localStorage.getItem("devMode") === "true"
            });
        };

        runScheduler();

        const handleResume = () => {
            console.log("[AlarmContext] App resumed, ensuring schedule...");
            runScheduler();
        };
        window.addEventListener('app-resumed', handleResume);
        return () => window.removeEventListener('app-resumed', handleResume);
    }, [notifSettings, calculationMethod, madhab, locationMode, manualLatitude, manualLongitude, t, language, preAzanReminder]);

    // Load alarm from localStorage on mount
    useEffect(() => {
        const savedTime = localStorage.getItem("alarmTime");
        const savedType = localStorage.getItem("alarmChallengeType") as AlarmChallengeType;
        const savedSound = localStorage.getItem("alarmSound");

        if (savedTime) {
            setAlarmTimeState(savedTime);
        }
        if (savedType) {
            setChallengeTypeState(savedType);
        }
        if (savedSound) {
            setAlarmSoundState(savedSound);
        }
    }, []);

    return (
        <AlarmContext.Provider
            value={{
                isAlarmActive: !!alarmTime,
                alarmTime,
                challengeType,
                alarmSound,
                setAlarmTime,
                setChallengeType,
                setAlarmSound,
                stopAlarm,
                isAlarmRinging,
            }}
        >
            {children}
        </AlarmContext.Provider>
    );
};

export const useAlarm = () => {
    const context = useContext(AlarmContext);
    if (context === undefined) {
        throw new Error("useAlarm must be used within an AlarmProvider");
    }
    return context;
};
