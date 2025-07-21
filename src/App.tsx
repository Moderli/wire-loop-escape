import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Game from "./pages/Game";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import { useEffect, useState } from 'react';

const App = () => {
  const [currentLevel, setCurrentLevel] = useState(() => {
    const savedLevel = localStorage.getItem('wireloop-currentLevel');
    return savedLevel ? parseInt(savedLevel, 10) : 1;
  });

  useEffect(() => {
    localStorage.setItem('wireloop-currentLevel', currentLevel.toString());
  }, [currentLevel]);

  return (
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/game" element={<Game currentLevel={currentLevel} setCurrentLevel={setCurrentLevel} />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
        <Analytics />
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
