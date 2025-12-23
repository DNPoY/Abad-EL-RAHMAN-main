import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Compass, Navigation } from "lucide-react";
import { toast } from "sonner";

export const QiblaCompass = () => {
  const { t, language } = useLanguage();
  // Load cached values immediately to prevent waiting
  const [qiblaDirection, setQiblaDirection] = useState<number>(() => {
    const cached = localStorage.getItem("qiblaDirection");
    return cached ? parseFloat(cached) : 0;
  });
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
      localStorage.setItem("qiblaDirection", bearing.toString());
    };

    if ("geolocation" in navigator) {
      // 1. Try to get cached location immediately (fastest)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          calculateQibla(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log("Cached location failed, trying fresh...", error);
          // 2. Fallback to fresh location if no cache available
          navigator.geolocation.getCurrentPosition(
            (position) => {
              calculateQibla(position.coords.latitude, position.coords.longitude);
            },
            (err) => console.error("Error getting location:", err),
            { enableHighAccuracy: true, timeout: 10000 }
          );
        },
        { maximumAge: Infinity, timeout: 5000, enableHighAccuracy: false }
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
    <Card className="p-6 islamic-pattern border-primary/20 bg-emerald-950/30 backdrop-blur-sm">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold font-amiri mb-2 text-primary dark:text-emerald-400">{t.qiblaDirection}</h3>
        <p className="text-sm text-muted-foreground">{t.pointNorth}</p>
      </div>

      <div className="relative w-72 h-72 mx-auto">
        {/* Main Compass Body - Gold Gradient Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#C5A059] via-[#F0E68C] to-[#8B6508] shadow-2xl overflow-hidden p-[6px]">
          {/* Inner Content - Compass Background */}
          <div className="w-full h-full rounded-full bg-[#094231] relative">

            {/* Inner Decorative Pattern (Subtle) */}
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at center, transparent 30%, #000 100%)' }} />

            {/* Rotating Dial (Compass Face) - Rotates to point North */}
            <div
              className="absolute inset-0 transition-transform duration-500 ease-out"
              style={{ transform: `rotate(${-deviceHeading}deg)` }}
            >
              {/* Golden Ratio Spiral Element (Creative Addition) */}
              <div className="absolute inset-6 opacity-10">
                <svg viewBox="0 0 100 100" className="w-full h-full stroke-[#C5A059] fill-none" strokeWidth="0.5">
                  <path d="M50 50 L50 50 A 1 1 0 0 1 51 51 A 2 2 0 0 1 49 53 A 5 5 0 0 1 44 48 A 13 13 0 0 1 57 35 A 34 34 0 0 1 91 69" />
                  <circle cx="50" cy="50" r="1.5" fill="#C5A059" />
                </svg>
              </div>

              {/* Cardinal Points Only - No Ticks */}
              <div className="absolute inset-2">
                <span className="absolute top-2 left-1/2 -translate-x-1/2 font-bold text-[#FF6B6B] text-xl font-amiri">N</span> {/* Softer Red */}
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-bold text-[#C5A059] text-xl font-amiri">S</span>
                <span className="absolute top-1/2 left-2 -translate-y-1/2 font-bold text-[#C5A059] text-xl font-amiri">W</span>
                <span className="absolute top-1/2 right-2 -translate-y-1/2 font-bold text-[#C5A059] text-xl font-amiri">E</span>
              </div>
            </div>

            {/* Qibla Needle (The Golden Pointer) */}
            <div
              className="absolute inset-0 transition-transform duration-500 ease-out"
              style={{ transform: `rotate(${-deviceHeading}deg)` }}
            >
              <div
                className="absolute inset-0 transition-transform duration-700 ease-out"
                style={{ transform: `rotate(${qiblaDirection}deg)` }}
              >
                {/* The Needle Graphic */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center"> {/* Adjusted top position for larger icon */}
                  {/* Kaaba Icon at tip - Larger & White */}
                  <div className={`transition-all duration-500 ${isAligned ? "scale-125 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-bounce" : "scale-100"}`}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> {/* Increased size to 48x48 */}
                      <path d="M4 7H20V19H4V7Z" fill="#FFFFFF" stroke="#000000" strokeWidth="2" /> {/* White Fill with Black Outline */}
                      <path d="M4 7L12 11L20 7" stroke="#000000" strokeWidth="2" />
                      <path d="M4 11H20" stroke="#000000" strokeWidth="1" strokeOpacity="0.5" />
                      {/* Add Gold Band to Kaaba for detail */}
                      <rect x="4" y="9" width="16" height="3" fill="#FFD700" fillOpacity="0.8" />
                    </svg>
                  </div>
                  {/* The Needle Shaft */}
                  <div className={`w-1.5 h-20 rounded-full -mt-2 bg-gradient-to-b from-[#FFFFFF] to-transparent opacity-80 ${isAligned ? "shadow-[0_0_15px_#FFFFFF]" : ""}`} />
                </div>
              </div>
            </div>

            {/* Center Pivot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-[#C5A059] border-2 border-[#094231] shadow-lg z-10" />
              <div className="w-32 h-0.5 bg-[#C5A059]/30 absolute rotate-90" /> {/* Crosshair Vertical */}
              <div className="w-32 h-0.5 bg-[#C5A059]/30 absolute" /> {/* Crosshair Horizontal */}
            </div>
          </div>

        </div>

      </div>

      <div className="mt-8 text-center space-y-2">
        <div className="inline-block px-4 py-2 rounded-full bg-[#094231]/10 border border-[#C5A059]/30">
          <span className="text-3xl font-bold text-[#C5A059] font-amiri">
            {Math.round(deviceHeading)}° <span className="text-sm text-muted-foreground mx-2">➞</span>
            <span className={`${isAligned ? "text-green-500" : "text-primary"}`}>{Math.round(qiblaDirection)}°</span>
          </span>
        </div>

        <div className="h-8 flex items-center justify-center">
          {isAligned && (
            <div className="flex items-center gap-2 text-green-600 bg-green-100/50 px-3 py-1 rounded-full animate-bounce">
              <Compass className="w-4 h-4" />
              <span className="font-bold">{language === "ar" ? "القبلة صحيحة!" : "You are facing the Qibla!"}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
