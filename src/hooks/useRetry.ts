import { useCallback, useRef } from 'react';
import { AUDIO_RETRY_CONFIG, getRetryDelay } from '@/lib/performance-constants';

interface RetryOptions {
    maxAttempts?: number;
    onAttempt?: (attempt: number) => void;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

/**
 * Hook for retrying failed operations with exponential backoff
 */
export const useRetry = () => {
    const abortControllerRef = useRef<AbortController | null>(null);

    const retry = useCallback(async <T,>(
        fn: () => Promise<T>,
        options: RetryOptions = {}
    ): Promise<T> => {
        const {
            maxAttempts = AUDIO_RETRY_CONFIG.MAX_ATTEMPTS,
            onAttempt,
            onSuccess,
            onError,
        } = options;

        // Create abort controller for the retry operation
        abortControllerRef.current = new AbortController();

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                if (abortControllerRef.current?.signal.aborted) {
                    throw new Error('Retry aborted');
                }

                if (onAttempt) {
                    onAttempt(attempt + 1);
                }

                const result = await Promise.race([
                    fn(),
                    new Promise<never>((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout')), AUDIO_RETRY_CONFIG.TIMEOUT)
                    ),
                ]);

                if (onSuccess) {
                    onSuccess();
                }

                return result;
            } catch (error) {
                const isLastAttempt = attempt === maxAttempts - 1;

                if (isLastAttempt) {
                    if (onError) {
                        onError(error as Error);
                    }
                    throw error;
                }

                // Wait before retrying (exponential backoff)
                const delay = getRetryDelay(attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw new Error('Retry failed');
    }, []);

    const cancel = useCallback(() => {
        abortControllerRef.current?.abort();
    }, []);

    return { retry, cancel };
};
