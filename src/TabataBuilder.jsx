import React, { useState, useRef, useEffect, useMemo } from "react";

/* ------------------------------------------------------------------
   Tabata builder
   A block = one exercise, N rounds of [work on / rest off].
   Classic Tabata = 8 × 20/10 = 4:00. All three are adjustable.
------------------------------------------------------------------ */

const INK = "#17130F";
const PAPER = "#FAF5E9";

const PHASE = {
  warmup:    { label: "Warm-up",     field: "#5FB6E5" },
  work:      { label: "Work",        field: "#3BC183" },
  rest:      { label: "Rest",        field: "#FFAE3A" },
  blockrest: { label: "Block break", field: "#5FB6E5" },
  cooldown:  { label: "Cooldown",    field: "#5FB6E5" },
  done:      { label: "Done",        field: "#E8DCC6" },
};

/* ---------- two-frame poses ---------- */
const POSES = {
  /* legs */
  squat: { beat: 1.5, frames: [
    { head: [46,16,8], lines: ["M46 25 L48 52","M47 31 L24 34","M48 52 L42 68 L40 84","M32 84 L48 84"] },
    { head: [44,26,8], lines: ["M44 34 L54 55","M45 39 L22 43","M54 55 L34 58 L38 84","M30 84 L46 84"] },
  ]},
  lunge: { beat: 1.6, frames: [
    { head: [46,15,8], lines: ["M46 23 L47 50","M47 50 L44 67 L43 84","M47 50 L52 67 L53 84","M46 28 L40 46"] },
    { head: [44,22,8], lines: ["M44 30 L46 55","M46 55 L34 70 L34 85","M46 55 L66 70 L76 84","M45 34 L38 52"] },
  ]},
  bridge: { beat: 1.6, frames: [
    { head: [20,74,7], lines: ["M28 77 L52 78 L68 60 L70 84","M30 79 L46 83","M10 86 L92 86"] },
    { head: [20,73,7], lines: ["M28 76 L52 57 L68 60 L70 84","M30 78 L46 83","M10 86 L92 86"] },
  ]},
  calfraise: { beat: 1.1, frames: [
    { head: [50,20,8], lines: ["M50 28 L50 56","M50 56 L44 80 L44 86","M50 56 L56 80 L56 86","M50 34 L38 48","M50 34 L62 48","M18 88 L82 88"] },
    { head: [50,14,8], lines: ["M50 22 L50 50","M50 50 L44 74 L48 86","M50 50 L56 74 L52 86","M50 28 L38 42","M50 28 L62 42","M18 88 L82 88"] },
  ]},
  wallsit: { beat: 3.2, frames: [
    { head: [34,32,8], lines: ["M22 10 L22 88","M34 40 L34 62","M34 62 L64 62","M64 62 L64 88","M36 44 L54 52","M18 90 L88 90"] },
    { head: [34,34,8], lines: ["M22 10 L22 88","M34 42 L34 64","M34 64 L64 64","M64 64 L64 88","M36 46 L54 54","M18 90 L88 90"] },
  ]},

  /* upper body */
  kneepushup: { beat: 1.5, frames: [
    { head: [24,44,7.5], lines: ["M32 48 L58 58 L70 68","M32 48 L31 81","M70 68 L86 60","M10 83 L92 83"] },
    { head: [22,58,7.5], lines: ["M30 60 L58 66 L70 72","M30 60 L21 73 L31 81","M70 72 L86 64","M10 83 L92 83"] },
  ]},
  wallpushup: { beat: 1.4, frames: [
    { head: [40,24,8], lines: ["M86 8 L86 88","M42 32 L36 86","M43 34 L82 34","M12 88 L86 88"] },
    { head: [52,28,8], lines: ["M86 8 L86 88","M54 36 L38 86","M55 37 L70 28 L82 34","M12 88 L86 88"] },
  ]},
  chairdip: { beat: 1.6, frames: [
    { head: [32,26,8], lines: ["M50 52 L80 52","M64 52 L64 88","M34 34 L44 58","M36 36 L58 50","M44 58 L28 68 L28 88","M10 90 L88 90"] },
    { head: [32,36,8], lines: ["M50 52 L80 52","M64 52 L64 88","M34 44 L44 64","M36 46 L58 42 L57 51","M44 64 L28 72 L28 88","M10 90 L88 90"] },
  ]},
  pressup: { beat: 1.3, frames: [
    { head: [50,22,8], lines: ["M50 30 L50 58","M50 58 L44 86","M50 58 L56 86","M50 36 L36 36 L36 24","M50 36 L64 36 L64 24"] },
    { head: [50,22,8], lines: ["M50 30 L50 58","M50 58 L44 86","M50 58 L56 86","M50 36 L38 26 L44 8","M50 36 L62 26 L56 8"] },
  ]},
  pikepushup: { beat: 1.6, frames: [
    { head: [34,50,7.5], lines: ["M44 44 L26 78","M44 44 L64 28","M64 28 L84 78","M12 82 L92 82"] },
    { head: [28,66,7.5], lines: ["M40 58 L30 70 L24 78","M40 58 L64 30","M64 30 L84 78","M12 82 L92 82"] },
  ]},
  pushup: { beat: 1.5, frames: [
    { head: [24,44,7.5], lines: ["M32 48 L58 58 L82 70","M32 48 L31 81","M82 70 L90 80","M10 83 L92 83"] },
    { head: [22,60,7.5], lines: ["M30 62 L58 68 L82 76","M30 62 L21 74 L31 81","M82 76 L90 82","M10 83 L92 83"] },
  ]},
  pullup: { beat: 1.9, frames: [
    { head: [50,33,8], lines: ["M18 12 L82 12","M50 42 L40 12","M50 42 L60 12","M50 42 L50 66","M50 66 L44 88","M50 66 L56 88"] },
    { head: [50,20,7.5], lines: ["M18 12 L82 12","M50 28 L38 20 L40 12","M50 28 L62 20 L60 12","M50 28 L50 54","M50 54 L44 76","M50 54 L56 76"] },
  ]},

  /* core */
  plank: { beat: 3.2, frames: [
    { head: [23,51,7], lines: ["M31 54 L78 71","M31 54 L30 72 L15 76","M78 71 L88 79","M10 82 L94 82"] },
    { head: [23,53,7], lines: ["M31 56 L78 72","M31 56 L30 74 L15 77","M78 72 L88 80","M10 82 L94 82"] },
  ]},
  legraise: { beat: 1.8, frames: [
    { head: [27,38,8], lines: ["M32 46 L49 76","M32 48 L20 77","M49 76 L80 56 L85 52","M10 80 L92 80"] },
    { head: [27,36,8], lines: ["M32 44 L49 76","M32 46 L20 77","M49 76 L82 70 L88 68","M10 80 L92 80"] },
  ]},
  deadbug: { beat: 1.7, frames: [
    { head: [24,66,7], lines: ["M32 70 L58 71","M34 68 L30 46","M34 68 L46 82","M58 71 L64 54 L78 56","M58 71 L86 74","M10 86 L92 86"] },
    { head: [24,66,7], lines: ["M32 70 L58 71","M34 68 L44 46","M34 68 L24 82","M58 71 L68 54 L82 58","M58 71 L86 70","M10 86 L92 86"] },
  ]},
  sideplank: { beat: 3.2, frames: [
    { head: [22,44,7], lines: ["M30 50 L74 66","M30 50 L28 68 L14 73","M74 66 L86 76","M32 50 L36 28","M10 80 L94 80"] },
    { head: [22,46,7], lines: ["M30 52 L74 68","M30 52 L28 69 L14 74","M74 68 L86 77","M32 52 L36 30","M10 80 L94 80"] },
  ]},
  superman: { beat: 1.9, frames: [
    { head: [26,66,7], lines: ["M34 70 L68 70","M34 70 L16 73","M68 70 L88 73","M10 78 L92 78"] },
    { head: [24,58,7], lines: ["M32 64 L68 68","M32 64 L14 56","M68 68 L88 58","M10 78 L92 78"] },
  ]},
  shouldertap: { beat: 1.1, frames: [
    { head: [22,50,7], lines: ["M30 54 L74 70","M30 54 L28 80","M31 55 L46 60 L38 49","M74 70 L86 80","M10 82 L94 82"] },
    { head: [22,51,7], lines: ["M30 55 L74 71","M30 55 L28 81","M33 56 L38 81","M74 71 L86 81","M10 82 L94 82"] },
  ]},

  /* cardio */
  march: { beat: 0.8, frames: [
    { head: [50,16,8], lines: ["M50 24 L50 52","M50 52 L46 68 L45 84","M50 52 L66 52 L63 68","M50 30 L36 44","M50 30 L63 26"] },
    { head: [50,16,8], lines: ["M50 24 L50 52","M50 52 L54 68 L55 84","M50 52 L34 52 L37 68","M50 30 L64 44","M50 30 L37 26"] },
  ]},
  jacks: { beat: 0.7, frames: [
    { head: [50,17,8], lines: ["M50 25 L50 54","M50 54 L46 84","M50 54 L54 84","M50 31 L42 54","M50 31 L58 54"] },
    { head: [50,14,8], lines: ["M50 22 L50 52","M50 52 L34 84","M50 52 L66 84","M50 28 L28 16","M50 28 L72 16"] },
  ]},
  punch: { beat: 0.7, frames: [
    { head: [46,17,8], fist: [79,32,3.5], lines: ["M46 25 L48 52","M48 52 L38 68 L36 84","M48 52 L58 68 L60 84","M47 31 L76 32","M47 31 L38 40 L45 32"] },
    { head: [44,17,8], fist: [77,41,3.5], lines: ["M44 25 L48 52","M48 52 L38 68 L36 84","M48 52 L58 68 L60 84","M47 31 L74 41","M47 31 L36 39 L44 31"] },
  ]},
  steptouch: { beat: 0.9, frames: [
    { head: [42,18,8], lines: ["M42 26 L44 52","M44 52 L30 78 L28 85","M44 52 L52 78 L52 85","M42 32 L28 40","M42 32 L56 40"] },
    { head: [58,18,8], lines: ["M58 26 L56 52","M56 52 L70 78 L72 85","M56 52 L48 78 L48 85","M58 32 L72 40","M58 32 L44 40"] },
  ]},
  fastfeet: { beat: 0.4, frames: [
    { head: [50,20,8], lines: ["M50 28 L50 54","M50 54 L42 66 L40 84","M50 54 L58 68 L60 76","M50 32 L38 44","M50 32 L62 44"] },
    { head: [50,20,8], lines: ["M50 28 L50 54","M50 54 L42 68 L40 76","M50 54 L58 66 L60 84","M50 32 L40 46","M50 32 L60 42"] },
  ]},
  burpee: { beat: 1.2, frames: [
    { head: [50,14,8], lines: ["M50 22 L50 50","M50 50 L44 78","M50 50 L56 78","M50 28 L38 10","M50 28 L62 10","M10 84 L92 84"] },
    { head: [24,58,7], lines: ["M32 62 L76 70","M32 62 L30 82","M76 70 L88 80","M10 84 L92 84"] },
  ]},

  /* bookends */
  warmup: { beat: 1.4, frames: [
    { head: [50,28,8], lines: ["M50 36 L50 60","M50 60 L40 84","M50 60 L60 84","M50 42 L30 26","M50 42 L70 26"] },
    { head: [50,28,8], lines: ["M50 36 L50 60","M50 60 L40 84","M50 60 L60 84","M50 42 L28 52","M50 42 L72 52"] },
  ]},
  cooldown: { beat: 3.2, frames: [
    { head: [29,63,7.5], lines: ["M52 48 L46 84","M52 48 L58 84","M52 48 L36 58","M36 58 L33 80"] },
    { head: [27,67,7.5], lines: ["M52 48 L46 84","M52 48 L58 84","M52 48 L34 62","M34 62 L32 82"] },
  ]},
};

