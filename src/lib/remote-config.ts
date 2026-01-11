import { remoteConfig } from "./firebase";
import { fetchAndActivate, getValue, getAll } from "firebase/remote-config";

// Default values - used before a successful fetch or if fetch fails
const DEFAULTS = {
    // Core
    prayer_api_url: "https://api.aladhan.com/v1/timings",
    min_required_version: "1.0.14",
    force_update_message_ar: "يرجى التحديث لضمان دقة مواقيت الصلاة.",
    force_update_message_en: "Please update to ensure prayer times accuracy.",

    // Quran Audio
    quran_audio_base_url: "https://server8.mp3quran.net/",

    // Hijri Calendar Adjustment
    hijri_adjustment: 0,

    // Privacy/Analytics
    enable_analytics: true,

    // Seasonal/Event Mode
    seasonal_config: JSON.stringify({
        enabled: false,
        event_name: "",
        home_banner_text_ar: "",
        home_banner_text_en: "",
        theme_color: null
    }),

    // Daily Feed (Hadith, Ayah, Announcement)
    daily_feed_config: JSON.stringify({
        show: true,
        type: "hadith",
        source: "local_db"
    }),

    // Share Message
    share_message_template: "تقبل الله منا ومنكم. حمل تطبيق عباد الرحمن: [LINK]",

    // Featured Video (Help/Tutorial)
    featured_video_url: "",

    // Feature Flags (Enable/Disable features remotely)
    feature_flags: JSON.stringify({
        mosque_finder: true,
        radio_stream: true,
        qibla_compass: true
    }),

    // Support Contact
    support_contact: JSON.stringify({
        email: "ahmeddnelhariri@gmail.com",
        whatsapp: ""
    }),

    // ========= ADHAN SETTINGS =========
    adhan_config: JSON.stringify({
        // Audio URLs (can switch if a server goes down)
        audio_urls: {
            makkah: "adhan_makkah",
            madinah: "adhan_madinah",
            egypt: "adhan_egypt"
        },
        // Default sound if user hasn't chosen
        default_sound: "makkah",
        // Enable/disable adhan globally (emergency kill switch)
        enabled: true,
        // Fajr uses a different adhan in some regions
        fajr_special_adhan: false
    }),

    // Prayer time adjustments (in minutes, per prayer)
    prayer_adjustments: JSON.stringify({
        fajr: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0
    })
};

// Caching interval: 12 hours (43200000 ms)
const FETCH_INTERVAL_MS = 43200000;

let isFetched = false;

