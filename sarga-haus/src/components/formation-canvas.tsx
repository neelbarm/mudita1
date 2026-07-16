"use client";

import { useEffect, useRef } from "react";

/**
 * The hero formation field. ~160 hairline fragments drift in disorder;
 * as `progress` (a shared mutable ref, 0..1, driven by scroll) rises,
 * each fragment travels to its place on a formed object: a rounded
 * system frame with an inner structure. The pointer bends the unformed
 * field within a small radius. Plain 2D canvas, one rAF loop, paused
 * off-screen. Under reduced motion the formed state renders once.
 */

type Fragment = {
  sx: number; sy: number; sa: number; // scattered pose (unit space)
  tx: number; ty: number; ta: number; // target pose
  len: number;
  stagger: number;
  driftPhase: number;
  driftSpeed: number;
  alpha: number;
  brass: boolean;
};

// Deterministic PRNG so server/client and every visit agree.
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Point on a rounded-rect perimeter, t in [0,1). Unit space, centered.
function roundedRectPoint(t: number, w: number, h: number, r: number) {
  const straightW = w - 2 * r;
  const straightH = h - 2 * r;
  const arc = (Math.PI / 2) * r;
  const total = 2 * straightW + 2 * straightH + 4 * arc;
  let d = t * total;
  const x0 = -w / 2, y0 = -h / 2;

  if (d < straightW) return { x: x0 + r + d, y: y0, a: 0 };
  d -= straightW;
  if (d < arc) {
    const th = -Math.PI / 2 + d / r;
    return { x: w / 2 - r + Math.cos(th) * r, y: y0 + r + Math.sin(th) * r, a: th + Math.PI / 2 };
  }
  d -= arc;
  if (d < straightH) return { x: w / 2, y: y0 + r + d, a: Math.PI / 2 };
  d -= straightH;
  if (d < arc) {
    const th = d / r;
    return { x: w / 2 - r + Math.cos(th) * r, y: h / 2 - r + Math.sin(th) * r, a: th + Math.PI / 2 };
  }
  d -= arc;
  if (d < straightW) return { x: w / 2 - r - d, y: h / 2, a: 0 };
  d -= straightW;
  if (d < arc) {
    const th = Math.PI / 2 + d / r;
    return { x: x0 + r + Math.cos(th) * r, y: h / 2 - r + Math.sin(th) * r, a: th + Math.PI / 2 };
  }
  d -= arc;
  if (d < straightH) return { x: x0, y: h / 2 - r - d, a: Math.PI / 2 };
  d -= straightH;
  const th = Math.PI + d / r;
  return { x: x0 + r + Math.cos(th) * r, y: y0 + r + Math.sin(th) * r, a: th + Math.PI / 2 };
}