const LIBRARY = [
  { key:"squat",      group:"Legs",       name:"Bodyweight squat",  cue:"Sit back like there's a chair behind you" },
  { key:"lunge",      group:"Legs",       name:"Step-back lunge",   cue:"Front knee stacked over the ankle" },
  { key:"bridge",     group:"Legs",       name:"Glute bridge",      cue:"Squeeze at the top, ribs down" },
  { key:"calfraise",  group:"Legs",       name:"Calf raise",        cue:"All the way up, slow all the way down" },
  { key:"wallsit",    group:"Legs",       name:"Wall sit",          cue:"Knees at ninety, back flat on the wall" },

  { key:"kneepushup", group:"Upper body", name:"Knee push-up",      cue:"Elbows close, body in one straight line" },
  { key:"pushup",     group:"Upper body", name:"Push-up",           cue:"Full plank, chest to the floor, elbows at 45°" },
  { key:"pullup",     group:"Upper body", name:"Pull-up",           cue:"Needs a bar — negatives or bands while you build up" },
  { key:"wallpushup", group:"Upper body", name:"Wall push-up",      cue:"Further from the wall, harder it gets" },
  { key:"chairdip",   group:"Upper body", name:"Chair dip",         cue:"Elbows point back, shoulders down" },
  { key:"pressup",    group:"Upper body", name:"Overhead press",    cue:"Ribs down, press straight up past the ears" },
  { key:"pikepushup", group:"Upper body", name:"Pike push-up",      cue:"Hips high, lower the crown of your head — tough one" },

  { key:"plank",      group:"Core",       name:"Plank hold",        cue:"Hips level with your shoulders" },
  { key:"shouldertap",group:"Core",       name:"Shoulder taps",     cue:"Alternate hands, keep the hips dead still" },
  { key:"legraise",   group:"Core",       name:"Seated leg raise",  cue:"Lower slowly — don't drop the legs" },
  { key:"deadbug",    group:"Core",       name:"Dead bug",          cue:"Opposite arm and leg, lower back glued down" },
  { key:"sideplank",  group:"Core",       name:"Side plank (knee)", cue:"Stack the shoulders, lift the hip" },
  { key:"superman",   group:"Core",       name:"Superman",          cue:"Lift chest and thighs, look at the floor" },

  { key:"march",      group:"Cardio",     name:"High knees march",  cue:"Stay tall, land soft" },
  { key:"jacks",      group:"Cardio",     name:"Jumping jacks",     cue:"Step them out instead of jumping if needed" },
  { key:"punch",      group:"Cardio",     name:"Standing punches",  cue:"Turn through the hips, not just the arm" },
  { key:"steptouch",  group:"Cardio",     name:"Side step-touch",   cue:"Wide steps, arms join in" },
  { key:"fastfeet",   group:"Cardio",     name:"Fast feet",         cue:"Tiny quick steps, stay on the balls of your feet" },
  { key:"burpee",     group:"Cardio",     name:"Burpee",            cue:"Step back and step up if the jump is too much" },
];
const GROUPS = ["Legs", "Upper body", "Core", "Cardio"];
const byKey = (k) => LIBRARY.find((e) => e.key === k);

