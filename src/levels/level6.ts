import { LevelData } from '@/lib/types';

const vortexPoints = [];
const radius = 150;
const segments = 120; // Increased segments for a smoother circle
const zigzagFrequency = 5; // How many zigzags in total
const zigzagAmplitude = 20; // How much they go in and out

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