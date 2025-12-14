import axios from "axios";

export interface HijriDay {
    gregorianDate: string; // DD-MM-YYYY
    hijri: {
        date: string;
        format: string;
        day: string;
        weekday: { en: string; ar: string };
        month: { number: number; en: string; ar: string };
        year: string;
        designation: { abbreviated: string; expanded: string };
        holidays: string[];
    };
}

export const fetchHijriMonth = async (year: number, month: number): Promise<HijriDay[]> => {
    // API uses 1-indexed months (1-12)
    try {
        const response = await axios.get(`https://api.aladhan.com/v1/gToHCalendar/${month}/${year}`);
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error("Error fetching Hijri calendar:", error);
        return [];
    }
};
