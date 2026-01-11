/*
 * PROJECT: Ibad Al-Rahman (عباد الرحمن)
 * STATUS: Waqf / Sadaqah Jariyah (Islamic Endowment)
 * LICENSE: GNU GPL v3 (Open Source)
 * * This code is dedicated to the service of Allah.
 * It is free to use/modify but MUST remain Open Source.
 * Selling this code is ethically and legally prohibited.
 * * Please pray for the developer and his parents.
 */

import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProviders } from "@/components/AppProviders";
import { NotificationManager } from "@/components/NotificationManager";
import { BackButtonHandler } from "@/components/BackButtonHandler";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BackgroundMode } from "@anuradev/capacitor-background-mode";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from '@capacitor/app';

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const QuranIndex = lazy(() => import("@/components/QuranIndex").then(module => ({ default: module.QuranIndex })));
const SurahView = lazy(() => import("@/components/SurahView").then(module => ({ default: module.SurahView })));

const App = () => {
  useEffect(() => {
    const initBackgroundMode = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          await BackgroundMode.enable({});
          const hasRequested = localStorage.getItem("hasRequestedBatteryOptimizations");
          if (!hasRequested) {
            await BackgroundMode.requestDisableBatteryOptimizations();
            localStorage.setItem("hasRequestedBatteryOptimizations", "true");
          }

          // Prevent Back Button Exit
          CapApp.addListener('backButton', ({ canGoBack }) => {
            if (canGoBack) {
              window.history.back();
            } else {
              // Exit prevented
            }
          });
        }
      } catch (e) {
        console.error("Background mode initialization error:", e);
      }
    };
    initBackgroundMode();

    // Re-sync alarms when app comes to foreground
    const setupResumeListener = async () => {
      const resumeListener = await CapApp.addListener('appStateChange', async (state: { isActive: boolean }) => {
        if (state.isActive) {
          console.log("App resumed, resyncing alarms...");
          window.dispatchEvent(new Event('app-resumed'));
        }
      });
      return resumeListener;
    };

    const cleanupPromise = setupResumeListener();

    return () => {
      cleanupPromise.then(listener => listener.remove());
    };
  }, []);

  return (
    <ErrorBoundary>
      <AppProviders>
        <NotificationManager />
        <BrowserRouter>
          <BackButtonHandler />
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#f8f9fa] dark:bg-[#1a1c1e] text-primary">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/quran" element={<QuranIndex />} />
              <Route path="/quran/:surahId" element={<SurahView />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AppProviders>
    </ErrorBoundary>
  );
};

export default App;
