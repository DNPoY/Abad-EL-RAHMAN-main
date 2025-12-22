import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { morningAzkar, eveningAzkar, afterPrayerAzkar, sleepAzkar, nightAnxietyAzkar, badDreamsAzkar } from "@/lib/azkar-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle2, RotateCcw, Info } from "lucide-react";
import { useAzkarProgress } from "@/hooks/useAzkarProgress";
import { toast } from "sonner";
import { useFontSize } from "@/contexts/FontSizeContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AzkarCategory = ({
  data,
  type
}: {
  data: typeof morningAzkar,
  type: "morning" | "evening" | "afterPrayer" | "sleep" | "nightAnxiety" | "badDreams"
}) => {
  const { t, language } = useLanguage();
  const { fontSize } = useFontSize();
  const { progress, incrementCount, resetProgress, resetItem } = useAzkarProgress(type);

  const allComplete = data.every(item => (progress[item.id] || 0) >= item.count);

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-xl leading-loose';
      case 'medium': return 'text-2xl leading-loose';
      case 'large': return 'text-3xl leading-[2.5]';
      default: return 'text-2xl leading-loose';
    }
  };

  return (
    <div className="space-y-4">
      {allComplete && (
        <div className="bg-emerald-deep/5 p-4 rounded-xl text-center mb-6 animate-fade-in border border-emerald-deep/10">
          <p className="text-emerald-deep font-amiri text-lg font-bold">
            {language === "ar" ? "✨ أحسنت! أتممت الأذكار" : "✨ Mashallah! All completed"}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetProgress}
            className="mt-2 text-gold-matte hover:text-gold-matte/80 hover:bg-emerald-deep/5"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {language === "ar" ? "إعادة" : "Reset"}
          </Button>
        </div>
      )}

      {data.map((dhikr, index) => {
        const currentCount = progress[dhikr.id] || 0;
        const finalTarget = dhikr.secondaryCount || dhikr.count;
        const isCardComplete = currentCount >= finalTarget;
        const isPrimaryComplete = currentCount >= dhikr.count;

        return (
          <Card
            key={dhikr.id}
            className={`p-6 transition-all duration-300 border-emerald-deep/5 ${isCardComplete ? "opacity-70 bg-gold-matte/10 border-gold-matte/20" : "bg-white hover:shadow-lg hover:-translate-y-1"
              }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge
                  className={`gap-1 ${isCardComplete ? "bg-emerald-deep/10 text-emerald-deep hover:bg-emerald-deep/20" : "bg-emerald-deep text-white hover:bg-emerald-deep/90"}`}
                >
                  {isCardComplete && <CheckCircle2 className="w-3 h-3" />}
                  {currentCount} / {currentCount > dhikr.count && dhikr.secondaryCount ? dhikr.secondaryCount : dhikr.count}
                </Badge>
                {currentCount > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-emerald-deep/40 hover:text-red-500"
                    onClick={() => resetItem(dhikr.id)}
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {/* Info Popup Trigger */}
              {(dhikr.occasion || dhikr.reward) && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-deep/60 hover:text-emerald-deep hover:bg-emerald-deep/5">
                      <Info className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-cream border-emerald-deep/10 max-w-[90vw] sm:max-w-md rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="font-amiri text-2xl text-emerald-deep text-center mb-4 border-b border-emerald-deep/10 pb-2">
                        {language === 'ar' ? 'فضل الذكر ومناسبته' : 'Virtues & Occasion'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 font-amiri text-lg text-emerald-deep/80 text-right max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar" dir="rtl">
                      {dhikr.occasion && (
                        <div className="bg-white/50 p-3 rounded-lg border border-emerald-deep/5">
                          <h4 className="font-bold mb-2 text-gold-matte flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold-matte shrink-0" />
                            {language === 'ar' ? 'المناسبة:' : 'Occasion:'}
                          </h4>
                          <p className="leading-relaxed">{dhikr.occasion}</p>
                        </div>
                      )}
                      {dhikr.reward && (
                        <div className="bg-white/50 p-3 rounded-lg border border-emerald-deep/5">
                          <h4 className="font-bold mb-2 text-gold-matte flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold-matte shrink-0" />
                            {language === 'ar' ? 'الفضل/الأجر:' : 'Reward:'}
                          </h4>
                          <p className="leading-relaxed">{dhikr.reward}</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <p className={`${getFontSizeClass()} font-amiri mb-4 text-right text-emerald-deep break-words`} lang="ar">
              {dhikr.arabic}
            </p>

            {language === "en" && (
              <>
                <p className="text-sm text-emerald-deep/60 italic mb-2">
                  {dhikr.transliteration}
                </p>
                <p className="text-sm text-emerald-deep/80">
                  {dhikr.translation}
                </p>
              </>
            )}

            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => incrementCount(dhikr.id, dhikr.count)}
                disabled={isPrimaryComplete}
                className={`flex-1 active:scale-95 transition-transform border border-emerald-deep/10 ${isPrimaryComplete
                  ? "bg-transparent text-emerald-deep/40 shadow-none"
                  : "bg-emerald-deep text-white hover:bg-emerald-light shadow-md"
                  }`}
              >
                {isPrimaryComplete
                  ? language === "ar"
                    ? "مكتمل"
                    : "Completed"
                  : (language === "ar" ? "عد" : "Count") + ` (${dhikr.count})`}
              </Button>

              {dhikr.secondaryCount && (
                <Button
                  onClick={() => incrementCount(dhikr.id, dhikr.secondaryCount)}
                  disabled={currentCount >= dhikr.secondaryCount}
                  className={`flex-1 active:scale-95 transition-transform border border-emerald-deep/10 ${currentCount >= dhikr.secondaryCount
                    ? "bg-transparent text-emerald-deep/40 shadow-none"
                    : "bg-gold-matte text-white hover:bg-gold-matte/80 shadow-md"
                    }`}
                >
                  {currentCount >= dhikr.secondaryCount
                    ? language === "ar"
                      ? "مكتمل (100)"
                      : "Completed (100)"
                    : (language === "ar" ? "عد" : "Count") + ` (${dhikr.secondaryCount})`}
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export const AzkarList = () => {
  const { t, language } = useLanguage();
  const [resetKey, setResetKey] = useState(0);

  const handleResetAll = () => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const types = ["morning", "evening", "afterPrayer", "sleep", "nightAnxiety", "badDreams"];

    types.forEach(type => {
      localStorage.removeItem(`azkar-progress-${type}-${today}`);
      localStorage.removeItem(`azkar-last-active-${type}`);
    });

    setResetKey(prev => prev + 1);
    toast.success(language === "ar" ? "تم إعادة تعيين الأذكار" : "Azkar reset successfully");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-emerald-deep/60 border-emerald-deep/20 hover:text-emerald-deep hover:bg-emerald-deep/5 hover:border-emerald-deep/30"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {language === "ar" ? "بدء من جديد" : "Start Over"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-cream border-emerald-deep/10 text-emerald-deep">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-amiri text-2xl text-emerald-deep">
                {language === "ar" ? "تأكيد إعادة البدء" : "Confirm Reset"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-emerald-deep/70">
                {language === "ar"
                  ? "هل أنت متأكد أنك تريد إعادة تعيين جميع عدادات الأذكار لهذا اليوم؟"
                  : "Are you sure you want to reset all Azkar counters for today?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-emerald-deep/10 text-emerald-deep hover:bg-emerald-deep/5">
                {language === "ar" ? "إلغاء" : "Cancel"}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetAll}
                className="bg-gold-matte text-white hover:bg-gold-matte/80"
              >
                {language === "ar" ? "نعم، أعد البدء" : "Yes, Reset"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Tabs key={resetKey} defaultValue="morning" className="w-full" dir={language === "ar" ? "rtl" : "ltr"}>
        <TabsList className="flex w-full justify-start overflow-x-auto mb-6 h-auto gap-2 p-1 bg-muted/50 rounded-lg no-scrollbar pb-2">
          <TabsTrigger value="morning" className="font-amiri min-w-fit px-4 whitespace-nowrap">
            {t.morningAzkar}
          </TabsTrigger>
          <TabsTrigger value="evening" className="font-amiri min-w-fit px-4 whitespace-nowrap">
            {t.eveningAzkar}
          </TabsTrigger>
          <TabsTrigger value="afterPrayer" className="font-amiri min-w-fit px-4 whitespace-nowrap">
            {t.afterPrayerAzkar}
          </TabsTrigger>
          <TabsTrigger value="sleep" className="font-amiri min-w-fit px-4 whitespace-nowrap">
            {t.sleepAzkar}
          </TabsTrigger>
          <TabsTrigger value="nightAnxiety" className="font-amiri min-w-fit px-4 whitespace-nowrap">
            {t.nightAnxietyAzkar}
          </TabsTrigger>
          <TabsTrigger value="badDreams" className="font-amiri min-w-fit px-4 whitespace-nowrap">
            {t.badDreamsAzkar}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="morning">
          <AzkarCategory data={morningAzkar} type="morning" />
        </TabsContent>

        <TabsContent value="evening">
          <AzkarCategory data={eveningAzkar} type="evening" />
        </TabsContent>

        <TabsContent value="afterPrayer">
          <AzkarCategory data={afterPrayerAzkar} type="afterPrayer" />
        </TabsContent>

        <TabsContent value="sleep">
          <AzkarCategory data={sleepAzkar} type="sleep" />
        </TabsContent>

        <TabsContent value="nightAnxiety">
          <AzkarCategory data={nightAnxietyAzkar} type="nightAnxiety" />
        </TabsContent>

        <TabsContent value="badDreams">
          <AzkarCategory data={badDreamsAzkar} type="badDreams" />
        </TabsContent>
      </Tabs>
    </div>
  );
};


