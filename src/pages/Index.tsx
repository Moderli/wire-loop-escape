import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SocialButtons, SocialButtonsHorizontal } from '@/components/SocialButtons';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const gradientText =
  'bg-gradient-to-r from-green-400 via-green-300 to-purple-500 bg-clip-text text-transparent';

interface IndexProps {
  onStartGame: (nickname: string) => void;
}

export default function Index({ onStartGame }: IndexProps) {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleStart = () => {
    if (nickname.trim()) {
      onStartGame(nickname);
    } else {
      setError(true);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background text-foreground overflow-hidden p-4">
      {/* Top left social buttons */}
      <div className="absolute top-4 left-4 z-10">
        <SocialButtons />
      </div>

      {/* Top right theme toggle and graphics quality */}
      <div className="absolute top-4 right-4 flex flex-col items-end space-y-2 z-10">
        <ThemeToggle />
        <div className="hidden md:flex flex-col items-end">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-purple-300">Graphics:</span>
            <span className="text-green-400 font-bold text-sm">High quality</span>
          </div>
          <div className="w-10 h-10 mt-1 bg-gradient-to-tr from-green-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-2xl">S</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-6 rounded-xl">
        <h1 className={cn('text-5xl md:text-7xl font-bold mb-2 drop-shadow-lg', gradientText)}>
          WireLoop
        </h1>
        <p className="text-muted-foreground text-center md:text-left">
          Play fair, play safe.
        </p>
        <div className="w-full flex flex-col items-center space-y-4 md:space-y-6 mt-4">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                if (error) setError(false);
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleStart()}
              className={error ? 'border-red-500' : ''}
            />
            <Button onClick={handleStart} className="glow-primary">Start Game</Button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">Please enter a nickname to start.</p>}
          <Link to="/blog">
            <button className="w-32 py-2 rounded-full bg-gradient-to-b from-purple-400 to-purple-700 text-white text-lg font-bold shadow-lg hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400">
              Read Blog
            </button>
          </Link>
          
          {/* Social interaction buttons */}
          <div className="mt-6 pt-4 border-t border-muted-foreground/20">
            <div className="flex flex-col items-center space-y-2">
              <span className="text-sm text-muted-foreground">Connect with us</span>
              <SocialButtonsHorizontal />
            </div>
          </div>
        </div>
      </div> 

      {/* Bottom center: privacy/contact */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-purple-300 text-center">
        <p>© 2024 Wire Loop Game. Challenge your precision!</p>
      </div>
    </div>
  );
}
