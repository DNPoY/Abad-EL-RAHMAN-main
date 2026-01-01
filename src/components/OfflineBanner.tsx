import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Offline Banner Component
 * Shows a banner at the top when user goes offline
 */
export const OfflineBanner = () => {
    const isOnline = useOnlineStatus();
    const { language } = useLanguage();

    return (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed top-0 left-0 right-0 z-[100] pt-safe"
                >
                    <Alert className="rounded-none border-x-0 border-t-0 bg-amber-500 text-white border-amber-600">
                        <WifiOff className="h-4 w-4" />
                        <AlertDescription className="font-tajawal">
                            {language === 'ar'
                                ? 'أنت غير متصل بالإنترنت. بعض الميزات قد لا تعمل.'
                                : 'You are offline. Some features may not work.'}
                        </AlertDescription>
                    </Alert>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
