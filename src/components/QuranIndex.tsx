import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { surahs } from "@/lib/quran-data";
import { Search, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import patternBg from "@/assets/pattern.png";
import { removeTashkil } from "@/lib/utils";

interface QuranIndexProps {
    isEmbedded?: boolean;
}

interface Ayah {
    number: number;
    text: string;
    numberInSurah: number;
    juz: number;
    manzil: number;
    page: number;
    ruku: number;
    hizbQuarter: number;
    sajda: boolean;
}

interface Surah {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    ayahs: Ayah[];
}

interface SearchResult {
    surah: {
        number: number;
        name: string;
        englishName: string;
        englishNameTranslation: string;
        revelationType: string;
    };
    number: number;
    numberInSurah: number;
    text: string;
}

export const QuranIndex = ({ isEmbedded = false }: QuranIndexProps) => {
    const { language } = useLanguage();
    const [searchQuery, setSearchQuery] = useState("");
    const [ayahResults, setAyahResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [lastRead, setLastRead] = useState<any>(null);

    useEffect(() => {
        const saved = localStorage.getItem("last_read_position");
        if (saved) {
            try {
                setLastRead(JSON.parse(saved));
            } catch (e) { console.error(e); }
        }
    }, []);

    // Debounced search effect removed to prevent auto-search
    // User must press Enter or click Search button

    const handleSearch = async () => {
        // If empty, clear results (already handled by useEffect debounce, but good for direct calls)
        if (!searchQuery.trim()) {
            setAyahResults([]);
            return;
        }

        setIsSearching(true);
        try {
            // Import local JSON directly for offline search
            const quranData = await import("@/lib/quran-simple-clean.json");
            const data = (quranData as { default?: { data: { surahs: Surah[] } }, data?: { surahs: Surah[] } });
            const surahsList = data.default?.data?.surahs || data.data?.surahs;

            const matches: SearchResult[] = [];

            if (surahsList) {
                const normalizedQuery = removeTashkil(searchQuery);
                surahsList.forEach((surah: Surah) => {
                    surah.ayahs.forEach((ayah: Ayah) => {
                        if (removeTashkil(ayah.text).includes(normalizedQuery)) {
                            matches.push({
                                surah: {
                                    number: surah.number,
                                    name: surah.name,
                                    englishName: surah.englishName,
                                    englishNameTranslation: surah.englishNameTranslation,
                                    revelationType: surah.revelationType
                                },
                                number: ayah.number,
                                numberInSurah: ayah.numberInSurah,
                                text: ayah.text
                            });
                        }
                    });
                });
            }

            setAyahResults(matches);
        } catch (error) {
            console.error("Search failed:", error);
            setAyahResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const normalizedSearchQuery = removeTashkil(searchQuery.toLowerCase());

    const filteredSurahs = surahs.filter((surah) =>
        surah.englishName.toLowerCase().includes(normalizedSearchQuery) ||
        removeTashkil(surah.name).includes(normalizedSearchQuery) ||
        surah.englishNameTranslation.toLowerCase().includes(normalizedSearchQuery) ||
        surah.number.toString().includes(normalizedSearchQuery)
    );

    return (
        <div className="min-h-screen relative overflow-hidden bg-cream">
            {/* Texture Overlay */}
            <div
                className="absolute inset-0 z-0 opacity-30 pointer-events-none mix-blend-multiply"
                style={{ backgroundImage: 'url("/textures/cream-paper.png")', backgroundSize: 'cover' }}
            />

            <div className="relative z-10 px-4 pt-safe pb-32 animate-fade-in">
                {/* Continue Reading Card */}
                {lastRead && !searchQuery && (
                    <div className="max-w-xl mx-auto mb-6 px-1 animate-fade-in-up delay-100">
                        <Link to={`/quran/${lastRead.surahId}`}>
                            <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-between group border border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                                        <BookOpen className="w-6 h-6 text-gold-matte" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-emerald-100/60 uppercase tracking-wider font-semibold mb-0.5">
                                            {language === "ar" ? "تابع القراءة" : "Continue Reading"}
                                        </p>
                                        <h3 className="font-bold font-tajawal text-lg leading-none mt-1">
                                            {lastRead.surahName}
                                            <span className="mx-2 text-white/40 text-sm font-light">|</span>
                                            <span className="text-sm font-normal text-emerald-100">
                                                {language === "ar" ? "صفحة" : "Page"} {lastRead.pageNumber}
                                            </span>
                                        </h3>
                                    </div>
                                </div>
                                <ArrowRight className={`w-5 h-5 text-gold-matte transition-transform duration-300 ${language === 'ar' ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
                            </div>
                        </Link>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col items-center justify-center pt-8 mb-8 relative">
                    {!isEmbedded && (
                        <div className="absolute top-8 left-0">
                            <Link to="/">
                                <Button variant="ghost" size="icon" className="text-emerald-deep hover:bg-emerald-deep/5 rounded-full">
                                    <ArrowRight className={language === "ar" ? "rotate-180" : ""} />
                                </Button>
                            </Link>
                        </div>
                    )}

                    <div className="flex flex-col items-center animate-fade-in-up">
                        <BookOpen className="w-10 h-10 text-emerald-deep mb-2 drop-shadow-sm" />
                        <h2 className="text-3xl font-bold font-tajawal text-emerald-deep">
                            {language === "ar" ? "القرآن الكريم" : "The Holy Quran"}
                        </h2>
                        <span className="text-sm font-tajawal text-emerald-deep/60 mt-1">
                            {language === "ar" ? "اقرأ وارتق" : "Read and Rise"}
                        </span>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto mb-8 relative z-20">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-emerald-deep/5 blur-xl rounded-full transform scale-90 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative flex shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-2xl bg-white border border-emerald-deep/5 overflow-hidden">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-deep/40 w-5 h-5 z-20" />
                            <Input
                                placeholder={language === "ar" ? "ابحث عن سورة أو آية..." : "Search Surah or Ayah..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="pl-12 py-7 border-none bg-transparent text-emerald-deep placeholder:text-emerald-deep/30 focus:ring-0 text-lg font-tajawal w-full"
                            />
                            <Button
                                onClick={handleSearch}
                                disabled={isSearching}
                                className="h-auto px-6 bg-gold-matte text-white hover:bg-gold-light font-bold rounded-none"
                            >
                                {isSearching ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    language === "ar" ? "بحث" : "Search"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="max-w-xl mx-auto space-y-4">
                    {/* Surah Results - Vertical List */}
                    {filteredSurahs.length > 0 && (
                        <div className="space-y-3">
                            {filteredSurahs.map((surah) => (
                                <Link to={`/quran/${surah.number}`} key={surah.number}>
                                    <div className="group relative bg-white rounded-2xl p-5 border border-emerald-deep/5 transition-all duration-300 hover:shadow-[0_10px_40px_-10px_rgba(9,66,49,0.1)] hover:-translate-y-1 overflow-hidden">
                                        {/* Hover Accent */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-deep opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-5">
                                                {/* Number Badge */}
                                                <div className="w-12 h-12 flex items-center justify-center relative">
                                                    <div className="absolute inset-0 bg-emerald-50 rounded-xl rotate-45 group-hover:rotate-90 transition-transform duration-500" />
                                                    <span className="font-tajawal font-bold text-lg text-emerald-deep relative z-10">
                                                        {surah.number}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col">
                                                    <h3 className="font-bold font-tajawal text-xl text-emerald-deep group-hover:text-emerald-deep/80 transition-colors">
                                                        {surah.name}
                                                    </h3>
                                                    <span className="text-xs text-emerald-deep/40 font-medium tracking-wider uppercase">
                                                        {surah.englishName}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gold-matte" />
                                                    <span className="text-[10px] font-bold text-emerald-deep/70">
                                                        {language === "ar" ? `${surah.numberOfAyahs} آية` : `${surah.numberOfAyahs} Ayahs`}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-emerald-deep/30 pr-1">
                                                    {surah.revelationType}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Ayah Results */}
                    {ayahResults.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold mb-4 font-tajawal text-emerald-deep px-2">
                                {language === "ar" ? "نتائج البحث في الآيات" : "Ayah Search Results"}
                            </h3>
                            <div className="space-y-4">
                                {ayahResults.map((match, index) => (
                                    <Link to={`/quran/${match.surah.number}?ayah=${match.numberInSurah}`} key={index}>
                                        <div className="p-6 rounded-2xl bg-white border border-emerald-deep/5 hover:border-gold-matte/30 hover:shadow-lg transition-all group">
                                            <div className="flex justify-between items-center mb-4 border-b border-emerald-deep/5 pb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-emerald-deep text-white text-xs px-2 py-0.5 rounded-md font-bold">
                                                        {match.surah.name}
                                                    </span>
                                                    <span className="text-emerald-deep/40 text-xs">
                                                        {language === "ar" ? "آية" : "Ayah"} {match.numberInSurah}
                                                    </span>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-gold-matte -rotate-45 group-hover:rotate-0 transition-transform" />
                                            </div>
                                            <p className="font-quran text-2xl text-center leading-[2.5] text-emerald-deep">
                                                {match.text}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredSurahs.length === 0 && ayahResults.length === 0 && searchQuery && !isSearching && (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-soft">
                                <Search className="w-8 h-8 text-emerald-deep/30" />
                            </div>
                            <p className="text-emerald-deep/50 font-tajawal">
                                {language === "ar" ? "لا توجد نتائج" : "No results found"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
