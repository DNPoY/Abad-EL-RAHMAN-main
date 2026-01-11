import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { NotificationSettings } from "@/components/NotificationSettings";
import { AlarmSettings } from "@/components/AlarmSettings";
import { FontSizeSelector } from "@/components/FontSizeSelector";
import { CALCULATION_METHODS } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, MapPin, Globe, Type, BookOpen, RefreshCw } from "lucide-react";
import { usePrayerTimes } from "@/contexts/PrayerTimesContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SettingsPageProps {
    isEmbedded?: boolean;
}

export const SettingsPage = ({ isEmbedded = false }: SettingsPageProps) => {
    const { t, language } = useLanguage();
    const {
        calculationMethod,
        setCalculationMethod,
        madhab,
        setMadhab,
        locationMode,
        setLocationMode,
        manualLatitude,
        manualLongitude,
        setManualLocation,
        fontFamily,
        setFontFamily,
        quranFont,
        setQuranFont,
        readingStyle,
        setReadingStyle
    } = useSettings();

    // Tahqiq System
    const { checkVerification, corrections } = usePrayerTimes();

    const [activeTab, setActiveTab] = useState("general");

    return (
        <div className={`space-y-6 animate-fade-in ${isEmbedded ? '' : 'pb-20'} `}>
            {/* Header - Only show if not embedded */}
            {!isEmbedded && (
                <div className="flex items-center gap-3 mb-6 px-2">
                    <div className="p-3 bg-emerald-deep/5 rounded-full">
                        <Settings className="w-6 h-6 text-emerald-deep" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold font-amiri text-emerald-deep">
                            {language === "ar" ? "الإعدادات" : "Settings"}
                        </h2>
                        <p className="text-sm text-emerald-deep/60">
                            {language === "ar" ? "تخصيص التطبيق حسب رغبتك" : "Customize your app experience"}
                        </p>
                    </div>
                </div>
            )}

            <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-emerald-deep/5 p-1 mb-6 rounded-xl">
                    <TabsTrigger value="general" className="font-amiri data-[state=active]:bg-white data-[state=active]:text-emerald-deep data-[state=active]:shadow-sm text-emerald-deep/60">
                        {language === "ar" ? "عام" : "General"}
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="font-amiri data-[state=active]:bg-white data-[state=active]:text-emerald-deep data-[state=active]:shadow-sm text-emerald-deep/60">
                        {language === "ar" ? "تنبيهات" : "Notif."}
                    </TabsTrigger>
                    <TabsTrigger value="alarms" className="font-amiri data-[state=active]:bg-white data-[state=active]:text-emerald-deep data-[state=active]:shadow-sm text-emerald-deep/60">
                        {language === "ar" ? "منبه" : "Alarm"}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                    {/* Location Settings */}
                    <Card className="p-6 border-emerald-deep/5 bg-white/60 backdrop-blur-sm shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <MapPin className="w-5 h-5 text-emerald-deep" />
                            <h3 className="text-lg font-bold font-amiri text-emerald-deep">
                                {language === "ar" ? "إعدادات الموقع" : "Location Settings"}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-emerald-deep/80 font-amiri">
                                    {language === "ar" ? "طريقة تحديد الموقع" : "Location Mode"}
                                </Label>
                                <Select
                                    value={locationMode}
                                    onValueChange={(val) => setLocationMode(val as "auto" | "manual")}
                                >
                                    <SelectTrigger className="bg-white border-emerald-deep/10 text-emerald-deep">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="auto">
                                            {language === "ar" ? "تلقائي (GPS)" : "Auto (GPS)"}
                                        </SelectItem>
                                        <SelectItem value="manual">
                                            {language === "ar" ? "يدوي" : "Manual"}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {locationMode === "manual" && (
                                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <Label className="text-emerald-deep/80 text-xs">
                                            {language === "ar" ? "خط العرض" : "Latitude"}
                                        </Label>
                                        <Input
                                            type="number"
                                            value={manualLatitude}
                                            onChange={(e) => setManualLocation(parseFloat(e.target.value), manualLongitude)}
                                            step="0.0001"
                                            className="bg-white border-emerald-deep/10 text-emerald-deep"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-emerald-deep/80 text-xs">
                                            {language === "ar" ? "خط الطول" : "Longitude"}
                                        </Label>
                                        <Input
                                            type="number"
                                            value={manualLongitude}
                                            onChange={(e) => setManualLocation(manualLatitude, parseFloat(e.target.value))}
                                            step="0.0001"
                                            className="bg-white border-emerald-deep/10 text-emerald-deep"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Prayer Calculation */}
                    <Card className="p-6 border-emerald-deep/5 bg-white/60 backdrop-blur-sm shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Globe className="w-5 h-5 text-emerald-deep" />
                            <h3 className="text-lg font-bold font-amiri text-emerald-deep">
                                {language === "ar" ? "حساب الصلوات" : "Prayer Calculation"}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-emerald-deep/80 font-amiri">
                                    {language === "ar" ? "طريقة الحساب" : "Calculation Method"}
                                </Label>
                                <Select
                                    value={calculationMethod.toString()}
                                    onValueChange={(val) => setCalculationMethod(parseInt(val))}
                                >
                                    <SelectTrigger className="bg-white border-emerald-deep/10 text-emerald-deep">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CALCULATION_METHODS.map((method) => (
                                            <SelectItem key={method.id} value={method.id.toString()}>
                                                {method.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-emerald-deep/80 font-amiri">
                                    {language === "ar" ? "المذهب (للعصر)" : "Madhab (for Asr)"}
                                </Label>
                                <Select
                                    value={madhab}
                                    onValueChange={(val) => setMadhab(val as "shafi" | "hanafi")}
                                >
                                    <SelectTrigger className="bg-white border-emerald-deep/10 text-emerald-deep">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="shafi">
                                            {language === "ar" ? "شافعي / مالكي / حنبلي (قياسي)" : "Shafi/Maliki/Hanbali (Standard)"}
                                        </SelectItem>
                                        <SelectItem value="hanafi">
                                            {language === "ar" ? "حنفي" : "Hanafi"}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </Card>

                    {/* Prayer Time Verification (Tahqiq) */}
                    <Card className="p-6 border-emerald-deep/5 bg-white/60 backdrop-blur-sm shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-deep/10 rounded-full">
                                <Settings className="w-4 h-4 text-emerald-deep" />
                            </div>
                            <h3 className="text-lg font-bold font-amiri text-emerald-deep">
                                {language === "ar" ? "التحقق الذكي (تحقيق)" : "Smart Verification"}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-emerald-deep/70">
                                {language === "ar"
                                    ? "يقوم التطبيق أسبوعياً بمطابقة الحسابات المحلية مع المصادر العالمية الموثوقة لضمان الدقة."
                                    : "The app weekly cross-checks local calculations with trusted global sources to ensure accuracy."}
                            </p>

                            <div className="flex items-center justify-between p-3 bg-emerald-deep/5 rounded-lg border border-emerald-deep/10">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-emerald-deep">
                                        {language === "ar" ? "حالة المطابقة" : "Sync Status"}
                                    </span>
                                    <span className="text-xs text-emerald-deep/60">
                                        {Object.keys(corrections || {}).length > 0
                                            ? (language === "ar" ? "تم تصحيح بعض الأوقات تلقائياً" : "Corrections applied automatically")
                                            : (language === "ar" ? "الأوقات متطابقة تماماً" : "Times are perfectly synced")
                                        }
                                    </span>
                                </div>
                                <Button
                                    onClick={() => {
                                        checkVerification();
                                        toast.success(language === "ar" ? "تم بدء التحقق..." : "Verification started...");
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 border-emerald-deep/20 text-emerald-deep hover:bg-emerald-deep/10"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    {language === "ar" ? "تحقق الآن" : "Check Now"}
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Quran Settings */}
                    <Card className="p-6 border-emerald-deep/5 bg-white/60 backdrop-blur-sm shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <BookOpen className="w-5 h-5 text-emerald-deep" />
                            <h3 className="text-lg font-bold font-amiri text-emerald-deep">
                                {language === "ar" ? "إعدادات المصحف" : "Quran Settings"}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-emerald-deep/80 font-amiri">
                                    {language === "ar" ? "الرواية" : "Reading Style"}
                                </Label>
                                <Select
                                    value={readingStyle}
                                    onValueChange={(val) => setReadingStyle(val as "hafs" | "warsh")}
                                >
                                    <SelectTrigger className="bg-white border-emerald-deep/10 text-emerald-deep">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hafs">
                                            {language === "ar" ? "حفص عن عاصم (الافتراضي)" : "Hafs an Asim (Default)"}
                                        </SelectItem>
                                        <SelectItem value="warsh">
                                            {language === "ar" ? "ورش عن نافع" : "Warsh an Nafi"}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </Card>

                    {/* Appearance */}
                    <Card className="p-6 border-emerald-deep/5 bg-white/60 backdrop-blur-sm shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Type className="w-5 h-5 text-emerald-deep" />
                            <h3 className="text-lg font-bold font-amiri text-emerald-deep">
                                {language === "ar" ? "المظهر" : "Appearance"}
                            </h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-emerald-deep/80 font-amiri">
                                    {language === "ar" ? "نوع الخط" : "Font Style"}
                                </Label>
                                <Select
                                    value={fontFamily}
                                    onValueChange={(val) => setFontFamily(val as "amiri" | "cairo" | "tajawal")}
                                >
                                    <SelectTrigger className="bg-white border-emerald-deep/10 text-emerald-deep">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="amiri" className="font-amiri">
                                            {language === "ar" ? "أميري (افتراضي)" : "Amiri (Default)"}
                                        </SelectItem>
                                        <SelectItem value="cairo" className="font-cairo">
                                            {language === "ar" ? "القاهرة" : "Cairo"}
                                        </SelectItem>
                                        <SelectItem value="tajawal" className="font-tajawal">
                                            {language === "ar" ? "تجوال" : "Tajawal"}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <FontSizeSelector />
                            </div>
                        </div>
                    </Card>
                    {/* Privacy & About */}
                    <Card className="p-6 border-emerald-deep/5 bg-white/60 backdrop-blur-sm shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-deep/10 rounded-full">
                                <Settings className="w-4 h-4 text-emerald-deep" />
                            </div>
                            <h3 className="text-lg font-bold font-amiri text-emerald-deep">
                                {language === "ar" ? "حول التطبيق" : "About & Privacy"}
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <a
                                href="/privacy-policy.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 rounded-lg bg-white border border-emerald-deep/5 hover:bg-emerald-50 transition-colors"
                            >
                                <span className="font-tajawal text-emerald-deep">
                                    {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
                                </span>
                                <Globe className="w-4 h-4 text-emerald-deep/40" />
                            </a>

                            <a
                                href="mailto:ahmeddnelhariri@gmail.com"
                                className="flex items-center justify-between p-3 rounded-lg bg-white border border-emerald-deep/5 hover:bg-emerald-50 transition-colors"
                            >
                                <span className="font-tajawal text-emerald-deep">
                                    {language === "ar" ? "تواصل معنا (Email)" : "Contact Us (Email)"}
                                </span>
                                <Globe className="w-4 h-4 text-emerald-deep/40" />
                            </a>
                        </div>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                    <NotificationSettings />
                </TabsContent>

                <TabsContent value="alarms" className="space-y-6">
                    <AlarmSettings />
                </TabsContent>
            </Tabs>
        </div>
    );
};
