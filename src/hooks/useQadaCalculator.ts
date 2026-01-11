import { useState, useEffect, useCallback } from 'react';

// Prayer types
export type PrayerType = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

// Strategy types
export type QadaStrategy = 'comfortable' | 'moderate' | 'intensive' | 'custom';

// Individual prayer progress
export interface PrayerProgress {
    total: number;
    completed: number;
}

// Qada Plan state
export interface QadaPlan {
    isActive: boolean;
    startDate: string;
    yearsOfMissing: number;
    monthsOfMissing: number;
    strategy: QadaStrategy;
    customDailyCount: number;
    prayers: {
        fajr: PrayerProgress;
        dhuhr: PrayerProgress;
        asr: PrayerProgress;
        maghrib: PrayerProgress;
        isha: PrayerProgress;
    };
    milestones: {
        percent10: boolean;
        percent25: boolean;
        percent50: boolean;
        percent75: boolean;
        percent100: boolean;
    };
}

// Milestone thresholds
export const MILESTONES = [10, 25, 50, 75, 100] as const;

const STORAGE_KEY = 'qada_calculator_plan';

const defaultPlan: QadaPlan = {
    isActive: false,
    startDate: '',
    yearsOfMissing: 0,
    monthsOfMissing: 0,
    strategy: 'moderate',
    customDailyCount: 5,
    prayers: {
        fajr: { total: 0, completed: 0 },
        dhuhr: { total: 0, completed: 0 },
        asr: { total: 0, completed: 0 },
        maghrib: { total: 0, completed: 0 },
        isha: { total: 0, completed: 0 },
    },
    milestones: {
        percent10: false,
        percent25: false,
        percent50: false,
        percent75: false,
        percent100: false,
    },
};

