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
import { Clock, Compass, BookOpen, Settings, Calendar, Moon, Heart, ClipboardList, Terminal, MapPin } from "lucide-react";
import { HijriDateDisplay } from "@/components/HijriDateDisplay";
import { getHijriYear } from "@/lib/date-utils";
import { HijriCalendar } from "@/components/HijriCalendar";
import { QuranIndex } from "@/components/QuranIndex";
import { SunnahPrayers } from "@/components/SunnahPrayers";
import { MissedPrayersTracker } from "@/components/MissedPrayersTracker";
import { MasjidFinder } from "@/components/MasjidFinder";
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
    { id: "mosques", label: t.mosques, icon: MapPin },
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
      case "mosques":
        return <MasjidFinder />;
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
    <div className="min-h-screen bg-cream text-foreground font-sans flex flex-col relative overflow-hidden selection:bg-emerald-light selection:text-white">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-multiply"
        style={{ backgroundImage: `url('/textures/cream-paper.png')`, backgroundSize: 'cover' }}>
      </div>

      <AlarmChallenge />
      <PermissionsPrompt />

      {/* Modern Header - Deep Emerald */}
      <header
        className="relative z-10 pt-safe pb-6 px-6 bg-emerald-deep text-white rounded-b-[3rem] shadow-[0_15px_50px_-10px_rgba(9,66,49,0.4)] mb-6 overflow-hidden"
      >
        {/* Abstract Pattern Overlay for Header */}
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: `url('/assets/pattern.png')`, backgroundSize: '150px' }}>
        </div>

        <div className="relative flex flex-col items-center justify-center pt-2 animate-fade-in-down">
          {/* Top Row: Language & Dev Trigger */}
          <div className="absolute top-0 right-0 p-2 z-20 flex items-center gap-2">
            <LanguageToggle />
          </div>

          {/* Dev Mode Trigger - "Hidden" Area (User Request) */}
          {/* Placing it subtly but accessible - maybe user meant it was literally invisible before */}
          {/* Dev Mode Trigger - Expanded Area */}
          <div
            onClick={handleDevTrigger}
            className="absolute top-0 left-0 w-20 h-20 z-50 opacity-0 hover:opacity-20 bg-red-500/20 cursor-pointer"
            title="Dev Mode"
          />

          {/* Centered Greeting & Logo */}
          <div className="flex flex-col items-center text-center space-y-3 mt-6">
            <span className="text-emerald-100/90 font-tajawal text-lg font-medium tracking-wide animate-fade-in delay-100">
              {language === "ar" ? "السلام عليكم" : "Assalamu Alaikum"}
            </span>

            {/* Main Logo - Clickable for Dua/Message */}
            <div
              onClick={() => setIsDuaOpen(true)}
              className="cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 group relative flex justify-center items-center"
            >
              <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full opacity-50 pointer-events-none" />
              {/* User provided transparent unique image - rendering as is without aggressive filters */}
              <img
                src="/assets/logo_caligraphy.png"
                alt="Ibad Al-Rahman"
                className="h-28 md:h-36 w-auto object-contain drop-shadow-lg relative z-10"
              />
            </div>
          </div>
        </div>

        {/* Date Display - Floating Pill */}
        <div className="mt-6 mx-auto max-w-sm bg-white/10 backdrop-blur-md rounded-full px-6 py-2 border border-white/20 flex items-center justify-between shadow-lg animate-fade-in-up delay-200">
          <HijriDateDisplay />
          <div className="w-px h-6 bg-white/20 mx-4" />
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gold-matte" />
            <span className="text-xs text-white/80 font-tajawal">{getHijriYear(new Date())} AH</span>
          </div>
        </div>

        {/* Contact Note - User Request */}
        <div className="mt-4 text-center animate-fade-in delay-300">
          <p className="text-[10px] text-white/70 font-tajawal leading-relaxed max-w-xs mx-auto">
            نسخة تجربية جارى العمل عليها لاى اقتراح او شكوى أحمد الحريري 01019152314
          </p>
        </div>
      </header>

      <Dialog open={isDuaOpen} onOpenChange={setIsDuaOpen}>
        <DialogContent className="sm:max-w-md bg-cream border-emerald-deep/10 text-emerald-deep shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-center font-amiri text-3xl leading-loose text-emerald-deep drop-shadow-sm">
              دعاء
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-6 py-4">
            <div className="p-6 bg-white rounded-2xl border border-emerald-deep/5 shadow-inner">
              <p className="font-quran text-2xl leading-[3] text-emerald-deep">
                رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ
              </p>
            </div>

            <p className="font-tajawal text-base leading-relaxed text-emerald-deep/70">
              نسألكم دعوة بظهر الغيب لمطور هذا التطبيق ووالدته المتوفاة.. اللهم ارحمهما، واغفر لهما، وثبتهما عند السؤال.
            </p>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={() => setIsDuaOpen(false)}
              className="bg-gold-matte text-white hover:bg-gold-light font-tajawal font-bold px-10 py-6 rounded-xl shadow-lg shadow-gold-matte/20 transition-all hover:scale-105"
            >
              اللهم آمين
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-32 px-4 relative z-10 no-scrollbar">
        {renderContent()}
      </main>

      {/* Modern Floating Dock Navigation */}
      <div className="fixed bottom-6 left-4 right-4 z-50 flex justify-center pb-safe">
        {/* Container for Style (Border, Background, Shadow) */}
        <div className="glass-panel-dark rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] max-w-full">
          {/* Scrollable Area - Added padding here to prevent clipping of scaled items */}
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full p-2">
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
                    "relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 group shrink-0 ring-0 select-none disable-nav-outline",
                    isActive
                      ? "bg-gold-matte text-white shadow-lg shadow-gold-matte/30 scale-110"
                      : "text-white/60"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Index;
