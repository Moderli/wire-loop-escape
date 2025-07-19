import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { getMetrics } from '@/lib/metrics';

const gradientText =
  'bg-gradient-to-r from-green-400 via-green-300 to-purple-500 bg-clip-text text-transparent';

export default function Index() {
  const [nickname, setNickname] = useState('');
  const [metrics, setMetrics] = useState({ visitors: 0, timeSpent: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMetrics = async () => {
      const data = await getMetrics();
      setMetrics(data);
    };
    fetchMetrics();
  }, []);

  const handlePlay = async () => {
    if (nickname.trim()) {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });
      navigate('/game', { state: { nickname } });
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#181c23] text-white overflow-hidden">
      {/* Top left social buttons (placeholders) */}
      <div className="absolute top-4 left-4 flex space-x-2 z-10">
        <button className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1 rounded shadow">Like</button>
        <button className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1 rounded shadow">Share</button>
        <button className="bg-black/80 hover:bg-black text-xs px-3 py-1 rounded shadow">Follow</button>
      </div>

      {/* Top right graphics quality (placeholder) */}
      <div className="absolute top-4 right-4 flex flex-col items-end z-10">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-purple-300">Graphics:</span>
          <span className="text-green-400 font-bold text-sm">High quality</span>
        </div>
        <div className="w-10 h-10 mt-1 bg-gradient-to-tr from-green-400 to-purple-500 rounded-full flex items-center justify-center">
          <span className="text-2xl">S</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-6 rounded-xl">
        <h1 className={cn('text-7xl font-bold mb-2 drop-shadow-lg', gradientText)}>
          WireLoop
        </h1>
        <p className="text-muted-foreground">
          Play fair, play safe.
        </p>
        <div className="w-full flex flex-col items-center space-y-6">
          <input
            className="w-full max-w-sm px-6 py-3 rounded-full bg-[#3a3350] text-lg text-purple-200 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-lg mb-2"
            placeholder="Nickname"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            maxLength={20}
          />
          <button
            className="w-32 py-3 rounded-full bg-gradient-to-b from-green-400 to-green-700 text-white text-2xl font-bold shadow-lg hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-green-400"
            onClick={handlePlay}
            disabled={!nickname.trim()}
            style={{ boxShadow: '0 4px 24px 0 #1a3a2a55' }}
          >
            Play
          </button>
        </div>
      </div> 

      {/* Bottom center: privacy/contact */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-purple-300">
        <p>Total Visitors: {metrics.visitors}</p>
        <p>Total Time Spent: {Math.floor(metrics.timeSpent / 60)} minutes</p>
      </div>
    </div>
  );
}