const WARMUP = { key:"warmup", name:"Loosen up", cue:"Big arm circles, then march on the spot" };
const COOL   = { key:"cooldown", name:"Fold and breathe", cue:"Let your neck go heavy, knees soft" };

const WORKS  = [10, 15, 20, 25, 30, 40, 45, 60];
const RESTS  = [5, 10, 15, 20, 30, 45, 60];
const ROUNDS = [4, 5, 6, 8, 10, 12];
const VOLUMES = [0.12, 0.25, 0.45, 0.75, 1.1];   // index 0-4, "Loud" is deliberately hot

function buildSegments(keys, work, rest, rounds) {
  const s = [{ kind:"warmup", seconds:120, ex:WARMUP, block:0, round:0 }];
  keys.forEach((k, b) => {
    const ex = byKey(k);
    for (let r = 1; r <= rounds; r++) {
      s.push({ kind:"work", seconds:work, ex, block:b+1, round:r });
      s.push({ kind:"rest", seconds:rest, ex, block:b+1, round:r });
    }
    if (b < keys.length - 1)
      s.push({ kind:"blockrest", seconds:60, ex:byKey(keys[b+1]), block:b+1, round:rounds });
  });
  s.push({ kind:"cooldown", seconds:120, ex:COOL, block:0, round:0 });
  return s;
}

