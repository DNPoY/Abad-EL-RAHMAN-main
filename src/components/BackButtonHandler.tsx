import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export const BackButtonHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Only run on native platforms
        if (!Capacitor.isNativePlatform()) return;

        const handleBackButton = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
            // If we're on the home page, minimize the app instead of closing
            if (location.pathname === '/' || !canGoBack) {
                CapacitorApp.minimizeApp();
            } else {
                // Navigate back in history
                navigate(-1);
            }
        });

        return () => {
            handleBackButton.remove();
        };
    }, [navigate, location]);

    return null; // This component doesn't render anything
};
