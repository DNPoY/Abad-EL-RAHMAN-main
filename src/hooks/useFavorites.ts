import { useState, useEffect } from 'react';

export const useFavorites = () => {
    const [favorites, setFavorites] = useState<(number | string)[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem('duaFavorites');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem('duaFavorites', JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = (id: number | string) => {
        setFavorites(prev =>
            prev.includes(id)
                ? prev.filter(favId => favId !== id)
                : [...prev, id]
        );
    };

    const isFavorite = (id: number | string) => favorites.includes(id);

    return { favorites, toggleFavorite, isFavorite };
};
