export interface SunnahPrayer {
    id: number;
    prayer: string;
    timing: "before" | "after";
    rakaat: number;
    confirmed: boolean;
}

export interface OtherPrayer {
    id: number;
    name: string;
    description: string;
    rakaat: string;
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

export const otherPrayers: OtherPrayer[] = [
    {
        id: 101,
        name: "صلاة الضحى",
        description: "تُصلى بعد ارتفاع الشمس",
        rakaat: "2 - 8 ركعات"
    },
    {
        id: 102,
        name: "صلاة الوتر",
        description: "تُختم بها الصلوات، وهي سنة مؤكدة",
        rakaat: "ركعات فردية (1+)"
    },
    {
        id: 103,
        name: "صلاة التهجد",
        description: "تُصلى مثنى مثنى في جوف الليل",
        rakaat: "مثنى مثنى"
    },
    {
        id: 104,
        name: "صلاة الاستخارة",
        description: "عند طلب التيسير في أمر ما",
        rakaat: "ركعتان"
    },
    {
        id: 105,
        name: "صلوات أخرى",
        description: "التراويح، العيدين، الكسوف، الاستسقاء",
        rakaat: "متفاوتة"
    }
];
