import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotification } from "@/contexts/NotificationContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Bell, BellOff, Volume2, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";


import { useRef } from "react";

export const NotificationSettings = () => {
  const { settings, updateSettings, requestPermission, hasPermission } = useNotification();
  const { preAzanReminder, setPreAzanReminder, azanVolume, setAzanVolume, smartDnd, setSmartDnd, azanFadeIn, setAzanFadeIn } = useSettings();
  const { t, language } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleToggleNotifications = async () => {
    if (!settings.enabled && !hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        toast.error(
          language === "ar"
            ? "يجب السماح بالتنبيهات أولاً"
            : "Please allow notifications first"
        );
        return;
      }
    }
    updateSettings({ enabled: !settings.enabled });

    toast.success(
      settings.enabled
        ? language === "ar" ? "تم إيقاف التنبيهات" : "Notifications disabled"
        : language === "ar" ? "تم تفعيل التنبيهات" : "Notifications enabled"
    );
  };

  const prayers = [
    { key: "fajr", label: t.fajr },
    { key: "dhuhr", label: t.dhuhr },
    { key: "asr", label: t.asr },
    { key: "maghrib", label: t.maghrib },
    { key: "isha", label: t.isha },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 islamic-pattern">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {settings.enabled ? (
              <Bell className="w-6 h-6 text-primary" />
            ) : (
              <BellOff className="w-6 h-6 text-muted-foreground" />
            )}
            <div>
              <h3 className="text-xl font-bold font-amiri">
                {language === "ar" ? "التنبيهات" : "Notifications"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === "ar"
                  ? "تفعيل الأذان والتنبيهات للصلوات"
                  : "Enable Azan and prayer notifications"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3" dir="ltr">
            <span className={cn("text-xs font-medium transition-colors", !settings.enabled ? "text-[#FFD700] font-bold" : "text-muted-foreground")}>
              {language === "ar" ? "إيقاف" : "Off"}
            </span>
            <Switch
              checked={settings.enabled}
              onCheckedChange={handleToggleNotifications}
              className={cn(settings.enabled ? "data-[state=checked]:bg-[#FFD700]" : "bg-input")}
            />
            <span className={cn("text-xs font-medium transition-colors", settings.enabled ? "text-[#FFD700] font-bold" : "text-muted-foreground")}>
              {language === "ar" ? "تفعيل" : "On"}
            </span>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Adhan Sound Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary" />
            <Label className="font-amiri font-semibold">
              {language === "ar" ? "صوت الأذان" : "Adhan Sound"}
            </Label>
          </div>

          <div className="flex gap-2">
            <Select
              value={settings.adhanSound}
              onValueChange={(value) => updateSettings({ adhanSound: value as "makkah" | "madinah" | "egypt" })}
              disabled={!settings.enabled}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="makkah">
                  {language === "ar" ? "أذان مكة المكرمة" : "Makkah Adhan"}
                </SelectItem>
                <SelectItem value="madinah">
                  {language === "ar" ? "أذان المدينة المنورة" : "Madinah Adhan"}
                </SelectItem>
                <SelectItem value="egypt">
                  {language === "ar" ? "أذان مصر" : "Egypt Adhan"}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (audioRef.current && !audioRef.current.paused) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                  // Force re-render to update icon
                  const btn = document.getElementById('adhan-preview-btn');
                  if (btn) btn.setAttribute('data-playing', 'false');
                  return;
                }

                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                }

                const audio = new Audio();
                audioRef.current = audio;

                const adhanSounds = {
                  makkah: "/sounds/adhan_makkah.mp3",
                  madinah: "/sounds/adhan_madinah.mp3",
                  egypt: "/sounds/adhan_egypt.mp3",
                };
                audio.src = adhanSounds[settings.adhanSound];
                audio.volume = azanVolume / 100;

                audio.onended = () => {
                  const btn = document.getElementById('adhan-preview-btn');
                  if (btn) btn.setAttribute('data-playing', 'false');
                };

                audio.play().catch(e => toast.error("Error playing sound"));
                const btn = document.getElementById('adhan-preview-btn');
                if (btn) btn.setAttribute('data-playing', 'true');
              }}
              disabled={!settings.enabled}
              id="adhan-preview-btn"
              data-playing="false"
            >
              <style>
                {`
                  #adhan-preview-btn[data-playing="true"] .play-icon { display: none; }
                  #adhan-preview-btn[data-playing="true"] .stop-icon { display: block; }
                  #adhan-preview-btn[data-playing="false"] .play-icon { display: block; }
                  #adhan-preview-btn[data-playing="false"] .stop-icon { display: none; }
                `}
              </style>
              <Volume2 className="w-4 h-4 play-icon" />
              <div className="w-3 h-3 bg-primary rounded-sm stop-icon hidden" />
            </Button>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {azanVolume === 0 ? <Volume2 className="w-5 h-5 text-muted-foreground" /> : <Volume2 className="w-5 h-5 text-primary" />}
              <Label className="font-amiri font-semibold">
                {language === "ar" ? "مستوى صوت الأذان" : "Adhan Volume"}
              </Label>
            </div>
            <span className="text-sm font-medium text-emerald-deep">{azanVolume}%</span>
          </div>
          <Slider
            defaultValue={[azanVolume]}
            value={[azanVolume]}
            max={100}
            step={1}
            onValueChange={(val) => setAzanVolume(val[0])}
            disabled={!settings.enabled}
            className="w-full"
          />

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="smart-dnd" className="font-amiri cursor-pointer">
                {language === "ar" ? "مراعاة وضع الصامت" : "Respect Silent/DND Mode"}
              </Label>
              <p className="text-xs text-muted-foreground">
                {language === "ar" ? "لا يتم تشغيل الأذان إذا كان الهاتف صامتاً" : "Don't play sound if phone is silent"}
              </p>
            </div>
            <Switch
              id="smart-dnd"
              checked={smartDnd}
              onCheckedChange={setSmartDnd}
              disabled={!settings.enabled}
              className={cn(smartDnd ? "data-[state=checked]:bg-[#FFD700]" : "bg-input")}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="azan-fade-in" className="font-amiri cursor-pointer">
                {language === "ar" ? "تدرج الصوت (تصاعدي)" : "Fade-In Audio"}
              </Label>
              <p className="text-xs text-muted-foreground">
                {language === "ar" ? "بدء الصوت منخفضاً ثم يرتفع تدريجياً" : "Start volume low and gradually increase"}
              </p>
            </div>
            <Switch
              id="azan-fade-in"
              checked={azanFadeIn}
              onCheckedChange={setAzanFadeIn}
              disabled={!settings.enabled}
              className={cn(azanFadeIn ? "data-[state=checked]:bg-[#FFD700]" : "bg-input")}
            />
          </div>
        </div>

        <Separator className="my-4" />

        {/* Reminder Time */}
        <div className="space-y-4">
          <Label className="font-amiri font-semibold">
            {language === "ar" ? "التنبيه قبل الأذان" : "Reminder Before Adhan"}
          </Label>
          <Select
            value={settings.reminderMinutes.toString()}
            onValueChange={(value) => updateSettings({ reminderMinutes: parseInt(value) })}
            disabled={!settings.enabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">
                {language === "ar" ? "لا تنبيه" : "No Reminder"}
              </SelectItem>
              <SelectItem value="5">
                {language === "ar" ? "5 دقائق" : "5 minutes"}
              </SelectItem>
              <SelectItem value="10">
                {language === "ar" ? "10 دقائق" : "10 minutes"}
              </SelectItem>
              <SelectItem value="15">
                {language === "ar" ? "15 دقيقة" : "15 minutes"}
              </SelectItem>
              <SelectItem value="30">
                {language === "ar" ? "30 دقيقة" : "30 minutes"}
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label htmlFor="pre-azan-reminder" className="font-amiri cursor-pointer">
                {language === "ar" ? "تنبيه قبل 9 دقائق (إضافي)" : "Notify 9 mins before Azan"}
              </Label>
              <p className="text-xs text-muted-foreground">
                {language === "ar" ? "تنبيه خاص قبل الأذان بـ 9 دقائق" : "Special notification exactly 9 minutes before Azan"}
              </p>
            </div>
            <Switch
              id="pre-azan-reminder"
              checked={preAzanReminder}
              onCheckedChange={setPreAzanReminder}
              disabled={!settings.enabled}
              className={cn(preAzanReminder ? "data-[state=checked]:bg-[#FFD700]" : "bg-input")}
            />
          </div>
        </div>

        <Separator className="my-4" />

        {/* Individual Prayer Toggles */}
        <div className="space-y-3">
          <Label className="font-amiri font-semibold">
            {language === "ar" ? "تفعيل التنبيهات للصلوات" : "Enable Notifications for Prayers"}
          </Label>
          {prayers.map((prayer) => (
            <div key={prayer.key} className="flex items-center justify-between py-2">
              <Label htmlFor={prayer.key} className="font-amiri cursor-pointer">
                {prayer.label}
              </Label>
              <Switch
                id={prayer.key}
                checked={settings.enabledPrayers[prayer.key as keyof typeof settings.enabledPrayers]}
                onCheckedChange={(checked) =>
                  updateSettings({
                    enabledPrayers: {
                      ...settings.enabledPrayers,
                      [prayer.key]: checked,
                    },
                  })
                }
                disabled={!settings.enabled}
                className={cn(settings.enabledPrayers[prayer.key as keyof typeof settings.enabledPrayers] ? "data-[state=checked]:bg-[#FFD700]" : "bg-input")}
              />
            </div>
          ))}
        </div>

        {
          !hasPermission && (
            <Button
              onClick={requestPermission}
              className="w-full mt-6"
              variant="outline"
            >
              <Bell className="w-4 h-4 mr-2" />
              {language === "ar" ? "طلب إذن التنبيهات" : "Request Notification Permission"}
            </Button>
          )
        }
      </Card >

      {/* Test Button */}
      {
        settings.enabled && (
          <div className="space-y-3">
            <Button
              onClick={async () => {
                try {
                  // For native platforms, use Capacitor
                  // For native platforms, use WidgetBridge to test the REAL Azan
                  if (Capacitor.isNativePlatform()) {
                    const { default: WidgetBridge } = await import("@/lib/widget-bridge");
                    const now = new Date();
                    const testTime = new Date(now.getTime() + 2000); // 2 seconds from now

                    await WidgetBridge.scheduleAdhan({
                      prayerName: "Test_" + now.getTime(),
                      timestamp: testTime.getTime(),
                      soundName: settings.adhanSound === "makkah" ? "adhan_makkah" : settings.adhanSound === "madinah" ? "adhan_madinah" : "adhan_egypt",
                    });

                    toast.success(language === "ar" ? "سيتم تشغيل الأذان خلال ثانتين..." : "Azan will play in 2 seconds...");
                  } else {
                    // Web Fallback
                    if ("Notification" in window && Notification.permission === "granted") {
                      new Notification("Test Azan", { body: "Azan Sound Test (Web)", icon: "/favicon.ico" });
                    }
                  }
                } catch (error) {
                  console.error("Error sending test notification:", error);
                  toast.error(language === "ar" ? "خطأ في إرسال التنبيه" : "Error sending notification");
                }
              }}
              className="w-full"
              variant="secondary"
            >
              {language === "ar" ? "تجربة التنبيه" : "Test Notification"}
            </Button>

            <Button
              onClick={async () => {
                try {
                  if (Capacitor.isNativePlatform()) {
                    const { default: WidgetBridge } = await import("@/lib/widget-bridge");
                    const now = new Date();
                    const testTime = new Date(now.getTime() + 15000); // 15 seconds from now

                    await WidgetBridge.scheduleAdhan({
                      prayerName: "Test_" + now.getTime(),
                      timestamp: testTime.getTime(),
                      soundName: settings.adhanSound === "makkah" ? "adhan_makkah" : settings.adhanSound === "madinah" ? "adhan_madinah" : "adhan_egypt",
                    });

                    toast.success(
                      language === "ar"
                        ? "سيتم تفعيل الأذان بعد 15 ثانية. يرجى إغلاق التطبيق للتجربة."
                        : "Adhan scheduled in 15s. Please close the app to test background."
                    );
                  } else {
                    toast.info(language === "ar" ? "هذه الخاصية متاحة فقط على الهاتف" : "This feature is only available on mobile");
                  }
                } catch (e) {
                  console.error("Error scheduling test adhan", e);
                  toast.error(language === "ar" ? "حدث خطأ في الجدول" : "Error scheduling test");
                }
              }}
              className="w-full"
              variant="default"
            >
              {language === "ar" ? "تجربة الأذان الخلفي (بعد 15 ثانية)" : "Test Background Azan (in 15s)"}
            </Button>

            <Button
              variant="outline"
              className="w-full text-muted-foreground"
              onClick={() => {
                toast.info(
                  language === "ar"
                    ? "إذا لم تصلك التنبيهات، تأكد من إيقاف 'تحسين البطارية' لهذا التطبيق من إعدادات هاتفك."
                    : "If notifications don't appear, disable 'Battery Optimization' for this app in your phone settings.",
                  { duration: 5000 }
                );
              }}
            >
              <Info className="w-4 h-4 mr-2" />
              {language === "ar" ? "مشكلة في التنبيهات؟" : "Trouble with notifications?"}
            </Button>
          </div>
        )
      }

      {/* Battery Optimization Section */}
      <Card className="p-6 islamic-pattern border-yellow-500/20 bg-yellow-500/5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-600 mt-1" />
          <div className="space-y-2">
            <h3 className="font-bold font-amiri text-yellow-700">
              {language === "ar" ? "تحسين البطارية" : "Battery Optimization"}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {language === "ar"
                ? "قد يقوم النظام بإيقاف التنبيهات لتوفير البطارية. لضمان عمل الأذان، يرجى استثناء التطبيق من تحسين البطارية."
                : "The system might stop notifications to save battery. To ensure Adhan works, please exclude the app from battery optimization."}
            </p>
            <Button
              variant="outline"
              className="mt-2 border-yellow-600/20 hover:bg-yellow-600/10 text-yellow-700"
              onClick={async () => {
                try {
                  if (Capacitor.isNativePlatform()) {
                    // Import dynamically to avoid circular dependency issues if any, though here it's fine
                    const { default: WidgetBridge } = await import("@/lib/widget-bridge");
                    await WidgetBridge.openBatterySettings();
                  } else {
                    toast.info(language === "ar" ? "هذه الخاصية متاحة فقط على الهاتف" : "This feature is only available on mobile");
                  }
                } catch (e) {
                  console.error("Error opening battery settings", e);
                  toast.error(language === "ar" ? "لا يمكن فتح الإعدادات" : "Could not open settings");
                }
              }}
            >
              {language === "ar" ? "فتح إعدادات البطارية" : "Open Battery Settings"}
            </Button>
          </div>
        </div>
      </Card>
    </div >
  );
};
