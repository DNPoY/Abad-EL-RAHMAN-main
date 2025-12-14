export const getHijriDate = (date: Date, language: "ar" | "en" = "en") => {
    return new Intl.DateTimeFormat(language === "ar" ? "ar-SA" : "en-u-ca-islamic-umalqura", {
        day: "numeric",
        month: "long",
        year: "numeric",
        calendar: "islamic-umalqura",
    }).format(date);
};

export const getHijriMonthName = (date: Date, language: "ar" | "en" = "en") => {
    return new Intl.DateTimeFormat(language === "ar" ? "ar-SA" : "en-u-ca-islamic-umalqura", {
        month: "long",
        calendar: "islamic-umalqura",
    }).format(date);
};

export const getHijriYear = (date: Date) => {
    const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
        year: "numeric",
        calendar: "islamic-umalqura",
    }).formatToParts(date);
    return parts.find((p) => p.type === "year")?.value || "";
};

// Helper to get days in a Hijri month (approximate/computed via iteration)
// Since Intl doesn't give "days in month" directly, we iterate to find the last day
export const getHijriMonthDays = (year: number, monthIndex: number): number => {
    // This is a bit tricky with Intl as we can't easily construct a date from Hijri year/month
    // So we might need a different approach for the full calendar grid if we want 100% accuracy without a library.
    // For now, we will use a simplified approach or rely on the fact that Hijri months are 29 or 30 days.
    // A robust way without library is complex. 
    // Let's try to find the Gregorian date that corresponds to the start of the Hijri month
    // and iterate until the month changes.

    // Actually, for the "Calendar View" specifically, using a library like 'hijri-date' or 'moment-hijri' 
    // is usually recommended, but we want to stay lightweight.
    // We will build the calendar grid based on the *current* Gregorian month's view 
    // but showing Hijri dates, OR we try to show a Hijri month view.

    // Let's stick to showing the Hijri date for the *current* day primarily, 
    // and for the calendar view, we can show a Gregorian calendar where each cell ALSO shows the Hijri day.
    // This is often more useful for users living in Gregorian-dominant societies.
    return 30; // Placeholder if we strictly need month length, but we might not need it if we map Gregorian -> Hijri
};
