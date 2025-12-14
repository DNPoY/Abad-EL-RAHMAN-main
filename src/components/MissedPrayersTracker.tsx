import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMissedPrayers, MissedPrayers } from "@/hooks/useMissedPrayers";
import { Plus, Minus, RotateCcw } from "lucide-react";

export const MissedPrayersTracker = () => {
    const { t, language } = useLanguage();
    const { missedPrayers, increment, decrement, reset } = useMissedPrayers();

    const prayers: { key: keyof MissedPrayers; label: string }[] = [
        { key: "fajr", label: t.fajr },
        { key: "dhuhr", label: t.dhuhr },
        { key: "asr", label: t.asr },
        { key: "maghrib", label: t.maghrib },
        { key: "isha", label: t.isha },
    ];

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold font-amiri">
                    {language === "ar" ? "سجل قضاء الفوائت" : "Missed Prayers Tracker"}
                </h2>
                <Button variant="outline" size="sm" onClick={reset} className="text-destructive hover:text-destructive">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {language === "ar" ? "تصفير" : "Reset"}
                </Button>
            </div>

            <div className="grid gap-3">
                {prayers.map((prayer) => (
                    <Card key={prayer.key} className="p-4 flex items-center justify-between">
                        <span className="font-amiri text-lg w-24">{prayer.label}</span>

                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => decrement(prayer.key)}
                                disabled={missedPrayers[prayer.key] === 0}
                                className="h-8 w-8"
                            >
                                <Minus className="w-4 h-4" />
                            </Button>

                            <span className="font-bold text-xl w-8 text-center">
                                {missedPrayers[prayer.key]}
                            </span>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => increment(prayer.key)}
                                className="h-8 w-8"
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
                {language === "ar"
                    ? "استخدم هذا السجل لمتابعة الصلوات التي فاتتك وتريد قضاءها."
                    : "Use this tracker to keep count of prayers you missed and intend to make up."}
            </p>
        </div>
    );
};
