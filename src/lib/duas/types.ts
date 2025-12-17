export interface DuaItem {
    id: number | string;
    category: "personal" | "deceased-male" | "deceased-female" | "quranic" | "prophetic" | "leaving-home";
    arabic: string;
    transliteration?: string;
    translation?: string;
    source?: string;
}
