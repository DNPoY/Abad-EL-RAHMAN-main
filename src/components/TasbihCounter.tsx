import { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useCounter } from "@/hooks/useCounter";
import { useCelebration } from "@/components/Celebration";
import { TASBIH_TARGETS } from "@/lib/constants";
import { SPRING_CONFIGS, SCALE_VARIANTS } from "@/lib/animation-constants";
import { TasbihTarget } from "@/types/tasbih";

// Memoized counter button component for performance
const CounterButton = memo(({
    count,
    target,
    progress,
    onClick
}: {
    count: number;
    target: TasbihTarget;
    progress: number;
    onClick: () => void;
}) => {
    return (
        <motion.div
            whileTap={{ scale: 0.95 }}
            transition={SPRING_CONFIGS.STIFF}
            className="relative"
        >
            <Button
                variant="outline"
                className="w-64 h-64 rounded-full border-4 border-primary/20 text-6xl font-bold hover:bg-primary/5 transition-all shadow-xl relative overflow-hidden"
                onClick={onClick}
            >
                {/* Animated Progress Ring */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-primary/10"
                    initial={{ height: '0%' }}
                    animate={{ height: target ? `${progress}%` : '0%' }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{ opacity: target ? 1 : 0 }}
                />

                {/* Animated Counter Number */}
                <AnimatePresence mode="wait">
                    <motion.span
                        key={count}
                        className="relative z-10 font-mono"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {count}
                    </motion.span>
                </AnimatePresence>

                {/* Target Display */}
                {target > 0 && (
                    <motion.span
                        className="absolute bottom-12 text-sm text-muted-foreground font-normal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        / {target}
                    </motion.span>
                )}
            </Button>
        </motion.div>
    );
});

CounterButton.displayName = "CounterButton";

// Memoized target selector button
const TargetButton = memo(({
    target,
    isActive,
    onClick
}: {
    target: TasbihTarget;
    isActive: boolean;
    onClick: () => void;
}) => {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={SPRING_CONFIGS.GENTLE}
        >
            <Button
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={onClick}
                className={cn(
                    "min-w-[4rem]",
                    isActive ? "bg-primary text-primary-foreground shadow-md" : ""
                )}
            >
                {target === 0 ? "∞" : target}
            </Button>
        </motion.div>
    );
});

TargetButton.displayName = "TargetButton";

export const TasbihCounter = memo(() => {
    const { t } = useLanguage();
    const { celebrate } = useCelebration();
    const [showCelebration, setShowCelebration] = useState(false);

    const { count, target, increment, reset, setTarget, progress } = useCounter({
        initialCount: 0,
        initialTarget: 33,
        onTargetReached: () => {
            setShowCelebration(true);
            celebrate();
            // Reset celebration after animation
            setTimeout(() => setShowCelebration(false), 3000);
        },
    });

    return (
        <motion.div
            className="flex flex-col items-center justify-center space-y-8 py-8"
            variants={SCALE_VARIANTS}
            initial="hidden"
            animate="visible"
            transition={SPRING_CONFIGS.GENTLE}
        >
            {/* Target Selector */}
            <div className="flex justify-center space-x-4 space-x-reverse relative z-10">
                {TASBIH_TARGETS.map((tgt) => (
                    <TargetButton
                        key={tgt}
                        target={tgt}
                        isActive={target === tgt}
                        onClick={() => setTarget(tgt)}
                    />
                ))}
            </div>

            {/* Main Counter Button */}
            <CounterButton
                count={count}
                target={target}
                progress={progress}
                onClick={increment}
            />

            {/* Celebration Indicator */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold text-gold-matte pointer-events-none"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        ✨ الله أكبر ✨
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reset Button */}
            <motion.div
                whileHover={{ scale: 1.1, rotate: -15 }}
                whileTap={{ scale: 0.9 }}
                transition={SPRING_CONFIGS.BOUNCY}
            >
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={reset}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    title={t.reset}
                >
                    <RotateCcw className="w-6 h-6" />
                </Button>
            </motion.div>
        </motion.div>
    );
});

TasbihCounter.displayName = "TasbihCounter";
