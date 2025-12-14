import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, StickyNote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const HijriCalendar = () => {
    const { language } = useLanguage();
    const [currentDate, setCurrentDate] = useState(new Date());

    // Notes System
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [noteContent, setNoteContent] = useState("");

    // Long Press Logic
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isLongPress = useRef(false);

    // Load Notes
    useEffect(() => {
        const saved = localStorage.getItem("calendar_notes");
        if (saved) {
            try {
                setNotes(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load notes", e);
            }
        }
    }, []);

    const saveNote = () => {
        if (!selectedDate) return;
        const key = selectedDate.toDateString();

        const newNotes = { ...notes };
        if (noteContent.trim()) {
            newNotes[key] = noteContent;
        } else {
            delete newNotes[key];
        }

        setNotes(newNotes);
        localStorage.setItem("calendar_notes", JSON.stringify(newNotes));
        setIsDialogOpen(false);
        toast.success(language === 'ar' ? "تم حفظ الملاحظة" : "Note saved");
    };

    const handleDayInteractionStart = (date: Date) => {
        isLongPress.current = false;
        timerRef.current = setTimeout(() => {
            isLongPress.current = true;
            openNoteDialog(date);
        }, 500); // 500ms long press
    };

    const handleDayInteractionEnd = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const openNoteDialog = (date: Date) => {
        setSelectedDate(date);
        setNoteContent(notes[date.toDateString()] || "");
        setIsDialogOpen(true);
        // Vibrate if possible
        if (navigator.vibrate) navigator.vibrate(50);
    };

    // Arabic numbers helper
    const toArabic = (n: number) => n.toLocaleString("ar-EG").replace(/,/g, "");

    // Format Helpers using Native Intl
    const getHijriMonthName = (date: Date) => {
        return new Intl.DateTimeFormat(language === "ar" ? "ar-SA" : "en-US", {
            calendar: "islamic-umalqura",
            month: "long",
        }).format(date);
    };

    const getHijriYear = (date: Date) => {
        return new Intl.DateTimeFormat(language === "ar" ? "ar-SA" : "en-US", {
            calendar: "islamic-umalqura",
            year: "numeric",
        }).format(date);
    };

    const getHijriDay = (date: Date) => {
        const day = new Intl.DateTimeFormat("en-US", {
            calendar: "islamic-umalqura",
            day: "numeric",
        }).format(date);
        return parseInt(day, 10);
    };

    const getHijriMonthIndex = (date: Date) => {
        const parts = new Intl.DateTimeFormat("en-US", {
            calendar: "islamic-umalqura",
            month: "numeric"
        }).formatToParts(date);
        const m = parts.find(p => p.type === 'month')?.value;
        return m ? parseInt(m) - 1 : 0;
    };

    // Navigation
    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    // Generate Calendar Grid
    const renderCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        const days = [];

        // Empty slots
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="h-10 md:h-14" />);
        }

        // Days
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const hijriDay = getHijriDay(date);
            const hijriMonth = getHijriMonthIndex(date);

            const isToday = new Date().toDateString() === date.toDateString();
            const isFriday = date.getDay() === 5;
            const isWhiteDay = [13, 14, 15].includes(hijriDay);
            const hasNote = !!notes[date.toDateString()];

            // Holidays Logic (Simple check)
            let holidayName = null;
            if (hijriMonth === 8 && hijriDay === 1) holidayName = language === 'ar' ? "رمضان" : "Ramadan";
            if (hijriMonth === 9 && hijriDay === 1) holidayName = language === 'ar' ? "عيد الفطر" : "Eid Fitr";
            if (hijriMonth === 11 && hijriDay === 9) holidayName = language === 'ar' ? "عرفة" : "Arafat";
            if (hijriMonth === 11 && hijriDay === 10) holidayName = language === 'ar' ? "عيد الأضحى" : "Eid Adha";
            if (hijriMonth === 0 && hijriDay === 1) holidayName = language === 'ar' ? "رأس السنة" : "New Year";
            if (hijriMonth === 2 && hijriDay === 12) holidayName = language === 'ar' ? "المولد" : "Mawlid";
            if (hijriMonth === 0 && hijriDay === 10) holidayName = language === 'ar' ? "عاشوراء" : "Ashura";

            days.push(
                <div
                    key={d}
                    onMouseDown={() => handleDayInteractionStart(date)}
                    onMouseUp={handleDayInteractionEnd}
                    onMouseLeave={handleDayInteractionEnd}
                    onTouchStart={() => handleDayInteractionStart(date)}
                    onTouchEnd={handleDayInteractionEnd}
                    className={cn(
                        "h-10 md:h-14 flex flex-col items-center justify-center rounded-lg relative border transition-all text-white cursor-pointer select-none active:scale-95",
                        isToday
                            ? "bg-[#FFD700] text-[#094231] font-extrabold border-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.5)] z-10 scale-105"
                            : "border-white/5 hover:bg-white/10",
                        !isToday && isWhiteDay && "bg-white/10 border-white/20",
                        !isToday && holidayName && "bg-emerald-600/40 border-emerald-400",
                        !isToday && isFriday && !holidayName && "text-emerald-400",
                        hasNote && !isToday && "ring-1 ring-blue-400/50"
                    )}
                >
                    {/* Gregorian Day */}
                    <span className={cn(
                        "text-[8px] md:text-[10px] absolute top-1 left-2 opacity-90 font-sans",
                        isToday ? "text-[#094231]" : "text-white/80"
                    )}>
                        {language === 'ar' ? toArabic(d) : d}
                    </span>

                    {/* Hijri Day */}
                    <span className="text-sm md:text-lg font-amiri font-bold">
                        {language === 'ar' ? toArabic(hijriDay) : hijriDay}
                    </span>

                    {/* Holiday Dot */}
                    {holidayName && (
                        <span className="absolute -bottom-1 md:bottom-0.5 text-[8px] md:text-[9px] truncate w-full text-center px-1 font-amiri text-emerald-200">
                            {holidayName}
                        </span>
                    )}

                    {/* Note Indicator */}
                    {hasNote && !holidayName && (
                        <StickyNote className={cn("absolute bottom-1 right-1 w-2 h-2 opacity-70", isToday ? "text-[#094231]" : "text-blue-300")} />
                    )}
                </div>
            );
        }

        return days;
    };

    const weekDays = language === "ar"
        ? ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="space-y-4 animate-in fade-in pb-20">
            {/* Header Card */}
            <Card className="p-4 bg-white/5 border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={prevMonth} className="hover:bg-white/10 text-white">
                        <ChevronRight className="w-5 h-5 rtl:hidden" />
                        <ChevronLeft className="w-5 h-5 ltr:hidden" />
                    </Button>

                    <div className="text-center">
                        <h2 className="text-xl font-bold font-amiri text-[#FFD700]">
                            {getHijriMonthName(currentDate)} {getHijriYear(currentDate)}
                        </h2>
                        <div className="flex items-center justify-center gap-2 text-xs text-white/60 mt-1 font-sans">
                            <CalendarIcon className="w-3 h-3" />
                            <span>
                                {currentDate.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    <Button variant="ghost" size="icon" onClick={nextMonth} className="hover:bg-white/10 text-white">
                        <ChevronLeft className="w-5 h-5 rtl:hidden" />
                        <ChevronRight className="w-5 h-5 ltr:hidden" />
                    </Button>
                </div>
            </Card>

            {/* Calendar Grid */}
            <Card className="p-2 md:p-4 bg-black/20 border-white/10">
                <div className="grid grid-cols-7 gap-1 md:gap-2 text-center mb-2">
                    {weekDays.map((day) => (
                        <div key={day} className="text-xs font-bold text-white/90 py-2 font-amiri">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1 md:gap-2">
                    {renderCalendarDays()}
                </div>
            </Card>

            {/* Legend */}
            <div className="flex justify-center gap-4 text-xs text-white/60 pt-2 font-amiri">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-[#FFD700]"></div>
                    <span>{language === 'ar' ? 'اليوم' : 'Today'}</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-white/10 border border-white/20"></div>
                    <span>{language === 'ar' ? 'الأيام البيض' : 'White Days'}</span>
                </div>
                <div className="flex items-center gap-1">
                    <StickyNote className="w-3 h-3 text-blue-300" />
                    <span>{language === 'ar' ? 'ملاحظة' : 'Note'}</span>
                </div>
            </div>

            {/* Note Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-[#1a2e26] border-emerald-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="font-amiri text-[#FFD700]">
                            {language === 'ar' ? 'إضافة ملاحظة' : 'Add Note'}
                        </DialogTitle>
                        <DialogDescription className="text-white/60">
                            {selectedDate?.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <Textarea
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder={language === 'ar' ? "اكتب ملاحظتك هنا..." : "Write your note here..."}
                            className="bg-black/20 border-white/10 text-white min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-white/60 hover:text-white">
                            {language === 'ar' ? 'إلغاء' : 'Cancel'}
                        </Button>
                        <Button onClick={saveNote} className="bg-[#FFD700] text-[#094231] hover:bg-[#FFD700]/90">
                            {language === 'ar' ? 'حفظ' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
