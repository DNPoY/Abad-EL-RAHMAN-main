import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CONFETTI_CONFIG } from '@/lib/animation-constants';

interface CelebrationProps {
    trigger: boolean;
    onComplete?: () => void;
}

/**
 * Celebration component that triggers confetti animation
 * Used when completing dhikr targets
 */
export const Celebration = ({ trigger, onComplete }: CelebrationProps) => {
    useEffect(() => {
        if (!trigger) return;

        const duration = 2500; // 2.5 seconds
        const animationEnd = Date.now() + duration;
        const defaults = {
            startVelocity: CONFETTI_CONFIG.START_VELOCITY,
            spread: CONFETTI_CONFIG.SPREAD,
            ticks: 60,
            zIndex: 0,
            colors: CONFETTI_CONFIG.COLORS,
        };

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        };

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                clearInterval(interval);
                if (onComplete) {
                    onComplete();
                }
                return;
            }

            const particleCount = 50 * (timeLeft / duration);

            // Fire confetti from two sides
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            });
        }, 250);

        return () => clearInterval(interval);
    }, [trigger, onComplete]);

    return null;
};

/**
 * Hook for triggering celebration effects
 */
export const useCelebration = () => {
    const celebrate = () => {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 },
            colors: CONFETTI_CONFIG.COLORS,
        };

        function fire(particleRatio: number, opts: confetti.Options) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio),
            });
        }

        // Firework-style burst
        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });
        fire(0.2, {
            spread: 60,
        });
        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
        });
        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    };

    return { celebrate };
};
