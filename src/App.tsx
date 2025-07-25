import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Game from "./pages/Game";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import { useEffect, useState } from 'react';

const AppContent = () => {
  // Get initial nickname from localStorage or default to ''
  const [nickname, setNickname] = useState(localStorage.getItem('playerName') || '');
  // Get initial level from localStorage or default to 1
  const [currentLevel, setCurrentLevel] = useState(() => {
    const savedLevel = localStorage.getItem('wireloop-currentLevel');
    return savedLevel ? parseInt(savedLevel, 10) : 1;
  });
  
  const navigate = useNavigate();

  const handleStartGame = (name: string) => {
    // Save to localStorage and state
    localStorage.setItem('playerName', name);
    setNickname(name);
    navigate('/game');
  };

  useEffect(() => {
    localStorage.setItem('wireloop-currentLevel', currentLevel.toString());
  }, [currentLevel]);

  return (
    <Routes>
      <Route path="/" element={<Index onStartGame={handleStartGame} />} />
      <Route path="/game" element={<Game nickname={nickname} currentLevel={currentLevel} setCurrentLevel={setCurrentLevel} />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <AppContent />
        </Router>
        <Analytics />
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
