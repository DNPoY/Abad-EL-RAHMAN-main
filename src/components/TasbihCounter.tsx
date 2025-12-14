import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export const TasbihCounter = () => {
    const { t, language } = useLanguage();
    const [count, setCount] = useState(0);
    const [target, setTarget] = useState(33);

    const handleIncrement = () => {
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
        setCount((prev) => {
            const newCount = prev + 1;
            if (target !== 0 && newCount > target) {
                if (navigator.vibrate) {
                    navigator.vibrate([50, 50, 50]);
                }
                return 1;
            }
            return newCount;
        });
    };

    const handleReset = () => {
        if (navigator.vibrate) {
            navigator.vibrate(20);
        }
        setCount(0);
    };

    const targets = [33, 100, 0]; // 0 for infinity

    return (
        <div className="flex flex-col items-center justify-center space-y-8 py-8 animate-fade-in">
            <div className="flex justify-center space-x-4 space-x-reverse relative z-10">
                {targets.map((tgt) => (
                    <Button
                        key={tgt}
                        variant={target === tgt ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                            setTarget(tgt);
                            setCount(0);
                        }}
                        className={cn(
                            "min-w-[4rem]",
                            target === tgt ? "bg-primary text-primary-foreground" : ""
                        )}
                    >
                        {tgt === 0 ? "∞" : tgt}
                    </Button>
                ))}
            </div>

            <div className="relative">
                <Button
                    variant="outline"
                    className="w-64 h-64 rounded-full border-4 border-primary/20 text-6xl font-bold hover:bg-primary/5 active:scale-95 transition-all shadow-xl relative overflow-hidden"
                    onClick={handleIncrement}
                >
                    {/* Progress Ring Background (Optional simple implementation) */}
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-primary/10 transition-all duration-300 ease-out"
                        style={{
                            height: target ? `${(count / target) * 100}%` : '0%',
                            opacity: target ? 1 : 0
                        }}
                    />

                    <span className="relative z-10 font-mono">
                        {count}
                    </span>
                    {target > 0 && (
                        <span className="absolute bottom-12 text-sm text-muted-foreground font-normal">
                            / {target}
                        </span>
                    )}
                </Button>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                className="text-muted-foreground hover:text-destructive transition-colors"
                title={t.reset}
            >
                <RotateCcw className="w-6 h-6" />
            </Button>
        </div>
    );
};
