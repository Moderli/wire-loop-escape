import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { WireLoopGame } from '@/components/WireLoopGame';

interface GameProps {
  currentLevel: number;
  setCurrentLevel: (level: number) => void;
}

export default function Game({ currentLevel, setCurrentLevel }: GameProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const nickname = location.state?.nickname || '';

  useEffect(() => {
    if (!nickname) {
      // If no nickname, redirect to home
      navigate('/', { replace: true });
    }
  }, [nickname, navigate]);

  if (!nickname) return null;

  return <WireLoopGame nickname={nickname} currentLevel={currentLevel} setCurrentLevel={setCurrentLevel} />;
} 