export const useQadaCalculator = () => {
    const [plan, setPlan] = useState<QadaPlan>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : defaultPlan;
    });

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    }, [plan]);

    // Calculate total missed prayers from years and months
    const calculateMissedPrayers = useCallback((years: number, months: number): number => {
        const totalDays = (years * 365) + (months * 30);
        return totalDays * 5; // 5 prayers per day
    }, []);

    // Calculate missed prayers per prayer type
    const calculatePrayersPerType = useCallback((years: number, months: number): number => {
        const totalDays = (years * 365) + (months * 30);
        return totalDays; // Each prayer type has same count
    }, []);

    // Get daily prayers based on strategy
    const getDailyPrayersByStrategy = useCallback((strategy: QadaStrategy, customCount?: number): number => {
        switch (strategy) {
            case 'comfortable':
                return 1; // 1 qada prayer per day
            case 'moderate':
                return 5; // 1 qada with each fard (5 per day)
            case 'intensive':
                return 10; // 2 qada with each fard (10 per day)
            case 'custom':
                return customCount || 5;
            default:
                return 5;
        }
    }, []);

    // Calculate estimated days to complete
    const getEstimatedDays = useCallback((totalPrayers: number, dailyPrayers: number): number => {
        if (dailyPrayers === 0) return Infinity;
        return Math.ceil(totalPrayers / dailyPrayers);
    }, []);

    // Calculate estimated completion date
    const getEstimatedCompletionDate = useCallback((startDate: string, totalPrayers: number, dailyPrayers: number): Date => {
        const start = new Date(startDate || new Date());
        const days = getEstimatedDays(totalPrayers, dailyPrayers);
        const completion = new Date(start);
        completion.setDate(completion.getDate() + days);
        return completion;
    }, [getEstimatedDays]);

    // Start a new Qada plan
    const startPlan = useCallback((years: number, months: number, strategy: QadaStrategy, customDailyCount?: number) => {
        const prayersPerType = calculatePrayersPerType(years, months);

        const newPlan: QadaPlan = {
            isActive: true,
            startDate: new Date().toISOString(),
            yearsOfMissing: years,
            monthsOfMissing: months,
            strategy,
            customDailyCount: customDailyCount || 5,
            prayers: {
                fajr: { total: prayersPerType, completed: 0 },
                dhuhr: { total: prayersPerType, completed: 0 },
                asr: { total: prayersPerType, completed: 0 },
                maghrib: { total: prayersPerType, completed: 0 },
                isha: { total: prayersPerType, completed: 0 },
            },
            milestones: {
                percent10: false,
                percent25: false,
                percent50: false,
                percent75: false,
                percent100: false,
            },
        };

        setPlan(newPlan);
        return newPlan;
    }, [calculatePrayersPerType]);

    // Mark a prayer as completed
    const markPrayerComplete = useCallback((prayerType: PrayerType, count: number = 1): { newMilestone: number | null } => {
        let newMilestone: number | null = null;

        setPlan((prev) => {
            const updated = { ...prev };
            const prayer = { ...updated.prayers[prayerType] };

            prayer.completed = Math.min(prayer.total, prayer.completed + count);
            updated.prayers = { ...updated.prayers, [prayerType]: prayer };

            // Check milestones
            const progress = getOverallProgress(updated);
            const milestones = { ...updated.milestones };

            if (progress >= 10 && !milestones.percent10) {
                milestones.percent10 = true;
                newMilestone = 10;
            }
            if (progress >= 25 && !milestones.percent25) {
                milestones.percent25 = true;
                newMilestone = 25;
            }
            if (progress >= 50 && !milestones.percent50) {
                milestones.percent50 = true;
                newMilestone = 50;
            }
            if (progress >= 75 && !milestones.percent75) {
                milestones.percent75 = true;
                newMilestone = 75;
            }
            if (progress >= 100 && !milestones.percent100) {
                milestones.percent100 = true;
                newMilestone = 100;
            }

            updated.milestones = milestones;
            return updated;
        });

        return { newMilestone };
    }, []);

    // Undo a prayer (decrement)
    const undoPrayer = useCallback((prayerType: PrayerType, count: number = 1) => {
        setPlan((prev) => {
            const updated = { ...prev };
            const prayer = { ...updated.prayers[prayerType] };
            prayer.completed = Math.max(0, prayer.completed - count);
            updated.prayers = { ...updated.prayers, [prayerType]: prayer };
            return updated;
        });
    }, []);

    // Get overall progress percentage
    const getOverallProgress = (currentPlan?: QadaPlan): number => {
        const p = currentPlan || plan;
        const total = Object.values(p.prayers).reduce((sum, prayer) => sum + prayer.total, 0);
        const completed = Object.values(p.prayers).reduce((sum, prayer) => sum + prayer.completed, 0);
        if (total === 0) return 0;
        return Math.round((completed / total) * 100);
    };

    // Get total prayers info
    const getTotalPrayers = useCallback(() => {
        const total = Object.values(plan.prayers).reduce((sum, prayer) => sum + prayer.total, 0);
        const completed = Object.values(plan.prayers).reduce((sum, prayer) => sum + prayer.completed, 0);
        return { total, completed, remaining: total - completed };
    }, [plan.prayers]);

    // Get remaining days based on current progress
    const getRemainingDays = useCallback(() => {
        const { remaining } = getTotalPrayers();
        const dailyPrayers = getDailyPrayersByStrategy(plan.strategy, plan.customDailyCount);
        return getEstimatedDays(remaining, dailyPrayers);
    }, [getTotalPrayers, getDailyPrayersByStrategy, getEstimatedDays, plan.strategy, plan.customDailyCount]);

    // Reset the plan
    const resetPlan = useCallback(() => {
        setPlan(defaultPlan);
    }, []);

    // Update strategy mid-plan
    const updateStrategy = useCallback((strategy: QadaStrategy, customDailyCount?: number) => {
        setPlan((prev) => ({
            ...prev,
            strategy,
            customDailyCount: customDailyCount || prev.customDailyCount,
        }));
    }, []);

    return {
        plan,
        // Calculations
        calculateMissedPrayers,
        calculatePrayersPerType,
        getDailyPrayersByStrategy,
        getEstimatedDays,
        getEstimatedCompletionDate,
        // Actions
        startPlan,
        markPrayerComplete,
        undoPrayer,
        resetPlan,
        updateStrategy,
        // Getters
        getOverallProgress: () => getOverallProgress(),
        getTotalPrayers,
        getRemainingDays,
    };
};
