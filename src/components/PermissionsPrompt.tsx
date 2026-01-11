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
import { Battery, Zap, CheckCircle2, Bell } from "lucide-react";
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
            <DialogContent className="sm:max-w-md bg-cream border-emerald-deep/20 shadow-2xl">
                <DialogHeader>
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-deep to-emerald-800 flex items-center justify-center shadow-lg shadow-emerald-deep/30">
                            <Bell className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <DialogTitle className="text-center font-amiri text-2xl text-emerald-deep mb-2">
                        {language === "ar" ? "إعدادات مهمة للأذان" : "Important Adhan Settings"}
                    </DialogTitle>
                    <DialogDescription className="text-center text-emerald-deep/70 font-tajawal">
                        {language === "ar"
                            ? "لضمان عمل الأذان في وقته، يرجى ضبط الإعدادات التالية:"
                            : "To ensure Adhan plays on time, please adjust these settings:"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Battery Optimization */}
                    <div className="bg-white p-4 rounded-2xl border border-emerald-deep/10 shadow-sm flex items-start gap-4">
                        <div className="bg-gold-matte/20 p-3 rounded-xl">
                            <Battery className="w-6 h-6 text-gold-matte" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-emerald-deep font-amiri mb-1">
                                {language === "ar" ? "تحسين البطارية" : "Battery Optimization"}
                            </h3>
                            <p className="text-sm text-emerald-deep/70 leading-relaxed">
                                {language === "ar"
                                    ? "يرجى استثناء التطبيق من تحسين البطارية لكي لا يتوقف الأذان."
                                    : "Please exclude the app from battery optimization so Adhan doesn't stop."}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleOpenBattery}
                                className="mt-3 border-gold-matte text-gold-matte hover:bg-gold-matte hover:text-white font-medium"
                            >
                                {language === "ar" ? "فتح الإعدادات" : "Open Settings"}
                            </Button>
                        </div>
                    </div>

                    {/* Auto Start */}
                    <div className="bg-white p-4 rounded-2xl border border-emerald-deep/10 shadow-sm flex items-start gap-4">
                        <div className="bg-emerald-deep/10 p-3 rounded-xl">
                            <Zap className="w-6 h-6 text-emerald-deep" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-emerald-deep font-amiri mb-1">
                                {language === "ar" ? "التشغيل التلقائي" : "Auto-Start"}
                            </h3>
                            <p className="text-sm text-emerald-deep/70 leading-relaxed">
                                {language === "ar"
                                    ? "إذا كان هاتفك (شاومي، هواوي، سامسونج)، يرجى تفعيل التشغيل التلقائي من إعدادات الهاتف."
                                    : "If you have (Xiaomi, Huawei, Samsung), please enable Auto-Start from phone settings."}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button
                        onClick={handleClose}
                        className="w-full bg-gradient-to-r from-emerald-deep to-emerald-800 hover:opacity-90 text-white font-bold py-5 rounded-xl shadow-lg shadow-emerald-deep/30"
                    >
                        <CheckCircle2 className="w-5 h-5 me-2" />
                        {language === "ar" ? "تم، فهمت ذلك" : "Done, I understand"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
