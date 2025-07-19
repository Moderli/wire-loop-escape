import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { WireLoopGame } from '@/components/WireLoopGame';

export default function Game() {
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

  return <WireLoopGame nickname={nickname} />;
} 