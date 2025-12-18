import { registerPlugin } from '@capacitor/core';

export interface WidgetBridgePlugin {
    updateWidgetData(options: {
        fajr: string;
        dhuhr: string;
        asr: string;
        maghrib: string;
        isha: string;
        nextPrayerName: string;
        nextPrayerTime: string;
        hijriDate: string;
        locationName: string;
    }): Promise<void>;
    openBatterySettings(): Promise<void>;
    scheduleAdhan(options: {
        prayerName: string;
        timestamp: number;
        soundName: string;
    }): Promise<void>;
    cancelAdhan(options: { prayerName: string }): Promise<void>;
    scheduleAlarm(options: { timestamp: number; soundName?: string }): Promise<void>;
    stopAlarm(): Promise<void>;
    getPendingAlarms(): Promise<{ alarms: { prayerName: string; timestamp: number; soundName: string }[] }>;
    pickRingtone(): Promise<{ uri: string; title: string }>;
    getCustomRingtone(): Promise<{ uri: string | null; title: string | null }>;
}

const WidgetBridge = registerPlugin<WidgetBridgePlugin>('WidgetBridge');

export default WidgetBridge;
