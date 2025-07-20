import { LevelData } from '@/lib/types';

// Level 7: "Mountain Serpent" - A winding path that climbs and descends like a mountain trail
// No overlaps, but challenging elevation changes and tight curves
const mountainSerpentPoints = [
  // Starting at the base of the "mountain"
  { x: -150, y: 0, z: -40 },
  { x: -140, y: -10, z: -35 },
  { x: -125, y: -15, z: -30 },
  
  // First switchback - climbing up
  { x: -110, y: -20, z: -25 },
  { x: -90, y: -25, z: -20 },
  { x: -70, y: -30, z: -15 },
  { x: -50, y: -35, z: -10 },
  { x: -30, y: -40, z: -5 },
  
  // Sharp turn - first switchback
  { x: -10, y: -45, z: 0 },
  { x: 10, y: -40, z: 5 },
  { x: 30, y: -30, z: 10 },
  { x: 50, y: -20, z: 15 },
  { x: 70, y: -10, z: 20 },
  
  // Climbing higher - second level
  { x: 90, y: 0, z: 25 },
  { x: 110, y: 10, z: 30 },
  { x: 120, y: 25, z: 35 },
  { x: 125, y: 45, z: 40 },
  
  // Peak approach - getting steeper
  { x: 120, y: 65, z: 45 },
  { x: 110, y: 80, z: 50 },
  { x: 95, y: 90, z: 55 },
  { x: 75, y: 95, z: 60 },
  
  // The peak - highest point
  { x: 50, y: 100, z: 65 },
  { x: 25, y: 105, z: 70 },
  { x: 0, y: 110, z: 75 },
  { x: -25, y: 105, z: 70 },
  
  
  // Steep descent with switchbacks
  { x: -120, y: 50, z: 45 },
  { x: -125, y: 30, z: 40 },
  { x: -120, y: 10, z: 35 },
  { x: -110, y: -5, z: 30 },
  
  // Third switchback - going back the other direction
  { x: -95, y: -15, z: 25 },
  { x: -75, y: -20, z: 20 },
  { x: -50, y: -15, z: 15 },
  { x: -25, y: -10, z: 10 },
  { x: 0, y: -5, z: 5 },
  
  // Final descent - zigzag pattern
  { x: 25, y: 0, z: 0 },
  { x: 45, y: 10, z: -5 },
  { x: 60, y: 25, z: -10 },
  { x: 70, y: 45, z: -15 },
  { x: 75, y: 65, z: -20 },
];

export const level7: LevelData = {
  id: 7,
  name: 'Mountain Serpent',
  difficulty: 'hard',
  wirePath: mountainSerpentPoints,
};