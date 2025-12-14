import React from 'react';

interface IslamicBorderProps {
    children: React.ReactNode;
    className?: string;
}

export const IslamicBorder: React.FC<IslamicBorderProps> = ({ children, className = "" }) => {
    return (
        <div className={`relative p-8 md:p-12 border-4 border-double border-primary/30 rounded-xl ${className}`}>
            {/* Corner Ornaments */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary rounded-br-xl" />

            {/* Inner Decorative Elements */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-accent rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-accent rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-accent rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-accent rounded-br-lg" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};
