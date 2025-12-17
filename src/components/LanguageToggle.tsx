import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
      className="bg-black/20 hover:bg-black/30 text-gold-matte border border-white/10 shadow-sm backdrop-blur-sm transition-all"
    >
      <Languages className="h-5 w-5" />
    </Button>
  );
};
