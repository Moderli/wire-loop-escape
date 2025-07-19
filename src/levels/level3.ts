// Spiral wire loop for level 3 (3 curves, 30 points)
export const wireLoop = Array.from({ length: 30 }, (_, i) => {
  const t = (i / 29) * Math.PI * 6; // 0 to 6π (3 full spirals)
  const r = 100 + 30 * Math.sin(t * 0.7);
  return {
    x: Math.cos(t) * r,
    y: Math.sin(t) * r,
    z: 40 * Math.sin(t * 2),
  };
}); 