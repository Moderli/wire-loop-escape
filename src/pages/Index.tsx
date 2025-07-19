import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const gradientText =
  'bg-gradient-to-r from-green-400 via-green-300 to-purple-500 bg-clip-text text-transparent';

export default function Index() {
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  const handlePlay = () => {
    if (nickname.trim()) {
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
          slither.io
        </h1>
        <p className="text-purple-300 text-lg mb-8 mt-2">Eat to grow longer!</p>
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

      {/* Bottom left: Change Skin */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-2 z-10">
        <div className="w-10 h-10 bg-gradient-to-tr from-purple-400 to-purple-700 rounded-full flex items-center justify-center">
          <span className="text-2xl">🐍</span>
        </div>
        <span className="text-green-400 font-semibold cursor-pointer hover:underline">Change Skin</span>
      </div>

      {/* Bottom right: Choose Server */}
      <div className="absolute bottom-4 right-4 flex items-center space-x-2 z-10">
        <div className="w-10 h-10 bg-gradient-to-tr from-green-400 to-blue-500 rounded-full flex items-center justify-center">
          <span className="text-2xl">🌍</span>
        </div>
        <span className="text-green-400 font-semibold cursor-pointer hover:underline">Choose Server</span>
      </div>

      {/* Bottom center: privacy/contact */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-purple-300">
        privacy &ndash; contact
      </div>
    </div>
  );
}
