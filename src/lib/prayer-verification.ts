import { CorrectionMap } from "@/contexts/PrayerTimesContext";
import { RemoteConfigService } from "@/lib/remote-config";

interface VerificationOptions {
    latitude: number;
    longitude: number;
    method: number;
    madhab: number; // 1 = Hanfi, 0 = Shafi
    force?: boolean;
}

interface ApiTimings {
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
}

export const PrayerVerificationService = {
    shouldVerify: (): boolean => {
        const lastCheck = localStorage.getItem("lastPrayerVerification");
        if (!lastCheck) return true;

        const diff = Date.now() - parseInt(lastCheck);
        // Verify once every 7 days (604800000 ms)
        return diff > 604800000;
    },

    verify: async (
        options: VerificationOptions,
        localTimes: { [key: string]: string }
    ): Promise<CorrectionMap | null> => {
        try {
            console.log("[Tahqiq] Starting verification...", options);

            // 1. Construct API URL
            // timestamp is required. we use current time.
            const date = Math.floor(Date.now() / 1000);
            // Aladhan API params: method, adjustment (we ignore adjustment for raw check), school (0=Shafi, 1=Hanafi)
            // Note: Aladhan 'school' param: 0 for Shafi, 1 for Hanafi.
            // Our internal madhab might be different, let's ensure mapping is correct.
            // In Adhan.js/Context: Madhab.Shafi = 1, Madhab.Hanafi = 2 (Verify this logic from adhan source if possible, but usually 1/2)
            // Let's rely on standard Aladhan params.
            const school = options.madhab === 2 ? 1 : 0; // Assuming 2 is Hanafi in app preferences

            // Dynamically get API URL from Remote Config (Kill Switch)
            const API_BASE_URL = RemoteConfigService.getApiUrl();
            const url = `${API_BASE_URL}/${date}?latitude=${options.latitude}&longitude=${options.longitude}&method=${options.method}&school=${school}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error("API request failed");

            const data = await response.json();
            const apiTimings: ApiTimings = data.data.timings;

            // 2. Compare and Calculate Offsets
            const corrections: CorrectionMap = {};
            let hasVariance = false;

            // Map our keys to API keys
            const mapKeys = {
                fajr: "Fajr",
                dhuhr: "Dhuhr",
                asr: "Asr",
                maghrib: "Maghrib",
                isha: "Isha"
            };

            const parseTime = (timeStr: string) => {
                const [h, m] = timeStr.split(":").map(Number);
                return h * 60 + m;
            };

            for (const [localKey, apiKey] of Object.entries(mapKeys)) {
                // Local time might be "04:30", API "04:32"
                // Clean API time (remove (EEST) etc)
                const cleanApiTime = apiTimings[apiKey as keyof ApiTimings].split(" ")[0];

                const localMinutes = parseTime(localTimes[localKey]);
                const apiMinutes = parseTime(cleanApiTime);

                const diff = apiMinutes - localMinutes;

                // We only care if diff is significant (e.g. != 0)
                // Limit extreme diffs (e.g. timezone issues) to +/- 30 mins to be safe
                if (diff !== 0 && Math.abs(diff) < 60) {
                    corrections[localKey] = diff;
                    hasVariance = true;
                }
            }

            // 3. Save Results
            localStorage.setItem("lastPrayerVerification", Date.now().toString());

            if (hasVariance) {
                console.log("[Tahqiq] Variance found:", corrections);
                localStorage.setItem("prayerCorrections", JSON.stringify(corrections));
                return corrections;
            } else {
                console.log("[Tahqiq] Times match. No correction needed.");
                // Clear old corrections if they are now accurate
                localStorage.removeItem("prayerCorrections");
                return {};
            }

        } catch (error) {
            console.error("[Tahqiq] Verification failed:", error);
            return null;
        }
    }
};
