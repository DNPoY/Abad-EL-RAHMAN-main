import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { useLanguage } from "@/contexts/LanguageContext";
import { RemoteConfigService } from "@/lib/remote-config";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

// Get current version from package.json (Vite can inject this via define)
const APP_VERSION = "1.0.14"; // Hardcoded for now, ideally use import.meta.env.VITE_APP_VERSION

/**
 * Compares two semver strings. Returns true if current < required.
 */
const isVersionOutdated = (current: string, required: string): boolean => {
    const curr = current.split(".").map(Number);
    const req = required.split(".").map(Number);

    for (let i = 0; i < Math.max(curr.length, req.length); i++) {
        const c = curr[i] || 0;
        const r = req[i] || 0;
        if (c < r) return true;
        if (c > r) return false;
    }
    return false;
};

export const ForceUpdateDialog = () => {
    const { language } = useLanguage();
    const [showDialog, setShowDialog] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const checkVersion = async () => {
            // Only applicable on native
            if (!Capacitor.isNativePlatform()) return;

            const minVersion = RemoteConfigService.getMinVersion();
            const isOutdated = isVersionOutdated(APP_VERSION, minVersion);

            // Debug logging
            console.log(`[ForceUpdate] App Version: ${APP_VERSION}`);
            console.log(`[ForceUpdate] Min Required: ${minVersion}`);
            console.log(`[ForceUpdate] Is Outdated: ${isOutdated}`);

            if (isOutdated) {
                setMessage(RemoteConfigService.getForceUpdateMessage(language));
                setShowDialog(true);
            }
        };

        // Give Remote Config a moment to fetch
        const timer = setTimeout(checkVersion, 3000);
        return () => clearTimeout(timer);
    }, [language]);

    const handleUpdate = () => {
        // Open Play Store link
        window.open("https://play.google.com/store/apps/details?id=com.ibadalrahman.app", "_blank");
    };

    if (!showDialog) return null;

    return (
        <AlertDialog open={showDialog}>
            <AlertDialogContent className="bg-white border-emerald-deep/20 max-w-sm">
                <AlertDialogHeader>
                    {/* Secret: Tap title 7 times to skip */}
                    <AlertDialogTitle
                        className="text-emerald-deep font-amiri text-xl text-center cursor-default select-none"
                        onClick={() => {
                            const count = parseInt(localStorage.getItem("skipUpdateCount") || "0") + 1;
                            if (count >= 7) {
                                localStorage.removeItem("skipUpdateCount");
                                setShowDialog(false);
                            } else {
                                localStorage.setItem("skipUpdateCount", count.toString());
                            }
                        }}
                    >
                        {language === "ar" ? "⬆️ تحديث مطلوب" : "⬆️ Update Required"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center text-emerald-deep/80">
                        {message}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="justify-center">
                    <Button onClick={handleUpdate} className="bg-emerald-deep hover:bg-emerald-deep/90 text-white w-full gap-2">
                        {language === "ar" ? "تحديث الآن" : "Update Now"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
