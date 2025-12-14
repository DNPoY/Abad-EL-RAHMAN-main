import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FontSizeProvider } from "@/contexts/FontSizeContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AlarmProvider } from "@/contexts/AlarmContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

const queryClient = new QueryClient();

interface AppProvidersProps {
    children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
    return (
        <QueryClientProvider client={queryClient}>
            <LanguageProvider>
                <FontSizeProvider>
                    <SettingsProvider>
                        <NotificationProvider>
                            <AlarmProvider>
                                <TooltipProvider>
                                    <Toaster />
                                    <Sonner />
                                    {children}
                                </TooltipProvider>
                            </AlarmProvider>
                        </NotificationProvider>
                    </SettingsProvider>
                </FontSizeProvider>
            </LanguageProvider>
        </QueryClientProvider>
    );
};
