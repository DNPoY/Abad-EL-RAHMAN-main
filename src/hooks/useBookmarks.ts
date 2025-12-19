import { useState, useEffect } from 'react';

export const useBookmarks = () => {
    const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(() => {
        try {
            const saved = localStorage.getItem('quran-bookmarks');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error("Error parsing quran bookmarks:", e);
            return {};
        }
    });

    useEffect(() => {
        localStorage.setItem('quran-bookmarks', JSON.stringify(bookmarks));
    }, [bookmarks]);

    const toggleBookmark = (surahId: number, ayahNumber: number) => {
        const key = `${surahId}:${ayahNumber}`;
        setBookmarks(prev => {
            const newBookmarks = { ...prev };
            if (newBookmarks[key]) {
                delete newBookmarks[key];
            } else {
                newBookmarks[key] = true;
            }
            return newBookmarks;
        });
    };

    const isBookmarked = (surahId: number, ayahNumber: number) => {
        return !!bookmarks[`${surahId}:${ayahNumber}`];
    };

    return { bookmarks, toggleBookmark, isBookmarked };
};
