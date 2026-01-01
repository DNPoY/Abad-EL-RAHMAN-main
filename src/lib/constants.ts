import { TasbihTarget } from "@/types/tasbih";

/**
 * Tasbih Counter Constants
 */
export const TASBIH_TARGETS: readonly TasbihTarget[] = [33, 100, 0] as const;

export const VIBRATION_PATTERNS = {
    LIGHT: 10,
    MEDIUM: 20,
    HEAVY: 30,
    SUCCESS: [50, 50, 50] as number[],
    LONG_PRESS: [0, 100, 50, 100] as number[],
} as const;

/**
 * Animation Duration Constants (in ms)
 */
export const ANIMATION_DURATIONS = {
    INSTANT: 0,
    FAST: 150,
    MEDIUM: 300,
    SLOW: 600,
    VERY_SLOW: 1000,
} as const;

/**
 * Theme Colors (HSL format)
 */
export const THEME_COLORS = {
    EMERALD_DEEP: 'hsl(162 76% 15%)',
    EMERALD_LIGHT: 'hsl(158 55% 22%)',
    GOLD_MATTE: 'hsl(40 48% 56%)',
    GOLD_LIGHT: 'hsl(42 63% 66%)',
    CREAM_BG: 'hsl(40 20% 97%)',
    WARM_PAPER: 'hsl(45 35% 92%)',
} as const;

/**
 * Z-Index Layers
 */
export const Z_INDEX = {
    BACKGROUND: 0,
    CONTENT: 10,
    HEADER: 20,
    NAVIGATION: 50,
    DIALOG: 100,
    TOAST: 200,
} as const;

/**
 * Developer Mode
 */
export const DEV_MODE = {
    PASSWORD: 'AllahAkbar@33',
    TAP_COUNT_TRIGGER: 7,
    STORAGE_KEY: 'devMode',
    DATE_STORAGE_KEY: 'devModeDate',
} as const;

/**
 * Local Storage Keys
 */
export const STORAGE_KEYS = {
    DEV_MODE: 'devMode',
    DEV_MODE_DATE: 'devModeDate',
    BATTERY_OPTIMIZATION_REQUESTED: 'hasRequestedBatteryOptimizations',
    FONT_SIZE: 'fontSize',
    LANGUAGE: 'language',
    PRAYER_SETTINGS: 'prayerSettings',
} as const;

/**
 * Prayer Calculation Methods
 */
export const CALCULATION_METHODS = [
    { id: 0, name: "Shia Ithna-Ansari" },
    { id: 1, name: "University of Islamic Sciences, Karachi" },
    { id: 2, name: "Islamic Society of North America (ISNA)" },
    { id: 3, name: "Muslim World League" },
    { id: 4, name: "Umm al-Qura University, Makkah" },
    { id: 5, name: "Egyptian General Authority of Survey" },
    { id: 7, name: "Institute of Geophysics, University of Tehran" },
    { id: 8, name: "Gulf Region" },
    { id: 9, name: "Kuwait" },
    { id: 10, name: "Qatar" },
    { id: 11, name: "Majlis Ugama Islam Singapura, Singapore" },
    { id: 12, name: "Union Organization islamic de France" },
    { id: 13, name: "Diyanet Isleri Baskanligi, Turkey" },
    { id: 14, name: "Spiritual Administration of Muslims of Russia" },
];
