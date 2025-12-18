import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAlarm, type AlarmChallengeType } from "@/contexts/AlarmContext";
import { AlarmClock, Bell, BellOff, Music } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";

export const AlarmSettings = () => {
    const { t, language } = useLanguage();
    const { alarmTime, setAlarmTime, isAlarmActive, challengeType, setChallengeType, alarmSound, setAlarmSound } = useAlarm();
    const [timeInput, setTimeInput] = useState(alarmTime || "04:30");
    const [customRingtoneTitle, setCustomRingtoneTitle] = useState<string | null>(null);

    // Load custom ringtone title on mount
    useEffect(() => {
        const loadCustomRingtone = async () => {
            if (Capacitor.isNativePlatform()) {
                try {
                    const { default: WidgetBridge } = await import("@/lib/widget-bridge");
                    const result = await WidgetBridge.getCustomRingtone();
                    if (result.title) {
                        setCustomRingtoneTitle(result.title);
                    }
                } catch (e) {
                    console.error("Error loading custom ringtone", e);
                }
            }
        };
        loadCustomRingtone();
    }, []);

    const handlePickRingtone = async () => {
        if (!Capacitor.isNativePlatform()) {
            toast.error(language === "ar" ? "متاح فقط على الهاتف" : "Only available on mobile");
            return;
        }
        try {
            const { default: WidgetBridge } = await import("@/lib/widget-bridge");
            const result = await WidgetBridge.pickRingtone();
            setCustomRingtoneTitle(result.title);
            setAlarmSound("custom");
            toast.success(language === "ar" ? `تم اختيار: ${result.title}` : `Selected: ${result.title}`);
        } catch (e) {
            console.error("Ringtone picker error", e);
        }
    };

    const handleSetAlarm = () => {
        setAlarmTime(timeInput);
        toast.success(
            language === "ar"
                ? `تم ضبط المنبه على ${timeInput}`
                : `Alarm set for ${timeInput}`
        );
    };

    const handleDisableAlarm = () => {
        setAlarmTime("");
        toast.info(
            language === "ar"
                ? "تم إيقاف المنبه"
                : "Alarm disabled"
        );
    };

    return (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <AlarmClock className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold font-amiri">{t.alarm}</h3>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                        {isAlarmActive ? (
                            <Bell className="w-6 h-6 text-[#FFD700] animate-pulse" />
                        ) : (
                            <BellOff className="w-6 h-6 text-muted-foreground" />
                        )}
                        <div>
                            <p className="font-amiri font-semibold">
                                {isAlarmActive ? t.alarmEnabled : t.alarmDisabled}
                            </p>
                            {isAlarmActive && (
                                <p className="text-sm text-muted-foreground" dir="ltr">
                                    {alarmTime}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="alarm-time" className="font-amiri">
                        {t.alarmTime}
                    </Label>
                    <Input
                        id="alarm-time"
                        type="time"
                        value={timeInput}
                        onChange={(e) => setTimeInput(e.target.value)}
                        className="text-lg"
                        dir="ltr"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="font-amiri">{language === "ar" ? "نغمة المنبه" : "Alarm Sound"}</Label>
                    <Select
                        value={alarmSound}
                        onValueChange={setAlarmSound}
                        disabled={isAlarmActive}
                    >
                        <SelectTrigger className="w-full text-right" dir={language === "ar" ? "rtl" : "ltr"}>
                            <SelectValue placeholder={language === "ar" ? "نغمة المنبه" : "Alarm Sound"} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default" className="font-amiri">
                                {language === "ar" ? "نغمة الهاتف الافتراضية" : "System Default"}
                            </SelectItem>
                            <SelectItem value="makkah" className="font-amiri text-[#FFD700]">
                                {language === "ar" ? "أذان مكة" : "Makkah Adhan"}
                            </SelectItem>
                            <SelectItem value="madinah" className="font-amiri text-[#FFD700]">
                                {language === "ar" ? "أذان المدينة" : "Madinah Adhan"}
                            </SelectItem>
                            <SelectItem value="egypt" className="font-amiri text-[#FFD700]">
                                {language === "ar" ? "أذان مصر" : "Egypt Adhan"}
                            </SelectItem>
                            {customRingtoneTitle && (
                                <SelectItem value="custom" className="font-amiri text-emerald-600">
                                    📱 {customRingtoneTitle}
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePickRingtone}
                        disabled={isAlarmActive}
                        className="w-full mt-2 font-amiri"
                    >
                        <Music className="w-4 h-4 mr-2" />
                        {language === "ar" ? "اختر نغمة من هاتفك" : "Pick Ringtone from Phone"}
                    </Button>
                </div>

                <div className="space-y-2">
                    <Label className="font-amiri">{t.alarmType}</Label>
                    <RadioGroup
                        value={challengeType}
                        onValueChange={(value) => setChallengeType(value as AlarmChallengeType)}
                        className="space-y-2"
                    >
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="normal" id="normal" className="data-[state=checked]:border-[#FFD700] data-[state=checked]:text-[#FFD700] border-muted-foreground" />
                            <Label htmlFor="normal" className="font-amiri cursor-pointer">
                                {t.normalAlarm}
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="number" id="number" className="data-[state=checked]:border-[#FFD700] data-[state=checked]:text-[#FFD700] border-muted-foreground" />
                            <Label htmlFor="number" className="font-amiri cursor-pointer">
                                {t.numberChallenge}
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value="math" id="math" className="data-[state=checked]:border-[#FFD700] data-[state=checked]:text-[#FFD700] border-muted-foreground" />
                            <Label htmlFor="math" className="font-amiri cursor-pointer">
                                {t.mathChallenge}
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="text-sm text-muted-foreground p-3 bg-primary/5 rounded-lg">
                    <p className="font-amiri">
                        {challengeType === "normal"
                            ? (language === "ar"
                                ? "⏰ منبه عادي - اضغط إيقاف لإطفاء المنبه"
                                : "⏰ Normal alarm - just press stop to turn off")
                            : challengeType === "number"
                                ? (language === "ar"
                                    ? "🔢 اكتب رقم عشوائي لإيقاف المنبه - يضمن تركيزك!"
                                    : "🔢 Type a random number to stop - keeps you focused!")
                                : (language === "ar"
                                    ? "🧮 حل معادلة حسابية لإيقاف المنبه - يضمن استيقاظك التام!"
                                    : "🧮 Solve a math problem to stop - ensures you're fully awake!")}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={handleSetAlarm}
                        className="flex-1 font-amiri bg-[#FFD700] text-[#094231] hover:bg-[#FFD700]/90"
                        variant="default"
                    >
                        <AlarmClock className="w-4 h-4 mr-2" />
                        {t.setAlarm}
                    </Button>

                    {isAlarmActive && (
                        <Button
                            onClick={handleDisableAlarm}
                            className="flex-1 font-amiri"
                            variant="outline"
                        >
                            <BellOff className="w-4 h-4 mr-2" />
                            {language === "ar" ? "إيقاف" : "Disable"}
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};
