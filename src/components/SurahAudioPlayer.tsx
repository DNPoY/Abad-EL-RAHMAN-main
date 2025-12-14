import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Loader2, SkipForward, SkipBack } from "lucide-react";
import { RECITERS } from "@/lib/audio-constants";
import { useLanguage } from "@/contexts/LanguageContext";

interface SurahAudioPlayerProps {
    surahNumber: number;
    totalAyahs: number;
    onAyahChange: (ayahNumber: number | null) => void;
}

export const SurahAudioPlayer = ({ surahNumber, totalAyahs, onAyahChange }: SurahAudioPlayerProps) => {
    const { language } = useLanguage();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAyah, setCurrentAyah] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedReciterId, setSelectedReciterId] = useState<string>(RECITERS[0].id);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Construct URL for specific Ayah
    const getAyahUrl = (surah: number, ayah: number) => {
        const reciter = RECITERS.find(r => r.id === selectedReciterId) || RECITERS[0];
        const paddedSurah = surah.toString().padStart(3, "0");
        const paddedAyah = ayah.toString().padStart(3, "0");
        return `${reciter.url}${paddedSurah}${paddedAyah}.mp3`;
    };

    // Initialize/Update Audio Source when Ayah changes
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
        }

        const audio = audioRef.current;
        const url = getAyahUrl(surahNumber, currentAyah);

        // Only update src if it's different to prevent reload spam
        if (audio.src !== url) {
            audio.src = url;
            setIsLoading(true);
            if (isPlaying) {
                audio.play().catch(e => console.error("Play error", e));
            }
        }

        const handleEnded = () => {
            if (currentAyah < totalAyahs) {
                setCurrentAyah(prev => prev + 1); // Play next
            } else {
                setIsPlaying(false);
                setCurrentAyah(1); // Reset to start
                onAyahChange(null);
            }
        };

        const handleCanPlay = () => setIsLoading(false);
        const handleError = () => {
            setIsLoading(false);
            setIsPlaying(false);
        };

        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);

        // Notify parent to highlight this ayah
        if (isPlaying) {
            onAyahChange(currentAyah);
        } else {
            onAyahChange(null);
        }

        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('error', handleError);
        };
    }, [surahNumber, currentAyah, selectedReciterId, isPlaying]); // Added isPlaying dependency

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
                onAyahChange(null);
            }
        };
    }, []);

    // Handle Play/Pause
    useEffect(() => {
        if (!audioRef.current) return;
        if (isPlaying && audioRef.current.paused) {
            audioRef.current.play().catch(() => setIsPlaying(false));
        } else if (!isPlaying && !audioRef.current.paused) {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    const togglePlay = () => setIsPlaying(!isPlaying);

    const nextAyah = () => {
        if (currentAyah < totalAyahs) setCurrentAyah(c => c + 1);
    };

    const prevAyah = () => {
        if (currentAyah > 1) setCurrentAyah(c => c - 1);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border p-4 shadow-lg z-50 animate-in slide-in-from-bottom">
            <div className="container max-w-2xl mx-auto flex flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={prevAyah} disabled={currentAyah === 1}>
                            <SkipBack className="h-5 w-5" />
                        </Button>

                        <Button
                            variant="default"
                            size="icon"
                            onClick={togglePlay}
                            disabled={isLoading}
                            className="h-12 w-12 rounded-full"
                        >
                            {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : isPlaying ? (
                                <Pause className="h-6 w-6 fill-current" />
                            ) : (
                                <Play className="h-6 w-6 fill-current ml-1" />
                            )}
                        </Button>

                        <Button variant="ghost" size="icon" onClick={nextAyah} disabled={currentAyah === totalAyahs}>
                            <SkipForward className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="flex-1 flex flex-col gap-1">
                        <Select value={selectedReciterId} onValueChange={setSelectedReciterId}>
                            <SelectTrigger className="w-full text-xs h-8">
                                <SelectValue placeholder="Select Reciter" />
                            </SelectTrigger>
                            <SelectContent>
                                {RECITERS.map((reciter) => (
                                    <SelectItem key={reciter.id} value={reciter.id}>
                                        {reciter.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="text-xs text-center text-muted-foreground w-full">
                            {language === 'ar' ? 'الآية' : 'Ayah'} {currentAyah} / {totalAyahs}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
