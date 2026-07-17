"use client";

import { useEffect, useRef } from "react";

/**
 * The story engine: a second hand-rolled canvas renderer, sibling to the
 * hero's formation engine. One pool of ~230 line fragments carries four
 * keyframe layouts — idea cloud, product interface, automation conduits,
 * pipeline flow — and scroll scrubs the morph between them, with staggered
 * per-fragment easing so transitions travel in waves.
 *
 * Every stage stays alive: the cloud orbits and twinkles, pulses run the
 * conduits, a dot-stream feeds the pipeline, and the pointer applies a
 * per-fragment parallax with pseudo-depth. Static mode renders one frozen,
 * fully-formed stage for mobile and reduced motion.
 */

type SegState = {
  ax: number; ay: number; bx: number; by: number;
  alpha: number; brass: number;
};
type DotState = { x: number; y: number; r: number; alpha: number; brass: number };

type Fragment = {
  stages: SegState[]; // 4 entries
  stag: number;       // morph stagger 0..1
  orbit: number;      // orbit speed factor
  phase: number;      // twinkle phase
  par: number;        // parallax depth factor
};
type Dot = { stages: DotState[]; phase: number; par: number };

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** point on a rounded-rect perimeter, t in [0,1) */
function rrPoint(t: number, cx: number, cy: number, w: number, h: number, r: number) {
  const sw = w - 2 * r, sh = h - 2 * r, arc = (Math.PI / 2) * r;
  const total = 2 * sw + 2 * sh + 4 * arc;
  let d = (((t % 1) + 1) % 1) * total;
  const x0 = cx - w / 2, y0 = cy - h / 2;
  if (d < sw) return { x: x0 + r + d, y: y0 };
  d -= sw;
  if (d < arc) { const th = -Math.PI / 2 + d / r; return { x: cx + w / 2 - r + Math.cos(th) * r, y: y0 + r + Math.sin(th) * r }; }
  d -= arc;
  if (d < sh) return { x: cx + w / 2, y: y0 + r + d };
  d -= sh;
  if (d < arc) { const th = d / r; return { x: cx + w / 2 - r + Math.cos(th) * r, y: cy + h / 2 - r + Math.sin(th) * r }; }
  d -= arc;
  if (d < sw) return { x: cx + w / 2 - r - d, y: cy + h / 2 };
  d -= sw;
  if (d < arc) { const th = Math.PI / 2 + d / r; return { x: x0 + r + Math.cos(th) * r, y: cy + h / 2 - r + Math.sin(th) * r }; }
  d -= arc;
  if (d < sh) return { x: x0, y: cy + h / 2 - r - d };
  d -= sh;
  const th = Math.PI + d / r;
  return { x: x0 + r + Math.cos(th) * r, y: y0 + r + Math.sin(th) * r };
}

const seg = (ax: number, ay: number, bx: number, by: number, alpha: number, brass = 0): SegState =>
  ({ ax, ay, bx, by, alpha, brass });

/** n dashes around a rounded rect */
function rrSegs(cx: number, cy: number, w: number, h: number, r: number, n: number, alpha: number, brass = 0) {
  const out: SegState[] = [];
  for (let i = 0; i < n; i++) {
    const a = rrPoint(i / n, cx, cy, w, h, r);
    const b = rrPoint((i + 0.78) / n, cx, cy, w, h, r);
    out.push(seg(a.x, a.y, b.x, b.y, alpha, brass));
  }
  return out;
}

/** n dashes along a straight line */
function lineSegs(x1: number, y1: number, x2: number, y2: number, n: number, alpha: number, brass = 0, fill = 0.72) {
  const out: SegState[] = [];
  for (let i = 0; i < n; i++) {
    const t0 = i / n, t1 = (i + fill) / n;
    out.push(seg(
      x1 + (x2 - x1) * t0, y1 + (y2 - y1) * t0,
      x1 + (x2 - x1) * t1, y1 + (y2 - y1) * t1,
      alpha, brass
    ));
  }
  return out;
}

