import { db } from '../firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

export async function logLevelCompletion({
  playerName,
  level,
  timeSpent,
  failures,
}: {
  playerName: string;
  level: number;
  timeSpent: number;
  failures: number;
}) {
  if (!playerName || playerName === 'Guest' || playerName.trim() === '') {
    console.warn('Player name is not set. Skipping leaderboard logging.');
    return;
  }

  const playerDocRef = doc(db, 'levelCompletions', playerName);
  const levelKey = `level${level}`;

  try {
    // Using setDoc with merge: true will create the document for the player if it doesn't exist,
    // or update it with the new level data without overwriting existing level data.
    await setDoc(playerDocRef, {
      [levelKey]: {
        timeTaken: timeSpent,
        failures: failures,
        timestamp: Timestamp.now(),
      }
    }, { merge: true });

    console.log(`Leaderboard updated for ${playerName}, Level ${level}.`);
  } catch (e) {
    console.error('Error updating leaderboard:', e);
  }
} 