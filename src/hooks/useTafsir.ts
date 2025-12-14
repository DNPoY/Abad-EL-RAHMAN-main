import { useState, useEffect, useCallback } from 'react';
import { fetchTafsir, TafsirResponse } from '@/lib/tafsir-service';

export const useTafsir = (surah: number | null, ayah: number | null) => {
    const [data, setData] = useState<TafsirResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadTafsir = useCallback(async () => {
        if (!surah || !ayah) {
            setData(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        setData(null);

        try {
            const result = await fetchTafsir(surah, ayah);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load Tafsir');
        } finally {
            setIsLoading(false);
        }
    }, [surah, ayah]);

    useEffect(() => {
        loadTafsir();
    }, [loadTafsir]);

    return { data, isLoading, error, refetch: loadTafsir };
};
