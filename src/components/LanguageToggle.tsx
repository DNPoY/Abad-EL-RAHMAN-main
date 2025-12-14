import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
      className="fixed top-4 right-4 z-50 shadow-lg"
    >
      <Languages className="h-5 w-5" />
    </Button>
  );
};
