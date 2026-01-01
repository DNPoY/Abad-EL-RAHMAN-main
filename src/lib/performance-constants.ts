/**
 * Performance and reliability constants
 */

// Audio retry configuration
export const AUDIO_RETRY_CONFIG = {
    MAX_ATTEMPTS: 3,
    BASE_DELAY: 1000, // ms
    MAX_DELAY: 5000, // ms
    TIMEOUT: 10000, // 10 seconds per request
} as const;

// Cache configuration
export const CACHE_CONFIG = {
    MAX_SIZE_MB: 500,
    AUDIO_CACHE_NAME: 'ibad-rahman-audio-cache',
    CLEANUP_THRESHOLD_MB: 450, // Start cleanup at 90%
    MAX_AGE_DAYS: 30,
} as const;

// Network configuration
export const NETWORK_CONFIG = {
    OFFLINE_CHECK_INTERVAL: 5000, // Check every 5 seconds
    REQUEST_TIMEOUT: 10000,
    SLOW_NETWORK_THRESHOLD: 3000, // Consider "slow" if takes > 3s
} as const;

// Error messages
export const ERROR_MESSAGES = {
    ar: {
        NETWORK_ERROR: 'لا يوجد اتصال بالإنترنت',
        AUDIO_LOAD_FAILED: 'فشل تحميل الصوت',
        RETRYING: 'جاري إعادة المحاولة...',
        MAX_RETRIES: 'فشل بعد عدة محاولات',
        OFFLINE: 'غير متصل بالإنترنت',
        SLOW_NETWORK: 'الاتصال بطيء، قد يستغرق وقتًا',
        COMPONENT_ERROR: 'حدث خطأ غير متوقع',
        TRY_AGAIN: 'حاول مرة أخرى',
    },
    en: {
        NETWORK_ERROR: 'No internet connection',
        AUDIO_LOAD_FAILED: 'Failed to load audio',
        RETRYING: 'Retrying...',
        MAX_RETRIES: 'Failed after multiple attempts',
        OFFLINE: 'You are offline',
        SLOW_NETWORK: 'Slow connection, this may take a while',
        COMPONENT_ERROR: 'An unexpected error occurred',
        TRY_AGAIN: 'Try Again',
    },
} as const;

// Exponential backoff helper
export const getRetryDelay = (attempt: number): number => {
    const delay = Math.min(
        AUDIO_RETRY_CONFIG.BASE_DELAY * Math.pow(2, attempt),
        AUDIO_RETRY_CONFIG.MAX_DELAY
    );
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 500;
};
