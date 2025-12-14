import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Compass, Navigation } from "lucide-react";
import { toast } from "sonner";

export const QiblaCompass = () => {
  const { t, language } = useLanguage();
  const [qiblaDirection, setQiblaDirection] = useState<number>(0);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const calculateQibla = (latitude: number, longitude: number) => {
      // Kaaba coordinates
      const kaabaLat = 21.4225;
      const kaabaLng = 39.8262;

      const lat1 = (latitude * Math.PI) / 180;
      const lat2 = (kaabaLat * Math.PI) / 180;
      const dLng = ((kaabaLng - longitude) * Math.PI) / 180;

      const y = Math.sin(dLng) * Math.cos(lat2);
      const x =
        Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

      let bearing = Math.atan2(y, x);
      bearing = (bearing * 180) / Math.PI;
      bearing = (bearing + 360) % 360;

      setQiblaDirection(bearing);
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          calculateQibla(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const requestPermission = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ("DeviceOrientationEvent" in window && typeof (DeviceOrientationEvent as any).requestPermission === "function") {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === "granted") {
            setHasPermission(true);
          }
        } catch (error) {
          console.error("Permission denied:", error);
        }
      } else {
        setHasPermission(true);
      }
    };

    requestPermission();
  }, []);

  useEffect(() => {
    if (!hasPermission) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const alpha = event.alpha || 0;
      setDeviceHeading(360 - alpha);
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [hasPermission]);

  const relativeQibla = (qiblaDirection - deviceHeading + 360) % 360;
  const isAligned = Math.abs(relativeQibla) < 5 || Math.abs(relativeQibla) > 355;

  useEffect(() => {
    if (isAligned && "vibrate" in navigator) {
      navigator.vibrate(50);
    }
  }, [isAligned]);

  return (
    <Card className="p-6 islamic-pattern">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold font-amiri mb-2">{t.qiblaDirection}</h3>
        <p className="text-sm text-muted-foreground">{t.pointNorth}</p>
      </div>

      <div className="relative w-64 h-64 mx-auto">
        {/* Compass Background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-muted to-background border-4 border-primary/20 shadow-lg">
          {/* Cardinal Points - ROTATING with device to show Real North */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
            style={{ transform: `rotate(${-deviceHeading}deg)` }}
          >
            <div className="relative w-full h-full">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 font-bold text-red-500">N</div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-bold text-muted-foreground">S</div>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">W</div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">E</div>
            </div>
          </div>

          {/* Qibla Direction Arrow */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out"
            style={{ transform: `rotate(${relativeQibla}deg)` }}
          >
            <div className="flex flex-col items-center">
              <Navigation
                className={`w-16 h-16 drop-shadow-lg transition-colors duration-300 ${isAligned ? 'text-green-600 fill-green-600 animate-pulse' : 'text-accent fill-accent'}`}
              />
              {isAligned && (
                <span className="mt-2 text-xs font-bold text-green-700 bg-white/90 px-2 py-1 rounded-full shadow-sm">
                  {language === "ar" ? "القبلة!" : "Qibla!"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center Kaaba Symbol */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Changed bg-primary to bg-white, and text-primary-foreground to text-primary */}
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-primary shadow-lg border border-gray-100">
            <Compass className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-lg font-amiri">
          <span className="text-muted-foreground">{language === "ar" ? "الاتجاه:" : "Direction:"}</span>{" "}
          <span className={`font-bold transition-colors ${isAligned ? "text-green-600" : "text-primary"}`}>
            {Math.round(qiblaDirection)}°
          </span>
        </p>
        <div className="h-6">
          {isAligned && <p className="text-green-600 font-bold animate-bounce">{language === "ar" ? "أنت تواجه القبلة الآن" : "You are facing the Qibla"}</p>}
        </div>
      </div>
    </Card>
  );
};
