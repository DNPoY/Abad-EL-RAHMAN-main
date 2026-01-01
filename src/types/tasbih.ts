export type TasbihTarget = 33 | 100 | 0; // 0 represents infinity

export interface TasbihState {
    count: number;
    target: TasbihTarget;
}

export interface TasbihActions {
    increment: () => void;
    reset: () => void;
    setTarget: (target: TasbihTarget) => void;
}

export interface CelebrationConfig {
    enabled: boolean;
    type: 'confetti' | 'fireworks' | 'sparkle';
    duration: number;
}
