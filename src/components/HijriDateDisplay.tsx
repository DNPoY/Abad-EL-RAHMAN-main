import { useLanguage } from "@/contexts/LanguageContext";
import { getHijriDate } from "@/lib/date-utils";
import { Moon } from "lucide-react";

export const HijriDateDisplay = () => {
    const { language } = useLanguage();
    const today = new Date();
    const hijriDate = getHijriDate(today, language as "ar" | "en");

    return (
        <div className="flex items-center justify-center gap-2 text-primary-foreground/90 font-amiri text-lg mt-2 animate-fade-in">
            <Moon className="w-4 h-4" />
            <div className="flex flex-col items-start leading-tight">
                <span>{hijriDate}</span>
                <span className="text-[10px] text-white/60 font-sans">
                    {today.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
            </div>
        </div>
    );
};
