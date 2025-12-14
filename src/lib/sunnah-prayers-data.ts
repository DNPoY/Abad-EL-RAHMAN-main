export interface SunnahPrayer {
    id: number;
    prayer: string;
    timing: "before" | "after";
    rakaat: number;
    confirmed: boolean;
}

export const confirmedSunnahPrayers: SunnahPrayer[] = [
    {
        id: 1,
        prayer: "الظهر",
        timing: "before",
        rakaat: 4,
        confirmed: true,
    },
    {
        id: 2,
        prayer: "الظهر",
        timing: "after",
        rakaat: 2,
        confirmed: true,
    },
    {
        id: 3,
        prayer: "المغرب",
        timing: "after",
        rakaat: 2,
        confirmed: true,
    },
    {
        id: 4,
        prayer: "العشاء",
        timing: "after",
        rakaat: 2,
        confirmed: true,
    },
    {
        id: 5,
        prayer: "الفجر",
        timing: "before",
        rakaat: 2,
        confirmed: true,
    },
];

export const nonConfirmedSunnahPrayers: SunnahPrayer[] = [
    {
        id: 6,
        prayer: "العصر",
        timing: "before",
        rakaat: 4,
        confirmed: false,
    },
    {
        id: 7,
        prayer: "المغرب",
        timing: "before",
        rakaat: 2,
        confirmed: false,
    },
    {
        id: 8,
        prayer: "العشاء",
        timing: "before",
        rakaat: 2,
        confirmed: false,
    },
];