/** n dashes along a polyline, distributed by length */
function polySegs(pts: Array<[number, number]>, n: number, alpha: number, brass = 0) {
  const lens: number[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    lens.push(l); total += l;
  }
  const at = (d: number) => {
    let rem = Math.min(d, total - 1e-6);
    for (let i = 0; i < lens.length; i++) {
      if (rem <= lens[i]) {
        const t = rem / lens[i];
        return { x: pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, y: pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t };
      }
      rem -= lens[i];
    }
    return { x: pts[pts.length - 1][0], y: pts[pts.length - 1][1] };
  };
  const out: SegState[] = [];
  for (let i = 0; i < n; i++) {
    const a = at((i / n) * total), b = at(((i + 0.7) / n) * total);
    out.push(seg(a.x, a.y, b.x, b.y, alpha, brass));
  }
  return out;
}

/* ------------------------------------------------------------ geometry */
// Unit space, centered. Frame sits left of center; nodes right; inflow left.
const FR = { cx: -0.06, cy: 0, w: 0.62, h: 0.52, r: 0.05 };
const ROWS3 = [
  { y: -0.05, len: 0.34 },
  { y: 0.03, len: 0.28 },
  { y: 0.11, len: 0.31 },
];
const ROWS4 = [
  { y: -0.07, len: 0.3 },
  { y: 0.0, len: 0.26 },
  { y: 0.07, len: 0.28 },
  { y: 0.14, len: 0.22 },
];
const ROW_X = -0.3;
export const CONDUIT_PATHS: Array<Array<[number, number]>> = [
  [[0.25, -0.15], [0.34, -0.15], [0.34, -0.2], [0.40, -0.2]],
  [[0.25, 0], [0.40, 0]],
  [[0.25, 0.15], [0.34, 0.15], [0.34, 0.2], [0.40, 0.2]],
];
const NODE_C: Array<[number, number]> = [[0.435, -0.2], [0.435, 0], [0.435, 0.2]];
const INFLOW: Array<[number, number]> = [[-0.62, 0], [-0.40, 0]];
const SPARK3: Array<[number, number]> = [
  [-0.02, 0.21], [0.03, 0.185], [0.08, 0.195], [0.13, 0.165], [0.18, 0.175], [0.23, 0.14],
];
const SPARK4: Array<[number, number]> = [
  [-0.02, 0.215], [0.03, 0.19], [0.08, 0.17], [0.13, 0.135], [0.18, 0.115], [0.23, 0.07],
];

const hide = (x: number, y: number): SegState => seg(x, y, x, y, 0, 0);

