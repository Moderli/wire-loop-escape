// Spiral wire loop for level 1 (1 curve, 10 points)
export const wireLoop = Array.from({ length: 10 }, (_, i) => {
  const t = (i / 9) * Math.PI * 2; // 0 to 2π
  const r = 100;
  return {
    x: Math.cos(t) * r,
    y: Math.sin(t) * r,
    z: 20 * Math.sin(t * 2),
  };
}); 