/* ---------- figure ---------- */
function Frame({ f, w }) {
  const S = { fill:"none", stroke:INK, strokeWidth:w, strokeLinecap:"round", strokeLinejoin:"round" };
  return (
    <>
      <circle cx={f.head[0]} cy={f.head[1]} r={f.head[2]} style={S} />
      {f.fist && <circle cx={f.fist[0]} cy={f.fist[1]} r={f.fist[2]} style={{...S, strokeWidth:w*0.8}} />}
      {f.lines.map((d, i) => <path key={i} d={d} style={S} />)}
    </>
  );
}
function Figure({ name, size=200, animate=true, weight=5, fluid=false }) {
  const p = POSES[name] || POSES.march;
  const dims = fluid
    ? { width:"100%", height:"auto", maxWidth:size }
    : { width:size, height:size, flexShrink:0 };
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true"
         style={{ filter:`url(#${animate ? "boil" : "rough"})`, display:"block", ...dims }}>
      <g className={animate ? "fA" : ""} style={{ animationDuration:`${p.beat}s` }}>
        <Frame f={p.frames[0]} w={weight} />
      </g>
      {animate && (
        <g className="fB" style={{ animationDuration:`${p.beat}s` }}>
          <Frame f={p.frames[1]} w={weight} />
        </g>
      )}
    </svg>
  );
}

const clock = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

/* ---------- stepper ---------- */
function Stepper({ label, unit, value, options, onChange, locked, labels }) {
  const i = options.indexOf(value);
  const go = (d) => {
    const n = Math.min(options.length - 1, Math.max(0, i + d));
    if (n !== i) onChange(options[n]);
  };
  const btn = {
    width:38, height:38, borderRadius:999, background:"transparent",
    border:`2px solid ${INK}`, color:INK, fontSize:20, lineHeight:1,
    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
    fontFamily:"'Space Grotesk', sans-serif", fontWeight:700, padding:0,
  };
  return (
    <div style={{ background:PAPER, border:`2px solid ${INK}`, borderRadius:16,
                  padding:"7px 10px", display:"flex", alignItems:"center", gap:8,
                  opacity: locked ? 0.45 : 1 }}>
      <span style={{ fontSize:10.5, textTransform:"uppercase", letterSpacing:"0.14em", fontWeight:700,
                     opacity:0.65, flex:1, minWidth:0 }}>{label}</span>
      <button className="btn" style={btn} disabled={locked} onClick={() => go(-1)} aria-label={`less ${label}`}>−</button>
      <div style={{ fontFamily:"'Archivo Black', sans-serif", fontSize: labels ? 13 : 20,
                    fontVariantNumeric:"tabular-nums",
                    lineHeight:1, textAlign:"center", width:52, flexShrink:0 }}>
        {labels ? labels[i] : <>{value}<span style={{ fontSize:11, marginLeft:1 }}>{unit}</span></>}
      </div>
      <button className="btn" style={btn} disabled={locked} onClick={() => go(1)} aria-label={`more ${label}`}>+</button>
    </div>
  );
}

