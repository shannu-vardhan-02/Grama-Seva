import { useRef, useEffect, useState } from "react";

/* ─────────────────────────────────────────────
   BloomingFlower
   Point-cloud flower that blooms on hover.
   Inspired by originkit's "blooming-flower".
───────────────────────────────────────────── */
export default function BloomingFlower({ size = 260, color = "#cc785c" }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ bloom: 0, target: 0, raf: null, pts: [] });
  const [hovered, setHovered] = useState(false);

  /* Parse hex → [r,g,b] */
  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const W = size * dpr;
    const H = size * dpr;
    canvas.width = W;
    canvas.height = H;

    const cx = W / 2;
    const cy = H / 2 + H * 0.06; // shift center slightly down (stem)
    const [r, g, b] = hexToRgb(color);

    const PETALS = 6;
    const ROWS = 18; // rings per petal
    const PTS_PER_ROW = 12;
    const MAX_R = W * 0.38;
    const STEM_LEN = H * 0.28;

    /* Build point cloud once */
    const pts = [];

    // ── Petals ────────────────────────────────
    for (let p = 0; p < PETALS; p++) {
      const petalAngle = (p / PETALS) * Math.PI * 2;
      for (let row = 0; row < ROWS; row++) {
        const t = row / ROWS;
        const petalR = MAX_R * Math.sin(t * Math.PI) * 0.9;
        const along = MAX_R * t;
        const pts_in_row = Math.max(2, Math.round(PTS_PER_ROW * Math.sin(t * Math.PI)));
        for (let k = 0; k < pts_in_row; k++) {
          const spread = (k / (pts_in_row - 1) - 0.5) * 2;
          const perpAngle = petalAngle + Math.PI / 2;
          const bx = Math.cos(petalAngle) * along + Math.cos(perpAngle) * spread * petalR;
          const by = Math.sin(petalAngle) * along + Math.sin(perpAngle) * spread * petalR;
          const depth = 1 - t * 0.4;
          const alpha = 0.3 + 0.7 * Math.pow(Math.sin(t * Math.PI), 0.7);
          const dotSize = (1.2 + 1.8 * Math.sin(t * Math.PI)) * dpr * depth;
          pts.push({ bx, by, alpha, dotSize, type: "petal", petal: p, t });
        }
      }
    }

    // ── Centre disc ───────────────────────────
    const DISC_N = 80;
    for (let i = 0; i < DISC_N; i++) {
      const a = Math.random() * Math.PI * 2;
      const rd = MAX_R * 0.18 * Math.sqrt(Math.random());
      pts.push({
        bx: Math.cos(a) * rd,
        by: Math.sin(a) * rd,
        alpha: 0.9,
        dotSize: (1.5 + Math.random()) * dpr,
        type: "disc",
      });
    }

    stateRef.current.pts = pts;
    stateRef.current.bloom = 0;
    stateRef.current.target = 0;

    /* Stem helper */
    function drawStem(bloom) {
      const sway = Math.sin(Date.now() * 0.001) * 4 * dpr;
      ctx.beginPath();
      ctx.moveTo(cx, cy + STEM_LEN);
      ctx.quadraticCurveTo(cx + sway, cy + STEM_LEN * 0.5, cx, cy);
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.25 + bloom * 0.2})`;
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();
    }

    /* Render loop */
    function draw() {
      const s = stateRef.current;
      // Ease bloom toward target
      s.bloom += (s.target - s.bloom) * 0.06;

      ctx.clearRect(0, 0, W, H);
      drawStem(s.bloom);

      for (const pt of s.pts) {
        let x, y, alpha, ds;
        if (pt.type === "disc") {
          x = cx + pt.bx;
          y = cy + pt.by;
          alpha = pt.alpha * (0.5 + 0.5 * s.bloom);
          ds = pt.dotSize;
        } else {
          // bloom 0 → bud (collapsed along stem), 1 → open
          const scale = 0.12 + s.bloom * 0.88;
          x = cx + pt.bx * scale;
          y = cy + pt.by * scale;
          alpha = pt.alpha * (0.2 + 0.8 * s.bloom);
          ds = pt.dotSize * (0.5 + 0.5 * s.bloom);
        }
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.3, ds / 2), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();
      }

      s.raf = requestAnimationFrame(draw);
    }

    const s = stateRef.current;
    s.raf = requestAnimationFrame(draw);

    return () => {
      if (s.raf) cancelAnimationFrame(s.raf);
    };
  }, [size, color]);

  /* Update bloom target on hover */
  useEffect(() => {
    stateRef.current.target = hovered ? 1 : 0.15;
  }, [hovered]);

  return (
    <canvas
      ref={canvasRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: size,
        height: size,
        cursor: "pointer",
        display: "block",
      }}
    />
  );
}
