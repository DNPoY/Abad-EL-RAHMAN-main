import { useRef, useCallback } from 'react';

interface Options {
    threshold?: number;
    onStart?: () => void;
    onFinish?: () => void;
    onCancel?: () => void;
}

export const useLongPress = (
    callback: () => void,
    { threshold = 500, onStart, onFinish, onCancel }: Options = {}
) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isLongPress = useRef(false);

    const start = useCallback(() => {
        if (onStart) onStart();
        isLongPress.current = false;
        timerRef.current = setTimeout(() => {
            isLongPress.current = true;
            callback();
            if (onFinish) onFinish();
        }, threshold);
    }, [callback, threshold, onStart, onFinish]);

    const stop = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        if (onCancel && !isLongPress.current) onCancel();
    }, [onCancel]);

    return {
        onMouseDown: start,
        onMouseUp: stop,
        onMouseLeave: stop,
        onTouchStart: start,
        onTouchEnd: stop,
    };
};
