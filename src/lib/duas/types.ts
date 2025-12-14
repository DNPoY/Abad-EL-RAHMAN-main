export interface DuaItem {
    id: number;
    category: "personal" | "deceased-male" | "deceased-female" | "quranic" | "prophetic";
    arabic: string;
    transliteration?: string;
    translation?: string;
    source?: string;
}
