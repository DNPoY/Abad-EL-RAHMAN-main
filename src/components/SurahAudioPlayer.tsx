import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Loader2, SkipForward, SkipBack, Download, Check } from "lucide-react";
import { RECITERS } from "@/lib/audio-constants";
import { useLanguage } from "@/contexts/LanguageContext";
import { KeepAwake } from '@capacitor-community/keep-awake';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { toast } from "sonner";

interface SurahAudioPlayerProps {
    surahNumber: number;
    totalAyahs: number;
    onAyahChange: (ayahNumber: number | null) => void;
    jumpToAyah?: number | null;
    onClose?: () => void;
    onPlayChange?: (isPlaying: boolean) => void;
    onSurahEnd?: () => void;
    autoPlay?: boolean;
}

export const SurahAudioPlayer = ({ surahNumber, totalAyahs, onAyahChange, jumpToAyah, onClose, onPlayChange, onSurahEnd, autoPlay = false }: SurahAudioPlayerProps) => {
    const { language, t } = useLanguage();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAyah, setCurrentAyah] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedReciterId, setSelectedReciterId] = useState<string>(() => {
        return localStorage.getItem("selectedReciterId") || RECITERS[0].id;
    });

    useEffect(() => {
        localStorage.setItem("selectedReciterId", selectedReciterId);
    }, [selectedReciterId]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloaded, setIsDownloaded] = useState(false);

    // Ref to avoid stale closure issues
    const onAyahChangeRef = useRef(onAyahChange);
    const onPlayChangeRef = useRef(onPlayChange);
    const onSurahEndRef = useRef(onSurahEnd);

    useEffect(() => {
        onAyahChangeRef.current = onAyahChange;
        onPlayChangeRef.current = onPlayChange;
        onSurahEndRef.current = onSurahEnd;
    }, [onAyahChange, onPlayChange, onSurahEnd]);

    // Check if Surah is already downloaded
    const checkDownloadStatus = useCallback(async () => {
        if (!Capacitor.isNativePlatform()) return;
        try {
            // Check if directory exists for first ayah, assumption if first exists, likely downloaded or started
            // Ideally we check a marker file or the folder availability
            const path = `quran/${selectedReciterId}/${surahNumber}`;
            try {
                // Try to read directory - if it throws, it doesn't exist
                await Filesystem.readdir({
                    path,
                    directory: Directory.Data
                });
                // If we get here, folder exists. Let's check if we have files. 
                // Simple check: isDownloaded = true if folder exists. 
                // More robust: check if file count matches totalAyahs.
                setIsDownloaded(true);
            } catch {
                setIsDownloaded(false);
            }
        } catch (e) {
            console.error("Error checking download status", e);
            setIsDownloaded(false);
        }
    }, [selectedReciterId, surahNumber]);

    useEffect(() => {
        checkDownloadStatus();
    }, [checkDownloadStatus]);


    const downloadSurah = async () => {
        if (!Capacitor.isNativePlatform()) {
            toast.error(language === 'ar' ? "التحميل متاح فقط في التطبيق" : "Download only available in App");
            return;
        }

        setIsDownloading(true);
        setDownloadProgress(0);
        const reciter = RECITERS.find(r => r.id === selectedReciterId) || RECITERS[0];

        try {
            const baseDir = `quran/${selectedReciterId}/${surahNumber}`;
            // Create directory if not exists
            try {
                await Filesystem.mkdir({
                    path: baseDir,
                    directory: Directory.Data,
                    recursive: true
                });
            } catch (e) {
                // Ignore error if dir exists
            }

            for (let i = 1; i <= totalAyahs; i++) {
                const paddedSurah = surahNumber.toString().padStart(3, "0");
                const paddedAyah = i.toString().padStart(3, "0");
                const remoteUrl = `${reciter.url}${paddedSurah}${paddedAyah}.mp3`;
                const fileName = `${paddedAyah}.mp3`;

                // Perform Download
                await Filesystem.downloadFile({
                    path: `${baseDir}/${fileName}`,
                    directory: Directory.Data,
                    url: remoteUrl
                });

                setDownloadProgress(Math.round((i / totalAyahs) * 100));
            }

            setIsDownloaded(true);
            toast.success(language === 'ar' ? "تم تحميل السورة بنجاح" : "Surah downloaded successfully");

        } catch (e) {
            console.error("Download failed", e);
            toast.error(language === 'ar' ? "فشل التحميل" : "Download failed");
            // Optional: Cleanup partial download? 
        } finally {
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    };


    // Notify parent about play state change
    useEffect(() => {
        if (onPlayChangeRef.current) {
            onPlayChangeRef.current(isPlaying);
        }
    }, [isPlaying]);

    useEffect(() => {
        setCurrentAyah(1);
        setIsPlaying(autoPlay);
    }, [surahNumber, autoPlay]);

    // Handle external jump requests
    useEffect(() => {
        if (jumpToAyah) {
            setCurrentAyah(jumpToAyah);
            setIsPlaying(true);
        }
    }, [jumpToAyah]);

    // Construct URL for specific Ayah (Offline First)
    const getAyahUrl = useCallback(async (surah: number, ayah: number) => {
        const reciter = RECITERS.find(r => r.id === selectedReciterId) || RECITERS[0];
        const paddedSurah = surah.toString().padStart(3, "0");
        const paddedAyah = ayah.toString().padStart(3, "0");
        const remoteUrl = `${reciter.url}${paddedSurah}${paddedAyah}.mp3`;
        const fileName = `${paddedAyah}.mp3`;

        // OFFLINE CHECK: Only check filesystem if we know the Surah is downloaded
        // This prevents the "spinning" hang by avoiding filesystem calls for streaming-only users
        if (Capacitor.isNativePlatform() && isDownloaded) {
            try {
                const path = `quran/${selectedReciterId}/${surah}/${fileName}`;
                // Check if file exists first (using stat usually, but getUri works if we handle error)
                const fileInfo = await Filesystem.getUri({
                    path,
                    directory: Directory.Data
                });
                if (fileInfo.uri) {
                    return Capacitor.convertFileSrc(fileInfo.uri);
                }
            } catch (e) {
                // File doesn't exist locally or error accessing it, fall back to remote safely
                // console.warn("Local file check failed, using remote", e);
            }
        }

        return remoteUrl;
    }, [selectedReciterId, isDownloaded]);

    // Track the implementation request ID to invalidate stale async operations
    const requestIdRef = useRef(0);

    // Main Audio Lifecycle Effect
    useEffect(() => {
        const requestId = ++requestIdRef.current;
        let isCancelled = false;

        const setupAudio = async () => {
            setIsLoading(true);
            if (!audioRef.current) audioRef.current = new Audio();
            const audio = audioRef.current;

            try {
                // 1. Get URL
                const url = await getAyahUrl(surahNumber, currentAyah);

                // Check cancellation or stale request
                if (isCancelled || requestId !== requestIdRef.current) return;

                // 2. Set Source
                // Only reset src if it changed to avoid reloading same file
                if (audio.src !== url) {
                    audio.src = url;
                    audio.load();
                } else {
                    // Source matched, we might not get 'canplay' again if already ready.
                    // Assume strictly remote, so we wait for event? 
                    // Or if readyState is HIGH, complete load.
                    if (audio.readyState >= 3) {
                        setIsLoading(false);
                    }
                }

                // 3. Set Handlers
                audio.onended = () => {
                    if (isCancelled || requestId !== requestIdRef.current) return;
                    if (currentAyah < totalAyahs) {
                        setCurrentAyah(c => c + 1);
                    } else {
                        if (onSurahEndRef.current) onSurahEndRef.current();
                        else {
                            setIsPlaying(false);
                            setCurrentAyah(1);
                            onAyahChangeRef.current(null);
                        }
                    }
                };

                audio.onerror = (e) => {
                    console.error("Audio Error", e);
                    if (!isCancelled && requestId === requestIdRef.current) {
                        setIsLoading(false);
                        setIsPlaying(false);
                    }
                };

                audio.oncanplay = () => {
                    if (!isCancelled && requestId === requestIdRef.current) {
                        setIsLoading(false);
                    }
                };

                // 4. Play if supposed to be playing
                if (isPlaying) {
                    const playPromise = audio.play();
                    if (playPromise !== undefined) {
                        playPromise
                            .then(() => KeepAwake.keepAwake())
                            .catch(e => {
                                // Auto-pause if strictly not allowed or aborted
                                if (e.name === 'NotAllowedError') {
                                    setIsPlaying(false);
                                    KeepAwake.allowSleep();
                                }
                            });
                    }
                    onAyahChangeRef.current(currentAyah);
                } else {
                    audio.pause();
                    KeepAwake.allowSleep();
                    onAyahChangeRef.current(null);
                }

            } catch (e) {
                console.error("Setup failed", e);
                setIsLoading(false);
                setIsPlaying(false);
            }
        };

        setupAudio();

        return () => {
            isCancelled = true;
            // Cleanup provided by parent unmount effect mostly, 
            // but we ensure listeners don't fire for dead component
        };
    }, [surahNumber, currentAyah, selectedReciterId, getAyahUrl, totalAyahs, isPlaying]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
                KeepAwake.allowSleep();
            }
        };
    }, []);

    const togglePlay = () => setIsPlaying(!isPlaying);

    const nextAyah = () => {
        if (currentAyah < totalAyahs) setCurrentAyah(c => c + 1);
    };

    const prevAyah = () => {
        if (currentAyah > 1) setCurrentAyah(c => c - 1);
    };

    return (
        <div className="w-full bg-background/95 backdrop-blur-md border-t border-border p-4 shadow-lg animate-in slide-in-from-bottom rounded-t-2xl">
            <div className="container max-w-2xl mx-auto flex flex-col gap-3 relative">

                {/* Compact Mobile Layout: 2 Rows */}
                <div className="flex flex-col gap-3">
                    {/* Row 1: Playback Controls (Centered) */}
                    <div className="flex items-center justify-center gap-6 w-full">
                        <Button variant="ghost" size="icon" onClick={prevAyah} disabled={currentAyah === 1}>
                            <SkipBack className="h-6 w-6" />
                        </Button>

                        <Button
                            variant="default"
                            size="icon"
                            onClick={togglePlay}
                            disabled={isLoading}
                            className="h-14 w-14 rounded-full shadow-lg shadow-primary/30 transform hover:scale-105 transition-all"
                        >
                            {isLoading ? (
                                <Loader2 className="h-7 w-7 animate-spin" />
                            ) : isPlaying ? (
                                <Pause className="h-7 w-7 fill-current" />
                            ) : (
                                <Play className="h-7 w-7 fill-current ml-1" />
                            )}
                        </Button>

                        <Button variant="ghost" size="icon" onClick={nextAyah} disabled={currentAyah === totalAyahs}>
                            <SkipForward className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Row 2: Reciter Selection & Download (Space Between) */}
                    <div className="flex items-center justify-between gap-3 bg-muted/20 p-2 rounded-xl">

                        {/* Reciter Select */}
                        <div className="flex-1 min-w-[120px]">
                            <Select value={selectedReciterId} onValueChange={setSelectedReciterId}>
                                <SelectTrigger className="w-full text-xs h-9 bg-transparent border-0 ring-0 focus:ring-0 shadow-none px-2 font-medium">
                                    <SelectValue placeholder="Select Reciter" />
                                </SelectTrigger>
                                <SelectContent>
                                    {RECITERS.map((reciter) => (
                                        <SelectItem key={reciter.id} value={reciter.id}>
                                            {language === 'ar' ? reciter.arabicName : reciter.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-px h-6 bg-border mx-1" />

                        <div className="flex items-center gap-2">
                            {/* Ayah Counter */}
                            <span className="text-[10px] font-mono whitespace-nowrap text-muted-foreground">
                                {currentAyah}/{totalAyahs}
                            </span>

                            {/* Download Button */}
                            {Capacitor.isNativePlatform() && (
                                <>
                                    <div className="w-px h-6 bg-border mx-1" />
                                    {isDownloading ? (
                                        <div className="flex items-center gap-1.5 px-1">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                                            <span className="text-[10px] font-mono text-primary">{downloadProgress}%</span>
                                        </div>
                                    ) : isDownloaded ? (
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-50" title={language === 'ar' ? 'تم التحميل' : 'Downloaded'}>
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button variant="ghost" size="icon" onClick={downloadSurah} className="h-8 w-8 text-muted-foreground hover:text-primary" title={language === 'ar' ? 'تحميل السورة' : 'Download Surah'}>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
