import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    confirmedSunnahPrayers,
    nonConfirmedSunnahPrayers,
    SunnahPrayer,
    otherPrayers,
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
        <div className="space-y-6 pb-20">
            {prayerOrder.map((prayerName, index) => {
                const prayers = groupedPrayers[prayerName];
                if (!prayers) return null;

                return (
                    <Card
                        key={prayerName}
                        className="p-6 animate-fade-in hover:shadow-lg transition-all bg-white border-emerald-deep/10"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <h3 className="text-3xl font-bold font-tajawal text-emerald-deep mb-4 text-center drop-shadow-sm">
                            {prayerName}
                        </h3>

                        <div className="space-y-3">
                            {prayers.map((prayer) => (
                                <div
                                    key={prayer.id}
                                    className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl border border-emerald-deep/5"
                                >
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            className={`${prayer.confirmed ? "bg-emerald-deep hover:bg-emerald-deep/90" : "bg-gold-matte hover:bg-gold-matte/90"} text-white border-none`}
                                        >
                                            {prayer.confirmed
                                                ? (language === "ar" ? "مؤكدة" : "Confirmed")
                                                : (language === "ar" ? "غير مؤكدة" : "Non-Confirmed")}
                                        </Badge>
                                        <span className="text-lg font-tajawal text-emerald-deep/80">
                                            {language === "ar"
                                                ? `${prayer.timing === "before" ? "قبل" : "بعد"} الصلاة`
                                                : `${prayer.timing === "before" ? "Before" : "After"} Prayer`}
                                        </span>
                                    </div>
                                    <span className="text-2xl font-bold text-emerald-deep font-tajawal">
                                        {prayer.rakaat} <span className="text-sm font-normal text-emerald-deep/60">{language === "ar" ? "ركعة" : "Rakaat"}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                );
            })}

            {/* Other Prayers Section */}
            <Card className="p-6 animate-fade-in hover:shadow-lg transition-all bg-white border-emerald-deep/10">
                <h3 className="text-3xl font-bold font-tajawal text-emerald-deep mb-4 text-center drop-shadow-sm">
                    {t.otherPrayers}
                </h3>
                <div className="space-y-3">
                    {otherPrayers.map((prayer) => (
                        <div
                            key={prayer.id}
                            className="flex flex-col p-4 bg-emerald-50/50 rounded-xl border border-emerald-deep/5 space-y-2"
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-xl font-bold font-tajawal text-emerald-deep">
                                    {language === "ar" ? prayer.name : prayer.nameEn}
                                </span>
                                <Badge className="bg-emerald-deep/10 text-emerald-deep hover:bg-emerald-deep/20 border-none">
                                    {language === "ar" ? prayer.rakaat : prayer.rakaatEn}
                                </Badge>
                            </div>
                            <p className="text-sm text-emerald-deep/70 font-tajawal leading-relaxed">
                                {language === "ar" ? prayer.description : prayer.descriptionEn}
                            </p>
                        </div>
                    ))}
                </div>
            </Card>
        </div >
    );
};
