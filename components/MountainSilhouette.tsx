/**
 * MountainSilhouette — site-wide backdrop for BroMountain.
 *
 * Drop-in replacement for components/MountainSilhouette.tsx.
 * - Uses the existing --bm-hill-* tokens from globals.css (light + dark).
 * - Ridges are generated from seeded noise, so every peak is different,
 *   but the output is identical on server and client (no hydration drift).
 * - Layers: sky glow, stars + moon (dark only), snow-capped far range with
 *   shadowed faces, two mid ranges, pine forest rows, drifting mist.
 * - No client JS needed (pure SVG + CSS), so it stays a server component.
 */

const W = 1600;
const H = 640;
const STEP = 8;

/* ───────────── seeded noise ───────────── */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoise(seed: number) {
  const r = rng(seed);
  const v = Array.from({ length: 256 }, () => r());
  return (x: number) => {
    const i = Math.floor(x);
    const f = x - i;
    const a = v[i & 255];
    const b = v[(i + 1) & 255];
    return a + (b - a) * f; // linear: angular crests, like real alpine ridgelines
  };
}

/** Ridged noise: sharp crests, soft valleys — reads as alpine rock. */
const ridged = (n: number) => 1 - Math.abs(2 * n - 1);

type Pt = [number, number];

function ridgeline(seed: number, base: number, amp: number, freq: number, sharp = 1.8): Pt[] {
  const n1 = makeNoise(seed);
  const n2 = makeNoise(seed + 11);
  const n3 = makeNoise(seed + 23);
  const mass = makeNoise(seed + 37);
  const pts: Pt[] = [];
  for (let x = 0; x <= W; x += STEP) {
    const t = x * freq;
    const h =
      0.7 * Math.pow(ridged(n1(t)), sharp) +
      0.22 * Math.pow(ridged(n2(t * 2.7)), sharp) +
      0.08 * ridged(n3(t * 6.3));
    const envelope = 0.35 + 0.65 * Math.pow(mass(x * 0.0019), 0.8);
    pts.push([x, base - amp * h * envelope * 1.35]);
  }
  return pts;
}

const f1 = (n: number) => Math.round(n * 10) / 10;
const line = (pts: Pt[]) => pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join(" L");
const fillPath = (pts: Pt[]) => `M0,${H} L${line(pts)} L${W},${H} Z`;
const strokePath = (pts: Pt[]) => `M${line(pts)}`;

/** Snow caps: the part of each peak above `snowline`, thick at the crest, thinning downhill. */
function snowPath(pts: Pt[], snowline: number, seed: number) {
  const n = makeNoise(seed);
  const parts: string[] = [];
  let run: Pt[] = [];
  const flush = () => {
    if (run.length > 2) {
      const lower = run
        .map(([x, y]): Pt => {
          const above = snowline - y;
          const depth = above * (0.22 + 0.4 * n(x * 0.05)) + 3 * n(x * 0.3);
          return [x, y + Math.max(2, depth)];
        })
        .reverse();
      parts.push(`M${line(run)} L${line(lower)} Z`);
    }
    run = [];
  };
  for (const p of pts) {
    if (p[1] < snowline) run.push(p);
    else flush();
  }
  flush();
  return parts.join(" ");
}

/** Shadow faces: one shape per prominent peak, covering its right flank and fading downhill. */
function shadowFaces(pts: Pt[], minProminence: number): string[] {
  const out: string[] = [];
  for (let i = 3; i < pts.length - 3; i++) {
    const y = pts[i][1];
    let isPeak = true;
    for (let k = -3; k <= 3; k++) if (pts[i + k][1] < y) isPeak = false;
    if (!isPeak) continue;
    let j = i;
    while (j < pts.length - 1 && pts[j + 1][1] >= pts[j][1] && j - i < 45) j++;
    const drop = pts[j][1] - y;
    if (drop < minProminence) continue;
    const flank = pts.slice(i, j + 1);
    const px = pts[i][0];
    const vx = pts[j][0];
    // lit/shaded edge (arete) runs from the crest to the base, slightly right of the crest
    const ex = px + Math.max(10, (vx - px) * 0.18);
    out.push(`M${line(flank)} L${f1(vx + drop * 0.55)},${H} L${f1(ex)},${H} Z`);
    i = j;
  }
  return out;
}

