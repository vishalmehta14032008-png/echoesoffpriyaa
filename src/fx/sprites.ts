/** Pre-rendered particle sprites — drawing images is far cheaper than paths per frame. */
const cache = new Map<string, HTMLCanvasElement>();

function make(key: string, size: number, draw: (c: CanvasRenderingContext2D, s: number) => void) {
  const hit = cache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const c = cv.getContext("2d")!;
  draw(c, size);
  cache.set(key, cv);
  return cv;
}

export function heart(color: string) {
  return make(`heart-${color}`, 64, (c, s) => {
    c.translate(s / 2, s / 2 + 4);
    c.scale(s / 64, s / 64);
    c.beginPath();
    c.moveTo(0, 18);
    c.bezierCurveTo(-30, -2, -22, -26, 0, -12);
    c.bezierCurveTo(22, -26, 30, -2, 0, 18);
    c.closePath();
    const g = c.createLinearGradient(-20, -20, 20, 20);
    g.addColorStop(0, "#fff");
    g.addColorStop(0.25, color);
    g.addColorStop(1, color);
    c.fillStyle = g;
    c.shadowColor = color;
    c.shadowBlur = 6;
    c.fill();
  });
}

export function flower(color: string, center = "#ffe2a8") {
  return make(`flower-${color}`, 64, (c, s) => {
    c.translate(s / 2, s / 2);
    c.fillStyle = color;
    for (let i = 0; i < 5; i++) {
      c.save();
      c.rotate((i * Math.PI * 2) / 5);
      c.beginPath();
      c.ellipse(0, -12, 8.5, 13, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }
    c.beginPath();
    c.arc(0, 0, 6, 0, Math.PI * 2);
    c.fillStyle = center;
    c.fill();
  });
}

export function glow(color: string) {
  return make(`glow-${color}`, 48, (c, s) => {
    const g = c.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.18, color);
    g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g;
    c.fillRect(0, 0, s, s);
  });
}

export function petal(color: string) {
  return make(`petal-${color}`, 48, (c, s) => {
    c.translate(s / 2, s / 2);
    c.beginPath();
    c.moveTo(0, -18);
    c.bezierCurveTo(14, -10, 12, 10, 0, 18);
    c.bezierCurveTo(-12, 10, -14, -10, 0, -18);
    const g = c.createLinearGradient(0, -18, 0, 18);
    g.addColorStop(0, "#fff7fb");
    g.addColorStop(1, color);
    c.fillStyle = g;
    c.globalAlpha = 0.9;
    c.fill();
  });
}

export const HEART_COLORS = ["#f2a2c0", "#e889ad", "#cdb6f6", "#f7c4d6", "#b9a2ec"];
export const FLOWER_COLORS = ["#ffffff", "#f8cfe0", "#dccdfc", "#fde3ec"];
export const GLOW_COLORS = ["rgba(255,214,236,.85)", "rgba(220,205,255,.85)", "rgba(255,240,210,.85)"];
