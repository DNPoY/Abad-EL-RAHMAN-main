export interface IslamicEvent {
    day: number;
    month: number; // 0-11
    title: { ar: string; en: string };
    type: 'fasting' | 'holiday' | 'other';
    description?: { ar: string; en: string };
}

export const getHijriEvents = (month: number, year: number): IslamicEvent[] => {
    const events: IslamicEvent[] = [];

    // White Days (Ayyam al-Bid) - 13, 14, 15 of every month
    // Exception: 13th of Dhul-Hijjah is Tashreeq (Holiday/Forbidden to fast), so usually we don't mark it as recommended fasting in the same way, or we mark it with a note.
    // However, for simplicity, we list them generally, but maybe exclude 13 Dhul-Hijjah if we want to be precise.
    // Let's keep it simple for now and add specific holidays that override.

    if (month !== 11) { // Not Dhul-Hijjah (11) for simplicity, or handle specifically
        events.push({ day: 13, month, title: { ar: "الأيام البيض", en: "White Days" }, type: 'fasting' });
        events.push({ day: 14, month, title: { ar: "الأيام البيض", en: "White Days" }, type: 'fasting' });
        events.push({ day: 15, month, title: { ar: "الأيام البيض", en: "White Days" }, type: 'fasting' });
    } else {
        // Dhul-Hijjah: 13 is part of Tashreeq (Forbidden to fast)
        events.push({ day: 14, month, title: { ar: "الأيام البيض", en: "White Days" }, type: 'fasting' });
        events.push({ day: 15, month, title: { ar: "الأيام البيض", en: "White Days" }, type: 'fasting' });
    }

    // Ramadan (Month 8)
    if (month === 8) {
        // It's the whole month, but we can mark the start
        events.push({ day: 1, month, title: { ar: "بداية رمضان", en: "Start of Ramadan" }, type: 'fasting' });
        // Last 10 days?
        events.push({ day: 21, month, title: { ar: "العشر الأواخر", en: "Last 10 Days" }, type: 'other' });
    }

    // Shawwal (Month 9)
    if (month === 9) {
        events.push({ day: 1, month, title: { ar: "عيد الفطر", en: "Eid al-Fitr" }, type: 'holiday' });
    }

    // Dhul-Hijjah (Month 11)
    if (month === 11) {
        events.push({ day: 9, month, title: { ar: "يوم عرفة", en: "Day of Arafah" }, type: 'fasting' });
        events.push({ day: 10, month, title: { ar: "عيد الأضحى", en: "Eid al-Adha" }, type: 'holiday' });
        events.push({ day: 11, month, title: { ar: "أيام التشريق", en: "Tashreeq Days" }, type: 'holiday' });
        events.push({ day: 12, month, title: { ar: "أيام التشريق", en: "Tashreeq Days" }, type: 'holiday' });
        events.push({ day: 13, month, title: { ar: "أيام التشريق", en: "Tashreeq Days" }, type: 'holiday' });
    }

    // Muharram (Month 0)
    if (month === 0) {
        events.push({ day: 1, month, title: { ar: "رأس السنة الهجرية", en: "Islamic New Year" }, type: 'other' });
        events.push({ day: 9, month, title: { ar: "تاسوعاء", en: "Tasua" }, type: 'fasting' });
        events.push({ day: 10, month, title: { ar: "عاشوراء", en: "Ashura" }, type: 'fasting' });
    }

    // Rabi' al-Awwal (Month 2)
    if (month === 2) {
        events.push({ day: 12, month, title: { ar: "المولد النبوي", en: "Mawlid al-Nabi" }, type: 'other' });
    }

    return events.sort((a, b) => a.day - b.day);
};
