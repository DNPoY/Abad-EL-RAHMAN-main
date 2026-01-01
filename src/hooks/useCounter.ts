import { useState, useCallback } from 'react';
import { TasbihTarget } from '@/types/tasbih';
import { useVibration } from './useVibration';

interface UseCounterOptions {
    initialCount?: number;
    initialTarget?: TasbihTarget;
    onTargetReached?: () => void;
}

/**
 * Custom hook for Tasbih counter logic
 * Handles counter state, target management, and completion detection
 */
export const useCounter = (options: UseCounterOptions = {}) => {
    const {
        initialCount = 0,
        initialTarget = 33,
        onTargetReached,
    } = options;

    const [count, setCount] = useState(initialCount);
    const [target, setTarget] = useState<TasbihTarget>(initialTarget);
    const { vibrateLight, vibrateSuccess } = useVibration();

    const increment = useCallback(() => {
        vibrateLight();

        setCount((prev) => {
            const newCount = prev + 1;

            // Check if we've reached the target
            if (target !== 0 && newCount >= target) {
                vibrateSuccess();

                // Trigger celebration callback
                if (onTargetReached) {
                    onTargetReached();
                }

                // Reset to 0 after reaching target
                return 0;
            }

            return newCount;
        });
    }, [target, vibrateLight, vibrateSuccess, onTargetReached]);

    const reset = useCallback(() => {
        vibrateLight();
        setCount(0);
    }, [vibrateLight]);

    const changeTarget = useCallback((newTarget: TasbihTarget) => {
        setTarget(newTarget);
        setCount(0);
    }, []);

    const progress = target === 0 ? 0 : (count / target) * 100;

    return {
        count,
        target,
        increment,
        reset,
        setTarget: changeTarget,
        progress,
        isComplete: target !== 0 && count >= target,
    };
};