/** One row of pines standing on a gently rolling ground line. */
function forest(seed: number, ground: number, rollAmp: number, minH: number, maxH: number) {
  const r = rng(seed);
  const roll = makeNoise(seed + 5);
  const groundY = (x: number) => ground - rollAmp * roll(x * 0.004);
  const parts: string[] = [];
  const base: Pt[] = [];
  for (let x = 0; x <= W; x += STEP) base.push([x, groundY(x)]);
  let x = -10;
  while (x < W + 10) {
    const h = minH + (maxH - minH) * Math.pow(r(), 1.7);
    const w = h * (0.34 + 0.1 * r());
    const by = groundY(Math.max(0, Math.min(W, x))) + 4;
    const pts: Pt[] = [
      [x - w * 0.5, by],
      [x - w * 0.22, by - h * 0.3],
      [x - w * 0.36, by - h * 0.3],
      [x - w * 0.12, by - h * 0.6],
      [x - w * 0.24, by - h * 0.6],
      [x, by - h],
      [x + w * 0.24, by - h * 0.6],
      [x + w * 0.12, by - h * 0.6],
      [x + w * 0.36, by - h * 0.3],
      [x + w * 0.22, by - h * 0.3],
      [x + w * 0.5, by],
    ];
    parts.push(`M${line(pts)} Z`);
    x += w * (0.55 + 0.5 * r());
  }
  return { trees: parts.join(" "), ground: fillPath(base) };
}

/* ───────────── build geometry once at module load ───────────── */
const far = ridgeline(7, 455, 360, 0.0034, 1.7);
const mid1 = ridgeline(19, 495, 250, 0.0048, 1.8);
const mid2 = ridgeline(31, 538, 165, 0.0062, 1.7);
const near = ridgeline(43, 584, 90, 0.0085, 1.6);

const farFill = fillPath(far);
const farSnow = snowPath(far, 250, 3);
const farShadow = shadowFaces(far, 34);
const farRidge = strokePath(far);

const mid1Fill = fillPath(mid1);
const mid1Snow = snowPath(mid1, 330, 8);
const mid1Shadow = shadowFaces(mid1, 28);
const mid1Ridge = strokePath(mid1);

const mid2Fill = fillPath(mid2);
const mid2Shadow = shadowFaces(mid2, 24);
const nearFill = fillPath(near);
const nearRidge = strokePath(near);

const pinesBack = forest(101, 566, 18, 26, 54);
const pinesFront = forest(202, 612, 14, 34, 78);

const stars = (() => {
  const r = rng(2026);
  return Array.from({ length: 90 }, () => ({
    x: f1(r() * 1000),
    y: f1(r() * 520),
    r: f1(0.5 + r() * 1.3),
    o: f1(0.25 + r() * 0.6),
    twinkle: r() > 0.78,
    d: f1(r() * 5),
  }));
})();

const css = `
.bm-mtn{position:absolute;inset:0;overflow:hidden}
.bm-sky{position:absolute;inset:0;
  background:
    radial-gradient(120% 70% at 50% 100%, rgba(255,214,150,.38) 0%, rgba(255,226,180,.14) 45%, transparent 70%),
    linear-gradient(to bottom, rgba(150,190,200,.22) 0%, transparent 55%)}
[data-theme="dark"] .bm-sky{
  background:
    radial-gradient(90% 60% at 78% 14%, rgba(110,170,150,.16) 0%, transparent 60%),
    radial-gradient(120% 55% at 50% 100%, rgba(40,90,70,.30) 0%, transparent 70%),
    linear-gradient(to bottom, rgba(14,22,30,.0) 0%, rgba(10,16,14,0) 100%)}
.bm-night{position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity .4s ease}
[data-theme="dark"] .bm-night{opacity:1}
.bm-twinkle{animation:bm-tw 4.5s ease-in-out infinite}
@keyframes bm-tw{0%,100%{opacity:.15}50%{opacity:.95}}
.bm-range{position:absolute;left:0;right:0;bottom:0;width:100%;
  height:clamp(320px,40vw,72vh);
  opacity:min(1,calc(var(--bm-hill-opacity) + .35));
  transition:opacity .4s ease}
.bm-fog{animation:bm-drift 60s ease-in-out infinite alternate}
.bm-fog.slow{animation-duration:90s;animation-direction:alternate-reverse}
@keyframes bm-drift{from{transform:translateX(-70px)}to{transform:translateX(70px)}}
@media (prefers-reduced-motion:reduce){.bm-fog,.bm-twinkle{animation:none}}
`;

