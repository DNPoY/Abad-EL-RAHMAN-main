import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { Locate, Navigation, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Placeholder key - User must replace this!
// In a real production app, this should be in an environment variable e.g. import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_API_KEY = "AIzaSyCASvoMpChtoZibGOJpm2M26kQTRgxE8ZQ";

const libraries: ("places")[] = ["places"];

const mapContainerStyle = {
    width: '100%',
    height: '100%'
};

const defaultCenter = {
    lat: 30.0444, // Cairo
    lng: 31.2357
};

const options = {
    disableDefaultUI: true,
    zoomControl: true,
};

export const MasjidFinder = () => {
    const { t, language } = useLanguage();
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [center, setCenter] = useState(defaultCenter);
    const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
    const [mosques, setMosques] = useState<google.maps.places.PlaceResult[]>([]);
    const [selectedMosque, setSelectedMosque] = useState<google.maps.places.PlaceResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries
    });

    const fetchNearbyMosques = useCallback((location: google.maps.LatLngLiteral) => {
        if (!map) return;

        setIsLoading(true);
        const service = new google.maps.places.PlacesService(map);
        const request = {
            location: location,
            radius: 5000, // 5km radius
            type: 'mosque'
        };

        service.nearbySearch(request, (results, status) => {
            setIsLoading(false);
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                setMosques(results);
            } else {
                toast.error(language === 'ar' ? 'حدث خطأ أثناء البحث عن المساجد' : 'Error searching for mosques');
            }
        });
    }, [map, language]);

    const handleLocateMe = useCallback(() => {
        if (navigator.geolocation) {
            setIsLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setCenter(pos);
                    setUserLocation(pos);
                    setIsLoading(false);
                    toast.success(language === 'ar' ? 'تم تحديد موقعك' : 'Location found');
                },
                (error) => {
                    setIsLoading(false);
                    console.error("Error getting location: ", error);
                    toast.error(language === 'ar'
                        ? 'تعذر تحديد موقعك. تأكد من تفعيل خدمة الموقع.'
                        : 'Could not find location. Please enable location services.');
                }
            );
        } else {
            toast.error(language === 'ar' ? 'المتصفح لا يدعم تحديد الموقع' : 'Browser does not support geolocation');
        }
    }, [language]);

    // Initial location fetch when map is ready
    // Initial location fetch
    useEffect(() => {
        handleLocateMe();
    }, [handleLocateMe]);

    // Update map when user location is found or map works
    useEffect(() => {
        if (map && userLocation) {
            map.panTo(userLocation);
            fetchNearbyMosques(userLocation);
        }
    }, [map, userLocation, fetchNearbyMosques]);


    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    if (loadError) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] p-4 text-center">
                <MapPin className="w-16 h-16 text-red-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
                    {language === 'ar' ? 'خطأ في تحميل الخريطة' : 'Error Loading Map'}
                </h3>
                <p className="text-gray-500 max-w-xs text-sm">
                    {loadError.message}
                </p>
                <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg text-xs">
                    <p>Make sure you have added a valid Google Maps API Key in <code>src/components/MasjidFinder.tsx</code></p>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-200px)] w-full relative rounded-2xl overflow-hidden shadow-xl border border-white/10">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={12}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={options}
            >
                {/* User Location Marker */}
                {userLocation && (
                    <Marker
                        position={userLocation}
                        icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 7,
                            fillColor: "#4285F4",
                            fillOpacity: 1,
                            strokeColor: "white",
                            strokeWeight: 2,
                        }}
                        title={language === 'ar' ? "موقعك الحالي" : "Your Location"}
                    />
                )}

                {/* Mosque Markers */}
                {mosques.map((mosque) => (
                    <Marker
                        key={mosque.place_id}
                        position={mosque.geometry?.location || undefined}
                        onClick={() => setSelectedMosque(mosque)}
                        icon={{
                            url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                        }}
                    />
                ))}

                {/* Info Window for Selected Mosque */}
                {selectedMosque && (
                    <InfoWindow
                        position={selectedMosque.geometry?.location || undefined}
                        onCloseClick={() => setSelectedMosque(null)}
                    >
                        <div className="p-2 min-w-[200px] text-right" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            <h3 className="font-bold text-gray-800 mb-1">{selectedMosque.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{selectedMosque.vicinity}</p>

                            <div className="flex gap-2 text-xs mt-2">
                                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                    {selectedMosque.rating ? `⭐ ${selectedMosque.rating}` : (language === 'ar' ? 'لا يوجد تقييم' : 'No rating')}
                                </span>
                            </div>

                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMosque.geometry?.location?.lat()},${selectedMosque.geometry?.location?.lng()}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 block w-full text-center bg-blue-600 text-white py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors"
                            >
                                {language === 'ar' ? 'احصل على الاتجاهات' : 'Get Directions'}
                            </a>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>

            {/* Locate Me Button */}
            <Button
                onClick={handleLocateMe}
                disabled={isLoading}
                className="absolute bottom-6 right-4 z-10 rounded-full w-12 h-12 p-0 shadow-lg bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
                title={language === 'ar' ? "موقعي" : "My Location"}
            >
                <Locate className={`w-6 h-6 ${isLoading ? 'animate-pulse text-blue-500' : ''}`} />
            </Button>

            {/* Search/Refresh Area Button */}
            <Button
                onClick={() => {
                    if (map) {
                        const newCenter = map.getCenter();
                        if (newCenter) {
                            fetchNearbyMosques({ lat: newCenter.lat(), lng: newCenter.lng() });
                        }
                    }
                }}
                className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/90 backdrop-blur text-emerald-800 hover:bg-white shadow-md rounded-full px-4 py-1 text-sm font-medium border border-emerald-100"
            >
                {language === 'ar' ? 'بحث في هذه المنطقة' : 'Search this area'}
            </Button>

        </div>
    );
};