function buildFragments(rand: () => number): Fragment[] {
  // stage 2/3/4 pools ------------------------------------------------
  const framePool = [rrSegs(FR.cx, FR.cy, FR.w, FR.h, FR.r, 56, 0.62)];
  const frame = framePool[0];
  const header = lineSegs(-0.3, -0.14, 0.19, -0.14, 8, 0.4);
  const rows3 = ROWS3.flatMap((r) => lineSegs(ROW_X, r.y, ROW_X + r.len, r.y, 8, 0.5));
  const rows4 = ROWS4.flatMap((r) => lineSegs(ROW_X, r.y, ROW_X + r.len, r.y, 6, 0.55));
  const pill = [
    ...rrSegs(-0.21, 0.19, 0.18, 0.055, 0.027, 12, 0.9, 1),
    ...lineSegs(-0.27, 0.19, -0.15, 0.19, 2, 0.9, 1),
  ];
  const spark3 = polySegs(SPARK3, 10, 0.55, 1);
  const spark4 = polySegs(SPARK4, 10, 0.65, 1);
  const conduits = CONDUIT_PATHS.flatMap((p) => polySegs(p, 8, 0.5));
  const nodes = NODE_C.flatMap(([x, y]) => rrSegs(x, y, 0.065, 0.065, 0.014, 8, 0.6));
  const inflow = lineSegs(INFLOW[0][0], INFLOW[0][1], INFLOW[1][0], INFLOW[1][1], 10, 0.45, 0, 0.55);
  const ticks = ROWS4.flatMap((r) => [
    seg(0.1, r.y, 0.115, r.y + 0.015, 0.95, 1),
    seg(0.115, r.y + 0.015, 0.145, r.y - 0.02, 0.95, 1),
  ]);
  const DUST_N = 50;

  type PoolDef = {
    segsByStage: [SegState[] | null, SegState[] | null, SegState[] | null]; // stages 2,3,4
    n: number;
    brassCloud?: boolean;
  };
  const anchorConduits = conduits.map((s) => hide(CONDUIT_PATHS[0][0][0], (s.ay + s.by) / 2));
  const anchorNodes = nodes.map((s) => hide((s.ax + s.bx) / 2, (s.ay + s.by) / 2));
  const anchorInflow = inflow.map(() => hide(-0.42, 0));
  const anchorTicks = ticks.map((s) => hide(s.ax, s.ay));

  const pools: PoolDef[] = [
    { segsByStage: [frame, frame, frame], n: frame.length },
    { segsByStage: [header, header, header], n: header.length },
    { segsByStage: [rows3, rows3, rows4], n: 24 },
    { segsByStage: [pill, pill, pill], n: pill.length, brassCloud: true },
    { segsByStage: [spark3, spark3, spark4], n: 10 },
    { segsByStage: [anchorConduits, conduits, conduits], n: conduits.length },
    { segsByStage: [anchorNodes, nodes, nodes], n: nodes.length },
    { segsByStage: [anchorInflow, anchorInflow, inflow], n: inflow.length },
    { segsByStage: [anchorTicks, anchorTicks, ticks], n: ticks.length, brassCloud: true },
    { segsByStage: [null, null, null], n: DUST_N }, // dust: wide faint field after stage 1
  ];

  const frags: Fragment[] = [];
  for (const pool of pools) {
    for (let i = 0; i < pool.n; i++) {
      // stage 1: everything is a member of the idea cloud
      const a = rand() * Math.PI * 2;
      const rad = 0.13 + rand() * 0.3;
      const cxp = Math.cos(a) * rad * 1.3;
      const cyp = Math.sin(a) * rad * 0.9;
      const ang = rand() * Math.PI * 2;
      const len = 0.02 + rand() * 0.045;
      const cloud = seg(
        cxp - Math.cos(ang) * len / 2, cyp - Math.sin(ang) * len / 2,
        cxp + Math.cos(ang) * len / 2, cyp + Math.sin(ang) * len / 2,
        0.25 + rand() * 0.4,
        pool.brassCloud && rand() > 0.5 ? 1 : 0
      );
      // dust pool: stages 2-4 are a faint far field
      let s2: SegState, s3: SegState, s4: SegState;
      if (pool.segsByStage[0] === null) {
        const da = rand() * Math.PI * 2;
        const dr = 0.48 + rand() * 0.28;
        const dx = Math.cos(da) * dr * 1.25, dy = Math.sin(da) * dr * 0.75;
        const dl = 0.012 + rand() * 0.02;
        const dAng = rand() * Math.PI * 2;
        const dust = seg(
          dx - Math.cos(dAng) * dl / 2, dy - Math.sin(dAng) * dl / 2,
          dx + Math.cos(dAng) * dl / 2, dy + Math.sin(dAng) * dl / 2,
          0.05 + rand() * 0.06, 0
        );
        s2 = dust; s3 = dust; s4 = dust;
      } else {
        s2 = pool.segsByStage[0]![i];
        s3 = pool.segsByStage[1]![i];
        s4 = pool.segsByStage[2]![i];
      }
      frags.push({
        stages: [cloud, s2, s3, s4],
        stag: rand(),
        orbit: 0.7 + rand() * 0.7,
        phase: rand() * Math.PI * 2,
        par: 0.6 + rand() * 0.8,
      });
    }
  }
  return frags;
}

function buildDots(rand: () => number): Dot[] {
  const cloudDot = (): DotState => {
    const a = rand() * Math.PI * 2;
    const r = 0.12 + rand() * 0.3;
    return { x: Math.cos(a) * r * 1.3, y: Math.sin(a) * r * 0.9, r: 0.006, alpha: 0.5, brass: rand() > 0.75 ? 1 : 0 };
  };
  const chrome: DotState[] = [
    { x: -0.305, y: -0.2, r: 0.007, alpha: 0.55, brass: 0 },
    { x: -0.275, y: -0.2, r: 0.007, alpha: 0.55, brass: 0 },
  ];
  const cores: DotState[] = NODE_C.map(([x, y]) => ({ x, y, r: 0.009, alpha: 0.95, brass: 1 }));
  const leads: DotState[] = ROWS4.map((r) => ({ x: -0.335, y: r.y, r: 0.006, alpha: 0.55, brass: 0 }));
  const hideDot = (d: DotState): DotState => ({ ...d, alpha: 0 });

  const defs: Array<[DotState, DotState, DotState]> = [
    [chrome[0], chrome[0], chrome[0]],
    [chrome[1], chrome[1], chrome[1]],
    [hideDot(cores[0]), cores[0], cores[0]],
    [hideDot(cores[1]), cores[1], cores[1]],
    [hideDot(cores[2]), cores[2], cores[2]],
    [hideDot(leads[0]), hideDot(leads[0]), leads[0]],
    [hideDot(leads[1]), hideDot(leads[1]), leads[1]],
    [hideDot(leads[2]), hideDot(leads[2]), leads[2]],
    [hideDot(leads[3]), hideDot(leads[3]), leads[3]],
  ];
  return defs.map(([a, b, c]) => ({
    stages: [cloudDot(), a, b, c],
    phase: rand() * Math.PI * 2,
    par: 0.6 + rand() * 0.8,
  }));
}

