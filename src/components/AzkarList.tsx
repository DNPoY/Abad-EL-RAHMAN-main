import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { morningAzkar, eveningAzkar, afterPrayerAzkar, sleepAzkar, nightAnxietyAzkar, badDreamsAzkar } from "@/lib/azkar-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { useAzkarProgress } from "@/hooks/useAzkarProgress";
import { toast } from "sonner";

const AzkarCategory = ({
  data,
  type
}: {
  data: typeof morningAzkar,
  type: "morning" | "evening" | "afterPrayer" | "sleep" | "nightAnxiety" | "badDreams"
}) => {
  const { t, language } = useLanguage();
  const { progress, incrementCount, resetProgress, resetItem } = useAzkarProgress(type);

  const allComplete = data.every(item => (progress[item.id] || 0) >= item.count);

  return (
    <div className="space-y-4">
      {allComplete && (
        <div className="bg-primary/10 p-4 rounded-lg text-center mb-6 animate-fade-in border border-primary/20">
          <p className="text-white font-amiri text-lg font-bold">
            {language === "ar" ? "✨ أحسنت! أتممت الأذكار" : "✨ Mashallah! All completed"}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetProgress}
            className="mt-2 text-[#FFD700] hover:text-[#FFD700]/80 hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {language === "ar" ? "إعادة" : "Reset"}
          </Button>
        </div>
      )}

      {data.map((dhikr, index) => {
        const currentCount = progress[dhikr.id] || 0;
        const isComplete = currentCount >= dhikr.count;

        return (
          <Card
            key={dhikr.id}
            className={`p-6 transition-all duration-300 ${isComplete ? "opacity-75 bg-muted/50" : "hover:shadow-lg"
              }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge
                  className={`gap-1 ${isComplete ? "bg-[#094231] hover:bg-[#073628] text-white" : "bg-gray-100 text-[#094231] border border-[#094231]/20"}`}
                >
                  {isComplete && <CheckCircle2 className="w-3 h-3" />}
                  {currentCount} / {dhikr.count}
                </Badge>
                {currentCount > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-[#094231]"
                    onClick={() => resetItem(dhikr.id)}
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            <p className="text-2xl font-amiri leading-loose mb-4 text-right text-white break-words" lang="ar">
              {dhikr.arabic}
            </p>

            {language === "en" && (
              <>
                <p className="text-sm text-muted-foreground italic mb-2">
                  {dhikr.transliteration}
                </p>
                <p className="text-sm text-foreground">
                  {dhikr.translation}
                </p>
              </>
            )}

            <Button
              onClick={() => incrementCount(dhikr.id, dhikr.count)}
              disabled={isComplete}
              className={`w-full mt-4 active:scale-95 transition-transform border-2 border-white ${isComplete
                ? "bg-gray-100 text-muted-foreground hover:bg-gray-200"
                : "bg-[#094231] text-white hover:bg-[#073628] shadow-md"
                }`}
            >
              {isComplete
                ? language === "ar"
                  ? "مكتمل"
                  : "Completed"
                : language === "ar"
                  ? "عد"
                  : "Count"}
            </Button>
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
    if (confirm(language === "ar" ? "هل أنت متأكد من إعادة تعيين جميع الأذكار؟" : "Are you sure you want to reset all Azkar?")) {
      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const types = ["morning", "evening", "afterPrayer", "sleep", "nightAnxiety", "badDreams"];

      types.forEach(type => {
        localStorage.removeItem(`azkar-progress-${type}-${today}`);
        localStorage.removeItem(`azkar-last-active-${type}`);
      });

      setResetKey(prev => prev + 1);
      toast.success(language === "ar" ? "تم إعادة تعيين الأذكار" : "Azkar reset successfully");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetAll}
          className="text-blue-400 border-blue-400/50 hover:text-blue-300 hover:bg-blue-400/10 hover:border-blue-300"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {language === "ar" ? "بدء من جديد" : "Start Over"}
        </Button>
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

