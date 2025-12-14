import { registerPlugin } from '@capacitor/core';

export interface WidgetBridgePlugin {
    updateWidgetData(options: {
        fajr: string;
        dhuhr: string;
        asr: string;
        maghrib: string;
        isha: string;
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
}

const WidgetBridge = registerPlugin<WidgetBridgePlugin>('WidgetBridge');

export default WidgetBridge;