function buildFragments(count: number): Fragment[] {
  const rand = mulberry32(1913);
  const frags: Fragment[] = [];

  // Target object: frame 0.62 x 0.62 (unit space), inner header line,
  // three ledger rows, one vertical divider, a brass action mark.
  const W = 0.62, H = 0.62, R = 0.06;
  const perimeterCount = Math.floor(count * 0.55);
  for (let i = 0; i < perimeterCount; i++) {
    const t = i / perimeterCount;
    const p = roundedRectPoint(t, W, H, R);
    frags.push({
      sx: 0, sy: 0, sa: 0,
      tx: p.x, ty: p.y, ta: p.a,
      len: 0.028 + rand() * 0.012,
      stagger: rand() * 0.35,
      driftPhase: rand() * Math.PI * 2,
      driftSpeed: 0.25 + rand() * 0.4,
      alpha: 0.35 + rand() * 0.4,
      brass: false,
    });
  }

  const innerLines: Array<[number, number, number, number, boolean]> = [
    // header rule
    [-0.24, -0.19, 0.24, -0.19, false],
    // ledger rows
    [-0.24, -0.06, 0.1, -0.06, false],
    [-0.24, 0.04, 0.16, 0.04, false],
    [-0.24, 0.14, 0.06, 0.14, false],
    // vertical divider
    [0.16, -0.06, 0.16, 0.2, false],
    // brass action mark, lower right
    [0.2, 0.2, 0.24, 0.2, true],
  ];
  const remaining = count - perimeterCount;
  const perLine = Math.floor(remaining / innerLines.length);
  innerLines.forEach(([x1, y1, x2, y2, brass], li) => {
    const n = li === innerLines.length - 1 ? remaining - perLine * (innerLines.length - 1) : perLine;
    for (let i = 0; i < n; i++) {
      const t0 = i / n;
      const t1 = (i + 0.72) / n;
      const ax = x1 + (x2 - x1) * t0, ay = y1 + (y2 - y1) * t0;
      const bx = x1 + (x2 - x1) * t1, by = y1 + (y2 - y1) * t1;
      frags.push({
        sx: 0, sy: 0, sa: 0,
        tx: (ax + bx) / 2, ty: (ay + by) / 2,
        ta: Math.atan2(by - ay, bx - ax),
        len: Math.hypot(bx - ax, by - ay),
        stagger: 0.1 + rand() * 0.35,
        driftPhase: rand() * Math.PI * 2,
        driftSpeed: 0.25 + rand() * 0.4,
        alpha: brass ? 0.95 : 0.3 + rand() * 0.35,
        brass,
      });
    }
  });

  // Scattered poses: a loose cloud biased away from dead center.
  for (const f of frags) {
    const angle = rand() * Math.PI * 2;
    const radius = 0.25 + rand() * 0.85;
    f.sx = Math.cos(angle) * radius * 0.9;
    f.sy = Math.sin(angle) * radius * 0.6;
    f.sa = rand() * Math.PI * 2;
  }
  return frags;
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function FormationCanvas({
  progressRef,
  reduced,
  className = "",
}: {
  progressRef: React.MutableRefObject<number>;
  reduced: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0, height = 0, dpr = 1;
    let frags = buildFragments(window.innerWidth < 768 ? 100 : 170);
    let raf = 0;
    let running = false;
    let start = performance.now();
    const pointer = { x: -1e4, y: -1e4 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const p = reduced ? 1 : Math.min(1, Math.max(0, progressRef.current));
      ctx.clearRect(0, 0, width, height);

      // Object center: right of center on wide screens, centered on small.
      const cx = width >= 768 ? width * 0.64 : width * 0.5;
      const cy = width >= 768 ? height * 0.5 : height * 0.42;
      const scale = Math.min(width, height) * (width >= 768 ? 0.72 : 0.78);

      const brassColor = "rgba(196, 168, 122,";
      const creamColor = "rgba(237, 233, 224,";

      for (const f of frags) {
        const local = easeInOut(
          Math.min(1, Math.max(0, (p - f.stagger * 0.4) / (1 - f.stagger * 0.4)))
        );

        const drift = (1 - local) * 0.02;
        let x = f.sx + Math.sin(t * f.driftSpeed + f.driftPhase) * drift;
        let y = f.sy + Math.cos(t * f.driftSpeed * 0.8 + f.driftPhase) * drift;

        x = x + (f.tx - x) * local;
        y = y + (f.ty - y) * local;

        // Shortest-path angle interpolation.
        let da = f.ta - f.sa;
        da = Math.atan2(Math.sin(da), Math.cos(da));
        const a = f.sa + da * local;

        let px = cx + x * scale;
        let py = cy + y * scale;

        // Pointer bends the field while it is still unformed.
        const dx = px - pointer.x, dy = py - pointer.y;
        const dist = Math.hypot(dx, dy);
        const radius = 150;
        if (dist < radius && dist > 0.01) {
          const force = ((radius - dist) / radius) * 26 * (1 - local * 0.75);
          px += (dx / dist) * force;
          py += (dy / dist) * force;
        }

        const half = (f.len * scale) / 2;
        const ca = Math.cos(a), sa = Math.sin(a);
        const alpha = f.alpha * (0.5 + 0.5 * local);
        ctx.strokeStyle = `${f.brass ? brassColor : creamColor} ${alpha})`;
        ctx.lineWidth = f.brass ? 1.6 : 1.1;
        ctx.beginPath();
        ctx.moveTo(px - ca * half, py - sa * half);
        ctx.lineTo(px + ca * half, py + sa * half);
        ctx.stroke();
      }
    };

    const loop = (now: number) => {
      draw(now);
      if (running) raf = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    if (reduced) {
      draw(start);
    } else {
      startLoop();
    }

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? startLoop() : stopLoop()),
      { threshold: 0 }
    );
    io.observe(canvas);

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      pointer.x = -1e4;
      pointer.y = -1e4;
    };
    const onResize = () => {
      resize();
      frags = buildFragments(window.innerWidth < 768 ? 100 : 170);
      if (reduced) draw(performance.now());
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      stopLoop();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [reduced, progressRef]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
