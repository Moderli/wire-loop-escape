import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface LeaderboardEntry {
  playerName: string;
  timeTaken: number;
  failures: number;
}

interface LeaderboardProps {
  level: number;
  currentUser: string;
}

export default function Leaderboard({ level, currentUser }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'levelCompletions'));
      const levelKey = `level${level}`;
      const data: LeaderboardEntry[] = [];
      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        if (d[levelKey] && d.playerName) {
          data.push({
            playerName: d.playerName,
            timeTaken: d[levelKey].timeTaken,
            failures: d[levelKey].failures || 0,
          });
        }
      });
      data.sort((a, b) => a.timeTaken - b.timeTaken);
      setEntries(data.slice(0, 10));
      setLoading(false);
    }
    fetchLeaderboard();
  }, [level]);

  return (
    <div className="w-full max-w-md mx-auto bg-black/80 rounded-lg shadow-lg p-4 mt-6">
      <h3 className="text-2xl font-bold text-center text-yellow-400 mb-4">Leaderboard (Level {level})</h3>
      {loading ? (
        <div className="text-center text-white">Loading...</div>
      ) : (
        <table className="w-full text-white border-separate border-spacing-y-2">
          <thead>
            <tr className="text-yellow-300 text-lg">
              <th className="text-left pl-2">Rank</th>
              <th className="text-left">Name</th>
              <th className="text-right">Time (s)</th>
              <th className="text-right">Fails</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={entry.playerName} className={entry.playerName === currentUser ? 'bg-yellow-900/60 font-bold' : 'hover:bg-white/10'}>
                <td className="pl-2">{i + 1}</td>
                <td>{entry.playerName}</td>
                <td className="text-right">{entry.timeTaken.toFixed(2)}</td>
                <td className="text-right">{entry.failures}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 