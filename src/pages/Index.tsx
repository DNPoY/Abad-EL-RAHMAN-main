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
import { OfflineBanner } from "@/components/OfflineBanner";
import { Clock, Compass, BookOpen, Settings, Calendar, Moon, Heart, ClipboardList, Terminal, MapPin } from "lucide-react";
import { HijriDateDisplay } from "@/components/HijriDateDisplay";
import { getHijriYear } from "@/lib/date-utils";
import { HijriCalendar } from "@/components/HijriCalendar";
import { QuranIndex } from "@/components/QuranIndex";
import { SunnahPrayers } from "@/components/SunnahPrayers";
import { QadaCalculator } from "@/components/QadaCalculator";
import { MasjidFinder } from "@/components/MasjidFinder";
import { DeveloperPanel } from "@/components/DeveloperPanel";
import { DockNavigation } from "@/components/DockNavigation";
import { useVibration } from "@/hooks/useVibration";
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
  const { vibrateLight } = useVibration();

  const [showDevPassword, setShowDevPassword] = useState(false);
  const [devPasswordInput, setDevPasswordInput] = useState("");

  useEffect(() => {
    const isDev = localStorage.getItem("devMode") === "true";
    setDevModeEnabled(isDev);
  }, []);

  const handleDevTrigger = () => {
    if (devModeEnabled) return;

    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (newCount >= 7) {
      setShowDevPassword(true);
      setTapCount(0);
    }
  };

  const verifyDevPassword = () => {
    if (devPasswordInput === "AllahAkbar@33") {
      localStorage.setItem("devMode", "true");
      localStorage.setItem("devModeDate", new Date().toDateString());
      setDevModeEnabled(true);
      setShowDevPassword(false);
      toast.success(language === "ar" ? "تم تفعيل وضع المطور!" : "Developer Mode Enabled!");
    } else {
      toast.error(language === "ar" ? "كلمة المرور غير صحيحة" : "Incorrect Password");
      setDevPasswordInput("");
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
        return <QadaCalculator />;
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

      {/* Offline Banner */}
      <OfflineBanner />

      <AlarmChallenge />
      <PermissionsPrompt />

      {/* Modern Header - Deep Emerald */}
      <header
        className="relative z-10 pt-safe pb-4 px-4 bg-emerald-deep text-white rounded-b-[2.5rem] shadow-[0_10px_40px_-10px_rgba(9,66,49,0.4)] mb-4 overflow-hidden"
        role="banner"
        aria-label={language === "ar" ? "رأس التطبيق - عباد الرحمن" : "App header - Ibad Al-Rahman"}
      >
        {/* Abstract Pattern Overlay for Header */}
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: `url('/assets/pattern.png')`, backgroundSize: '150px' }}>
        </div>

        <div className="relative flex flex-col items-center justify-center pt-1 animate-fade-in-down">
          {/* Top Row: Language & Dev Trigger */}
          <div className="absolute top-0 right-0 p-2 z-20 flex items-center gap-2">
            <LanguageToggle />
          </div>

          {/* Dev Mode Trigger - Expanded Area */}
          <div
            onClick={handleDevTrigger}
            className="absolute top-0 left-0 w-20 h-20 z-50 opacity-0 hover:opacity-20 bg-red-500/20 cursor-pointer"
            title="Dev Mode"
          />

          {/* Centered Greeting & Logo */}
          <div className="flex flex-col items-center text-center space-y-1 mt-2">
            <span className="text-emerald-100/90 font-tajawal text-base font-medium tracking-wide animate-fade-in delay-100">
              {language === "ar" ? "السلام عليكم" : "Assalamu Alaikum"}
            </span>

            {/* Main Logo - Clickable for Dua/Message */}
            <div
              onClick={() => setIsDuaOpen(true)}
              className="cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 group relative flex justify-center items-center"
            >
              <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full opacity-50 pointer-events-none" />
              <img
                src="/assets/logo_caligraphy.png"
                alt="Ibad Al-Rahman"
                className="h-28 md:h-36 w-auto object-contain drop-shadow-lg relative z-10"
              />
            </div>
          </div>
        </div>

        {/* Date Display - Compact Floating Pill */}
        <div className="mt-3 mx-auto max-w-sm bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/20 flex items-center justify-between shadow-lg animate-fade-in-up delay-200">
          <HijriDateDisplay />
          <div className="w-px h-5 bg-white/20 mx-3" />
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gold-matte" />
            <span className="text-[10px] text-white/80 font-tajawal">{getHijriYear(new Date())} AH</span>
          </div>
        </div>
      </header>

      <Dialog open={showDevPassword} onOpenChange={setShowDevPassword}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-center">Developer Access</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <input
              type="password"
              value={devPasswordInput}
              onChange={(e) => setDevPasswordInput(e.target.value)}
              placeholder="Enter Password"
              className="p-2 rounded bg-black/50 border border-white/10 text-white w-full"
            />
            <Button onClick={verifyDevPassword} className="w-full bg-emerald-600 hover:bg-emerald-700">
              Verify
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
      <main
        className="flex-1 overflow-y-auto pb-32 px-4 relative z-10 no-scrollbar"
        role="main"
        aria-label={language === "ar" ? "المحتوى الرئيسي" : "Main content"}
      >
        {renderContent()}
      </main>

      {/* Modern Floating Dock Navigation with Magnification */}
      <DockNavigation
        items={navItems}
        activeId={activeTab}
        onItemClick={(id) => {
          vibrateLight();
          if (id === "quran") {
            navigate("/quran");
          } else {
            setActiveTab(id);
          }
        }}
        language={language}
      />
    </div>
  );
};

export default Index;
