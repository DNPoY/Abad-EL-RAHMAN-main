import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFontSize, type FontSize } from "@/contexts/FontSizeContext";
import { useSettings } from "@/contexts/SettingsContext";
import { surahs } from "@/lib/quran-data";
import { ArrowRight, Loader2, AlertCircle, Moon, Sun, BookOpen, RotateCcw, Play, Pause, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
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


// Fonts helper functions
const getFontFamilyClass = (font: string) => {
    switch (font) {
        case 'uthmani': return 'font-quran';
        case 'indopak': return 'font-indopak'; // Assuming this exists or falls back
        default: return 'font-quran';
    }
};

const getFontSize = (size: string, font: string) => {
    const baseSize = size === 'small' ? 24 : size === 'large' ? 36 : 30;
    // Adjust logic as needed, or just return baseSize
    return baseSize;
};

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

// Separate component to handle per-ayah hooks (useLongPress removed)
const AyahItem = ({
    ayah,
    surahNumber,
    isPlaying,
    fontSize,
    quranFont,
    onPlay,
    setRef,
    highlightText,
    setSelectedAyah,
    language
}: {
    ayah: Ayah,
    surahNumber: number,
    isPlaying: boolean,
    fontSize: string,
    quranFont: string,
    onPlay: () => void,
    setRef: (el: HTMLDivElement | null) => void,
    highlightText: (text: string) => React.ReactNode,
    setSelectedAyah: (ayah: { number: number; text: string }) => void,
    language: string
}) => {
    // const { getFontFamilyClass, getFontSize } = useFontSize(); // Helpers are global now

    const handleClick = (e: React.MouseEvent) => {
        onPlay();
    };

    return (
        <div
            id={`ayah-${ayah.numberInSurah}`}
            ref={setRef}
            onClick={handleClick}
            className={`relative group inline px-1.5 rounded-lg transition-colors duration-200 cursor-pointer ${isPlaying ? "bg-gold-matte/20" : "hover:bg-emerald-deep/5"
                }`}
            title={language === "ar" ? "اضغط للاستماع" : "Click to play"}
        >
            <span className={`transition-colors duration-300 ${isPlaying ? "text-emerald-deep font-bold" : "text-reading"
                }`}>
                {highlightText(surahNumber === 1
                    ? ayah.text.replace(/[\u06DF\u06ED]/g, "")
                    : ayah.text.replace("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ", "").replace(/[\u06DF\u06ED]/g, "").trim())}
            </span>
            {/* Ayah Number Marker */}
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Prevent playing audio when clicking number
                    setSelectedAyah({ number: ayah.numberInSurah, text: ayah.text });
                }}
                className="inline-flex items-center justify-center w-8 h-8 mx-1.5 align-middle text-xs border border-emerald-deep/20 rounded-full font-amiri font-bold text-emerald-deep/70 bg-white/50 hover:bg-emerald-deep hover:text-white transition-all cursor-pointer shadow-sm"
                title={language === "ar" ? "عرض التفسير" : "View Tafsir"}
            >
                {ayah.numberInSurah}
            </button>
        </div>
    );
};

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
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-cream border border-emerald-deep/10 text-emerald-deep shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-center font-amiri text-2xl mb-4 text-emerald-deep drop-shadow-sm">
                        {language === "ar" ? "المختصر في التفسير" : "Tafsir Al-Mukhtasar"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="bg-white/50 p-6 rounded-xl border border-emerald-deep/5 shadow-inner">
                        <p className="text-center font-quran text-xl leading-[2.5] text-emerald-deep drop-shadow-sm">
                            {ayahText}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-gold-matte" />
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-500 py-4">
                                <p>{language === "ar" ? "فشل تحميل التفسير" : "Failed to load Tafsir"}</p>
                                <p className="text-xs text-emerald-deep/50 mt-2 mb-4">{error}</p>
                                <Button variant="outline" size="sm" onClick={() => refetch()} className="border-emerald-deep/20 text-emerald-deep hover:bg-emerald-deep/5">
                                    {language === "ar" ? "إعادة المحاولة" : "Retry"}
                                </Button>
                            </div>
                        ) : data ? (
                            <div className="space-y-4 animate-fade-in">
                                <div className="prose prose-sm max-w-none text-right" dir="rtl">
                                    <div
                                        className="text-lg leading-relaxed font-tajawal text-emerald-deep/90"
                                        dangerouslySetInnerHTML={{ __html: data.text }}
                                    />
                                </div>
                                {data.footnotes && (
                                    <div className="border-t border-emerald-deep/10 pt-4 mt-4">
                                        <p className="text-sm text-emerald-deep/60 text-right font-tajawal" dir="rtl">
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
    const navigate = useNavigate();
    const targetAyahRef = useRef<number | null>(null);
    const [playingAyahNumber, setPlayingAyahNumber] = useState<number | null>(null);
    const [jumpToAyah, setJumpToAyah] = useState<number | null>(null);
    const ayahRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const { quranFont, readingStyle } = useSettings();
    const [showPlayer, setShowPlayer] = useState(false);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);

    // Add extra padding at bottom for audio player
    const containerClass = "min-h-screen bg-[#0c3f2d] pb-40";
    const ITEMS_PER_PAGE = 20;

    // Page change handler - defined early for use in effects
    const handlePageChange = useCallback((newPage: number) => {
        setCurrentPage(newPage);
        localStorage.setItem(`quran_progress_${surahId}`, newPage.toString());
        window.scrollTo(0, 0);
    }, [surahId]);

    // Scroll to playing ayah and turn page if needed
    useEffect(() => {
        if (playingAyahNumber) {
            // Auto turn page if the playing ayah is not on the current page
            const requiredPage = Math.ceil(playingAyahNumber / ITEMS_PER_PAGE);
            if (requiredPage !== currentPage) {
                handlePageChange(requiredPage);
            }

            // Scroll into view (needs small delay if page just changed)
            setTimeout(() => {
                if (ayahRefs.current[playingAyahNumber]) {
                    ayahRefs.current[playingAyahNumber]?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }, 100);
        }
    }, [playingAyahNumber, currentPage, handlePageChange]);

    // Ensure scroll to top when page changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentPage, surahId]);

    const surahInfo = surahs.find((s) => s.number === Number(surahId));

    // Track visible Ayahs for "Continue Reading"
    useEffect(() => {
        if (!surahInfo || isLoading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const ayahNum = parseInt(entry.target.getAttribute("data-ayah-number") || "0");
                        if (ayahNum > 0) {
                            // Update local storage with precise location
                            const lastRead = {
                                surahId: surahInfo.number,
                                surahName: surahInfo.name,
                                englishName: surahInfo.englishName,
                                pageNumber: currentPage,
                                ayahNumber: ayahNum, // Save exact ayah
                                timestamp: Date.now()
                            };
                            localStorage.setItem("last_read_position", JSON.stringify(lastRead));
                        }
                    }
                });
            },
            {
                rootMargin: "-40% 0px -40% 0px" // Trigger when element is in the vertical center 20%
            }
        );

        // Observe all ayah elements on the current page
        const ayahElements = document.querySelectorAll('.ayah-container');
        ayahElements.forEach((el) => observer.observe(el));

        return () => {
            observer.disconnect();
        };
    }, [surahInfo, currentPage, isLoading]);

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
                // Determine which JSON to load based on readingStyle setting
                let quranModule;

                // You will need to import useSettings at the top if not already imported
                // readingStyle is available from useSettings() hook

                // Since this effect depends on readingStyle, we need to access it inside
                // If standard hook rules apply, useSettings is already called at top level
                // We just need to use the value here.

                if (readingStyle === 'warsh') {
                    // We will assume quran-warsh.json is available in src/lib
                    // If it doesn't exist yet, we must ensure it is created or handle error
                    try {
                        quranModule = await import("@/lib/quran-warsh.json");
                    } catch (e) {
                        console.warn("Warsh JSON not found, falling back to Uthmani", e);
                        quranModule = await import("@/lib/quran-uthmani.json");
                    }
                } else {
                    quranModule = await import("@/lib/quran-uthmani.json");
                }

                // Accessing default export for JSON module
                const data = (quranModule as { default?: { data: { surahs: SurahData[] } }, data?: { surahs: SurahData[] } });
                const surahs = data.default?.data?.surahs || data.data?.surahs;

                if (!surahs || !Array.isArray(surahs)) {
                    console.error("Invalid Quran Data Structure:", data);
                    throw new Error("Invalid Quran Data Structure");
                }

                const surah = surahs.find((s: SurahData) => s.number === Number(surahId));

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

        // Handle Autoplay from URL (e.g. from previous Surah)
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get("autoplay") === "true") {
            setTimeout(() => {
                setShowPlayer(true);
                // No need to set isPlaying here, standard player init handles it if we pass a prop or just rely on mount
                // But SurahAudioPlayer starts paused by default unless we tell it otherwise.
                // We'll trust the user to hit play OR better, we passed 'jumpToAyah' maybe?
                // Actually, let's just show the player. Ideally we'd auto-play but browser policies might block unmuted autoplay.
                // For now, let's just make sure player is OPEN.
                // To force play, we might need a prop on SurahAudioPlayer like 'autoPlay={true}'
            }, 500);
        }
    }, [surahId, language, location.search, readingStyle]);

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



    // Map font sizes based on selected font for optical consistency
    const getFontSize = (size: FontSize, font: string) => {
        const baseSize = size === 'small' ? 24 : size === 'medium' ? 32 : 40;
        // IndoPak usually needs to be slightly smaller or larger depending on the font file
        if (font === 'indopak') return baseSize * 1.1;
        return baseSize;
    };

    const getFontFamilyClass = (font: string) => {
        switch (font) {
            case 'uthmani': return 'font-quran'; // Original Hafs
            case 'indopak': return 'font-indopak'; // Needs to be added to index.css
            case 'amiri_quran': return 'font-amiri';
            default: return 'font-quran';
        }
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
    const totalPages = surahData ? Math.ceil(surahData.ayahs.length / ITEMS_PER_PAGE) : 0;
    const currentAyahs = surahData ? surahData.ayahs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    ) : [];

    return (
        <div className="min-h-screen relative overflow-hidden bg-paper-warm" dir={language === "ar" ? "rtl" : "ltr"}>
            {/* Texture Overlay */}
            <div
                className="absolute inset-0 z-0 opacity-80 pointer-events-none mix-blend-multiply"
                style={{ backgroundImage: 'url("/textures/warm-paper.png")', backgroundSize: 'cover' }}
            />

            <div className="relative z-10 pb-40 pt-safe pt-8 px-4 md:px-8 animate-fade-in">
                {/* Minimalist Header */}
                <div className="flex items-center justify-between mb-8 max-w-4xl mx-auto px-2">
                    <Link to="/quran">
                        <Button variant="ghost" size="icon" className="rounded-full text-emerald-deep/60 hover:text-emerald-deep hover:bg-emerald-deep/5 transition-colors">
                            <ArrowRight className={language === "ar" ? "rotate-180" : ""} />
                        </Button>
                    </Link>

                    <div className="flex flex-col items-center">
                        <h1 className="text-3xl font-bold font-tajawal text-emerald-deep drop-shadow-sm">{surahInfo?.name}</h1>
                        <p className="text-xs text-emerald-deep/50 font-medium tracking-wide font-sans">{surahInfo?.englishName}</p>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePageChange(1)}
                        className="rounded-full text-emerald-deep/60 hover:text-emerald-deep hover:bg-emerald-deep/5 transition-colors"
                        title={language === "ar" ? "ابدأ من جديد" : "Start Over"}
                    >
                        <RotateCcw className="w-5 h-5" />
                    </Button>
                </div>

                {/* Reading Frame */}
                <div className="relative max-w-4xl mx-auto">
                    {/* Frame Container - Simple & Elegant */}
                    {/* Frame Container - Simple & Elegant (Optimized) */}
                    <div className="relative rounded-[1.5rem] bg-white/60 shadow-sm border border-emerald-deep/5 overflow-hidden">

                        <div className="p-6 md:p-12 relative z-10">
                            {surahInfo?.number !== 1 && surahInfo?.number !== 9 && currentPage === 1 && (
                                <div className="text-center mb-12">
                                    <h2 className="text-2xl font-amiri text-emerald-deep/80 drop-shadow-sm inline-block pb-4 border-b border-emerald-deep/10">
                                        بسم الله الرحمن الرحيم
                                    </h2>
                                </div>
                            )}

                            <div
                                className={`space-y-10 leading-[2.5] text-center ${getFontFamilyClass(quranFont || 'uthmani')}`}
                                style={{ fontSize: `${getFontSize(fontSize, quranFont || 'uthmani')}px`, color: '#1A1A1A', contain: "content" }}
                            >
                                {currentAyahs.map((ayah, index) => {
                                    const actualAyahNumber = ayah.numberInSurah;
                                    const isPlaying = playingAyahNumber === actualAyahNumber;

                                    return (
                                        <span key={ayah.number} className="ayah-container" data-ayah-number={actualAyahNumber}>
                                            <AyahItem
                                                ayah={ayah}
                                                surahNumber={surahInfo?.number || 0}
                                                isPlaying={isPlaying}
                                                fontSize={fontSize}
                                                quranFont={quranFont || 'uthmani'}
                                                onPlay={() => {
                                                    setJumpToAyah(actualAyahNumber);
                                                    setShowPlayer(true);
                                                }}
                                                setRef={(el) => (ayahRefs.current[actualAyahNumber] = el)}
                                                highlightText={highlightText}
                                                setSelectedAyah={setSelectedAyah}
                                                language={language}
                                            />
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-8 px-4 max-w-2xl mx-auto">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                const newPage = currentPage - 1;
                                handlePageChange(newPage);
                                if (isAudioPlaying) setJumpToAyah(((newPage - 1) * ITEMS_PER_PAGE) + 1);
                            }}
                            disabled={currentPage === 1}
                            className="text-emerald-deep/70 hover:text-emerald-deep hover:bg-emerald-deep/5 font-tajawal"
                        >
                            <ArrowRight className={`w-4 h-4 mx-2 ${language === "ar" ? "rotate-0" : "rotate-180"}`} />
                            {language === "ar" ? "السابقة" : "Prev"}
                        </Button>

                        <span className="text-sm font-medium text-emerald-deep/40 font-mono tracking-widest bg-emerald-deep/5 px-4 py-1 rounded-full">
                            {currentPage} / {totalPages}
                        </span>

                        <Button
                            variant="ghost"
                            onClick={() => {
                                const newPage = currentPage + 1;
                                handlePageChange(newPage);
                                if (isAudioPlaying) setJumpToAyah(((newPage - 1) * ITEMS_PER_PAGE) + 1);
                            }}
                            disabled={currentPage === totalPages}
                            className="text-emerald-deep/70 hover:text-emerald-deep hover:bg-emerald-deep/5 font-tajawal"
                        >
                            {language === "ar" ? "التالية" : "Next"}
                            <ArrowRight className={`w-4 h-4 mx-2 ${language === "ar" ? "rotate-180" : "rotate-0"}`} />
                        </Button>
                    </div>
                )}

                {/* Audio Player */}
                {surahId && surahData && showPlayer && (
                    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe bg-gradient-to-t from-cream via-cream/95 to-transparent pointer-events-none">
                        <div className="max-w-xl mx-auto pointer-events-auto">
                            <SurahAudioPlayer
                                surahNumber={Number(surahId)}
                                totalAyahs={surahData.ayahs.length}
                                onAyahChange={setPlayingAyahNumber}
                                jumpToAyah={jumpToAyah}
                                onClose={() => setShowPlayer(false)}
                                onPlayChange={setIsAudioPlaying}
                                autoPlay={new URLSearchParams(location.search).get("autoplay") === "true"}
                                onSurahEnd={() => {
                                    if (surahData.number < 114) {
                                        // Navigate to next Surah
                                        const nextSurahId = surahData.number + 1;
                                        navigate(`/quran/${nextSurahId}?autoplay=true`);
                                    } else {
                                        // End of Quran, stop playing
                                        setIsAudioPlaying(false);
                                        setShowPlayer(false);
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Bottom Surah Navigation */}
                <div className="flex justify-center gap-12 mt-12 max-w-4xl mx-auto opacity-50 hover:opacity-100 transition-opacity">
                    {surahInfo && surahInfo.number > 1 ? (
                        <Link to={`/quran/${surahInfo.number - 1}`}>
                            <Button variant="link" className="text-emerald-deep/60 hover:text-emerald-deep font-tajawal">
                                {language === "ar" ? "السورة السابقة" : "Previous Surah"}
                            </Button>
                        </Link>
                    ) : null}

                    {surahInfo && surahInfo.number < 114 ? (
                        <Link to={`/quran/${surahInfo.number + 1}`}>
                            <Button variant="link" className="text-emerald-deep/60 hover:text-emerald-deep font-tajawal">
                                {language === "ar" ? "السورة التالية" : "Next Surah"}
                            </Button>
                        </Link>
                    ) : null}
                </div>

                {/* Floating Back Button */}
                <div className="fixed bottom-6 left-4 z-50 animate-fade-in-up">
                    <Link to="/quran">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="w-12 h-12 rounded-full shadow-lg bg-emerald-deep text-white hover:bg-emerald-deep/90 border border-white/10"
                        >
                            <ArrowRight className={`w-5 h-5 ${language === "ar" ? "rotate-180" : ""}`} />
                        </Button>
                    </Link>
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
        </div>
    );
};
