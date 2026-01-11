import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, BookOpen, Clock, Target, CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { triggerHaptic } from "@/lib/haptics";
import confetti from "canvas-confetti";

interface KhatmaState {
    isActive: boolean;
    startDate: string;
    targetDays: number;
    currentPage: number;
    totalPages: number;
    dailyTargetPages: number;
}

const TOTAL_QURAN_PAGES = 604;

export const KhatmaPlanner = () => {
    const { t, language } = useLanguage();
    const [khatma, setKhatma] = useState<KhatmaState>({
        isActive: false,
        startDate: "",
        targetDays: 30,
        currentPage: 0,
        totalPages: TOTAL_QURAN_PAGES,
        dailyTargetPages: 20
    });

    const [inputDays, setInputDays] = useState(30);

    useEffect(() => {
        // Load saved khatma state
        const savedKhatma = localStorage.getItem("khatma-planner");
        if (savedKhatma) {
            setKhatma(JSON.parse(savedKhatma));
        }
    }, []);

    const saveKhatma = (newState: KhatmaState) => {
        setKhatma(newState);
        localStorage.setItem("khatma-planner", JSON.stringify(newState));
    };

    const startNewKhatma = () => {
        const daily = Math.ceil(TOTAL_QURAN_PAGES / inputDays);
        const newState: KhatmaState = {
            isActive: true,
            startDate: new Date().toISOString(),
            targetDays: inputDays,
            currentPage: 0,
            totalPages: TOTAL_QURAN_PAGES,
            dailyTargetPages: daily
        };
        saveKhatma(newState);
        toast.success(language === "ar" ? "تم بدء الختمة بنجاح! وفقك الله" : "Khatma started! May Allah grant you success");
        triggerHaptic();
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    const updateProgress = (pages: number) => {
        let newPage = khatma.currentPage + pages;
        if (newPage > TOTAL_QURAN_PAGES) newPage = TOTAL_QURAN_PAGES;
        if (newPage < 0) newPage = 0;

        const newState = { ...khatma, currentPage: newPage };
        saveKhatma(newState);
        triggerHaptic();

        if (newPage === TOTAL_QURAN_PAGES) {
            toast.success(language === "ar" ? "مبارك! أتممت ختمة القرآن الكريم" : "Mabrouk! You have completed the Holy Quran");
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 }
            });
        }
    };

    const resetKhatma = () => {
        if (confirm(language === "ar" ? "هل أنت متأكد من إلغاء الختمة الحالية؟" : "Are you sure you want to cancel the current Khatma?")) {
            const newState: KhatmaState = {
                isActive: false,
                startDate: "",
                targetDays: 30,
                currentPage: 0,
                totalPages: TOTAL_QURAN_PAGES,
                dailyTargetPages: 20
            };
            saveKhatma(newState);
            toast.info(language === "ar" ? "تم إلغاء الختمة" : "Khatma cancelled");
        }
    };

    const calculateExpectedDate = () => {
        const d = new Date();
        d.setDate(d.getDate() + inputDays);
        return d.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US");
    };

    const progressPercentage = Math.round((khatma.currentPage / TOTAL_QURAN_PAGES) * 100);

    // Calculate days remaining
    const getDaysRemaining = () => {
        if (!khatma.startDate) return 0;
        const start = new Date(khatma.startDate);
        const targetDate = new Date(start);
        targetDate.setDate(start.getDate() + khatma.targetDays);
        const today = new Date();
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    if (!khatma.isActive) {
        return (
            <Card className="p-6 islamic-pattern border-emerald-deep/20 bg-emerald-deep/5">
                <div className="space-y-6 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-deep/10 flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-emerald-deep" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold font-amiri text-emerald-deep">
                        {language === "ar" ? "ختمة القرآن الميسرة" : "Smart Khatma Planner"}
                    </h3>
                    <p className="text-muted-foreground">
                        {language === "ar"
                            ? "حدد المدة التي تريد ختم القرآن فيها، وسنحسب لك الورد اليومي."
                            : "Set your target duration, and we'll calculate your daily reading goal."}
                    </p>

                    <div className="space-y-4 bg-white/50 p-4 rounded-xl border border-emerald-deep/10">
                        <div className="space-y-2">
                            <label className="text-sm font-medium font-amiri text-emerald-deep">
                                {language === "ar" ? "في كم يوم تريد أن تختم؟" : "Target Days"}
                            </label>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline" size="sm"
                                    onClick={() => setInputDays(Math.max(3, inputDays - 1))}
                                    className="h-10 w-10 text-xl font-bold"
                                >
                                    -
                                </Button>
                                <div className="flex-1 text-center">
                                    <span className="text-3xl font-bold text-emerald-deep">{inputDays}</span>
                                    <span className="text-sm text-muted-foreground block">
                                        {language === "ar" ? "يوم" : "Days"}
                                    </span>
                                </div>
                                <Button
                                    variant="outline" size="sm"
                                    onClick={() => setInputDays(Math.min(365, inputDays + 1))}
                                    className="h-10 w-10 text-xl font-bold"
                                >
                                    +
                                </Button>
                            </div>
                            <Slider
                                value={[inputDays]}
                                min={3}
                                max={60}
                                step={1}
                                onValueChange={(val) => setInputDays(val[0])}
                                className="py-4"
                            />
                        </div>

                        <div className="flex justify-between items-center text-sm p-3 bg-gold-matte/10 rounded-lg border border-gold-matte/20">
                            <div className="text-center flex-1">
                                <p className="text-muted-foreground text-xs">{language === "ar" ? "الورد اليومي" : "Daily Goal"}</p>
                                <p className="font-bold text-lg text-emerald-deep">
                                    {Math.ceil(TOTAL_QURAN_PAGES / inputDays)} {language === "ar" ? "صفحة" : "pages"}
                                </p>
                            </div>
                            <div className="w-[1px] h-8 bg-gold-matte/20"></div>
                            <div className="text-center flex-1">
                                <p className="text-muted-foreground text-xs">{language === "ar" ? "تاريخ الختم" : "Finish Date"}</p>
                                <p className="font-bold text-emerald-deep">{calculateExpectedDate()}</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={startNewKhatma}
                        className="w-full bg-emerald-deep hover:bg-emerald-deep/90 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                        {language === "ar" ? "ابدأ الختمة الآن" : "Start Khatma Now"}
                    </Button>
                </div>
            </Card>
        );
    }

    // Active Khatma View
    return (
        <Card className="p-6 islamic-pattern border-emerald-deep/20">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <Badge variant="outline" className="mb-2 bg-emerald-deep/5 text-emerald-deep border-emerald-deep/20 gap-1">
                        <Target className="w-3 h-3" />
                        {language === "ar" ? "ختمة جارية" : "Active Khatma"}
                    </Badge>
                    <h3 className="text-2xl font-bold font-amiri text-emerald-deep">
                        {language === "ar" ? "متابعة الختمة" : "Track Progress"}
                    </h3>
                </div>
                <Button variant="ghost" size="icon" onClick={resetKhatma} className="text-red-400 hover:text-red-600 hover:bg-red-50">
                    <RotateCcw className="w-4 h-4" />
                </Button>
            </div>

            <div className="space-y-6">

                {/* Progress Circle & Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-emerald-deep to-emerald-800 rounded-2xl p-4 text-white hover:shadow-lg transition-transform hover:scale-[1.02]">
                        <div className="flex items-center gap-2 mb-2 opacity-80">
                            <BookOpen className="w-4 h-4" />
                            <span className="text-sm font-medium">{language === "ar" ? "الصفحة الحالية" : "Current Page"}</span>
                        </div>
                        <div className="text-4xl font-bold mb-1">{khatma.currentPage}</div>
                        <div className="text-xs opacity-70">{language === "ar" ? `من ${TOTAL_QURAN_PAGES} صفحة` : `of ${TOTAL_QURAN_PAGES} pages`}</div>
                    </div>

                    <div className="col-span-2 sm:col-span-1 bg-white border border-emerald-deep/10 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-2 mb-2 text-emerald-deep/70">
                            <Target className="w-4 h-4" />
                            <span className="text-sm font-medium">{language === "ar" ? "الورد اليومي" : "Daily Goal"}</span>
                        </div>
                        <div className="flex items-end gap-2">
                            <div className="text-3xl font-bold text-emerald-deep">{khatma.dailyTargetPages}</div>
                            <span className="text-sm text-muted-foreground mb-1.5">{language === "ar" ? "صفحة" : "pages"}</span>
                        </div>
                        <div className="mt-2 text-xs text-orange-600 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getDaysRemaining()} {language === "ar" ? "يوماً متبقياً" : "days left"}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium text-emerald-deep">
                        <span>{progressPercentage}%</span>
                        <span>{language === "ar" ? "مكتمل" : "Completed"}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3 bg-emerald-deep/10" />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                    <Button
                        onClick={() => updateProgress(1)}
                        className="w-full bg-emerald-deep hover:bg-emerald-deep/90 h-12 text-lg"
                    >
                        {language === "ar" ? "أتممت صفحة (+1)" : "Read 1 Page (+1)"}
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            onClick={() => updateProgress(khatma.dailyTargetPages)}
                            className="border-gold-matte text-gold-matte hover:bg-gold-matte/10"
                        >
                            {language === "ar" ? `أتممت الورد (${khatma.dailyTargetPages}+)` : `Full Day Goal (${khatma.dailyTargetPages}+)`}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => updateProgress(-1)}
                            className="border-red-200 text-red-400 hover:bg-red-50 hover:text-red-500"
                        >
                            {language === "ar" ? "تراجع (-1)" : "Undo (-1)"}
                        </Button>
                    </div>
                </div>

            </div>
        </Card>
    );
};
