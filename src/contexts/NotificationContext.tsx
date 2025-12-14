import React, { createContext, useContext, useState, useEffect } from "react";
import { useLanguage } from "./LanguageContext";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

interface NotificationSettings {
  enabled: boolean;
  adhanSound: "makkah" | "madinah" | "egypt";
  reminderMinutes: number;
  enabledPrayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
}

interface NotificationContextType {
  settings: NotificationSettings;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  requestPermission: () => Promise<boolean>;
  hasPermission: boolean;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  adhanSound: "makkah",
  reminderMinutes: 9,
  enabledPrayers: {
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, t } = useLanguage();
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem("notificationSettings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setHasPermission(Notification.permission === "granted");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("notificationSettings", JSON.stringify(settings));
  }, [settings]);

  const requestPermission = async (): Promise<boolean> => {
    // Native Platform (Android/iOS)
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await LocalNotifications.requestPermissions();
        const granted = result.display === 'granted';
        setHasPermission(granted);
        if (granted) {
          toast.success(language === "ar" ? "تم تفعيل التنبيهات بنجاح" : "Notifications enabled successfully");
        } else {
          toast.error(language === "ar" ? "تم رفض الإذن" : "Permission denied");
        }
        return granted;
      } catch (error) {
        console.error("Error requesting native permission:", error);
        return false;
      }
    }

    // Web Platform
    if (!("Notification" in window)) {
      toast.error(language === "ar" ? "المتصفح لا يدعم التنبيهات" : "Browser doesn't support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      setHasPermission(true);
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      const granted = permission === "granted";
      setHasPermission(granted);

      if (granted) {
        toast.success(language === "ar" ? "تم تفعيل التنبيهات بنجاح" : "Notifications enabled successfully");
      }

      return granted;
    }

    return false;
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const value = {
    settings,
    updateSettings,
    requestPermission,
    hasPermission,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};