export const RemoteConfigService = {
    /**
     * Initialize Remote Config with defaults and optionally fetch.
     */
    init: async (devMode: boolean = false) => {
        try {
            remoteConfig.defaultConfig = DEFAULTS;
            remoteConfig.settings.minimumFetchIntervalMillis = devMode ? 0 : FETCH_INTERVAL_MS;
            await fetchAndActivate(remoteConfig);
            isFetched = true;
            console.log("[RemoteConfig] Fetched and activated successfully.");
        } catch (error) {
            console.warn("[RemoteConfig] Failed to fetch, using defaults:", error);
        }
    },

    /**
     * Force refresh (for Dev Panel or manual resync).
     */
    forceRefresh: async () => {
        try {
            remoteConfig.settings.minimumFetchIntervalMillis = 0;
            await fetchAndActivate(remoteConfig);
            console.log("[RemoteConfig] Force refresh successful.");
        } catch (error) {
            console.error("[RemoteConfig] Force refresh failed:", error);
        }
    },

    // =========== GETTERS ===========

    // --- Core ---
    getApiUrl: (): string => {
        return getValue(remoteConfig, "prayer_api_url").asString() || DEFAULTS.prayer_api_url;
    },

    getMinVersion: (): string => {
        return getValue(remoteConfig, "min_required_version").asString() || DEFAULTS.min_required_version;
    },

    getForceUpdateMessage: (lang: "ar" | "en"): string => {
        const key = lang === "ar" ? "force_update_message_ar" : "force_update_message_en";
        return getValue(remoteConfig, key).asString() || (lang === "ar" ? DEFAULTS.force_update_message_ar : DEFAULTS.force_update_message_en);
    },

    // --- Quran Audio ---
    getQuranAudioBaseUrl: (): string => {
        return getValue(remoteConfig, "quran_audio_base_url").asString() || DEFAULTS.quran_audio_base_url;
    },

    // --- Hijri Adjustment ---
    getHijriAdjustment: (): number => {
        return getValue(remoteConfig, "hijri_adjustment").asNumber() ?? DEFAULTS.hijri_adjustment;
    },

    // --- Analytics ---
    isAnalyticsEnabled: (): boolean => {
        return getValue(remoteConfig, "enable_analytics").asBoolean() ?? DEFAULTS.enable_analytics;
    },

    // --- Seasonal Config ---
    getSeasonalConfig: (): {
        enabled: boolean;
        event_name: string;
        home_banner_text_ar: string;
        home_banner_text_en: string;
        theme_color: string | null;
    } => {
        try {
            return JSON.parse(getValue(remoteConfig, "seasonal_config").asString());
        } catch {
            return JSON.parse(DEFAULTS.seasonal_config);
        }
    },

    // --- Daily Feed ---
    getDailyFeedConfig: (): {
        show: boolean;
        type: "hadith" | "ayah" | "announcement";
        source: string;
    } => {
        try {
            return JSON.parse(getValue(remoteConfig, "daily_feed_config").asString());
        } catch {
            return JSON.parse(DEFAULTS.daily_feed_config);
        }
    },

    // --- Share Message ---
    getShareMessage: (appLink: string): string => {
        const template = getValue(remoteConfig, "share_message_template").asString() || DEFAULTS.share_message_template;
        return template.replace("[LINK]", appLink);
    },

    // --- Featured Video ---
    getFeaturedVideoUrl: (): string => {
        return getValue(remoteConfig, "featured_video_url").asString() || DEFAULTS.featured_video_url;
    },

    // --- Feature Flags ---
    getFeatureFlags: (): {
        mosque_finder: boolean;
        radio_stream: boolean;
        qibla_compass: boolean;
        [key: string]: boolean;
    } => {
        try {
            return JSON.parse(getValue(remoteConfig, "feature_flags").asString());
        } catch {
            return JSON.parse(DEFAULTS.feature_flags);
        }
    },

    isFeatureEnabled: (featureName: string): boolean => {
        const flags = RemoteConfigService.getFeatureFlags();
        return flags[featureName] ?? true;
    },

    // --- Support Contact ---
    getSupportContact: (): {
        email: string;
        whatsapp: string;
    } => {
        try {
            return JSON.parse(getValue(remoteConfig, "support_contact").asString());
        } catch {
            return JSON.parse(DEFAULTS.support_contact);
        }
    },

    // --- Adhan Settings ---
    getAdhanConfig: (): {
        audio_urls: {
            makkah: string;
            madinah: string;
            egypt: string;
        };
        default_sound: string;
        enabled: boolean;
        fajr_special_adhan: boolean;
    } => {
        try {
            return JSON.parse(getValue(remoteConfig, "adhan_config").asString());
        } catch {
            return JSON.parse(DEFAULTS.adhan_config);
        }
    },

    isAdhanEnabled: (): boolean => {
        return RemoteConfigService.getAdhanConfig().enabled;
    },

    // --- Prayer Time Adjustments ---
    getPrayerAdjustments: (): {
        fajr: number;
        dhuhr: number;
        asr: number;
        maghrib: number;
        isha: number;
    } => {
        try {
            return JSON.parse(getValue(remoteConfig, "prayer_adjustments").asString());
        } catch {
            return JSON.parse(DEFAULTS.prayer_adjustments);
        }
    },

    getPrayerAdjustment: (prayer: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha"): number => {
        return RemoteConfigService.getPrayerAdjustments()[prayer] || 0;
    },

    // --- Debug ---
    getAll: () => {
        return getAll(remoteConfig);
    }
};
