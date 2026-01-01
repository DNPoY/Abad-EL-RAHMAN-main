/**
 * Animation-specific constants for consistent motion design
 */

export const SPRING_CONFIGS = {
    // Gentle spring for UI elements
    GENTLE: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
    },
    // Bouncy spring for playful interactions
    BOUNCY: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 25,
    },
    // Stiff spring for quick responses
    STIFF: {
        type: 'spring' as const,
        stiffness: 500,
        damping: 35,
    },
    // Smooth spring for dock magnification
    SMOOTH: {
        type: 'spring' as const,
        stiffness: 260,
        damping: 20,
    },
} as const;

export const EASE_CURVES = {
    EASE_IN: [0.4, 0, 1, 1] as const,
    EASE_OUT: [0, 0, 0.2, 1] as const,
    EASE_IN_OUT: [0.4, 0, 0.2, 1] as const,
    SMOOTH: [0.16, 1, 0.3, 1] as const, // cubic-bezier for smooth animations
} as const;

export const TRANSITION_DURATIONS = {
    INSTANT: 0,
    FAST: 0.15,
    MEDIUM: 0.3,
    SLOW: 0.6,
    VERY_SLOW: 1,
    CELEBRATION: 2.5,
} as const;

export const FADE_VARIANTS = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
} as const;

export const SLIDE_UP_VARIANTS = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
} as const;

export const SCALE_VARIANTS = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
} as const;

export const DOCK_ANIMATION = {
    // Base icon size
    BASE_SIZE: 48,
    // Maximum magnified size
    MAX_SIZE: 64,
    // Distance at which magnification starts (in pixels)
    INFLUENCE_DISTANCE: 80,
} as const;

export const CONFETTI_CONFIG = {
    PARTICLE_COUNT: 50,
    SPREAD: 70,
    START_VELOCITY: 30,
    DECAY: 0.9,
    GRAVITY: 1,
    DRIFT: 0,
    COLORS: ['#C5A059', '#D4B06A', '#047857', '#10B981', '#FFFFFF'] as string[],
} as const;

export const NUMBER_FLIP_DURATION = 0.3; // seconds
