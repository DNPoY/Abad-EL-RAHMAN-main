import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFontSize, type FontSize } from "@/contexts/FontSizeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Type } from "lucide-react";

export const FontSizeSelector = () => {
    const { fontSize, setFontSize } = useFontSize();
    const { t } = useLanguage();

    const sizes: FontSize[] = ["small", "medium", "large"];

    return (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
                <Type className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold font-amiri">{t.fontSize}</h3>
            </div>
            <div className="flex gap-2">
                {sizes.map((size) => (
                    <Button
                        key={size}
                        onClick={() => setFontSize(size)}
                        variant={fontSize === size ? "default" : "outline"}
                        className="flex-1"
                    >
                        {t[size]}
                    </Button>
                ))}
            </div>
        </Card>
    );
};