/* --------------------------------------------------------- scrubbing */
// p (0..1) -> stageFloat s (0..3): holds at integers, morphs between.
const WINDOWS = [
  [0.16, 0.30],
  [0.44, 0.58],
  [0.72, 0.86],
] as const;
export function stageFloatOf(p: number) {
  let s = 0;
  for (let i = 0; i < 3; i++) {
    const [a, b] = WINDOWS[i];
    if (p <= a) return s;
    if (p < b) return s + (p - a) / (b - a);
    s += 1;
  }
  return 3;
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** length lookup along a polyline for pulse travel */
function pathWalker(pts: Array<[number, number]>) {
  const lens: number[] = [];
  let total = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    lens.push(l); total += l;
  }
  return (t: number) => {
    let rem = clamp01(t) * total;
    for (let i = 0; i < lens.length; i++) {
      if (rem <= lens[i]) {
        const u = lens[i] === 0 ? 0 : rem / lens[i];
        return { x: pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, y: pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u };
      }
      rem -= lens[i];
    }
    return { x: pts[pts.length - 1][0], y: pts[pts.length - 1][1] };
  };
}

export function StoryCanvas({
  progressRef,
  staticStage,
  className = "",
}: {
  /** scroll progress 0..1 (sticky mode); omit for static mode */
  progressRef?: React.MutableRefObject<number>;
  /** render one frozen stage (mobile / reduced motion) */
  staticStage?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rand = mulberry32(4207);
    const frags = buildFragments(rand);
    const dots = buildDots(rand);
    const walkers = CONDUIT_PATHS.map(pathWalker);
    const inflowWalk = pathWalker(INFLOW);

    let width = 0, height = 0, scale = 1, cx = 0, cy = 0;
    let raf = 0, running = false;
    const start = performance.now();
    const isStatic = staticStage !== undefined;
    const pointer = { x: 0.5, y: 0.5, active: false };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width; height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // fit unit extents x[-0.66,0.5] y[-0.32,0.32] with margin
      scale = Math.min((width * 0.92) / 1.16, (height * 0.86) / 0.64);
      cx = width / 2 + 0.08 * scale;
      cy = height / 2;
    };

    const cream = (a: number) => `rgba(237,233,224,${a})`;
    const mix = (brass: number, a: number) => {
      const r = 237 + (196 - 237) * brass;
      const g = 233 + (168 - 233) * brass;
      const b = 224 + (122 - 224) * brass;
      return `rgba(${r | 0},${g | 0},${b | 0},${a})`;
    };

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const s = isStatic
        ? staticStage!
        : stageFloatOf(clamp01(progressRef?.current ?? 0));
      ctx.clearRect(0, 0, width, height);

      const k = Math.min(2, Math.floor(s));
      const mt = clamp01(s - k); // morph t between layouts k and k+1
      const w0 = clamp01(1 - s); // idea-cloud influence

      const pox = pointer.active ? (pointer.x - 0.5) * 18 : 0;
      const poy = pointer.active ? (pointer.y - 0.5) * 12 : 0;

      const orbitTheta = isStatic ? 0.6 : t * 0.1;

      // lamplight pooled behind the object, warming as the story advances
      const gx = cx + FR.cx * scale * Math.min(1, s);
      const glowR = scale * (0.95 + 0.1 * s);
      const glow = ctx.createRadialGradient(gx, cy, 0, gx, cy, glowR);
      glow.addColorStop(0, `rgba(196,168,122,${0.07 + 0.03 * Math.min(3, s) / 3})`);
      glow.addColorStop(0.55, "rgba(196,168,122,0.024)");
      glow.addColorStop(1, "rgba(196,168,122,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // the interface face gains a translucent surface as it forms
      const faceA = clamp01(s);
      if (faceA > 0.02) {
        ctx.beginPath();
        const NPTS = 40;
        for (let i = 0; i <= NPTS; i++) {
          const pt = rrPoint(i / NPTS, FR.cx, FR.cy, FR.w, FR.h, FR.r);
          const X = cx + pt.x * scale + pox;
          const Y = cy + pt.y * scale + poy;
          if (i === 0) ctx.moveTo(X, Y);
          else ctx.lineTo(X, Y);
        }
        ctx.closePath();
        const face = ctx.createLinearGradient(cx, cy - FR.h * scale * 0.5, cx, cy + FR.h * scale * 0.5);
        face.addColorStop(0, `rgba(237,233,224,${0.05 * faceA})`);
        face.addColorStop(1, `rgba(196,168,122,${0.022 * faceA})`);
        ctx.fillStyle = face;
        ctx.fill();
      }

      // solid matter materializes with each stage, so the object reads as
      // a finished product, not a wireframe: filled pill, header strip,
      // node bodies, and qualified-tick chips
      const rr = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        const N = 20;
        for (let i = 0; i <= N; i++) {
          const pt = rrPoint(i / N, x, y, w, h, r);
          const X = cx + pt.x * scale + pox;
          const Y = cy + pt.y * scale + poy;
          if (i === 0) ctx.moveTo(X, Y);
          else ctx.lineTo(X, Y);
        }
        ctx.closePath();
      };
      const wProduct = clamp01(s);
      const wAuto = clamp01(s - 1);
      const wPipe = clamp01(s - 2);
      if (wProduct > 0.02) {
        // header strip
        rr(FR.cx, -0.185, FR.w - 0.06, 0.075, 0.02);
        ctx.fillStyle = `rgba(237,233,224,${0.05 * wProduct})`;
        ctx.fill();
        // the action pill, solid brass
        rr(-0.21, 0.19, 0.18, 0.055, 0.027);
        ctx.fillStyle = `rgba(169,141,95,${0.28 * wProduct})`;
        ctx.fill();
      }
      if (wAuto > 0.02) {
        for (const [nx, ny] of NODE_C) {
          rr(nx, ny, 0.065, 0.065, 0.014);
          ctx.fillStyle = `rgba(237,233,224,${0.07 * wAuto})`;
          ctx.fill();
        }
      }
      if (wPipe > 0.02) {
        for (const r of ROWS4) {
          rr(0.122, r.y - 0.002, 0.075, 0.052, 0.026);
          ctx.fillStyle = `rgba(169,141,95,${0.14 * wPipe})`;
          ctx.fill();
        }
      }

      for (const f of frags) {
        const A = f.stages[k], B = f.stages[Math.min(3, k + 1)];
        const tt = smooth(clamp01((mt * 1.35 - f.stag * 0.35) / 1));
        let ax = lerp(A.ax, B.ax, tt), ay = lerp(A.ay, B.ay, tt);
        let bx = lerp(A.bx, B.bx, tt), by = lerp(A.by, B.by, tt);
        let alpha = lerp(A.alpha, B.alpha, tt);
        const brass = lerp(A.brass, B.brass, tt);

        // stage-1 life: slow orbit + twinkle, fading out as the cloud forms
        if (w0 > 0.001) {
          const th = orbitTheta * f.orbit * w0;
          const c = Math.cos(th), sn = Math.sin(th);
          const rot = (x: number, y: number) => ({ x: x * c - y * sn, y: x * sn + y * c });
          const ra = rot(ax, ay), rb = rot(bx, by);
          ax = ra.x; ay = ra.y; bx = rb.x; by = rb.y;
          alpha += Math.sin(t * 1.3 + f.phase) * 0.08 * w0;
        }
        if (alpha <= 0.004) continue;

        const px = pox * f.par, py = poy * f.par;
        if (brass > 0.5) {
          ctx.shadowColor = "rgba(196,168,122,0.5)";
          ctx.shadowBlur = 6;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.strokeStyle = mix(brass, Math.min(1, Math.max(0, alpha * 1.2)));
        ctx.lineWidth = brass > 0.5 ? 1.7 : 1.25;
        ctx.beginPath();
        ctx.moveTo(cx + ax * scale + px, cy + ay * scale + py);
        ctx.lineTo(cx + bx * scale + px, cy + by * scale + py);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      for (const d of dots) {
        const A = d.stages[k], B = d.stages[Math.min(3, k + 1)];
        const tt = smooth(mt);
        let x = lerp(A.x, B.x, tt), y = lerp(A.y, B.y, tt);
        let alpha = lerp(A.alpha, B.alpha, tt);
        const r = lerp(A.r, B.r, tt);
        const brass = lerp(A.brass, B.brass, tt);
        if (w0 > 0.001) {
          const th = orbitTheta * 0.9 * w0;
          const c = Math.cos(th), sn = Math.sin(th);
          const nx = x * c - y * sn, ny = x * sn + y * c;
          x = nx; y = ny;
          alpha += Math.sin(t * 1.1 + d.phase) * 0.1 * w0;
        }
        if (alpha <= 0.004) continue;
        ctx.fillStyle = mix(brass, Math.min(1, Math.max(0, alpha)));
        ctx.beginPath();
        ctx.arc(cx + x * scale + pox * d.par, cy + y * scale + poy * d.par, Math.max(1.2, r * scale), 0, Math.PI * 2);
        ctx.fill();
      }

      // pulses along the conduits once automation is formed
      const wp = clamp01((s - 1.82) / 0.18);
      if (wp > 0.01) {
        walkers.forEach((walk, i) => {
          for (let j = 0; j < 2; j++) {
            const tp = isStatic
              ? (0.35 + i * 0.22 + j * 0.5) % 1
              : (t * 0.32 + i * 0.29 + j * 0.5) % 1;
            const pt = walk(tp);
            const fade = Math.sin(tp * Math.PI); // ease in/out along the run
            ctx.shadowColor = "rgba(196,168,122,0.7)";
            ctx.shadowBlur = 9;
            ctx.fillStyle = `rgba(196,168,122,${0.9 * wp * fade})`;
            ctx.beginPath();
            ctx.arc(cx + pt.x * scale + pox, cy + pt.y * scale + poy, 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        });
      }

      // the pipeline stream feeding the frame in stage 4
      const wf = clamp01((s - 2.82) / 0.18);
      if (wf > 0.01) {
        for (let j = 0; j < 6; j++) {
          const tp = isStatic ? (j / 6 + 0.07) % 1 : (t * 0.24 + j / 6) % 1;
          const pt = inflowWalk(tp);
          const fade = Math.min(1, (1 - tp) * 4) * Math.min(1, tp * 6);
          ctx.fillStyle = `rgba(196,168,122,${0.7 * wf * fade})`;
          ctx.beginPath();
          ctx.arc(cx + pt.x * scale + pox, cy + pt.y * scale + poy, 1.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // whisper of a baseline under the object
      ctx.strokeStyle = cream(0.06);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 0.55 * scale, cy + 0.36 * scale);
      ctx.lineTo(cx + 0.5 * scale, cy + 0.36 * scale);
      ctx.stroke();
    };

    const loop = (now: number) => {
      draw(now);
      if (running) raf = requestAnimationFrame(loop);
    };
    const startLoop = () => {
      if (running || isStatic) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stopLoop = () => { running = false; cancelAnimationFrame(raf); };

    resize();
    if (isStatic) {
      draw(start);
    } else {
      startLoop();
    }

    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? startLoop() : stopLoop()),
      { threshold: 0 }
    );
    io.observe(canvas);

    const onPointer = (e: PointerEvent) => {
      pointer.x = e.clientX / window.innerWidth;
      pointer.y = e.clientY / window.innerHeight;
      pointer.active = true;
    };
    const onLeave = () => { pointer.active = false; };
    const onResize = () => { resize(); if (isStatic) draw(performance.now()); };

    if (!isStatic) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("pointerleave", onLeave);
    }
    window.addEventListener("resize", onResize);

    return () => {
      stopLoop();
      io.disconnect();
      if (!isStatic) {
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("pointerleave", onLeave);
      }
      window.removeEventListener("resize", onResize);
    };
  }, [progressRef, staticStage]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
