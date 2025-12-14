import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Battery, Zap, CheckCircle2 } from "lucide-react";
import WidgetBridge from "@/lib/widget-bridge";
import { Capacitor } from "@capacitor/core";

import { LocalNotifications } from '@capacitor/local-notifications';

export const PermissionsPrompt = () => {
    const { language } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);

    useEffect(() => {
        // Only show on Android native platform
        if (!Capacitor.isNativePlatform()) return;

        const hasSeenPrompt = localStorage.getItem("hasSeenPermissionsPrompt");
        if (!hasSeenPrompt) {
            // Small delay to not overwhelm user immediately on launch
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleOpenBattery = () => {
        WidgetBridge.openBatterySettings().catch(console.error);
    };

    const handleClose = async () => {
        setIsOpen(false);
        localStorage.setItem("hasSeenPermissionsPrompt", "true");
        // Request System Notification Permissions after educating the user
        await LocalNotifications.requestPermissions();
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md bg-[#094231] border-white/20 text-white">
                <DialogHeader>
                    <DialogTitle className="text-center font-amiri text-2xl text-[#FFD700] mb-2">
                        {language === "ar" ? "إعدادات مهمة للأذان" : "Important Adhan Settings"}
                    </DialogTitle>
                    <DialogDescription className="text-center text-white/80 font-amiri text-lg">
                        {language === "ar"
                            ? "لضمان عمل الأذان في وقته، يرجى ضبط الإعدادات التالية:"
                            : "To ensure Adhan plays on time, please adjust these settings:"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Battery Optimization */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-start gap-4">
                        <div className="bg-[#FFD700]/20 p-2 rounded-full">
                            <Battery className="w-6 h-6 text-[#FFD700]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#FFD700] mb-1">
                                {language === "ar" ? "تحسين البطارية" : "Battery Optimization"}
                            </h3>
                            <p className="text-sm text-white/80 leading-relaxed">
                                {language === "ar"
                                    ? "يرجى استثناء التطبيق من تحسين البطارية لكي لا يتوقف الأذان."
                                    : "Please exclude the app from battery optimization so Adhan doesn't stop."}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleOpenBattery}
                                className="mt-3 border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#094231]"
                            >
                                {language === "ar" ? "فتح الإعدادات" : "Open Settings"}
                            </Button>
                        </div>
                    </div>

                    {/* Auto Start */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-start gap-4">
                        <div className="bg-[#FFD700]/20 p-2 rounded-full">
                            <Zap className="w-6 h-6 text-[#FFD700]" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#FFD700] mb-1">
                                {language === "ar" ? "التشغيل التلقائي" : "Auto-Start"}
                            </h3>
                            <p className="text-sm text-white/80 leading-relaxed">
                                {language === "ar"
                                    ? "إذا كان هاتفك (شاومي، هواوي، سامسونج)، يرجى تفعيل التشغيل التلقائي."
                                    : "If you have (Xiaomi, Huawei, Samsung), please enable Auto-Start."}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button
                        onClick={handleClose}
                        className="w-full bg-white text-[#094231] hover:bg-white/90 font-bold"
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {language === "ar" ? "تم، فهمت ذلك" : "Done, I understand"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
