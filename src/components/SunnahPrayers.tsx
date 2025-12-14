import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    confirmedSunnahPrayers,
    nonConfirmedSunnahPrayers,
    SunnahPrayer,
} from "@/lib/sunnah-prayers-data";

export const SunnahPrayers = () => {
    const { t, language } = useLanguage();

    // Group prayers by prayer name
    const allPrayers = [...confirmedSunnahPrayers, ...nonConfirmedSunnahPrayers];
    const groupedPrayers = allPrayers.reduce((acc, prayer) => {
        if (!acc[prayer.prayer]) {
            acc[prayer.prayer] = [];
        }
        acc[prayer.prayer].push(prayer);
        return acc;
    }, {} as Record<string, SunnahPrayer[]>);

    // Sort each group: "before" first, then "after"
    Object.keys(groupedPrayers).forEach(prayerName => {
        groupedPrayers[prayerName].sort((a, b) => {
            if (a.timing === "before" && b.timing === "after") return -1;
            if (a.timing === "after" && b.timing === "before") return 1;
            return 0;
        });
    });

    const prayerOrder = ["الفجر", "الظهر", "العصر", "المغرب", "العشاء"];

    return (
        <div className="space-y-6">
            {prayerOrder.map((prayerName, index) => {
                const prayers = groupedPrayers[prayerName];
                if (!prayers) return null;

                return (
                    <Card
                        key={prayerName}
                        className="p-6 animate-fade-in hover:shadow-lg transition-all"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <h3 className="text-3xl font-bold font-amiri text-white mb-4 text-center">
                            {prayerName}
                        </h3>

                        <div className="space-y-3">
                            {prayers.map((prayer) => (
                                <div
                                    key={prayer.id}
                                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <Badge variant={prayer.confirmed ? "default" : "secondary"}>
                                            {prayer.confirmed
                                                ? (language === "ar" ? "مؤكدة" : "Confirmed")
                                                : (language === "ar" ? "غير مؤكدة" : "Non-Confirmed")}
                                        </Badge>
                                        <span className="text-lg font-amiri">
                                            {language === "ar"
                                                ? `${prayer.timing === "before" ? "قبل" : "بعد"} الصلاة`
                                                : `${prayer.timing === "before" ? "Before" : "After"} Prayer`}
                                        </span>
                                    </div>
                                    <span className="text-2xl font-bold text-white">
                                        {prayer.rakaat} {language === "ar" ? "ركعة" : "Rakaat"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};
