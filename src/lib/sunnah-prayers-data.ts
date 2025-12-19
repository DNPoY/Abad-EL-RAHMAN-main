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
    nameEn: string;
    description: string;
    descriptionEn: string;
    rakaat: string;
    rakaatEn: string;
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
        nameEn: "Duha Prayer",
        description: "تُصلى بعد ارتفاع الشمس",
        descriptionEn: "Performed after sunrise",
        rakaat: "2 - 8 ركعات",
        rakaatEn: "2 - 8 Rakaat"
    },
    {
        id: 102,
        name: "صلاة الوتر",
        nameEn: "Witr Prayer",
        description: "تُختم بها الصلوات، وهي سنة مؤكدة",
        descriptionEn: "Concludes the night prayers, confirmed Sunnah",
        rakaat: "ركعات فردية (1+)",
        rakaatEn: "Odd number (1+)"
    },
    {
        id: 103,
        name: "صلاة التهجد",
        nameEn: "Tahajjud Prayer",
        description: "تُصلى مثنى مثنى في جوف الليل",
        descriptionEn: "Performed in pairs during the night",
        rakaat: "مثنى مثنى",
        rakaatEn: "Pairs (2 by 2)"
    },
    {
        id: 104,
        name: "صلاة الاستخارة",
        nameEn: "Istikhara Prayer",
        description: "عند طلب التيسير في أمر ما",
        descriptionEn: "For seeking guidance in a matter",
        rakaat: "ركعتان",
        rakaatEn: "2 Rakaat"
    },
    {
        id: 105,
        name: "صلوات أخرى",
        nameEn: "Other Prayers",
        description: "التراويح، العيدين، الكسوف، الاستسقاء",
        descriptionEn: "Taraweeh, Eid, Eclipse, Rain",
        rakaat: "متفاوتة",
        rakaatEn: "Various"
    }
];
