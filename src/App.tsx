import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";
import Game from "./pages/Game";
import { useEffect, useState } from 'react';
import { startTimeTracking, updateTimeSpent } from '@/lib/metrics';

const queryClient = new QueryClient();

const App = () => {
  const [currentLevel, setCurrentLevel] = useState(() => {
    const savedLevel = localStorage.getItem('wireloop-currentLevel');
    return savedLevel ? parseInt(savedLevel, 10) : 1;
  });

  useEffect(() => {
    localStorage.setItem('wireloop-currentLevel', currentLevel.toString());
  }, [currentLevel]);
  
  useEffect(() => {
    startTimeTracking();

    const handleBeforeUnload = () => {
      updateTimeSpent();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    const interval = setInterval(() => {
      updateTimeSpent();
      startTimeTracking();
    }, 60000); // every minute

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(interval);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/game" element={<Game currentLevel={currentLevel} setCurrentLevel={setCurrentLevel} />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
        <Analytics />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
