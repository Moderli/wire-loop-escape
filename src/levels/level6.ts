import { LevelData } from '@/lib/types';

// Simplified vortex with much fewer segments for optimal performance
const vortexPoints = [];
const radius = 150;
const segments = 30; // Further reduced from 60 to 30 for better performance
const zigzagFrequency = 3; // Reduced frequency for even smoother gameplay
const zigzagAmplitude = 12; // Further reduced amplitude

for (let i = 0; i <= segments; i++) {
  const angle = (i / segments) * 2 * Math.PI * 0.95; // Use 95% of a circle to create a gap
  const a = i * (zigzagFrequency / segments) * 2 * Math.PI;

  const r = radius + Math.sin(a) * zigzagAmplitude;

  vortexPoints.push({
    x: Math.cos(angle) * r,
    y: Math.sin(angle) * r,
    z: 0,
  });
}

export const level6: LevelData = {
  id: 6,
  name: 'Zigzag Vortex',
  difficulty: 'expert',
  wirePath: vortexPoints,
}; 