import { useEffect, useState, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFontSize } from "@/contexts/FontSizeContext";
import { surahs } from "@/lib/quran-data";
import { ArrowRight, Loader2, AlertCircle, Moon, Sun, BookOpen, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { IslamicBorder } from "./IslamicBorder";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useTafsir } from "@/hooks/useTafsir";
import { SurahAudioPlayer } from "./SurahAudioPlayer";

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

interface SurahData {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    revelationType: string;
    numberOfAyahs: number;
    ayahs: Ayah[];
}

const TafsirModal = ({
    surahNumber,
    ayahNumber,
    isOpen,
    onClose,
    ayahText
}: {
    surahNumber: number;
    ayahNumber: number;
    isOpen: boolean;
    onClose: () => void;
    ayahText: string;
}) => {
    const { language } = useLanguage();
    const { data, isLoading, error, refetch } = useTafsir(isOpen ? surahNumber : null, isOpen ? ayahNumber : null);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-[#0c3f2d] border border-white/20 text-white">
                <DialogHeader>
                    <DialogTitle className="text-center font-amiri text-2xl mb-4 text-[#FFD700] drop-shadow-md">
                        {language === "ar" ? "المختصر في التفسير" : "Tafsir Al-Mukhtasar"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="bg-black/20 p-4 rounded-xl border border-white/10">
                        <p className="text-center font-quran text-xl leading-[2.5] text-white drop-shadow-sm">
                            {ayahText}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-[#FFD700]" />
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-300 py-4">
                                <p>{language === "ar" ? "فشل تحميل التفسير" : "Failed to load Tafsir"}</p>
                                <p className="text-xs text-white/50 mt-2 mb-4">{error}</p>
                                <Button variant="outline" size="sm" onClick={() => refetch()} className="border-white/20 text-white hover:bg-white/10">
                                    {language === "ar" ? "إعادة المحاولة" : "Retry"}
                                </Button>
                            </div>
                        ) : data ? (
                            <div className="space-y-4 animate-fade-in">
                                <div className="prose prose-sm prose-invert max-w-none text-right" dir="rtl">
                                    <div
                                        className="text-lg leading-relaxed font-amiri text-white/90"
                                        dangerouslySetInnerHTML={{ __html: data.text }}
                                    />
                                </div>
                                {data.footnotes && (
                                    <div className="border-t border-white/10 pt-4 mt-4">
                                        <p className="text-sm text-white/60 text-right" dir="rtl">
                                            {data.footnotes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const SurahView = () => {
    const { surahId } = useParams();
    const { language } = useLanguage();
    const { fontSize } = useFontSize();
    const [surahData, setSurahData] = useState<SurahData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isNightMode, setIsNightMode] = useState(false);
    const [selectedAyah, setSelectedAyah] = useState<{ number: number; text: string } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const location = useLocation();
    const targetAyahRef = useRef<number | null>(null);
    const [playingAyahNumber, setPlayingAyahNumber] = useState<number | null>(null);
    const ayahRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    // Add extra padding at bottom for audio player
    const containerClass = "min-h-screen bg-[#0c3f2d] pb-40";
    const ITEMS_PER_PAGE = 20;

    // Scroll to playing ayah
    useEffect(() => {
        if (playingAyahNumber && ayahRefs.current[playingAyahNumber]) {
            ayahRefs.current[playingAyahNumber]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [playingAyahNumber]);

    // Ensure scroll to top when page changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentPage, surahId]);

    const surahInfo = surahs.find((s) => s.number === Number(surahId));

    useEffect(() => {
        const fetchSurah = async () => {
            if (!surahId) return;
            setIsLoading(true);
            setError(false);

            // Restore saved page or default to 1, unless we have a target ayah
            const queryParams = new URLSearchParams(location.search);
            const targetAyahParam = queryParams.get("ayah");

            let initialPage = 1;
            if (targetAyahParam) {
                const ayahNum = parseInt(targetAyahParam);
                if (!isNaN(ayahNum)) {
                    initialPage = Math.ceil(ayahNum / ITEMS_PER_PAGE);
                    targetAyahRef.current = ayahNum;
                }
            } else {
                const savedPage = localStorage.getItem(`quran_progress_${surahId}`);
                initialPage = savedPage ? parseInt(savedPage) : 1;
            }

            setCurrentPage(initialPage);

            try {
                // Import local JSON directly
                const quranData = await import("@/lib/quran-uthmani.json");

                // Accessing default export for JSON module
                const data = (quranData as { default?: { data: { surahs: SurahData[] } }, data?: { surahs: SurahData[] } });
                const surahs = data.default?.data?.surahs || data.data?.surahs;
                const surah = surahs?.find((s: SurahData) => s.number === Number(surahId));

                if (surah) {
                    setSurahData(surah);
                } else {
                    throw new Error("Surah not found");
                }
            } catch (err) {
                console.error(err);
                setError(true);
                toast.error(language === "ar" ? "فشل تحميل السورة" : "Failed to load Surah");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSurah();
        // Only scroll to top if we don't have a target ayah
        if (!targetAyahRef.current) {
            window.scrollTo(0, 0);
        }
    }, [surahId, language, location.search]);

    // Handle scrolling to target ayah after render
    useEffect(() => {
        if (targetAyahRef.current && !isLoading && surahData) {
            const element = document.getElementById(`ayah-${targetAyahRef.current}`);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                    // Highlight effect
                    element.classList.add("bg-white/10");
                    setTimeout(() => element.classList.remove("bg-white/10"), 2000);
                    targetAyahRef.current = null; // Clear target after scrolling
                }, 500); // Small delay to ensure rendering
            }
        }
    }, [isLoading, surahData, currentPage]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-amiri">
                    {language === "ar" ? "جاري تحميل السورة..." : "Loading Surah..."}
                </p>
            </div>
        );
    }

    if (error || !surahData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <AlertCircle className="w-12 h-12 text-destructive" />
                <p className="text-lg font-amiri">
                    {language === "ar" ? "حدث خطأ أثناء التحميل" : "Error loading content"}
                </p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    {language === "ar" ? "إعادة المحاولة" : "Retry"}
                </Button>
                <Link to="/quran">
                    <Button variant="ghost">
                        {language === "ar" ? "العودة للفهرس" : "Back to Index"}
                    </Button>
                </Link>
            </div>
        );
    }

    const fontSizes = {
        small: 24,
        medium: 32,
        large: 40
    };

    const highlightText = (text: string) => {
        const parts = text.split(/(ٱللَّهِ|لِلَّهِ|بِٱللَّهِ|تَٱللَّهِ|ٱلرَّحۡمَٰنِ)/g);
        return parts.map((part, index) => {
            if (part.match(/^(ٱللَّهِ|لِلَّهِ|بِٱللَّهِ|تَٱللَّهِ|ٱلرَّحۡمَٰنِ)$/)) {
                return <span key={index} className="text-[#ff3335] font-bold">{part}</span>;
            }
            return part;
        });
    };

    // Pagination Logic
    const totalPages = Math.ceil(surahData.ayahs.length / ITEMS_PER_PAGE);
    const currentAyahs = surahData.ayahs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        localStorage.setItem(`quran_progress_${surahId}`, newPage.toString());
        window.scrollTo(0, 0);
    };

    // Ensure scroll to top when page changes


    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#0e4b36] to-[#052016]" dir={language === "ar" ? "rtl" : "ltr"}>
            {/* Pattern Overlay (Optional - kept very subtle if needed, or removed) */}
            <div className="absolute inset-0 z-0 opacity-5"
                style={{ backgroundImage: 'url("/assets/pattern.png")' }}
            />

            <div className="relative z-10 pb-40 pt-safe pt-12 px-4 md:px-8 animate-fade-in">
                {/* Header Section */}
                <div className="flex flex-col items-center justify-center gap-4 mb-8 text-center relative">
                    <div className="absolute top-1/2 -translate-y-1/2 left-0">
                        <Link to="/quran">
                            <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
                                <ArrowRight className={language === "ar" ? "rotate-180" : ""} />
                            </Button>
                        </Link>
                    </div>

                    <div className="absolute top-1/2 -translate-y-1/2 right-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePageChange(1)}
                            className="rounded-full text-white hover:bg-white/10"
                            title={language === "ar" ? "ابدأ من جديد" : "Start Over"}
                        >
                            <RotateCcw className="w-5 h-5" />
                        </Button>
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold font-amiri text-white drop-shadow-md mb-1">{surahInfo?.name}</h1>
                        <p className="text-sm text-white/80 font-medium tracking-wide">{surahInfo?.englishName}</p>
                    </div>
                </div>

                {/* Main Content Frame */}
                <div className="relative max-w-4xl mx-auto">
                    {/* Frame Container - Transparent with White Border */}
                    <div className="relative rounded-[2rem] border-2 border-white/30 bg-[#0c3f2d] shadow-2xl overflow-hidden">
                        {/* Inner Decorative Border */}
                        <div className="absolute inset-2 border border-white/20 rounded-[1.5rem] pointer-events-none" />

                        {/* Corner Ornaments - Minimalist White */}
                        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-white/40 rounded-tl-[2rem]" />
                        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-white/40 rounded-tr-[2rem]" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-white/40 rounded-bl-[2rem]" />
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-white/40 rounded-br-[2rem]" />

                        <div className="p-6 md:p-10 relative z-10">
                            {surahInfo?.number !== 1 && surahInfo?.number !== 9 && currentPage === 1 && (
                                <div className="text-center mb-10">
                                    <div className="inline-block px-8 py-3 border-b border-white/20 mb-6">
                                        <h2 className="text-3xl font-amiri text-white drop-shadow-sm">
                                            بسم الله الرحمن الرحيم
                                        </h2>
                                    </div>
                                </div>
                            )}

                            <div
                                className="space-y-8 leading-[2.8] text-center font-quran"
                                style={{ fontSize: `${fontSizes[fontSize]}px`, color: '#FFFFFF' }}
                            >
                                {currentAyahs.map((ayah, index) => {
                                    const actualAyahNumber = ayah.numberInSurah;
                                    const isPlaying = playingAyahNumber === actualAyahNumber;

                                    return (
                                        <div
                                            key={ayah.number}
                                            id={`ayah-${ayah.numberInSurah}`}
                                            ref={(el) => (ayahRefs.current[actualAyahNumber] = el)}
                                            className={`relative group inline px-1 rounded transition-all duration-500 ${isPlaying
                                                ? "bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-500/30 scale-[1.02]"
                                                : "hover:bg-white/5"
                                                }`}
                                        >
                                            <span className={`drop-shadow-sm transition-colors duration-300 ${isPlaying ? "text-[#FFD700] font-bold" : "text-white"
                                                }`}>
                                                {highlightText(surahInfo?.number === 1
                                                    ? ayah.text.replace(/[\u06DF\u06ED]/g, "")
                                                    : ayah.text.replace("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", "").replace(/[\u06DF\u06ED]/g, "").trim())}
                                            </span>
                                            {/* Ayah Number Marker */}
                                            <button
                                                onClick={() => setSelectedAyah({ number: ayah.numberInSurah, text: ayah.text })}
                                                className="inline-flex items-center justify-center w-8 h-8 mx-2 text-xs border border-white/40 rounded-full font-amiri font-bold text-white/90 bg-white/10 hover:bg-white hover:text-[#0c3f2d] transition-all cursor-pointer"
                                                title={language === "ar" ? "عرض التفسير" : "View Tafsir"}
                                            >
                                                {ayah.numberInSurah}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-8 px-4 max-w-4xl mx-auto text-white">
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="border-white/30 text-white hover:bg-white hover:text-[#0c3f2d]"
                        >
                            {language === "ar" ? "الصفحة السابقة" : "Previous Page"}
                        </Button>

                        <span className="text-sm font-medium text-white/80">
                            {language === "ar"
                                ? `صفحة ${currentPage} من ${totalPages}`
                                : `Page ${currentPage} of ${totalPages}`}
                        </span>

                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="border-white/30 text-white hover:bg-white hover:text-[#0c3f2d]"
                        >
                            {language === "ar" ? "الصفحة التالية" : "Next Page"}
                        </Button>
                    </div>
                )}

                <div className="flex justify-between mt-8 max-w-4xl mx-auto">
                    {surahInfo && surahInfo.number > 1 ? (
                        <Link to={`/quran/${surahInfo.number - 1}`}>
                            <Button variant="ghost" className="text-white hover:text-white/80 hover:bg-white/10">
                                {language === "ar" ? "السورة السابقة" : "Previous Surah"}
                            </Button>
                        </Link>
                    ) : <div></div>}

                    {surahInfo && surahInfo.number < 114 ? (
                        <Link to={`/quran/${surahInfo.number + 1}`}>
                            <Button variant="ghost" className="text-white hover:text-white/80 hover:bg-white/10">
                                {language === "ar" ? "السورة التالية" : "Next Surah"}
                            </Button>
                        </Link>
                    ) : <div></div>}
                </div>

                {surahInfo && selectedAyah && (
                    <TafsirModal
                        surahNumber={surahInfo.number}
                        ayahNumber={selectedAyah.number}
                        ayahText={selectedAyah.text}
                        isOpen={!!selectedAyah}
                        onClose={() => setSelectedAyah(null)}
                    />
                )}
            </div>
            {/* Audio Player */}
            {surahId && surahData && (
                <SurahAudioPlayer
                    surahNumber={Number(surahId)}
                    totalAyahs={surahData.ayahs.length}
                    onAyahChange={setPlayingAyahNumber}
                />
            )}
        </div>
    );
};