export default function MountainSilhouette() {
  return (
    <div className="bm-mtn" aria-hidden="true">
      <style>{css}</style>
      <div className="bm-sky" />

      {/* Night sky: stars + moon (visible only in dark theme) */}
      <svg
        className="bm-night"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="bmMoonHalo">
            <stop offset="0%" stopColor="rgba(220,238,228,.38)" />
            <stop offset="40%" stopColor="rgba(190,220,205,.12)" />
            <stop offset="100%" stopColor="rgba(190,220,205,0)" />
          </radialGradient>
        </defs>
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#e9f2ec"
            opacity={s.o}
            className={s.twinkle ? "bm-twinkle" : undefined}
            style={s.twinkle ? { animationDelay: `${s.d}s` } : undefined}
          />
        ))}
        <circle cx="800" cy="105" r="120" fill="url(#bmMoonHalo)" />
        <circle cx="800" cy="105" r="22" fill="#eef5ef" opacity=".92" />
        <circle cx="792" cy="100" r="5" fill="#9fb3a6" opacity=".25" />
        <circle cx="808" cy="112" r="3.5" fill="#9fb3a6" opacity=".2" />
      </svg>

      {/* Mountain range */}
      <svg
        className="bm-range"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* shadow faces fade out as they run downhill */}
          <linearGradient id="bmShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(10,18,14)" stopOpacity="0.4" />
            <stop offset="55%" stopColor="rgb(10,18,14)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="rgb(10,18,14)" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="bmFog">
            <stop offset="0%" stopColor="var(--bm-hill-fog)" />
            <stop offset="100%" stopColor="var(--bm-hill-fog)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* FAR range */}
        <path d={farFill} fill="var(--bm-hill-far)" />
        {farShadow.map((d, i) => <path key={i} d={d} fill="url(#bmShade)" />)}
        <path d={farSnow} fill="var(--bm-hill-snow)" />
        <path d={farRidge} fill="none" stroke="var(--bm-hill-ridge)" strokeWidth="1.2" strokeLinejoin="round" />

        <ellipse className="bm-fog" cx="520" cy="470" rx="620" ry="46" fill="url(#bmFog)" />

        {/* MID range 1 */}
        <path d={mid1Fill} fill="var(--bm-hill-mid-a)" />
        {mid1Shadow.map((d, i) => <path key={i} d={d} fill="url(#bmShade)" />)}
        <path d={mid1Snow} fill="var(--bm-hill-snow)" opacity=".7" />
        <path d={mid1Ridge} fill="none" stroke="var(--bm-hill-ridge)" strokeWidth="1" strokeLinejoin="round" opacity=".8" />

        <ellipse className="bm-fog slow" cx="1080" cy="520" rx="700" ry="40" fill="url(#bmFog)" />

        {/* MID range 2 */}
        <path d={mid2Fill} fill="var(--bm-hill-mid-b)" />
        {mid2Shadow.map((d, i) => <path key={i} d={d} fill="url(#bmShade)" />)}

        {/* NEAR ridge */}
        <path d={nearFill} fill="var(--bm-hill-mid-c)" />
        <path d={nearRidge} fill="none" stroke="var(--bm-hill-ridge)" strokeWidth=".9" opacity=".6" />

        {/* Forest rows */}
        <path d={pinesBack.ground} fill="var(--bm-hill-front-b)" />
        <path d={pinesBack.trees} fill="var(--bm-hill-front-b)" />
        <ellipse className="bm-fog" cx="700" cy="590" rx="760" ry="30" fill="url(#bmFog)" />
        <path d={pinesFront.ground} fill="var(--bm-hill-front-c)" />
        <path d={pinesFront.trees} fill="var(--bm-hill-front-a)" />
        <path d={pinesFront.trees} fill="var(--bm-hill-front-c)" opacity=".6" />
        <rect x="0" y={H - 14} width={W} height="14" fill="var(--bm-hill-front-c)" />
      </svg>
    </div>
  );
}