// Spiral wire loop for level 2 (2 curves, 20 points)
export const wireLoop = Array.from({ length: 20 }, (_, i) => {
  const t = (i / 19) * Math.PI * 4; // 0 to 4π (2 full spirals)
  const r = 100 + 20 * Math.sin(t);
  return {
    x: Math.cos(t) * r,
    y: Math.sin(t) * r,
    z: 30 * Math.sin(t * 1.5),
  };
}); 