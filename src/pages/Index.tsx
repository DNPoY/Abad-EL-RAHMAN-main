import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { PrayerTimesCard } from "@/components/PrayerTimesCard";
import { QiblaCompass } from "@/components/QiblaCompass";
import { AzkarList } from "@/components/AzkarList";
import { DuaList } from "@/components/DuaList";
import { NotificationSettings } from "@/components/NotificationSettings";
import { FontSizeSelector } from "@/components/FontSizeSelector";
import { AlarmSettings } from "@/components/AlarmSettings";
import { SettingsPage } from "@/components/SettingsPage";
import { AlarmChallenge } from "@/components/AlarmChallenge";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Clock, Compass, BookOpen, Settings, Calendar, Moon, Heart, ClipboardList, Terminal } from "lucide-react";
import { HijriDateDisplay } from "@/components/HijriDateDisplay";
import { HijriCalendar } from "@/components/HijriCalendar";
import { QuranIndex } from "@/components/QuranIndex";
import { SunnahPrayers } from "@/components/SunnahPrayers";
import { MissedPrayersTracker } from "@/components/MissedPrayersTracker";
import { DeveloperPanel } from "@/components/DeveloperPanel";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PermissionsPrompt } from "@/components/PermissionsPrompt";
import patternBg from "@/assets/pattern.png";

const Index = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("prayers");
  const [isDuaOpen, setIsDuaOpen] = useState(false);
  const [devModeEnabled, setDevModeEnabled] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    const isDev = localStorage.getItem("devMode") === "true";
    setDevModeEnabled(isDev);
  }, []);

  const handleDevTrigger = () => {
    if (devModeEnabled) return;

    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (newCount >= 7) {
      localStorage.setItem("devMode", "true");
      localStorage.setItem("devModeDate", new Date().toDateString());
      setDevModeEnabled(true);
      toast.success(language === "ar" ? "تم تفعيل وضع المطور!" : "Developer Mode Enabled!");
      setTapCount(0);
    }
  };

  // Custom Icons for Bottom Nav - Restoring ALL original tabs
  const navItems = [
    { id: "prayers", label: t.prayerTimes, icon: Clock },
    { id: "quran", label: language === "ar" ? "القرآن" : "Quran", icon: BookOpen },
    { id: "azkar", label: t.azkar, icon: Moon },
    { id: "dua", label: t.dua, icon: Heart },
    { id: "qibla", label: t.qibla, icon: Compass },
    { id: "calendar", label: language === "ar" ? "التقويم" : "Calendar", icon: Calendar },
    { id: "sunnah", label: language === "ar" ? "النوافل" : "Nawafil", icon: Heart },
    { id: "qada", label: language === "ar" ? "قضاء" : "Qada", icon: ClipboardList },
    { id: "settings", label: t.settings, icon: Settings },
    ...(devModeEnabled ? [{ id: "developer", label: "Dev", icon: Terminal }] : []),
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "prayers":
        return <PrayerTimesCard />;
      case "quran":
        return <QuranIndex isEmbedded={true} />;
      case "qibla":
        return (
          <div className="flex justify-center h-full items-center">
            <QiblaCompass />
          </div>
        );
      case "calendar":
        return <HijriCalendar />;
      case "azkar":
        return <AzkarList />;
      case "dua":
        return <DuaList />;
      case "qada":
        return <MissedPrayersTracker />;
      case "sunnah":
        return <SunnahPrayers />;
      case "settings":
        return <SettingsPage />;
      case "developer":
        return <DeveloperPanel />;
      default:
        return <PrayerTimesCard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#094231] text-white font-sans flex flex-col relative overflow-hidden">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: `url(${patternBg})`, backgroundSize: '200px' }}>
      </div>

      <AlarmChallenge />
      <PermissionsPrompt />

      {/* Header - Salati Style */}
      <header
        className="relative z-10 pb-2 px-4 text-center"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
      >
        <div className="flex justify-between items-center mb-2">
          <LanguageToggle />
          {/* Placeholder for alignment - Secret Trigger */}
          <div
            className="w-8 h-8 cursor-default"
            onClick={handleDevTrigger}
          />
        </div>

        <div className="flex flex-col items-center justify-center">
          {/* Logo Image - Clickable for Dua */}
          <div
            onClick={() => setIsDuaOpen(true)}
            className="cursor-pointer hover:opacity-90 transition-opacity active:scale-95"
          >
            <img
              src="/assets/header_ibad_al_rahman.png"
              alt="Ibad Al-Rahman"
              className="h-auto w-auto max-w-[280px] object-contain drop-shadow-lg mb-2"
            />
          </div>

          {/* Beta / Contact Text */}
          <p className="text-[10px] text-white/80 mb-2 max-w-[250px] leading-relaxed font-amiri">
            {language === "ar"
              ? "نسخة تجريبية جاري العمل عليها. لو عندك أي اقتراحات ابعتها على الواتس: 01019152314 (أحمد)"
              : "Beta version under development. Send suggestions to WhatsApp: +201019152314 (Ahmed)"}
          </p>
          <HijriDateDisplay />
        </div>
      </header>

      <Dialog open={isDuaOpen} onOpenChange={setIsDuaOpen}>
        <DialogContent className="sm:max-w-md bg-[#094231] border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-center font-amiri text-2xl leading-loose text-[#FFD700] drop-shadow-md">
              دعاء
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-6 py-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="font-quran text-xl leading-loose text-[#FFD700]">
                رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ
              </p>
            </div>

            <p className="font-amiri text-lg leading-relaxed text-white/90">
              نسألكم دعوة بظهر الغيب لمطور هذا التطبيق ووالدته المتوفاة.. اللهم ارحمهما، واغفر لهما، وثبتهما عند السؤال.
            </p>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={() => setIsDuaOpen(false)}
              className="bg-white text-[#094231] hover:bg-white/90 font-amiri font-bold px-8"
            >
              اللهم آمين
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 px-4 relative z-10 no-scrollbar">
        {renderContent()}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#00381a] border-t border-white/30 pb-safe pt-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex items-center overflow-x-auto no-scrollbar px-2 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isQuran = item.id === "quran";
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isQuran) {
                    window.location.href = "/quran";
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[70px] flex-1 py-2 transition-all duration-300 rounded-lg",
                  isActive
                    ? "text-white bg-white/5"
                    : "text-white/60 hover:text-white/80 hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-6 h-6 mb-1", isActive && "fill-current")} />
                <span className="text-[10px] font-amiri font-bold tracking-wide whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav >
    </div >
  );
};

export default Index;
