import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { DOCK_ANIMATION, SPRING_CONFIGS } from '@/lib/animation-constants';

interface DockIconProps {
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
    mouseX: ReturnType<typeof useMotionValue>;
    isTouchDevice: boolean;
}

/**
 * Individual dock icon with magnification effect
 */
export const DockIcon = ({ icon: Icon, label, isActive, onClick, mouseX, isTouchDevice }: DockIconProps) => {
    const ref = useRef<HTMLButtonElement>(null);

    const distance = useTransform(mouseX, (val) => {
        const bounds = ref.current?.getBoundingClientRect();
        if (!bounds) return DOCK_ANIMATION.INFLUENCE_DISTANCE;

        const centerX = Number(bounds.x) + Number(bounds.width) / 2;
        return Math.abs(val - centerX);
    });

    const widthSync = useTransform(
        distance,
        [0, DOCK_ANIMATION.INFLUENCE_DISTANCE],
        [DOCK_ANIMATION.MAX_SIZE, DOCK_ANIMATION.BASE_SIZE]
    );

    const width = useSpring(widthSync, SPRING_CONFIGS.SMOOTH);

    // Fixed size for touch devices to avoid glitches
    const size = isTouchDevice ? DOCK_ANIMATION.BASE_SIZE : width;

    return (
        <motion.button
            ref={ref}
            onClick={onClick}
            style={{ width: size, height: size }}
            className={`relative flex items-center justify-center rounded-full transition-colors duration-300 shrink-0 ${isActive
                ? 'bg-gold-matte text-white shadow-lg shadow-gold-matte/30'
                : 'text-white/60 hover:text-white/80'
                }`}
            whileTap={{ scale: 0.9 }}
            aria-label={label}
        >
            <Icon
                className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`}
                strokeWidth={isActive ? 2.5 : 2}
            />
        </motion.button>
    );
};

interface DockNavigationProps {
    items: Array<{
        id: string;
        label: string;
        icon: React.ElementType;
    }>;
    activeId: string;
    onItemClick: (id: string) => void;
}

/**
 * Dock-style navigation with macOS-like magnification effect
 * Magnification is disabled on touch devices to prevent glitches
 */
export const DockNavigation = ({ items, activeId, onItemClick }: DockNavigationProps) => {
    const mouseX = useMotionValue(Infinity);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    // Detect touch device
    useEffect(() => {
        const checkTouch = () => {
            const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            setIsTouchDevice(hasTouch);
        };
        checkTouch();
    }, []);

    return (
        <div className="fixed bottom-6 left-4 right-4 z-50 flex justify-center pb-safe">
            <div className="glass-panel-dark rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] max-w-full">
                <motion.nav
                    ref={containerRef}
                    onMouseMove={(e) => !isTouchDevice && mouseX.set(e.pageX)}
                    onMouseLeave={() => !isTouchDevice && mouseX.set(Infinity)}
                    className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full p-3"
                >
                    {items.map((item) => (
                        <DockIcon
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            isActive={activeId === item.id}
                            onClick={() => onItemClick(item.id)}
                            mouseX={mouseX}
                            isTouchDevice={isTouchDevice}
                        />
                    ))}
                </motion.nav>
            </div>
        </div>
    );
};
