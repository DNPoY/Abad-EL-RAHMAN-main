import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useNotification } from "@/contexts/NotificationContext";
import { Terminal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { specialDuas, simpleDuas } from "@/lib/developer-data";

export const DeveloperPanel = () => {
    const { language, t } = useLanguage();
    const settings = useSettings(); // Get settings
    const { settings: notifSettings } = useNotification(); // Get notification settings

    const handleClearStorage = () => {
        if (confirm("Are you sure you want to clear ALL local storage? This will reset the app completely.")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleDisableDevMode = () => {
        localStorage.removeItem("devMode");
        toast.success("Developer mode disabled. Reloading...");
        setTimeout(() => window.location.reload(), 1000);
    };

    return (
        <div className="space-y-6 p-4 animate-fade-in pb-24">
            {/* ... (Header remains same) ... */}
            <div className="flex items-center gap-3 mb-6 text-[#FFD700]">
                <Terminal className="w-8 h-8" />
                <h2 className="text-2xl font-bold font-amiri">
                    عبد الرحمن
                </h2>
            </div>

            <Card className="p-6 bg-primary/20 border-primary/30 backdrop-blur-sm mb-6">
                <p className="text-2xl md:text-3xl font-bold text-center text-[#FFD700] font-amiri leading-loose">
                    تذكر فضل و رحمة الله عليك يا احمد
                </p>
            </Card>

            <Card className="p-6 bg-black/20 border-white/10 backdrop-blur-sm">
                <h3 className="text-lg font-bold mb-4 text-white">Debug Controls</h3>

                <div className="space-y-4">
                    <Button
                        onClick={async () => {
                            try {
                                toast.info("Running Scheduler Logic...");
                                const { PrayerScheduleService } = await import("@/lib/prayer-schedule-service");

                                const result = await PrayerScheduleService.scheduleAlarms({
                                    manualLatitude: settings.manualLatitude,
                                    manualLongitude: settings.manualLongitude,
                                    calculationMethod: settings.calculationMethod,
                                    madhab: settings.madhab,
                                    locationMode: settings.locationMode,
                                    notifSettings: notifSettings,
                                    preAzanReminder: settings.preAzanReminder,
                                    t: t,
                                    language: language as "ar" | "en"
                                });

                                console.log("Scheduler Result:", result);

                                // Show blocking alert with full details
                                alert(`Scheduler Result:\n\nSuccess: ${result.success}\nCount: ${result.count}\nReason/Error: ${result.reason || result.error || 'None'}`);

                            } catch (e) {
                                console.error(e);
                                alert(`Scheduler Crashed:\n${e.message}`);
                            }
                        }}
                        className="w-full justify-start text-white bg-green-600/50 hover:bg-green-600/70"
                    >
                        Run Scheduler & Show Result (No Reload)
                    </Button>

                    <Button
                        onClick={async () => {
                            try {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                if ((window as any).Capacitor?.isNativePlatform()) {
                                    const { default: WidgetBridge } = await import("@/lib/widget-bridge");
                                    const now = new Date();
                                    await WidgetBridge.scheduleAdhan({
                                        prayerName: "DEBUG_IMMEDIATE_" + now.getTime(),
                                        timestamp: now.getTime() + 5000,
                                        soundName: "adhan_makkah"
                                    });
                                    toast.success("Scheduled immediate test for 5s from now");
                                } else {
                                    toast.error("Not on native platform");
                                }
                            } catch (e) {
                                console.error(e);
                                toast.error("Failed to schedule");
                            }
                        }}
                        className="w-full justify-start text-white bg-blue-600/50 hover:bg-blue-600/70"
                    >
                        Force Test Immediate Azan (5s)
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full justify-start text-white border-white/20 hover:bg-white/10"
                        onClick={async () => {
                            try {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                if ((window as any).Capacitor?.isNativePlatform()) {
                                    const { default: WidgetBridge } = await import("@/lib/widget-bridge");
                                    const result = await WidgetBridge.getPendingAlarms();
                                    const logDiv = document.getElementById('dev-debug-log');
                                    if (logDiv) {
                                        if (result.alarms.length === 0) {
                                            logDiv.innerHTML = "No pending alarms found.";
                                        } else {
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            logDiv.innerHTML = result.alarms.map((a: any) =>
                                                `[${a.prayerName}] ${new Date(a.timestamp).toLocaleString()} (${a.soundName})`
                                            ).join('<br/>');
                                        }
                                    }
                                    toast.success(`Found ${result.alarms.length} pending alarms`);
                                } else {
                                    toast.error("Not on native platform");
                                }
                            } catch (e) {
                                console.error(e);
                                toast.error("Failed to fetch alarms");
                            }
                        }}
                    >
                        Check Pending Alarms
                    </Button>

                    <div className="mt-2 text-xs font-mono bg-black/40 text-white/80 p-2 rounded max-h-60 overflow-auto whitespace-pre-wrap border border-white/10" id="dev-debug-log">
                        Logs will appear here...
                    </div>

                    <div className="border-t border-white/10 my-2"></div>

                    <Button
                        variant="destructive"
                        className="w-full justify-start"
                        onClick={handleClearStorage}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear Local Storage (Reset App)
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full justify-start text-white border-white/20 hover:bg-white/10"
                        onClick={handleDisableDevMode}
                    >
                        Disable Developer Mode
                    </Button>
                </div>
            </Card>

            <Card className="p-6 bg-black/20 border-white/10 backdrop-blur-sm">
                <h3 className="text-lg font-bold mb-4 text-white">أذكار و أدعية خاصة</h3>
                <div className="space-y-4 text-right font-amiri text-white/90 leading-loose">
                    {specialDuas.map((dua, index) => (
                        <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                            {dua.title && (
                                <p className="mb-2 font-bold text-[#FFD700]">{dua.title}</p>
                            )}
                            <p className="whitespace-pre-line">{dua.content}</p>
                        </div>
                    ))}

                    <div className="border-t border-white/10 my-4 pt-4"></div>

                    {simpleDuas.map((dua, index) => (
                        <p key={index}>{dua}</p>
                    ))}
                </div>
            </Card>

            <Card className="p-6 bg-black/20 border-white/10 backdrop-blur-sm">
                <h3 className="text-lg font-bold mb-4 text-white">App Info</h3>
                <div className="space-y-2 text-sm text-white/70 font-mono">
                    <p>Version: 1.0.0 (Beta)</p>
                    <p>Build: Production</p>
                    <p>Platform: Capacitor / Web</p>
                </div>
            </Card>
        </div>
    );
};
