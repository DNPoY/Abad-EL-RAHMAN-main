import { useEffect } from "react";
import { usePrayerTimes } from "@/contexts/PrayerTimesContext";
import { useWidgetUpdater } from "@/hooks/useWidgetUpdater";
import { usePrayerNotifications } from "@/hooks/usePrayerNotifications";

export const NotificationManager = () => {
    const { prayerTimes } = usePrayerTimes();

    // 1. Update Android Widget
    useWidgetUpdater(prayerTimes);

    // 2. Schedule/Play Notifications
    usePrayerNotifications({ prayerTimes });

    // This component renders nothing, it just runs hooks
    return null;
};
