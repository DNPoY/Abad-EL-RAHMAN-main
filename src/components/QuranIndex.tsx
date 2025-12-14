import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { surahs } from "@/lib/quran-data";
import { Search, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import patternBg from "@/assets/pattern.png";

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
                surahsList.forEach((surah: Surah) => {
                    surah.ayahs.forEach((ayah: Ayah) => {
                        if (ayah.text.includes(searchQuery)) {
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

    const filteredSurahs = surahs.filter((surah) =>
        surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.name.includes(searchQuery) ||
        surah.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.number.toString().includes(searchQuery)
    );

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Image */}
            {/* Background Image - Warm Paper Theme (Trial) */}
            <div
                className="absolute inset-0 z-0 bg-[#f5f0e1]"
                style={{
                    backgroundImage: 'url("/images/quran-bg-warm.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 1
                }}
            />
            {/* Dark Overlay for Text Contrast */}
            <div className="absolute inset-0 bg-black/40 z-0" />

            {/* Overlay for readability if background is too busy */}
            <div className="absolute inset-0 bg-[#004B23]/80 z-0 mix-blend-multiply" />

            <div className="relative z-10 p-4 space-y-6 animate-fade-in pb-24">
                <div className="flex flex-col items-center justify-center gap-2 mb-8 text-[#FFD700] pt-4">
                    {!isEmbedded && (
                        <div className="absolute top-4 left-4">
                            <Link to="/">
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                                    <ArrowRight className={language === "ar" ? "rotate-180" : ""} />
                                </Button>
                            </Link>
                        </div>
                    )}
                    <div className="flex items-center gap-3 animate-fade-in-up">
                        <BookOpen className="w-8 h-8 text-[#FFD700]" />
                        <h2 className="text-4xl font-bold font-amiri drop-shadow-lg text-white">
                            {language === "ar" ? "القرآن الكريم" : "The Holy Quran"}
                        </h2>
                    </div>
                </div>

                <div className="space-y-4 max-w-2xl mx-auto px-4 relative z-20 -mt-2">
                    <div className="relative flex gap-2 group">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5 z-20 transition-colors group-hover:text-[#FFD700]" />
                            <Input
                                placeholder={language === "ar" ? "بحث عن سورة أو آية..." : "Search Surah or Ayah..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="pl-12 py-6 bg-white/5 border-2 border-white/10 text-white placeholder:text-white/30 focus:border-[#FFD700] focus:ring-[#FFD700] shadow-lg backdrop-blur-sm rounded-2xl text-lg font-amiri transition-all hover:bg-white/10 hover:border-white/20"
                            />
                        </div>
                        <Button onClick={handleSearch} disabled={isSearching} className="h-auto px-8 bg-[#FFD700] text-[#0c3f2d] hover:bg-[#FFD700]/90 font-bold rounded-2xl shadow-lg transition-transform hover:scale-105">
                            {isSearching ? (
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                language === "ar" ? "بحث" : "Search"
                            )}
                        </Button>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Surah Results */}
                    {filteredSurahs.length > 0 && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredSurahs.map((surah) => (
                                    <Link to={`/quran/${surah.number}`} key={surah.number}>
                                        <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#146c4d] to-[#0c3f2d] hover:border-[#FFD700]/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(12,63,45,0.4)]">
                                            {/* Decorative Corner */}
                                            <div
                                                className="absolute top-0 right-0 w-16 h-16 opacity-5 rotate-90"
                                                style={{ backgroundImage: `url(${patternBg})` }}
                                            />

                                            <div className="p-4 flex items-center justify-between relative z-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 relative flex items-center justify-center">
                                                        {/* Star/Octagon Shape for Number */}
                                                        <div className="absolute inset-0 border-2 border-white/30 rotate-45 rounded-sm group-hover:rotate-90 transition-transform duration-500" />
                                                        <span className="text-white font-bold font-amiri text-lg relative z-10">
                                                            {surah.number}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold font-amiri text-xl text-white group-hover:text-white/90 transition-colors">
                                                            {surah.name}
                                                        </h3>
                                                        <p className="text-xs text-white/60">{surah.englishName}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-white/60">
                                                        {language === "ar" ? `${surah.numberOfAyahs} آية` : `${surah.numberOfAyahs} Ayahs`}
                                                    </p>
                                                    <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">
                                                        {surah.revelationType}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ayah Results */}
                    {ayahResults.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold mb-4 font-amiri text-[#FFD700] text-center">
                                {language === "ar" ? "نتائج البحث في الآيات" : "Ayah Search Results"}
                            </h3>
                            <div className="space-y-4">
                                {ayahResults.map((match, index) => (
                                    <Link to={`/quran/${match.surah.number}?ayah=${match.numberInSurah}`} key={index}>
                                        <div className="p-6 rounded-xl border border-[#FFD700]/30 bg-black/20 hover:bg-black/30 transition-all cursor-pointer mb-4 backdrop-blur-sm">
                                            <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-2">
                                                <div className="text-sm font-bold text-[#FFD700]">
                                                    {match.surah.name} <span className="text-white/60 mx-2">|</span> {language === "ar" ? "آية" : "Ayah"} {match.numberInSurah}
                                                </div>
                                            </div>
                                            <p className="font-amiri text-2xl text-center leading-loose text-white drop-shadow-sm">
                                                {match.text}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredSurahs.length === 0 && ayahResults.length === 0 && searchQuery && !isSearching && (
                        <div className="text-center text-white/50 py-12">
                            <div className="w-16 h-16 border-2 border-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8" />
                            </div>
                            {language === "ar" ? "لا توجد نتائج" : "No results found"}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
