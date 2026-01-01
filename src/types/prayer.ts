export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export interface Prayer {
    key: PrayerKey;
    name: string;
    time: string;
}

export interface PrayerTimes {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    city: string;
}

export interface NextPrayer {
    key: PrayerKey;
    name: string;
    time: string;
    timeLeft: string;
}

export interface NotificationSettings {
    enabledPrayers: Record<PrayerKey, boolean>;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
}