export default function TabataBuilder() {
  const [picked, setPicked] = useState(["squat", "kneepushup", "march"]);
  const [work, setWork] = useState(20);
  const [rest, setRest] = useState(10);
  const [rounds, setRounds] = useState(8);
  const [tab, setTab] = useState("Legs");

  const segments = useMemo(() => buildSegments(picked, work, rest, rounds), [picked, work, rest, rounds]);
  const total = useMemo(() => segments.reduce((a,s) => a + s.seconds, 0), [segments]);
  const cum = useMemo(() => { let t=0; return segments.map((s) => { const v=t; t+=s.seconds; return v; }); }, [segments]);
  const blockLen = rounds * (work + rest);

  const [idx, setIdx] = useState(0);
  const [remaining, setRemaining] = useState(120);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [sound, setSound] = useState(true);
  const [vol, setVol] = useState(3);
  const [awake, setAwake] = useState(null);
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    try {
      const m = window.matchMedia("(prefers-reduced-motion: reduce)");
      setCalm(m.matches);
      const h = (e) => setCalm(e.matches);
      m.addEventListener ? m.addEventListener("change", h) : m.addListener(h);
      return () => { m.removeEventListener ? m.removeEventListener("change", h) : m.removeListener(h); };
    } catch (e) {}
  }, []);

  const idxRef = useRef(0), remainRef = useRef(120);
  const deadlineRef = useRef(0), beepRef = useRef(-1);
  const acRef = useRef(null), busRef = useRef(null);
  const soundRef = useRef(true); soundRef.current = sound;
  const volRef = useRef(3); volRef.current = vol;
  const segRef = useRef(segments); segRef.current = segments;

  function audio() {
    if (!acRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ac = new Ctx();
      // limiter keeps the cue loud without clipping, so it survives music underneath
      const comp = ac.createDynamicsCompressor();
      comp.threshold.value = -14; comp.knee.value = 6; comp.ratio.value = 14;
      comp.attack.value = 0.002; comp.release.value = 0.12;
      const bus = ac.createGain(); bus.gain.value = 1;
      bus.connect(comp); comp.connect(ac.destination);
      acRef.current = ac; busRef.current = bus;
    }
    if (acRef.current.state === "suspended") acRef.current.resume();
    return acRef.current;
  }

  function blip(ac, freq, at, dur, level) {
    // square + octave: harmonics are what punch through a music mix
    [[freq, 1], [freq * 2, 0.45], [freq * 3, 0.2]].forEach(([f, mix]) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = "square"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, level * mix), at + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g); g.connect(busRef.current);
      o.start(at); o.stop(at + dur + 0.03);
    });
  }

  function buzz(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) {}
  }

  function chime(type) {
    if (!soundRef.current) return;
    try {
      const ac = audio();
      const t = ac.currentTime + 0.01;
      const L = VOLUMES[volRef.current];
      if (type === "tick") { blip(ac, 1245, t, 0.13, L * 0.75); buzz(60); }
      else if (type === "go") { blip(ac, 1660, t, 0.16, L); blip(ac, 1660, t + 0.19, 0.34, L); buzz([70, 60, 160]); }
      else if (type === "rest") { blip(ac, 700, t, 0.3, L * 0.85); buzz(120); }
      else if (type === "end") {
        [880, 1108, 1318].forEach((f, i) => blip(ac, f, t + i * 0.17, 0.5, L));
        buzz([120, 80, 120, 80, 260]);
      }
    } catch (e) {}
  }

  /* keep audio alive across backgrounding, and hold the screen on while running */
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== "visible") return;
      try { if (acRef.current && acRef.current.state === "suspended") acRef.current.resume(); } catch (e) {}
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const wakeRef = useRef(null);
  useEffect(() => {
    let dead = false;
    async function hold() {
      try {
        if (!("wakeLock" in navigator)) { setAwake(false); return; }
        const s = await navigator.wakeLock.request("screen");
        if (dead) { try { await s.release(); } catch (e) {} return; }
        wakeRef.current = s;
        setAwake(true);
        s.addEventListener("release", () => setAwake(false));
      } catch (e) { setAwake(false); }
    }
    async function drop() {
      try { if (wakeRef.current) { await wakeRef.current.release(); wakeRef.current = null; } } catch (e) {}
    }
    if (running) hold(); else { drop(); setAwake(null); }
    const onVis = () => { if (running && document.visibilityState === "visible") hold(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { dead = true; document.removeEventListener("visibilitychange", onVis); drop(); };
  }, [running]);

  useEffect(() => {
    if (!running) return;
    deadlineRef.current = Date.now() + remainRef.current * 1000;
    const id = setInterval(() => {
      const segs = segRef.current, now = Date.now();
      if (acRef.current && acRef.current.state === "suspended") {
        try { acRef.current.resume(); } catch (e) {}
      }
      const left = Math.ceil((deadlineRef.current - now) / 1000);
      if (left <= 0) {
        const next = idxRef.current + 1;
        if (next >= segs.length) {
          setRunning(false); setFinished(true);
          remainRef.current = 0; setRemaining(0); chime("end");
          return;
        }
        idxRef.current = next; setIdx(next);
        const secs = segs[next].seconds;
        remainRef.current = secs; setRemaining(secs);
        deadlineRef.current = now + secs * 1000;
        beepRef.current = -1;
        chime(segs[next].kind === "work" ? "go" : "rest");
        return;
      }
      if (left !== remainRef.current) {
        remainRef.current = left; setRemaining(left);
        if (left <= 3 && beepRef.current !== left) { beepRef.current = left; chime("tick"); }
      }
    }, 100);
    return () => clearInterval(id);
  }, [running]);

  const started = running || idx > 0 || remaining !== 120 || finished;

  const reset = () => {
    setRunning(false); setFinished(false);
    idxRef.current = 0; setIdx(0);
    remainRef.current = 120; setRemaining(120);
    beepRef.current = -1;
  };
  const toggle = () => { if (finished) return reset(); if (!running) chime("tick"); setRunning((r) => !r); };

  function togglePick(k) {
    if (started) return;
    setPicked((p) => {
      if (p.includes(k)) return p.length === 1 ? p : p.filter((x) => x !== k);
      return p.length >= 6 ? p : [...p, k];
    });
  }

  const seg = segments[Math.min(idx, segments.length - 1)];
  const phase = finished ? PHASE.done : PHASE[seg.kind];
  const elapsed = finished ? total : cum[idx] + (seg.seconds - remaining);
  const spent = seg.seconds - remaining;
  const tally = seg.seconds <= 30 && !finished;
  const urgent = running && remaining <= 3 && remaining > 0;
  const inBlock = !finished && (seg.kind === "work" || seg.kind === "rest");

  const eyebrow = finished ? `${clock(total)} done`
    : seg.kind === "warmup" ? "Before we start"
    : seg.kind === "cooldown" ? "Last two minutes"
    : seg.kind === "blockrest" ? "Block break — walk it off"
    : `Block ${seg.block}/${picked.length} · Round ${seg.round}/${rounds}`;

  const headline = finished ? "That's the session."
    : seg.kind === "blockrest" ? `Up next: ${seg.ex.name}` : seg.ex.name;
  const subline = finished
    ? "Come back in 48 hours. Add a block, or add rounds, when it stops feeling hard."
    : seg.kind === "rest"
      ? (seg.round === rounds ? "Block done — breathe." : `Same again. ${rounds - seg.round} rounds left in this block.`)
      : seg.ex.cue;

  const mono = { fontVariantNumeric:"tabular-nums" };
  const caps = { textTransform:"uppercase", letterSpacing:"0.16em", fontWeight:700 };
  const display = { fontFamily:"'Archivo Black', ui-sans-serif, system-ui, sans-serif" };
  const body = { fontFamily:"'Space Grotesk', ui-sans-serif, system-ui, sans-serif" };

  return (
    <div style={{ background:phase.field, minHeight:"100vh", width:"100%", color:INK,
                  overflowX:"hidden", transition:"background 700ms ease", ...body }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fA { 0%,49.9%{opacity:1} 50%,100%{opacity:0} }
        @keyframes fB { 0%,49.9%{opacity:0} 50%,100%{opacity:1} }
        .fA { animation-name: fA; animation-iteration-count: infinite; animation-timing-function: linear; }
        .fB { animation-name: fB; animation-iteration-count: infinite; animation-timing-function: linear; }
        @keyframes nudge { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        .nudge { animation: nudge .9s ease-in-out infinite; }
        .btn { cursor:pointer; border:none; transition: transform .12s ease; }
        .btn:active { transform: translateY(2px); }
        .btn:disabled { cursor:default; }
        .btn:focus-visible { outline:3px solid ${INK}; outline-offset:3px; }
        @media (prefers-reduced-motion: reduce) {
          .fA,.fB,.nudge { animation: none !important; }
          .fB { display:none; }
        }
      `}</style>

      <svg width="0" height="0" style={{ position:"absolute" }} aria-hidden="true">
        <defs>
          <filter id="boil" x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="2" result="n">
              {!calm && <animate attributeName="seed" values="2;11;24;7" dur="0.5s" calcMode="discrete" repeatCount="indefinite" />}
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="n" scale="1.9" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="rough" x="-25%" y="-25%" width="150%" height="150%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="6" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div style={{ maxWidth:620, margin:"0 auto", padding:"20px 14px 40px" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", fontSize:11, ...caps, gap:10 }}>
          <span style={{ minWidth:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{eyebrow}</span>
          <span style={{ display:"flex", gap:12, alignItems:"baseline", flexShrink:0 }}>
            {running && (
              <span style={{ fontSize:10, ...caps, opacity:0.6 }}>
                {awake === true ? "Screen on" : awake === false ? "Screen may dim" : ""}
              </span>
            )}
            <button className="btn" onClick={() => { const n = !sound; setSound(n); soundRef.current = n; if (n) chime("tick"); }}
              aria-label={sound ? "mute" : "unmute"}
              style={{ background:"none", color:INK, padding:0, fontSize:14, ...body,
                       opacity: sound ? 1 : 0.4, textDecoration: sound ? "none" : "line-through" }}>
              ♪
            </button>
            <span style={mono}>{clock(elapsed)}/{clock(total)}</span>
          </span>
        </div>

        {/* panel */}
        <div style={{ marginTop:14, background:PAPER, border:`3px solid ${INK}`,
                      borderRadius:24, boxShadow:`6px 6px 0 ${INK}`, padding:"12px 14px",
                      display:"flex", alignItems:"center", gap:10 }}>

          <div style={{ flexShrink:0, minWidth:0 }}>
            <div style={{ fontSize:10, ...caps, opacity:0.55, marginBottom:-2 }}>{phase.label}</div>
            <div className={urgent ? "nudge" : ""}
                 style={{ ...display, ...mono, lineHeight:1, letterSpacing:"-0.03em",
                          fontSize: seg.seconds > 60 && !finished
                            ? "clamp(34px, 12vw, 50px)" : "clamp(46px, 17vw, 74px)" }}>
              {finished ? "✓" : seg.seconds > 60 ? clock(remaining) : remaining}
            </div>
            {inBlock && (
              <div style={{ display:"flex", gap:5, flexWrap:"wrap", maxWidth:88, marginTop:8 }}>
                {Array.from({ length: rounds }).map((_, i) => (
                  <span key={i} style={{
                    width:10, height:10, borderRadius:999, border:`2px solid ${INK}`,
                    background: i+1 < seg.round || (i+1 === seg.round && seg.kind === "rest") ? INK : "transparent",
                    opacity: i+1 === seg.round ? 1 : 0.75,
                  }} />
                ))}
              </div>
            )}
          </div>

          <div style={{ flex:1, minWidth:0, display:"flex", justifyContent:"center" }}>
            <Figure name={finished ? "cooldown" : seg.ex.key} size={230} animate={!calm} weight={5} fluid />
          </div>
        </div>

        {/* seconds */}
        <div style={{ marginTop:16, height:26, display:"flex", alignItems:"center", gap: seg.seconds > 20 ? 3 : 5 }}>
          {tally
            ? Array.from({ length: seg.seconds }).map((_, i) => (
                <span key={i} style={{
                  flex:1, height: i < spent ? 8 : 22, borderRadius:3,
                  background: i < spent ? "rgba(23,19,15,0.22)" : INK,
                  transition:"height .2s ease, background .2s ease",
                }} />
              ))
            : (
              <span style={{ flex:1, height:10, borderRadius:6, border:`2px solid ${INK}`, overflow:"hidden" }}>
                <span style={{ display:"block", height:"100%", width:`${finished ? 100 : (spent/seg.seconds)*100}%`,
                               background:INK, transition:"width 1s linear" }} />
              </span>
            )}
        </div>

        <h1 style={{ ...display, fontSize:30, lineHeight:1.08, letterSpacing:"-0.02em", margin:"16px 0 0" }}>
          {headline}
        </h1>
        <p style={{ fontSize:15.5, lineHeight:1.45, margin:"7px 0 0", opacity:0.8, maxWidth:430 }}>
          {subline}
        </p>

        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button className="btn" onClick={toggle}
            style={{ ...display, flex:1, background:INK, color:PAPER, borderRadius:999,
                     padding:"19px 20px", fontSize:16, letterSpacing:"0.1em", textTransform:"uppercase",
                     boxShadow:"4px 4px 0 rgba(23,19,15,0.28)" }}>
            {finished ? "Again" : running ? "Pause" : started ? "Resume" : "Start"}
          </button>
          <button className="btn" onClick={reset}
            style={{ ...display, background:"transparent", color:INK, border:`3px solid ${INK}`,
                     borderRadius:999, padding:"19px 26px", fontSize:16, letterSpacing:"0.1em",
                     textTransform:"uppercase" }}>
            Reset
          </button>
        </div>

        {/* ---- interval settings ---- */}
        <div style={{ marginTop:32, display:"flex", justifyContent:"space-between", alignItems:"baseline",
                      fontSize:11, ...caps, opacity:0.75 }}>
          <span>The interval</span>
          <span>{started ? "Locked while running" : `Block = ${clock(blockLen)}`}</span>
        </div>
        <div style={{ marginTop:9, display:"grid", gridTemplateColumns:"1fr", gap:7 }}>
          <Stepper label="Work" unit="s" value={work} options={WORKS} onChange={setWork} locked={started} />
          <Stepper label="Rest" unit="s" value={rest} options={RESTS} onChange={setRest} locked={started} />
          <Stepper label="Rounds" unit="×" value={rounds} options={ROUNDS} onChange={setRounds} locked={started} />
          <Stepper label="Beep volume" value={vol} options={[0,1,2,3,4]}
                   labels={["Quiet","Low","Mid","Loud","Max"]}
                   onChange={(v) => { setVol(v); volRef.current = v; chime("tick"); }} />
        </div>

        {/* ---- blocks ---- */}
        <div style={{ marginTop:26, display:"flex", justifyContent:"space-between", alignItems:"baseline",
                      fontSize:11, ...caps, opacity:0.75 }}>
          <span>{started ? "Your blocks" : "Pick your blocks"}</span>
          <span>{picked.length}/6</span>
        </div>

        {/* chosen, in order */}
        <div style={{ marginTop:9, display:"grid", gap:6 }}>
          {picked.map((k, i) => {
            const ex = byKey(k);
            const on = inBlock && seg.block === i + 1;
            return (
              <div key={k} style={{
                display:"flex", alignItems:"center", gap:11,
                background: on ? INK : PAPER, color: on ? PAPER : INK,
                border:`2px solid ${INK}`, borderRadius:14, padding:"5px 12px",
                transition:"background .3s ease, color .3s ease",
              }}>
                <span style={{ ...display, fontSize:12, width:14, opacity:0.6, ...mono }}>{i+1}</span>
                <span style={{ lineHeight:0, filter: on ? "invert(1)" : "none" }}>
                  <Figure name={k} size={38} animate={false} weight={6} />
                </span>
                <span style={{ minWidth:0 }}>
                  <span style={{ ...display, fontSize:14, letterSpacing:"-0.01em", display:"block" }}>{ex.name}</span>
                  <span style={{ fontSize:10, ...caps, opacity:0.55 }}>{ex.group} · {clock(blockLen)}</span>
                </span>
                {!started && (
                  <button className="btn" onClick={() => togglePick(k)} aria-label={`remove ${ex.name}`}
                    style={{ marginLeft:"auto", background:"transparent", color:"inherit", fontSize:18,
                             padding:"2px 6px", opacity: picked.length === 1 ? 0.25 : 0.7 }}>×</button>
                )}
              </div>
            );
          })}
        </div>

        {/* library, by body part */}
        {!started && (
          <>
            <div style={{ marginTop:20, display:"flex", gap:6, flexWrap:"wrap" }}>
              {GROUPS.map((g) => (
                <button key={g} className="btn" onClick={() => setTab(g)}
                  style={{ ...body, fontSize:11, ...caps, padding:"9px 14px", borderRadius:999,
                           background: tab === g ? INK : "transparent", color: tab === g ? PAPER : INK,
                           border:`2px solid ${INK}` }}>
                  {g}
                </button>
              ))}
            </div>

            <div style={{ marginTop:10, display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:8 }}>
              {LIBRARY.filter((e) => e.group === tab).map((ex) => {
                const chosen = picked.includes(ex.key);
                return (
                  <button key={ex.key} className="btn" onClick={() => togglePick(ex.key)}
                    style={{ display:"flex", alignItems:"center", gap:8, textAlign:"left",
                             background: chosen ? INK : PAPER, color: chosen ? PAPER : INK,
                             border:`2px solid ${INK}`, borderRadius:14, padding:"7px 10px" }}>
                    <span style={{ lineHeight:0, filter: chosen ? "invert(1)" : "none", flexShrink:0 }}>
                      <Figure name={ex.key} size={38} animate={false} weight={6} />
                    </span>
                    <span style={{ ...display, fontSize:12.5, lineHeight:1.15, letterSpacing:"-0.01em" }}>
                      {ex.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <p style={{ fontSize:13.5, lineHeight:1.5, marginTop:20, opacity:0.75 }}>
          One exercise per block, held for every round. Classic Tabata is 20 / 10 × 8 — drop to
          15 / 15 × 6 if you're starting out, or stretch the work to 40s for a slower strength block.
          Two minutes of warm-up and cooldown are built in, one minute between blocks.
        </p>
      </div>
    </div>
  );
}
