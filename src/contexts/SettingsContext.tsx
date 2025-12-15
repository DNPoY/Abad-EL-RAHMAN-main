import React, { createContext, useContext, useState, useEffect } from "react";

export interface SettingsState {
    calculationMethod: number;
    madhab: "shafi" | "hanafi";
    locationMode: "auto" | "manual";
    manualLatitude: number;
    manualLongitude: number;
    fontFamily: "amiri" | "cairo" | "tajawal";
    quranFont: "uthmani" | "indopak" | "amiri_quran";
    preAzanReminder: boolean;
}

interface SettingsContextType extends SettingsState {
    setCalculationMethod: (method: number) => void;
    setMadhab: (madhab: "shafi" | "hanafi") => void;
    setLocationMode: (mode: "auto" | "manual") => void;
    setManualLocation: (lat: number, lng: number) => void;
    setFontFamily: (font: "amiri" | "cairo" | "tajawal") => void;
    setQuranFont: (font: "uthmani" | "indopak" | "amiri_quran") => void;
    setPreAzanReminder: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [calculationMethod, setCalculationMethodState] = useState<number>(() => {
        const saved = localStorage.getItem("calculationMethod");
        if (saved) return parseInt(saved, 10);

        try {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (timeZone === "Africa/Cairo") {
                return 5; // Egyptian General Authority of Survey
            }
        } catch (e) {
            console.error("Error detecting timezone:", e);
        }
        return 4; // Default to Umm al-Qura (4)
    });

    const [madhab, setMadhabState] = useState<"shafi" | "hanafi">(() => {
        const saved = localStorage.getItem("madhab");
        return (saved as "shafi" | "hanafi") || "shafi"; // Default to Shafi (Standard)
    });

    const [locationMode, setLocationModeState] = useState<"auto" | "manual">(() => {
        const saved = localStorage.getItem("locationMode");
        return (saved as "auto" | "manual") || "auto";
    });

    const [manualLatitude, setManualLatitude] = useState<number>(() => {
        const saved = localStorage.getItem("manualLatitude");
        return saved ? parseFloat(saved) : 21.3891; // Default to Mecca
    });

    const [manualLongitude, setManualLongitude] = useState<number>(() => {
        const saved = localStorage.getItem("manualLongitude");
        return saved ? parseFloat(saved) : 39.8579; // Default to Mecca
    });

    const [fontFamily, setFontFamilyState] = useState<"amiri" | "cairo" | "tajawal">(() => {
        const saved = localStorage.getItem("fontFamily");
        return (saved as "amiri" | "cairo" | "tajawal") || "amiri";
    });

    const [quranFont, setQuranFontState] = useState<"uthmani" | "indopak" | "amiri_quran">(() => {
        const saved = localStorage.getItem("quranFont");
        return (saved as "uthmani" | "indopak" | "amiri_quran") || "uthmani";
    });

    const [preAzanReminder, setPreAzanReminderState] = useState<boolean>(() => {
        const saved = localStorage.getItem("preAzanReminder");
        return saved ? saved === "true" : false;
    });

    // Apply font globally
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--font-primary', fontFamily === 'amiri' ? "'Amiri', serif" : fontFamily === 'cairo' ? "'Cairo', sans-serif" : "'Tajawal', sans-serif");
        document.body.style.fontFamily = `var(--font-primary), 'Poppins', sans-serif`;
    }, [fontFamily]);

    const setCalculationMethod = (method: number) => {
        setCalculationMethodState(method);
        localStorage.setItem("calculationMethod", method.toString());
    };

    const setMadhab = (m: "shafi" | "hanafi") => {
        setMadhabState(m);
        localStorage.setItem("madhab", m);
    };

    const setLocationMode = (mode: "auto" | "manual") => {
        setLocationModeState(mode);
        localStorage.setItem("locationMode", mode);
    };

    const setManualLocation = (lat: number, lng: number) => {
        setManualLatitude(lat);
        setManualLongitude(lng);
        localStorage.setItem("manualLatitude", lat.toString());
        localStorage.setItem("manualLongitude", lng.toString());
    };

    const setFontFamily = (font: "amiri" | "cairo" | "tajawal") => {
        setFontFamilyState(font);
        localStorage.setItem("fontFamily", font);
    };

    const setQuranFont = (font: "uthmani" | "indopak" | "amiri_quran") => {
        setQuranFontState(font);
        localStorage.setItem("quranFont", font);
    };

    const setPreAzanReminder = (enabled: boolean) => {
        setPreAzanReminderState(enabled);
        localStorage.setItem("preAzanReminder", enabled.toString());
    };

    return (
        <SettingsContext.Provider
            value={{
                calculationMethod,
                madhab,
                locationMode,
                manualLatitude,
                manualLongitude,
                fontFamily,
                quranFont,
                preAzanReminder,
                setCalculationMethod,
                setMadhab,
                setLocationMode,
                setManualLocation,
                setFontFamily,
                setQuranFont,
                setPreAzanReminder,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
};


