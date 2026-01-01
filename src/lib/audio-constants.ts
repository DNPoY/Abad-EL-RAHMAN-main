export interface Reciter {
    id: string;
    name: string;
    arabicName: string;
    url: string;
    style?: string; // e.g., 'Murattal', 'Mujawwad', 'Warsh', etc.
}

export const RECITERS: Reciter[] = [
    // Hafs
    { id: 'Alafasy_128kbps', name: 'Mishary Rashid Al-Afasy', arabicName: 'مشاري راشد العفاسي', url: 'https://everyayah.com/data/Alafasy_128kbps/', style: 'Hafs' },
    { id: 'Abdul_Basit_Murattal_64kbps', name: 'Abdul Basit (Murattal)', arabicName: 'عبد الباسط عبد الصمد (مرتل)', url: 'https://everyayah.com/data/Abdul_Basit_Murattal_64kbps/', style: 'Hafs' },
    { id: 'Abdurrahmaan_As-Sudais_192kbps', name: 'Abdur-Rahman As-Sudais', arabicName: 'عبد الرحمن السديس', url: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/', style: 'Hafs' },
    { id: 'Maher_AlMuaiqly_64kbps', name: 'Maher Al-Muaiqly', arabicName: 'ماهر المعيقلي', url: 'https://everyayah.com/data/Maher_AlMuaiqly_64kbps/', style: 'Hafs' },
    { id: 'Saood_ash-Shuraym_128kbps', name: 'Saud Al-Shuraim', arabicName: 'سعود الشريم', url: 'https://everyayah.com/data/Saood_ash-Shuraym_128kbps/', style: 'Hafs' },
    { id: 'Husary_128kbps', name: 'Mahmoud Khalil Al-Husary', arabicName: 'محمود خليل الحصري', url: 'https://everyayah.com/data/Husary_128kbps/', style: 'Hafs' },
    { id: 'Minshawy_Murattal_128kbps', name: 'Mohamed Siddiq El-Minshawi', arabicName: 'محمد صديق المنشاوي', url: 'https://everyayah.com/data/Minshawy_Murattal_128kbps/', style: 'Hafs' },

    // Warsh
    { id: 'warsh_ibrahim_aldosary_128kbps', name: 'Ibrahim Al-Dosary (Warsh)', arabicName: 'إبراهيم الدوسري (ورش)', url: 'https://everyayah.com/data/warsh/warsh_ibrahim_aldosary_128kbps/', style: 'Warsh' },
    { id: 'warsh_yassin_al_jazaery_64kbps', name: 'Yassin Al-Jazaery (Warsh)', arabicName: 'ياسين الجزائري (ورش)', url: 'https://everyayah.com/data/warsh/warsh_yassin_al_jazaery_64kbps/', style: 'Warsh' },
];
