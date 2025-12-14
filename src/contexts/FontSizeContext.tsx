import React, { createContext, useContext, useState, useEffect } from "react";

export type FontSize = "small" | "medium" | "large";

interface FontSizeContextType {
    fontSize: FontSize;
    setFontSize: (size: FontSize) => void;
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export const FontSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [fontSize, setFontSizeState] = useState<FontSize>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("app-font-size");
            return (saved as FontSize) || "medium";
        }
        return "medium";
    });

    const setFontSize = (size: FontSize) => {
        setFontSizeState(size);
        localStorage.setItem("app-font-size", size);
    };

    useEffect(() => {
        // Remove all font size classes
        document.documentElement.classList.remove("font-size-small", "font-size-medium", "font-size-large");
        // Add the current font size class
        document.documentElement.classList.add(`font-size-${fontSize}`);
    }, [fontSize]);

    return (
        <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
            {children}
        </FontSizeContext.Provider>
    );
};

export const useFontSize = () => {
    const context = useContext(FontSizeContext);
    if (context === undefined) {
        throw new Error("useFontSize must be used within a FontSizeProvider");
    }
    return context;
};
