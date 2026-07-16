"use client";

import { useEffect, useRef } from "react";

/**
 * The hero formation field, v2: a hand-rolled 3D wireframe engine in
 * pure canvas 2D. No Three.js, no WebGL payload.
 *
 * Hundreds of hairline fragments tumble in a 3D volume. As `progress`
 * (scroll-driven, 0..1) rises, each fragment flies to its place on a
 * formed object: a portrait wireframe monolith with a ledger interface
 * on its front face. The pointer tilts the object with inertia; depth
 * fog and perspective give it real dimension; when assembly completes,
 * a single brass pulse travels the perimeter once.
 *
 * Reduced motion renders the formed object as a static frame.
 */

type V3 = { x: number; y: number; z: number };

type Fragment = {
  // scattered endpoints (3D)
  a0: V3;
  b0: V3;
  // target endpoints (3D)
  a1: V3;
  b1: V3;
  stagger: number;
  alpha: number;
  brass: boolean;
  /** normalized position along the front perimeter, or -1 */
  perim: number;
  /** atmosphere fragments never join the object */
  atmo: boolean;
  drift: number;
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Point on a rounded-rect perimeter in the XY plane, t in [0,1). */
function rrPoint(t: number, w: number, h: number, r: number) {
  const sw = w - 2 * r;
  const sh = h - 2 * r;
  const arc = (Math.PI / 2) * r;
  const total = 2 * sw + 2 * sh + 4 * arc;
  let d = ((t % 1) + 1) % 1 * total;
  const x0 = -w / 2, y0 = -h / 2;
  if (d < sw) return { x: x0 + r + d, y: y0 };
  d -= sw;
  if (d < arc) {
    const th = -Math.PI / 2 + d / r;
    return { x: w / 2 - r + Math.cos(th) * r, y: y0 + r + Math.sin(th) * r };
  }
  d -= arc;
  if (d < sh) return { x: w / 2, y: y0 + r + d };
  d -= sh;
  if (d < arc) {
    const th = d / r;
    return { x: w / 2 - r + Math.cos(th) * r, y: h / 2 - r + Math.sin(th) * r };
  }
  d -= arc;
  if (d < sw) return { x: w / 2 - r - d, y: h / 2 };
  d -= sw;
  if (d < arc) {
    const th = Math.PI / 2 + d / r;
    return { x: x0 + r + Math.cos(th) * r, y: h / 2 - r + Math.sin(th) * r };
  }
  d -= arc;
  if (d < sh) return { x: x0, y: h / 2 - r - d };
  d -= sh;
  const th = Math.PI + d / r;
  return { x: x0 + r + Math.cos(th) * r, y: y0 + r + Math.sin(th) * r };
}

/** The monolith: portrait slab, ledger interface on the front face. */
const W = 1.0, H = 1.26, R = 0.09, D = 0.22;
const FZ = -D / 2, BZ = D / 2;

function buildFragments(dense: boolean): Fragment[] {
  const rand = mulberry32(1913);
  const frags: Fragment[] = [];

  const scatterEnds = (len: number): [V3, V3] => {
    // a point on a loose shell around the object, tumbled orientation
    const th = rand() * Math.PI * 2;
    const ph = Math.acos(2 * rand() - 1);
    const rad = 1.1 + rand() * 1.3;
    const m: V3 = {
      x: Math.sin(ph) * Math.cos(th) * rad * 1.15,
      y: Math.sin(ph) * Math.sin(th) * rad * 0.8,
      z: Math.cos(ph) * rad * 0.9,
    };
    const dth = rand() * Math.PI * 2;
    const dph = Math.acos(2 * rand() - 1);
    const dir: V3 = {
      x: Math.sin(dph) * Math.cos(dth),
      y: Math.sin(dph) * Math.sin(dth),
      z: Math.cos(dph),
    };
    return [
      { x: m.x - dir.x * len / 2, y: m.y - dir.y * len / 2, z: m.z - dir.z * len / 2 },
      { x: m.x + dir.x * len / 2, y: m.y + dir.y * len / 2, z: m.z + dir.z * len / 2 },
    ];
  };

  const seg = (
    a1: V3, b1: V3,
    opts: { alpha?: number; brass?: boolean; perim?: number; stagger?: number } = {}
  ) => {
    const len = Math.hypot(b1.x - a1.x, b1.y - a1.y, b1.z - a1.z);
    const [a0, b0] = scatterEnds(len * (0.8 + rand() * 0.6));
    frags.push({
      a0, b0, a1, b1,
      stagger: opts.stagger ?? rand() * 0.42,
      alpha: opts.alpha ?? 0.4 + rand() * 0.35,
      brass: opts.brass ?? false,
      perim: opts.perim ?? -1,
      atmo: false,
      drift: rand() * Math.PI * 2,
    });
  };

  // Front perimeter: the object's defining edge. Dense, ordered.
  const FRONT = dense ? 72 : 48;
  for (let i = 0; i < FRONT; i++) {
    const p1 = rrPoint(i / FRONT, W, H, R);
    const p2 = rrPoint((i + 0.78) / FRONT, W, H, R);
    seg(
      { x: p1.x, y: p1.y, z: FZ },
      { x: p2.x, y: p2.y, z: FZ },
      { alpha: 0.6 + rand() * 0.3, perim: i / FRONT }
    );
  }

  // Back perimeter: sparser, dimmer. Reads as depth.
  const BACK = dense ? 44 : 28;
  for (let i = 0; i < BACK; i++) {
    const p1 = rrPoint(i / BACK, W, H, R);
    const p2 = rrPoint((i + 0.7) / BACK, W, H, R);
    seg(
      { x: p1.x, y: p1.y, z: BZ },
      { x: p2.x, y: p2.y, z: BZ },
      { alpha: 0.22 + rand() * 0.15 }
    );
  }

  // Connecting edges between the faces.
  for (let i = 0; i < 8; i++) {
    const p = rrPoint(i / 8 + 0.06, W, H, R);
    seg(
      { x: p.x, y: p.y, z: FZ },
      { x: p.x, y: p.y, z: BZ },
      { alpha: 0.3 + rand() * 0.15 }
    );
  }

  // The ledger interface on the front face.
  const inner: Array<[number, number, number, number, boolean]> = [
    [-0.36, -0.42, 0.36, -0.42, false], // header rule
    [-0.36, -0.2, 0.16, -0.2, false],
    [-0.36, -0.05, 0.24, -0.05, false],
    [-0.36, 0.1, 0.08, 0.1, false],
    [0.24, -0.2, 0.24, 0.22, false],    // divider
  ];
  for (const [x1, y1, x2, y2, brass] of inner) {
    const parts = dense ? 6 : 4;
    for (let i = 0; i < parts; i++) {
      const t0 = i / parts, t1 = (i + 0.75) / parts;
      seg(
        { x: x1 + (x2 - x1) * t0, y: y1 + (y2 - y1) * t0, z: FZ },
        { x: x1 + (x2 - x1) * t1, y: y1 + (y2 - y1) * t1, z: FZ },
        { alpha: 0.42 + rand() * 0.2, brass, stagger: 0.12 + rand() * 0.35 }
      );
    }
  }
  // Action pill + brass mark, lower left of the face.
  const pillW = 0.3, pillH = 0.11, px = -0.36 + pillW / 2, py = 0.34;
  const PILL = dense ? 14 : 10;
  for (let i = 0; i < PILL; i++) {
    const p1 = rrPoint(i / PILL, pillW, pillH, 0.05);
    const p2 = rrPoint((i + 0.8) / PILL, pillW, pillH, 0.05);
    seg(
      { x: px + p1.x, y: py + p1.y, z: FZ },
      { x: px + p2.x, y: py + p2.y, z: FZ },
      { alpha: 0.9, brass: true, stagger: 0.2 + rand() * 0.3 }
    );
  }
  seg(
    { x: px - 0.06, y: py, z: FZ },
    { x: px + 0.06, y: py, z: FZ },
    { alpha: 0.95, brass: true, stagger: 0.3 }
  );

  // Atmosphere: free fragments that never join. Depth and air.
  const ATMO = dense ? 230 : 110;
  for (let i = 0; i < ATMO; i++) {
    const len = 0.02 + rand() * 0.05;
    const [a0, b0] = scatterEnds(len);
    frags.push({
      a0, b0, a1: a0, b1: b0,
      stagger: 1, // never assembles
      alpha: 0.1 + rand() * 0.25,
      brass: rand() > 0.965,
      perim: -1,
      atmo: true,
      drift: rand() * Math.PI * 2,
    });
  }

  return frags;
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

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

    let width = 0, height = 0;
    let frags = buildFragments(window.innerWidth >= 768);
    let raf = 0;
    let running = false;
    const start = performance.now();

    // camera state with inertia
    let yaw = -0.45, pitch = 0.1;
    let targetYaw = -0.45, targetPitch = 0.1;
    let pulseAt = -1; // time the assembly completed
    let wasFormed = false;

    const pointer = { x: 0.5, y: 0.5, active: false };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const p = reduced ? 1 : clamp01(progressRef.current);
      ctx.clearRect(0, 0, width, height);

      const wide = width >= 768;
      const cx = wide ? width * 0.66 : width * 0.5;
      const cy = wide ? height * 0.5 : height * 0.45;
      const scale = Math.min(width, height) * (wide ? 0.42 : 0.4);

      // camera: ambient sway + pointer intent, dolly-in as it forms
      const sway = reduced ? 0 : Math.sin(t * 0.22) * 0.06;
      const px = pointer.active ? (pointer.x - 0.5) : 0;
      const py = pointer.active ? (pointer.y - 0.5) : 0;
      targetYaw = -0.45 + sway + px * 0.5 * (0.35 + 0.65 * p);
      targetPitch = 0.1 + py * 0.32 * (0.35 + 0.65 * p);
      yaw += (targetYaw - yaw) * 0.055;
      pitch += (targetPitch - pitch) * 0.055;

      const fov = 2.6 - 0.25 * smooth(p); // subtle dolly-in on completion
      const cyaw = Math.cos(yaw), syaw = Math.sin(yaw);
      const cpit = Math.cos(pitch), spit = Math.sin(pitch);

      // assembly pulse bookkeeping
      const formed = p > 0.995;
      if (formed && !wasFormed) pulseAt = t;
      if (!formed && p < 0.8) pulseAt = -1;
      wasFormed = formed;
      const pulseT = pulseAt >= 0 ? (t - pulseAt) / 1.7 : -1;

      const project = (v: V3) => {
        // rotate around Y, then X
        const x1 = v.x * cyaw + v.z * syaw;
        const z1 = -v.x * syaw + v.z * cyaw;
        const y2 = v.y * cpit - z1 * spit;
        const z2 = v.y * spit + z1 * cpit;
        const persp = fov / (fov + z2 + 0.001);
        return { x: cx + x1 * scale * persp, y: cy + y2 * scale * persp, z: z2, persp };
      };

      for (const f of frags) {
        const local = f.atmo
          ? 0
          : smooth(clamp01((p - f.stagger * 0.42) / (1 - f.stagger * 0.42)));

        // idle tumble on unformed fragments
        const wob = f.atmo ? 0.045 : (1 - local) * 0.05;
        const wx = Math.sin(t * 0.4 + f.drift) * wob;
        const wy = Math.cos(t * 0.33 + f.drift * 1.7) * wob;

        const ax = f.a0.x + wx + (f.a1.x - f.a0.x - wx) * local;
        const ay = f.a0.y + wy + (f.a1.y - f.a0.y - wy) * local;
        const az = f.a0.z + (f.a1.z - f.a0.z) * local;
        const bx = f.b0.x + wx + (f.b1.x - f.b0.x - wx) * local;
        const by = f.b0.y + wy + (f.b1.y - f.b0.y - wy) * local;
        const bz = f.b0.z + (f.b1.z - f.b0.z) * local;

        const A = project({ x: ax, y: ay, z: az });
        const B = project({ x: bx, y: by, z: bz });

        // depth fog
        const zmid = (A.z + B.z) / 2;
        const fog = clamp01(1.15 - zmid * 0.85);

        let alpha = f.alpha * fog * (f.atmo ? 1 - 0.62 * p : 0.45 + 0.55 * local);
        let brassMix = f.brass ? 1 : 0;

        // one brass pulse travels the front perimeter after assembly
        if (pulseT >= 0 && pulseT <= 1 && f.perim >= 0) {
          const d = Math.abs(f.perim - pulseT);
          const wrap = Math.min(d, 1 - d);
          const glow = Math.exp(-(wrap * wrap) / 0.0018);
          brassMix = Math.max(brassMix, glow);
          alpha = Math.min(1, alpha + glow * 0.5);
        }

        const r = 237 + (196 - 237) * brassMix;
        const g = 233 + (168 - 233) * brassMix;
        const b = 224 + (122 - 224) * brassMix;
        ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
        ctx.lineWidth = (f.brass ? 1.5 : 1.05) * ((A.persp + B.persp) / 2);
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
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
      yaw = -0.38; pitch = 0.12;
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
      pointer.x = e.clientX / window.innerWidth;
      pointer.y = e.clientY / window.innerHeight;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onResize = () => {
      resize();
      frags = buildFragments(window.innerWidth >= 768);
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
