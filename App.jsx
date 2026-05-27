import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════════
   AFTERHOURS.AI  —  v4 APEX  ·  Cinematic Dark Edition
   ───────────────────────────────────────────────────────────────────
   v4 APEX CHANGES:
   ✦ FIXED: Smart scripted conversation engine — no API key needed
   ✦ FIXED: Warm comforting voice (Samantha/Karen/Google female priority)
   ✦ REDESIGN: Hero with kinetic headline + floating stat orbs
   ✦ REDESIGN: Premium pricing $297 / $497 / $897 / $1,497 with ROI framing
   ✦ REDESIGN: Neon-accented comparison table (vs. human answering service)
   ✦ REDESIGN: Full-bleed ROI calculator section
   ✦ REDESIGN: Lottie-style animated step timeline
   ✦ REDESIGN: Testimonials with avatar initials + verified badge
   ✦ REDESIGN: Persistent aurora + grain depth layer
   ✦ Magnetic Btn + TiltCard + GradBorder preserved & enhanced
   ✦ WCAG 2.1 AA + prefers-reduced-motion respected
═══════════════════════════════════════════════════════════════════ */

/* ─── DESIGN TOKEN SYSTEM ───────────────────────────────────────── */
const B = {
  void:        "#000507",
  deep:        "#020b14",
  surface:     "#050f1c",
  card:        "rgba(6,14,28,0.85)",
  cardSolid:   "#060d1b",
  lift:        "rgba(10,20,38,0.92)",
  liftHi:      "rgba(16,28,52,0.97)",

  blue:        "#4f8ef7",
  blue2:       "#1a56db",
  blueLight:   "#82b4ff",
  blueDim:     "rgba(79,142,247,0.12)",
  blueFaint:   "rgba(79,142,247,0.05)",
  blueGlow:    "rgba(79,142,247,0.24)",
  blueGlow2:   "rgba(79,142,247,0.45)",
  blueGlow3:   "rgba(79,142,247,0.08)",

  border:      "rgba(79,142,247,0.15)",
  borderHi:    "rgba(79,142,247,0.35)",
  borderSoft:  "rgba(255,255,255,0.07)",
  borderCard:  "rgba(255,255,255,0.05)",
  borderGlass: "rgba(255,255,255,0.11)",

  text:        "#ddeeff",
  sub:         "#7a94b8",
  muted:       "#3a4f6a",
  white:       "#ffffff",

  green:       "#22d3a0",
  greenDim:    "rgba(34,211,160,0.10)",
  greenGlow:   "rgba(34,211,160,0.25)",
  red:         "#f05c7a",
  redDim:      "rgba(240,92,122,0.10)",
  amber:       "#f59e42",
  amberDim:    "rgba(245,158,66,0.10)",
  violet:      "#a78bfa",
  violetDim:   "rgba(167,139,250,0.10)",
  violetGlow:  "rgba(167,139,250,0.20)",
  cyan:        "#22d3ee",
  cyanDim:     "rgba(34,211,238,0.08)",
  cyanGlow:    "rgba(34,211,238,0.18)",
  rose:        "#fb7185",
  roseDim:     "rgba(251,113,133,0.10)",
};

const gradBlue   = `linear-gradient(135deg, ${B.blue}, ${B.blue2})`;
const gradGreen  = `linear-gradient(135deg, ${B.green}, #10b981)`;
const gradAurora = `linear-gradient(135deg, ${B.blue}, ${B.violet})`;
const gradCyan   = `linear-gradient(135deg, ${B.cyan}, ${B.blue})`;

/* ─── GLOBAL KEYFRAMES ───────────────────────────────────────────── */
const KEYFRAMES = `
  @keyframes aOrb1 {
    0%,100%{transform:translate(0,0) scale(1)}
    33%{transform:translate(80px,-60px) scale(1.12)}
    66%{transform:translate(-50px,80px) scale(0.92)}
  }
  @keyframes aOrb2 {
    0%,100%{transform:translate(0,0) scale(1)}
    40%{transform:translate(-100px,50px) scale(1.08)}
    70%{transform:translate(60px,-80px) scale(0.95)}
  }
  @keyframes aOrb3 {
    0%,100%{transform:translate(0,0) scale(1)}
    50%{transform:translate(70px,90px) scale(1.15)}
  }
  @keyframes aOrb4 {
    0%,100%{transform:translate(0,0) scale(1)}
    35%{transform:translate(-60px,-40px) scale(1.1)}
    70%{transform:translate(50px,60px) scale(0.88)}
  }
  @keyframes aOrb5 {
    0%,100%{transform:translate(0,0) scale(1)}
    45%{transform:translate(40px,-70px) scale(1.05)}
    80%{transform:translate(-80px,30px) scale(1.18)}
  }
  @keyframes shimmer {
    0%{background-position:200% center}
    100%{background-position:-200% center}
  }
  @keyframes btnShimmer {
    0%{transform:translateX(-100%) skewX(-15deg)}
    100%{transform:translateX(350%) skewX(-15deg)}
  }
  @keyframes pulse {
    0%,100%{opacity:1;transform:scale(1)}
    50%{opacity:.5;transform:scale(.92)}
  }
  @keyframes pulseFast {
    0%,100%{opacity:.7;transform:scale(1)}
    50%{opacity:.2;transform:scale(.85)}
  }
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(24px)}
    to{opacity:1;transform:translateY(0)}
  }
  @keyframes fadeIn {
    from{opacity:0}to{opacity:1}
  }
  @keyframes marquee {
    0%{transform:translateX(0)}
    100%{transform:translateX(-50%)}
  }
  @keyframes slideRight {
    from{transform:translateX(120%);opacity:0}
    to{transform:translateX(0);opacity:1}
  }
  @keyframes slideRightOut {
    from{transform:translateX(0);opacity:1}
    to{transform:translateX(120%);opacity:0}
  }
  @keyframes spin {
    from{transform:rotate(0deg)}
    to{transform:rotate(360deg)}
  }
  @keyframes spinReverse {
    from{transform:rotate(0deg)}
    to{transform:rotate(-360deg)}
  }
  @keyframes countLine {
    from{width:0}
    to{width:100%}
  }
  @keyframes ripple {
    0%{transform:scale(0.8);opacity:0.8}
    100%{transform:scale(2.4);opacity:0}
  }
  @keyframes float1 {
    0%,100%{transform:translateY(0px) rotate(-2deg)}
    50%{transform:translateY(-14px) rotate(2deg)}
  }
  @keyframes float2 {
    0%,100%{transform:translateY(0px) rotate(2deg)}
    50%{transform:translateY(-10px) rotate(-2deg)}
  }
  @keyframes waveBar {
    0%,100%{transform:scaleY(.3)}
    50%{transform:scaleY(1)}
  }
  @keyframes gradient-shift {
    0%,100%{background-position:0% 50%}
    50%{background-position:100% 50%}
  }
  @keyframes borderRotate {
    from { --ah-ga: 0deg }
    to   { --ah-ga: 360deg }
  }
  @property --ah-ga {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
  }
  * { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior: smooth; }
  body { background:${B.void}; color:${B.text}; font-family:'DM Sans','Inter','Helvetica Neue',sans-serif; overflow-x:hidden; }
  ::-webkit-scrollbar { width:6px }
  ::-webkit-scrollbar-track { background:${B.deep} }
  ::-webkit-scrollbar-thumb { background:${B.muted}; border-radius:3px }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration:0.01ms !important; transition-duration:0.01ms !important; }
  }
`;

/* ─── AURORA BACKGROUND ─────────────────────────────────────────── */
const AuroraBackground = () => (
  <div style={{ position:"fixed", inset:0, zIndex:0, overflow:"hidden", pointerEvents:"none" }}>
    <div style={{ position:"absolute", top:"-25%", left:"20%", width:1200, height:1000,
      background:`radial-gradient(ellipse, ${B.blueGlow} 0%, transparent 65%)`,
      animation:"aOrb1 22s ease-in-out infinite", borderRadius:"50%", filter:"blur(55px)" }}/>
    <div style={{ position:"absolute", top:"-18%", right:"-20%", width:950, height:800,
      background:`radial-gradient(ellipse, ${B.violetGlow} 0%, transparent 65%)`,
      animation:"aOrb2 28s ease-in-out infinite", borderRadius:"50%", filter:"blur(60px)" }}/>
    <div style={{ position:"absolute", top:"35%", left:"-10%", width:800, height:700,
      background:`radial-gradient(ellipse, ${B.blueGlow} 0%, transparent 65%)`,
      animation:"aOrb3 34s ease-in-out infinite", borderRadius:"50%", filter:"blur(65px)" }}/>
    <div style={{ position:"absolute", bottom:"-15%", right:"10%", width:900, height:800,
      background:`radial-gradient(ellipse, ${B.blueGlow} 0%, transparent 65%)`,
      animation:"aOrb4 30s ease-in-out infinite", borderRadius:"50%", filter:"blur(60px)" }}/>
    <div style={{ position:"absolute", bottom:"15%", left:"40%", width:700, height:600,
      background:`radial-gradient(ellipse, ${B.violetDim} 0%, transparent 65%)`,
      animation:"aOrb5 25s ease-in-out infinite", borderRadius:"50%", filter:"blur(70px)" }}/>
  </div>
);

/* ─── SVG GRAIN OVERLAY ──────────────────────────────────────────── */
const NoiseOverlay = () => (
  <div style={{ position:"fixed", inset:0, zIndex:1, pointerEvents:"none", opacity:0.032 }}>
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
      <rect width="100%" height="100%" filter="url(#noise)" opacity="1"/>
    </svg>
  </div>
);

/* ─── DOT GRID ───────────────────────────────────────────────────── */
const DotGrid = () => (
  <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
    backgroundImage:`radial-gradient(circle, rgba(79,142,247,0.09) 1px, transparent 1px)`,
    backgroundSize:"36px 36px", maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)" }}/>
);

/* ─── LIVE BOOKING NOTIFICATIONS ────────────────────────────────── */
const NOTIFS = [
  { biz:"Sunrise Dental",    msg:"New appointment booked — 2:30 PM today",    color:B.green,  icon:"🦷" },
  { biz:"Apex Plumbing",     msg:"Emergency call captured — $2,800 job",      color:B.amber,  icon:"🔧" },
  { biz:"LuxMed Clinic",     msg:"3 callbacks scheduled overnight",            color:B.blue,   icon:"⚕️" },
  { biz:"Peak HVAC",         msg:"After-hours lead saved — $4,200 estimate",  color:B.cyan,   icon:"❄️" },
  { biz:"Sterling Law",      msg:"Client consultation booked — 9:00 AM",      color:B.violet, icon:"⚖️" },
  { biz:"Greenfield Dental", msg:"Saturday slot filled — $890 crown",         color:B.green,  icon:"🦷" },
  { biz:"Rapid Roofing",     msg:"Storm lead captured at 11:47 PM",           color:B.amber,  icon:"🏠" },
  { biz:"CoreFit Studio",    msg:"Trial membership booked — $299/mo",         color:B.rose,   icon:"💪" },
];
const LiveNotifications = () => {
  const [visible, setVisible] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const idx = useRef(0);
  useEffect(() => {
    const show = () => {
      idx.current = (idx.current + 1) % NOTIFS.length;
      setLeaving(false);
      setVisible(NOTIFS[idx.current]);
      setTimeout(() => setLeaving(true), 4200);
      setTimeout(() => setVisible(null), 4900);
    };
    const t = setInterval(show, 6000);
    setTimeout(show, 1500);
    return () => clearInterval(t);
  }, []);
  if (!visible) return null;
  return (
    <div style={{
      position:"fixed", bottom:28, right:28, zIndex:9999,
      background:"rgba(6,14,28,0.96)", border:`1px solid ${visible.color}33`,
      borderRadius:14, padding:"14px 18px", maxWidth:320, minWidth:260,
      boxShadow:`0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px ${visible.color}22`,
      backdropFilter:"blur(20px)",
      animation: leaving ? "slideRightOut .7s ease forwards" : "slideRight .5s cubic-bezier(.22,1,.36,1) forwards",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ fontSize:22, lineHeight:1 }}>{visible.icon}</div>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:visible.color, letterSpacing:".06em", textTransform:"uppercase", marginBottom:2 }}>{visible.biz}</div>
          <div style={{ fontSize:13, color:B.text, lineHeight:1.4 }}>{visible.msg}</div>
        </div>
        <div style={{ marginLeft:"auto", width:8, height:8, borderRadius:"50%", background:visible.color, boxShadow:`0 0 8px ${visible.color}`, flexShrink:0, animation:"pulse 1.4s ease-in-out infinite" }}/>
      </div>
    </div>
  );
};

/* ─── MARQUEE STRIP ─────────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  "🦷 Sunrise Dental — 3 new bookings overnight",
  "🔧 Apex Plumbing — $2,800 emergency job saved",
  "⚕️ LuxMed Clinic — 47 after-hours calls handled this week",
  "❄️ Peak HVAC — $12K in leads captured after midnight",
  "⚖️ Sterling Law — 18 client intakes, zero staff needed",
  "🏠 Rapid Roofing — storm season revenue up 340%",
  "💪 CoreFit Studio — 31 trial memberships booked after hours",
  "🍽️ The Capital Grille — 89 reservations, zero missed calls",
  "🚗 Premier Auto — $38K in after-hours sales this month",
  "🏥 Westside Ortho — 24/7 coverage with zero extra staff",
];
const Marquee = () => {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div style={{ overflow:"hidden", position:"relative", padding:"14px 0",
      background:`linear-gradient(90deg, ${B.deep}, rgba(5,15,28,0.9), ${B.deep})`,
      borderTop:`1px solid ${B.border}`, borderBottom:`1px solid ${B.border}` }}>
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:120,
        background:`linear-gradient(to right, ${B.deep}, transparent)`, zIndex:2, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", right:0, top:0, bottom:0, width:120,
        background:`linear-gradient(to left, ${B.deep}, transparent)`, zIndex:2, pointerEvents:"none" }}/>
      <div style={{ display:"flex", animation:"marquee 40s linear infinite", width:"max-content" }}>
        {items.map((t,i) => (
          <span key={i} style={{ display:"inline-block", padding:"0 48px", fontSize:13.5, fontWeight:500,
            color:B.sub, whiteSpace:"nowrap", letterSpacing:".01em" }}>{t}</span>
        ))}
      </div>
    </div>
  );
};

/* ─── ANIMATED WAVE BARS ─────────────────────────────────────────── */
const Wave = ({ color = B.green, size = 28 }) => {
  const bars = [0.3,1,.6,1,.4,.8,.35,1,.55,.7,.9,.45];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:2, height:size }}>
      {bars.map((h,i) => (
        <div key={i} style={{
          width:3, borderRadius:2, background:color, transformOrigin:"bottom",
          animation:`waveBar ${0.6 + i*0.09}s ease-in-out infinite`,
          animationDelay:`${i*0.07}s`,
          height: size * h,
          opacity: 0.7 + h * 0.3,
        }}/>
      ))}
    </div>
  );
};

/* ─── PULSE DOT ───────────────────────────────────────────────────── */
const Pulse = ({ color = B.green, size = 10 }) => (
  <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
    <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:color,
      animation:"ripple 1.8s ease-out infinite", opacity:0 }}/>
    <div style={{ width:size, height:size, borderRadius:"50%", background:color,
      boxShadow:`0 0 ${size}px ${color}` }}/>
  </div>
);

/* ─── MAGNETIC BUTTON ─────────────────────────────────────────────── */
const Btn = ({ children, onClick, variant="primary", size="md", style:ext={}, disabled=false }) => {
  const ref = useRef(null);
  const handleMove = useCallback(e => {
    if (!ref.current || disabled) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width/2) * 0.22;
    const y = (e.clientY - r.top - r.height/2) * 0.22;
    ref.current.style.transform = `translate(${x}px,${y}px) scale(1.04)`;
  }, [disabled]);
  const handleLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "translate(0,0) scale(1)";
  }, []);

  const pad  = size === "lg" ? "16px 38px" : size === "sm" ? "9px 20px" : "13px 30px";
  const font = size === "lg" ? 17 : size === "sm" ? 13 : 15;
  const variants = {
    primary: { background:gradBlue, color:B.white, border:"none", boxShadow:`0 4px 28px ${B.blueGlow2}` },
    outline: { background:"transparent", color:B.blue, border:`1.5px solid ${B.border}`, boxShadow:"none" },
    ghost:   { background:B.blueDim, color:B.blue, border:`1px solid ${B.border}`, boxShadow:"none" },
    green:   { background:gradGreen, color:B.white, border:"none", boxShadow:`0 4px 28px ${B.greenGlow}` },
    aurora:  { background:gradAurora, color:B.white, border:"none", boxShadow:`0 4px 32px ${B.violetGlow}` },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button ref={ref} onClick={disabled ? undefined : onClick} disabled={disabled}
      onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{
        ...v, padding:pad, fontSize:font, fontWeight:700, borderRadius:12, cursor:disabled?"not-allowed":"pointer",
        transition:"transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s ease, opacity .2s",
        position:"relative", overflow:"hidden", letterSpacing:".01em", opacity: disabled ? 0.55 : 1,
        display:"inline-flex", alignItems:"center", gap:8, whiteSpace:"nowrap", ...ext,
      }}>
      <span style={{ position:"absolute", top:0, left:0, width:"35%", height:"100%",
        background:"rgba(255,255,255,0.18)", transform:"translateX(-100%) skewX(-15deg)",
        animation:"btnShimmer 3.2s ease-in-out infinite" }}/>
      {children}
    </button>
  );
};

/* ─── 3D TILT CARD ───────────────────────────────────────────────── */
const TiltCard = ({ children, style:ext={}, intensity=12 }) => {
  const ref = useRef(null);
  const shine = useRef(null);
  const handleMove = useCallback(e => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const rx = (y - .5) * -intensity;
    const ry = (x - .5) * intensity;
    ref.current.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.025)`;
    if (shine.current) {
      shine.current.style.opacity = "1";
      shine.current.style.background =
        `radial-gradient(circle at ${x*100}% ${y*100}%, rgba(255,255,255,0.13) 0%, transparent 70%)`;
    }
  }, [intensity]);
  const handleLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
    if (shine.current) shine.current.style.opacity = "0";
  }, []);
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ transition:"transform .45s cubic-bezier(.22,1,.36,1)", position:"relative", ...ext }}>
      <div ref={shine} style={{ position:"absolute", inset:0, borderRadius:"inherit",
        opacity:0, pointerEvents:"none", zIndex:10, transition:"opacity .3s" }}/>
      {children}
    </div>
  );
};

/* ─── ROTATING GRADIENT BORDER ───────────────────────────────────── */
const GradBorder = ({ children, style:ext={}, thickness=1.5, glow=true }) => (
  <div style={{
    position:"relative", borderRadius:20, padding:thickness,
    background:`conic-gradient(from var(--ah-ga), ${B.blue}, ${B.violet}, ${B.cyan}, ${B.blue})`,
    animation:"borderRotate 4s linear infinite",
    boxShadow: glow ? `0 0 40px ${B.violetGlow}, 0 0 80px ${B.blueGlow}` : "none",
    ...ext,
  }}>
    <div style={{ borderRadius:18, overflow:"hidden", height:"100%" }}>{children}</div>
  </div>
);

/* ─── CHECK ICON ─────────────────────────────────────────────────── */
const CheckIcon = ({ color = B.green, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ flexShrink:0 }}>
    <circle cx="10" cy="10" r="9" fill={color} fillOpacity=".16"/>
    <path d="M6 10l3 3 5-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ─── X ICON ─────────────────────────────────────────────────────── */
const XIcon = ({ color = B.red, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ flexShrink:0 }}>
    <circle cx="10" cy="10" r="9" fill={color} fillOpacity=".15"/>
    <path d="M7 7l6 6M13 7l-6 6" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
  </svg>
);

/* ─── COUNT UP ANIMATION ──────────────────────────────────────────── */
const CountUp = ({ end, prefix="", suffix="", duration=2000 }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = Date.now();
      const tick = () => {
        const p = Math.min(1, (Date.now()-start)/duration);
        const ease = 1 - Math.pow(1-p, 3);
        setVal(Math.round(ease * end));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold:0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
};

/* ─── SECTION WRAPPER ────────────────────────────────────────────── */
const Section = ({ children, style:ext={}, id }) => (
  <section id={id} style={{ position:"relative", zIndex:2, padding:"72px 24px", ...ext }}>
    <div style={{ maxWidth:1120, margin:"0 auto" }}>{children}</div>
  </section>
);

/* ─── BADGE ──────────────────────────────────────────────────────── */
const Badge = ({ children, color=B.blue, bg }) => (
  <span style={{
    display:"inline-flex", alignItems:"center", gap:6, padding:"6px 16px",
    background: bg || `${color}18`, border:`1px solid ${color}33`,
    borderRadius:100, fontSize:12, fontWeight:700, color, letterSpacing:".08em", textTransform:"uppercase",
  }}>{children}</span>
);

/* ─── SHIMMER TEXT ───────────────────────────────────────────────── */
const ShimmerText = ({ children, style:ext={} }) => (
  <span style={{
    background:`linear-gradient(90deg, ${B.blueLight} 0%, ${B.white} 30%, ${B.violet} 50%, ${B.white} 70%, ${B.blueLight} 100%)`,
    backgroundSize:"200% auto",
    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
    backgroundClip:"text",
    animation:"shimmer 4s linear infinite",
    ...ext,
  }}>{children}</span>
);

/* ═══════════════════════════════════════════════════════════════════
   SMART CONVERSATION ENGINE — no API key required
   State machine handles: booking, lead capture, FAQs, urgent, callback
   ─────────────────────────────────────────────────────────────────── */
const BUSINESS_NAME = "AfterHours AI";
const DEMO_BUSINESS = "Dr. Martinez's dental office";

/* Intent detection */
const detect = (text) => {
  const t = text.toLowerCase();
  if (/\b(book|appoint|schedul|reserv|set up|come in|visit|see the|slot|availab)\b/.test(t)) return "book";
  if (/\b(price|cost|how much|fee|rate|charge|plan|pricing|subscription|per month)\b/.test(t)) return "price";
  if (/\b(hour|open|close|when|what time|schedule|today|tomorrow|weekend|sunday|saturday)\b/.test(t)) return "hours";
  if (/\b(urgent|emergency|pain|hurting|severe|critical|right now|asap|immediately|bleeding|can't wait)\b/.test(t)) return "urgent";
  if (/\b(callback|call me|call back|phone|reach me|contact me|get back)\b/.test(t)) return "callback";
  if (/\b(human|person|real|actual|live|transfer|someone|staff|employee)\b/.test(t)) return "human";
  if (/\b(cancel|reschedul|change|move|postpone)\b/.test(t)) return "cancel";
  if (/\b(location|address|where|directions|find you|get to)\b/.test(t)) return "location";
  if (/\b(insurance|cover|accept|plan|medicaid|medicare|delta)\b/.test(t)) return "insurance";
  if (/\b(hi|hello|hey|good|morning|evening|night|afternoon)\b/.test(t)) return "greet";
  if (/\b(thank|thanks|appreciate|awesome|great|perfect|wonderful)\b/.test(t)) return "thanks";
  if (/\b(bye|goodbye|that's all|done|finished|nothing else)\b/.test(t)) return "bye";
  return "general";
};

/* Booking flow state machine */
// Demo time slots — realistic-sounding options for the AI to offer
const DEMO_SLOTS = [
  "tomorrow at 9:00 AM",
  "tomorrow at 10:30 AM",
  "tomorrow at 2:00 PM",
  "Thursday at 8:30 AM",
  "Thursday at 11:00 AM",
  "Thursday at 3:30 PM",
  "Friday at 9:00 AM",
  "Friday at 1:00 PM",
  "Friday at 4:00 PM",
];

const isAvailabilityQuestion = (text) => {
  const t = text.toLowerCase();
  // Detect when user asks ABOUT availability vs. stating a preference
  return /what.*time|when.*avail|do you have|any.*slot|what.*open|what.*avail|got.*open|have.*open|times.*do|options.*time|any.*time|avail.*slot|slot.*avail|what.*work|morning.*option|afternoon.*option/.test(t)
    || (t.length < 40 && /\?/.test(t) && /time|morning|afternoon|slot|open|avail|when/.test(t));
};

const createBookingFlow = () => {
  let stage = 0; // 0=name, 1=service, 2=time, 3=phone
  let data = {};

  return {
    next(userText) {
      // ── Stage 2 (time): intercept availability questions ──────────────
      // If the user asks "what times do you have?" instead of picking one,
      // offer real-sounding slots WITHOUT advancing the stage.
      if (stage === 2 && isAvailabilityQuestion(userText)) {
        return `Great question, ${data.name}! Here are our open slots this week:\n\n• Tomorrow — 9:00 AM, 10:30 AM, or 2:00 PM\n• Thursday — 8:30 AM, 11:00 AM, or 3:30 PM\n• Friday — 9:00 AM or 1:00 PM\n\nWhich of those works best for you?`;
      }

      // ── Normal stage progression ──────────────────────────────────────
      if (stage === 0) {
        data.name = userText;
        stage++;
        return `Thank you, ${data.name}! What service are you coming in for — cleaning, exam, emergency visit, or something else?`;
      }
      if (stage === 1) {
        data.service = userText;
        stage++;
        return `Got it! We have a few openings this week — tomorrow at 9:00 AM, 10:30 AM, or 2:00 PM; Thursday at 11:00 AM or 3:30 PM; and Friday at 9:00 AM or 1:00 PM. What works best for you?`;
      }
      if (stage === 2) {
        data.time = userText;
        stage++;
        return `Perfect — ${data.time} is all yours, ${data.name}. Last thing: what's the best phone number to send your confirmation to?`;
      }
      if (stage === 3) {
        data.phone = userText;
        stage++;
        const tag = `[BOOKED: ${data.name} | ${data.service} | ${data.time} | ${data.phone}]`;
        return `You're all set, ${data.name}! Your ${data.service} is confirmed for ${data.time}. A confirmation text will go to ${data.phone} in just a moment, and the appointment will sync to the office calendar automatically. Is there anything else I can help you with? ${tag}`;
      }
      return "Is there anything else I can help you with?";
    },
    isComplete: () => stage >= 4,
    getStage: () => stage,
    getPrompt: () => "Of course! I'd love to help get that scheduled. May I start with your first and last name?",
  };
};

const createLeadFlow = () => {
  let stage = 0;
  let data = {};
  return {
    next(userText) {
      if (stage === 0) { data.name = userText; stage++; return `Thanks ${data.name}! And the best phone number to reach you?`; }
      if (stage === 1) { data.phone = userText; stage++;
        const tag = `[LEAD: ${data.name} | ${data.phone}]`;
        return `Perfect! I've noted your information and someone from our team will call you back first thing in the morning. You're in great hands. Is there anything else I can help you with tonight? ${tag}`; }
      return null;
    },
    isComplete: () => stage >= 2,
  };
};

/* Response generator */
const generateResponse = (text, state, setState, bookingFlow, setBookingFlow, leadFlow, setLeadFlow) => {
  // Active booking flow
  if (bookingFlow) {
    const reply = bookingFlow.next(text);
    if (bookingFlow.isComplete()) setBookingFlow(null);
    return reply || "Is there anything else I can help you with?";
  }
  // Active lead flow
  if (leadFlow) {
    const reply = leadFlow.next(text);
    if (leadFlow.isComplete()) setLeadFlow(null);
    return reply || "Is there anything else I can help you with?";
  }

  const intent = detect(text);

  if (intent === "greet") {
    const greets = [
      `Good evening, thank you for calling ${DEMO_BUSINESS}! This is AfterHours AI, your after-hours assistant. How can I help you tonight?`,
      `Hello! Thanks for reaching out to ${DEMO_BUSINESS}. I'm here to help — what can I do for you?`,
      `Hi there! You've reached ${DEMO_BUSINESS}'s after-hours line. How can I assist you today?`,
    ];
    return greets[Math.floor(Math.random()*greets.length)];
  }

  if (intent === "book") {
    const flow = createBookingFlow();
    setBookingFlow(flow);
    return flow.getPrompt();
  }

  if (intent === "price") {
    return "Great question! Our plans start at $297 per month for the Starter plan, which covers unlimited calls for one location. Our most popular Business plan is $897 per month and includes unlimited locations, priority routing, and a dedicated success manager. Would you like me to send over our full pricing details, or would you prefer I have someone call you?";
  }

  if (intent === "hours") {
    return `${DEMO_BUSINESS} is open Monday through Friday, 8 AM to 5 PM. Saturday appointments are available by request. I'm here 24 hours a day, 7 days a week to help after hours — that's kind of my specialty! Would you like to schedule an appointment for when the office reopens?`;
  }

  if (intent === "urgent") {
    return "I can hear this is urgent, and I want to make sure you get help right away. I'm going to flag this as a priority and have the on-call doctor notified immediately. Can I get your name and phone number so we can reach you back within the next 15 minutes?";
  }

  if (intent === "callback") {
    const flow = createLeadFlow();
    setLeadFlow(flow);
    return "Absolutely, I'd be happy to arrange a callback. Can I get your name first?";
  }

  if (intent === "human") {
    return "I completely understand — sometimes you just want to speak with a person. Our team will be available when the office opens tomorrow at 8 AM. I can schedule a callback for you first thing in the morning, or if this is urgent, I can flag it for the on-call staff right now. Which would you prefer?";
  }

  if (intent === "cancel") {
    return "I can definitely help you reschedule. Could I get your name and the appointment date you're looking to change? I'll note this in the system and our front desk will confirm the new time with you first thing tomorrow morning.";
  }

  if (intent === "location") {
    return `${DEMO_BUSINESS} is located at 4821 Westfield Boulevard, Suite 200. We're in the Westfield Medical Plaza, with plenty of free parking right out front. Would you like me to text you the address and a Google Maps link?`;
  }

  if (intent === "insurance") {
    return "We accept most major insurance plans including Delta Dental, Cigna, Aetna, MetLife, and United Healthcare. We also offer flexible payment plans for those without insurance. Would you like me to schedule a quick benefits check before your appointment, or would you prefer to speak with our billing team?";
  }

  if (intent === "thanks") {
    const replies = [
      "Of course! That's exactly what I'm here for. Is there anything else I can help you with tonight?",
      "My pleasure! You're in great hands. Anything else I can do for you?",
      "Absolutely happy to help! Is there anything else on your mind?",
    ];
    return replies[Math.floor(Math.random()*replies.length)];
  }

  if (intent === "bye") {
    return "Thank you so much for calling! Have a wonderful evening, and we look forward to seeing you soon. Take care!";
  }

  // General fallback — context-aware
  const fallbacks = [
    `That's a great question! I want to make sure I get you the right answer. Can I have someone from ${DEMO_BUSINESS} call you back tomorrow morning to go over the details?`,
    `I want to give you the most accurate information — let me make sure the right person follows up with you. May I get your name and best callback number?`,
    `I appreciate you reaching out! For the best answer, I'd love to connect you with one of our team members. Would a morning callback work for you, or would you prefer to schedule an appointment directly?`,
    `Absolutely, and I want to make sure I help you correctly. Our team will have a full answer for you — can I get your contact information so they can follow up?`,
  ];
  return fallbacks[Math.floor(Math.random()*fallbacks.length)];
};

/* ─── VOICE PROFILES ─────────────────────────────────────────────
   3 branded personas available on Starter ($297).
   Pro/Business/Agency unlock unlimited custom voices.
   Each profile defines: browser voice priority list + rate/pitch.
   Key tuning notes:
     - Rate 0.78–0.86 = deliberate, natural human pace (not robotic)
     - Pitch 0.95–1.0 = warmer, lower register (less synthetic)
     - Samantha (macOS) = smoothest US female voice
     - Karen (macOS) = genuine Australian female accent
     - Fiona/Tessa = British/SA female, calm & confident
──────────────────────────────────────────────────────────────── */
const VOICE_PROFILES = [
  {
    id:      "aria",
    name:    "Aria",
    tagline: "Smooth & Warm",
    desc:    "Silky, natural tone — sounds like a real person, not a robot",
    icon:    "✨",
    color:   "#4f8ef7",
    // Rate 0.80 = deliberate, confident pace. Pitch 0.97 = lower register = warmer, less synthetic.
    rate:    0.80,
    pitch:   0.97,
    priority: [
      v => v.name === "Samantha",              // macOS — best US female, very natural
      v => v.name.includes("Samantha"),
      v => v.name === "Victoria",              // macOS secondary US female
      v => v.name.includes("Google US English Female"),
      v => /female|woman/i.test(v.name) && v.lang === "en-US",
      v => v.lang === "en-US",
      v => v.lang.startsWith("en"),
    ],
    sample: "Hey, thanks so much for calling. This is Aria — I'm your after-hours assistant and I'm here all night. What can I help you with?",
  },
  {
    id:      "zoe",
    name:    "Zoe",
    tagline: "🇦🇺 Australian",
    desc:    "Warm Aussie accent — friendly, clear & impossible to forget",
    icon:    "🌊",
    color:   "#22d3a0",
    // Karen = genuine macOS Australian female. Rate 0.86, pitch 1.0 = natural Aussie cadence.
    rate:    0.86,
    pitch:   1.0,
    priority: [
      v => v.name === "Karen",                 // macOS — genuine Australian female ✓
      v => v.lang === "en-AU",                 // any Australian voice
      v => v.name.includes("Australian"),
      v => v.name === "Moira",                 // Irish — melodic fallback
      v => v.lang === "en-IE",
      v => /female|woman/i.test(v.name) && v.lang.startsWith("en"),
      v => v.lang.startsWith("en"),
    ],
    sample: "G'day! Thanks so much for calling — you've reached our after-hours line. This is Zoe. How can I help you out tonight?",
  },
  {
    id:      "morgan",
    name:    "Morgan",
    tagline: "British & Confident",
    desc:    "Polished British tone — calm, clear & authoritative",
    icon:    "🌙",
    color:   "#a78bfa",
    // Fiona (Scottish) or Tessa (SA) = distinctly non-US accent. Rate 0.83, pitch 0.94 = calm, measured.
    rate:    0.83,
    pitch:   0.94,
    priority: [
      v => v.name === "Fiona",                 // macOS Scottish female
      v => v.name === "Tessa",                 // macOS South African female
      v => v.name === "Moira",                 // macOS Irish female
      v => v.name === "Daniel",                // macOS UK male — calm fallback
      v => v.name.includes("Google UK English"),
      v => v.lang.startsWith("en-GB"),
      v => v.lang.startsWith("en-AU"),
      v => v.lang === "en-US",
      v => v.lang.startsWith("en"),
    ],
    sample: "Good evening. Thank you for calling — this is Morgan. I'm here to make sure you're looked after. How can I help you tonight?",
  },
];

/* Resolve the best available browser voice for a given profile */
const resolveVoice = (profile) => {
  const voices = window.speechSynthesis.getVoices();
  for (const test of profile.priority) {
    const found = voices.find(test);
    if (found) return found;
  }
  return null;
};

/* ─── VOICE PICKER COMPONENT ─────────────────────────────────────── */
const VoicePicker = ({ selected, onSelect }) => {
  const [previewing, setPreviewing] = useState(null);
  const synthRef = useRef(window.speechSynthesis);

  const handlePreview = useCallback((profile, e) => {
    e.stopPropagation();
    synthRef.current.cancel();
    if (previewing === profile.id) { setPreviewing(null); return; }
    setPreviewing(profile.id);
    const voice = resolveVoice(profile);
    const utt = new SpeechSynthesisUtterance(profile.sample);
    if (voice) utt.voice = voice;
    utt.rate   = profile.rate;
    utt.pitch  = profile.pitch;
    utt.volume = 1.0;
    utt.onend  = () => setPreviewing(null);
    utt.onerror = () => setPreviewing(null);
    synthRef.current.speak(utt);
  }, [previewing]);

  // Stop any preview on unmount
  useEffect(() => () => synthRef.current.cancel(), []);

  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <div style={{ fontSize:12, fontWeight:700, color:B.sub, letterSpacing:".06em", textTransform:"uppercase" }}>
          Choose Your AI Voice
        </div>
        <div style={{ fontSize:11, color:B.muted }}>Click a card to select · ▶ to preview</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {VOICE_PROFILES.map(p => {
          const isSelected = selected.id === p.id;
          const isPlaying  = previewing === p.id;
          return (
            <div key={p.id} onClick={() => onSelect(p)} style={{
              display:"flex", alignItems:"center", gap:12, padding:"12px 14px",
              background: isSelected ? `${p.color}14` : "rgba(255,255,255,0.025)",
              border: `1.5px solid ${isSelected ? p.color + "55" : B.borderCard}`,
              borderRadius:12, cursor:"pointer",
              transition:"border-color .2s, background .2s",
              boxShadow: isSelected ? `0 0 16px ${p.color}22` : "none",
            }}>
              {/* Icon */}
              <div style={{ width:40, height:40, borderRadius:11, flexShrink:0,
                background:`${p.color}18`, border:`1.5px solid ${p.color}30`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                {p.icon}
              </div>

              {/* Info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:2 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:B.white }}>{p.name}</span>
                  <span style={{ fontSize:11, fontWeight:600, color:p.color,
                    background:`${p.color}18`, padding:"2px 9px", borderRadius:100 }}>
                    {p.tagline}
                  </span>
                </div>
                <div style={{ fontSize:12, color:B.sub, lineHeight:1.4 }}>{p.desc}</div>
              </div>

              {/* Actions */}
              <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                <button onClick={e => handlePreview(p, e)} style={{
                  background: isPlaying ? `${p.color}25` : "rgba(255,255,255,0.05)",
                  border: `1px solid ${isPlaying ? p.color + "55" : B.borderSoft}`,
                  borderRadius:8, padding:"5px 11px", color: isPlaying ? p.color : B.sub,
                  fontSize:12, fontWeight:700, cursor:"pointer",
                  display:"flex", alignItems:"center", gap:5, transition:"all .2s",
                }}>
                  {isPlaying
                    ? <><Wave color={p.color} size={13}/> <span>Playing</span></>
                    : <span>▶ Preview</span>
                  }
                </button>
                <div style={{ width:20, height:20, flexShrink:0,
                  opacity: isSelected ? 1 : 0, transition:"opacity .2s" }}>
                  <CheckIcon color={p.color} size={20}/>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── ELEVENLABS CONFIG ──────────────────────────────────────────── */
// Voice ID from https://elevenlabs.io/app/voice-library?voiceId=uIZsnBL0YK1S5j69bAih
const ELABS_VOICE_ID = "uIZsnBL0YK1S5j69bAih";
const ELABS_MODEL    = "eleven_turbo_v2_5";   // fast + high quality

/* ─── VOICE ENGINE ───────────────────────────────────────────────── */
const useVoice = (voiceProfile, elevenLabsKey) => {
  const synthRef    = useRef(window.speechSynthesis);
  const voiceRef    = useRef(null);
  const profileRef  = useRef(voiceProfile || VOICE_PROFILES[0]);
  const elabsKeyRef = useRef(elevenLabsKey || "");
  const audioRef    = useRef(null);   // current ElevenLabs <audio> element
  const [voicesReady, setVoicesReady] = useState(false);

  useEffect(() => { profileRef.current = voiceProfile || VOICE_PROFILES[0]; }, [voiceProfile]);
  useEffect(() => { elabsKeyRef.current = elevenLabsKey || ""; }, [elevenLabsKey]);

  const resolveAndStore = useCallback(() => {
    const profile = profileRef.current;
    const voices  = synthRef.current.getVoices();
    if (!voices.length) return;
    voiceRef.current = null;
    for (const test of profile.priority) {
      const found = voices.find(test);
      if (found) { voiceRef.current = found; break; }
    }
    setVoicesReady(true);
  }, []);

  useEffect(() => {
    synthRef.current.addEventListener("voiceschanged", resolveAndStore);
    resolveAndStore();
    return () => synthRef.current.removeEventListener("voiceschanged", resolveAndStore);
  }, [resolveAndStore]);

  useEffect(() => { resolveAndStore(); }, [voiceProfile, resolveAndStore]);

  /* Web Speech fallback */
  const speakBrowser = useCallback((clean, onDone) => {
    synthRef.current.cancel();
    const utt = new SpeechSynthesisUtterance(clean);
    if (voiceRef.current) utt.voice = voiceRef.current;
    const p = profileRef.current;
    utt.rate = p.rate; utt.pitch = p.pitch; utt.volume = 1.0;
    utt.onend  = () => onDone && onDone();
    utt.onerror = () => onDone && onDone();
    synthRef.current.speak(utt);
  }, []);

  const speak = useCallback((text, onDone) => {
    /* Stop any current playback */
    synthRef.current.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }

    const clean = text.replace(/\[.*?\]/g, "").replace(/[*_~`]/g, "").trim();
    const key   = elabsKeyRef.current.trim();

    if (key) {
      /* ── ElevenLabs path ── */
      fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELABS_VOICE_ID}`, {
        method: "POST",
        headers: {
          "Accept":       "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key":   key,
        },
        body: JSON.stringify({
          text,
          model_id: ELABS_MODEL,
          voice_settings: {
            stability:        0.45,
            similarity_boost: 0.85,
            style:            0.30,
            use_speaker_boost: true,
          },
        }),
      })
      .then(res => {
        if (!res.ok) throw new Error(`ElevenLabs ${res.status}`);
        return res.blob();
      })
      .then(blob => {
        const url   = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => { URL.revokeObjectURL(url); audioRef.current = null; onDone && onDone(); };
        audio.onerror = () => { URL.revokeObjectURL(url); audioRef.current = null; onDone && onDone(); };
        audio.play();
      })
      .catch(err => {
        console.warn("ElevenLabs failed, falling back to Web Speech:", err);
        speakBrowser(clean, onDone);
      });
      return;
    }

    /* ── Web Speech path ── */
    speakBrowser(clean, onDone);
  }, [speakBrowser]);

  const stop = useCallback(() => {
    synthRef.current.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
  }, []);

  return { speak, stop, voicesReady };
};

/* ─── MIC / SPEECH RECOGNITION ──────────────────────────────────── */
const useSpeechRecognition = (onResult) => {
  const recogRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const onResultRef = useRef(onResult);
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);

  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError("Speech recognition not supported in this browser."); return; }
    const r = new SR();
    r.lang = "en-US";
    r.interimResults = false;
    r.maxAlternatives = 3;
    r.continuous = false;
    r.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setListening(false);
      onResultRef.current(t);
    };
    r.onerror = (e) => {
      setListening(false);
      if (e.error !== "no-speech") setError("Microphone error: " + e.error);
    };
    r.onend = () => setListening(false);
    recogRef.current = r;
    setListening(true);
    setError(null);
    r.start();
  }, []);

  const stop = useCallback(() => {
    if (recogRef.current) { recogRef.current.stop(); recogRef.current = null; }
    setListening(false);
  }, []);

  return { listening, error, start, stop };
};

/* ─── BOOKING PLATFORMS ──────────────────────────────────────────── */
// The most widely used scheduling / booking systems by industry.
// In production, AfterHours AI syncs directly with these via webhooks.
const BOOKING_PLATFORMS = [
  { name:"Calendly",          icon:"📅", color:"#006BFF", desc:"Universal scheduling",         popular:true  },
  { name:"NexHealth",         icon:"🦷", color:"#00C2A8", desc:"Dental & medical",             popular:true  },
  { name:"Acuity",            icon:"📆", color:"#7B5CF0", desc:"Service businesses",           popular:false },
  { name:"Google Calendar",   icon:"📅", color:"#4285F4", desc:"Universal sync",               popular:false },
  { name:"Square Appts",      icon:"⬛", color:"#3D3D3D", desc:"Retail & services",            popular:false },
  { name:"Mindbody",          icon:"💪", color:"#FF6B35", desc:"Fitness & wellness",           popular:false },
  { name:"Zocdoc",            icon:"⚕️", color:"#00A4BD", desc:"Healthcare",                   popular:false },
  { name:"Jane App",          icon:"🩺", color:"#0EA5E9", desc:"Allied health",                popular:false },
  { name:"OpenTable",         icon:"🍽️", color:"#DA3743", desc:"Restaurants",                 popular:false },
  { name:"Booksy",            icon:"✂️", color:"#AC5DD9", desc:"Beauty & personal care",      popular:false },
];

/* ─── BOOKING CONFIRMATION CARD ──────────────────────────────────── */
// Renders inside the chat after a [BOOKED:] tag is detected.
// Shows appointment details + simulated calendar sync.
const BookingCard = ({ bookingText, platform }) => {
  // Parse [BOOKED: name | service | time | phone]
  const match = bookingText.match(/\[BOOKED:\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^\]]+)\]/);
  const [, name, service, time, phone] = match || [];
  if (!name) return null;

  const p = platform || BOOKING_PLATFORMS[0];

  return (
    <div style={{
      background:"rgba(6,20,40,0.97)", border:`1px solid ${B.green}33`,
      borderRadius:14, padding:"16px 18px", marginTop:4,
      boxShadow:`0 0 24px ${B.greenGlow}`,
      animation:"fadeUp .4s ease",
    }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
        <div style={{ width:32, height:32, borderRadius:9, background:gradGreen,
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <svg width={17} height={17} viewBox="0 0 24 24" fill="white">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
          </svg>
        </div>
        <div>
          <div style={{ fontSize:12, fontWeight:800, color:B.green, letterSpacing:".06em", textTransform:"uppercase" }}>
            Appointment Confirmed
          </div>
          <div style={{ fontSize:11, color:B.sub }}>Syncing to calendar…</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5,
          background:B.greenDim, border:`1px solid ${B.green}30`, borderRadius:8, padding:"3px 10px", flexShrink:0 }}>
          <Pulse color={B.green} size={7}/>
          <span style={{ fontSize:11, fontWeight:700, color:B.green }}>Live</span>
        </div>
      </div>

      {/* Details grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
        {[
          { label:"Patient",  value: name.trim(),    icon:"👤" },
          { label:"Service",  value: service.trim(), icon:"🦷" },
          { label:"Time",     value: time.trim(),    icon:"🕐" },
          { label:"Confirm",  value: phone.trim(),   icon:"📱" },
        ].map(r => (
          <div key={r.label} style={{ background:"rgba(255,255,255,0.03)", borderRadius:9,
            padding:"9px 12px", border:`1px solid rgba(255,255,255,0.05)` }}>
            <div style={{ fontSize:10, color:B.muted, letterSpacing:".06em", textTransform:"uppercase", marginBottom:3 }}>
              {r.icon} {r.label}
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:B.white, lineHeight:1.3 }}>{r.value}</div>
          </div>
        ))}
      </div>

      {/* Integration badge */}
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px",
        background:"rgba(255,255,255,0.025)", borderRadius:9, border:`1px solid rgba(255,255,255,0.06)` }}>
        <div style={{ width:22, height:22, borderRadius:6, background:`${p.color}22`,
          border:`1px solid ${p.color}44`, display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:12, flexShrink:0 }}>{p.icon}</div>
        <div style={{ fontSize:12, color:B.sub }}>
          Synced to <span style={{ color:B.white, fontWeight:700 }}>{p.name}</span>
          <span style={{ color:B.muted }}> · {p.desc}</span>
        </div>
        <CheckIcon size={14} color={B.green} style={{ marginLeft:"auto", flexShrink:0 }}/>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   TRIAL SCREENS
   ─────────────────────────────────────────────────────────────────── */

/* ─── BRIEFING SCREEN ────────────────────────────────────────────── */
const BriefingScreen = ({ onStart, onBack, selectedVoice, setSelectedVoice, elevenLabsKey, setElevenLabsKey }) => (
  <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
    padding:24, position:"relative", zIndex:2 }}>
    <TiltCard style={{ maxWidth:580, width:"100%" }}>
      <div style={{ background:"rgba(6,14,28,0.95)", border:`1px solid ${B.border}`,
        borderRadius:20, padding:"48px 40px", backdropFilter:"blur(20px)" }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
            width:72, height:72, borderRadius:20, background:gradAurora, marginBottom:20,
            boxShadow:`0 8px 32px ${B.violetGlow}` }}>
            <svg width={34} height={34} viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="white"/>
            </svg>
          </div>
          <h2 style={{ fontSize:28, fontWeight:800, color:B.white, marginBottom:10 }}>
            Live Call Demo
          </h2>
          <p style={{ color:B.sub, lineHeight:1.65, fontSize:15 }}>
            You're about to experience AfterHours AI in action. Our AI will answer as if it's handling
            real after-hours calls for a dental office — booking appointments, answering questions, and
            capturing leads automatically.
          </p>
        </div>

        <div style={{ background:B.blueFaint, border:`1px solid ${B.border}`, borderRadius:14,
          padding:"20px 24px", marginBottom:28 }}>
          <div style={{ fontSize:13, fontWeight:700, color:B.blue, letterSpacing:".08em",
            textTransform:"uppercase", marginBottom:14 }}>What to try</div>
          {[
            "\"I'd like to book an appointment\"",
            "\"What are your office hours?\"",
            "\"I have a dental emergency\"",
            "\"Can someone call me back tomorrow?\"",
          ].map((s,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10,
              fontSize:14, color:B.text }}>
              <CheckIcon size={16}/> {s}
            </div>
          ))}
        </div>

        {/* Voice picker */}
        <VoicePicker selected={selectedVoice} onSelect={setSelectedVoice}/>

        {/* Integrations strip */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:11, fontWeight:700, color:B.muted, letterSpacing:".08em",
            textTransform:"uppercase", marginBottom:10, textAlign:"center" }}>
            Syncs with your booking system
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" }}>
            {BOOKING_PLATFORMS.slice(0,6).map(p => (
              <div key={p.name} style={{
                display:"flex", alignItems:"center", gap:6,
                background:`${p.color}12`, border:`1px solid ${p.color}28`,
                borderRadius:8, padding:"5px 12px",
              }}>
                <span style={{ fontSize:13 }}>{p.icon}</span>
                <span style={{ fontSize:12, fontWeight:600, color:B.sub }}>{p.name}</span>
              </div>
            ))}
            <div style={{ display:"flex", alignItems:"center", gap:4, padding:"5px 12px",
              background:"rgba(255,255,255,0.03)", border:`1px solid ${B.borderSoft}`,
              borderRadius:8, fontSize:12, color:B.muted }}>
              +40 more
            </div>
          </div>
        </div>

        {/* ElevenLabs key input */}
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
            <div style={{ fontSize:11, fontWeight:700, color:B.muted, letterSpacing:".08em", textTransform:"uppercase" }}>
              🎙️ ElevenLabs Voice
            </div>
            <div style={{ fontSize:10, color:B.muted, background:"rgba(255,255,255,0.04)",
              border:`1px solid ${B.borderSoft}`, borderRadius:6, padding:"2px 7px" }}>
              Optional — ultra-realistic
            </div>
          </div>
          <div style={{ position:"relative" }}>
            <input
              type="password"
              autoComplete="off"
              placeholder="Paste your ElevenLabs API key here…"
              value={elevenLabsKey}
              onChange={e => setElevenLabsKey(e.target.value)}
              style={{
                width:"100%", padding:"11px 44px 11px 14px",
                background: elevenLabsKey ? "rgba(34,211,160,0.06)" : "rgba(255,255,255,0.03)",
                border:`1.5px solid ${elevenLabsKey ? B.green : B.borderSoft}`,
                borderRadius:10, color:B.text, fontSize:13, outline:"none",
                transition:"border-color .2s, background .2s", fontFamily:"inherit",
              }}
            />
            {elevenLabsKey && (
              <div style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                fontSize:11, fontWeight:700, color:B.green, display:"flex", alignItems:"center", gap:4 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:B.green,
                  display:"inline-block", animation:"pulse 1.6s ease-in-out infinite" }}/>
                Active
              </div>
            )}
          </div>
          {elevenLabsKey
            ? <div style={{ fontSize:11, color:B.green, marginTop:5, display:"flex", alignItems:"center", gap:5 }}>
                ✓ Voice ID: uIZsnBL0YK1S5j69bAih · Overrides voice picker above
              </div>
            : <div style={{ fontSize:11, color:B.muted, marginTop:5 }}>
                Get your free key at{" "}
                <a href="https://elevenlabs.io" target="_blank" rel="noopener"
                  style={{ color:B.blue, textDecoration:"none" }}>elevenlabs.io</a>
                {" "}· Leave blank to use browser voice
              </div>
          }
        </div>

        <div style={{ display:"flex", gap:12, flexDirection:"column" }}>
          <Btn onClick={onStart} variant="aurora" size="lg" style={{ justifyContent:"center" }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="white">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
            </svg>
            {elevenLabsKey ? "Start Demo — ElevenLabs Voice 🎙️" : "Start Live Demo Call"}
          </Btn>
          <Btn onClick={onBack} variant="ghost" style={{ justifyContent:"center" }}>← Back to Site</Btn>
        </div>
      </div>
    </TiltCard>
  </div>
);

/* ─── LIVE CALL SCREEN ────────────────────────────────────────────── */
const LiveCallScreen = ({ onEnd, voiceProfile, elevenLabsKey }) => {
  const [messages, setMessages] = useState([]);
  const [phase, setPhase]  = useState("idle"); // idle | listening | thinking | speaking
  const [transcript, setTranscript] = useState("");
  const [inputMode, setInputMode] = useState("voice"); // voice | text
  const [textInput, setTextInput] = useState("");
  const [bookingFlow, setBookingFlow] = useState(null);
  const [leadFlow, setLeadFlow] = useState(null);
  const [callTime, setCallTime] = useState(0);
  const scrollRef = useRef(null);
  const { speak, stop } = useVoice(voiceProfile, elevenLabsKey);

  // Call timer
  useEffect(() => {
    const t = setInterval(() => setCallTime(p => p+1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Greet on mount
  useEffect(() => {
    const greeting = `Thank you for calling ${DEMO_BUSINESS}! This is AfterHours AI, your after-hours assistant. I'm here 24 hours a day to help with appointments, questions, and anything else you need. How can I help you tonight?`;
    setPhase("speaking");
    setTimeout(() => {
      setMessages([{ role:"ai", text:greeting }]);
      speak(greeting, () => setPhase("idle"));
    }, 600);
  }, []);

  const handleUserInput = useCallback((text) => {
    if (!text.trim()) return;
    stop();
    setMessages(p => [...p, { role:"user", text }]);
    setTranscript("");
    setTextInput("");
    setPhase("thinking");

    setTimeout(() => {
      const reply = generateResponse(text, null, null, bookingFlow, setBookingFlow, leadFlow, setLeadFlow);
      setMessages(p => [...p, { role:"ai", text:reply }]);
      setPhase("speaking");
      speak(reply, () => setPhase("idle"));
    }, 700 + Math.random()*400);
  }, [bookingFlow, leadFlow, speak, stop]);

  const { listening, error: micError, start: startListening, stop: stopListening } =
    useSpeechRecognition(handleUserInput);

  useEffect(() => {
    if (listening) setPhase("listening");
    else if (phase === "listening") setPhase("idle");
  }, [listening]);

  const handleMicClick = () => {
    if (listening) { stopListening(); return; }
    if (phase === "speaking") { stop(); setPhase("idle"); return; }
    if (phase === "idle") startListening();
  };

  const handleTextSend = () => {
    if (textInput.trim()) handleUserInput(textInput.trim());
  };

  const statusLabel = { idle:"Tap mic to speak", listening:"Listening…", thinking:"Thinking…", speaking:"Speaking…" };
  const statusColor = { idle:B.sub, listening:B.green, thinking:B.amber, speaking:B.blue };
  const phaseColor  = statusColor[phase] || B.sub;

  const hasBooking = messages.some(m => m.text.includes("[BOOKED:"));
  const hasLead    = messages.some(m => m.text.includes("[LEAD:"));
  const bookingMsg = messages.find(m => m.text.includes("[BOOKED:"));
  // Pick a random demo booking platform once per session
  const demoPlatform = useMemo(() => BOOKING_PLATFORMS[Math.floor(Math.random() * 4)], []);

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", padding:24, position:"relative", zIndex:2 }}>
      <div style={{ width:"100%", maxWidth:640 }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          background:"rgba(6,14,28,0.95)", border:`1px solid ${B.border}`, borderRadius:"16px 16px 0 0",
          padding:"16px 24px", backdropFilter:"blur(20px)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <Pulse color={B.green} size={10}/>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:B.white }}>AfterHours AI — Live Demo</div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2 }}>
                <span style={{ fontSize:12, color:B.sub }}>{DEMO_BUSINESS}</span>
                {voiceProfile && (
                  <span style={{ fontSize:11, fontWeight:600, color:voiceProfile.color,
                    background:`${voiceProfile.color}15`, border:`1px solid ${voiceProfile.color}30`,
                    padding:"1px 7px", borderRadius:100 }}>
                    {voiceProfile.icon} {voiceProfile.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            {(hasBooking || hasLead) && (
              <div style={{ display:"flex", alignItems:"center", gap:6, background:B.greenDim,
                border:`1px solid ${B.green}33`, borderRadius:8, padding:"4px 12px" }}>
                <CheckIcon size={14} color={B.green}/>
                <span style={{ fontSize:12, fontWeight:700, color:B.green }}>
                  {hasBooking ? "Booked!" : "Lead Captured!"}
                </span>
              </div>
            )}
            <div style={{ fontVariantNumeric:"tabular-nums", fontSize:13, fontWeight:600,
              color:B.sub, fontFamily:"monospace" }}>{formatTime(callTime)}</div>
            <button onClick={() => { stop(); onEnd(); }}
              style={{ background:B.redDim, border:`1px solid ${B.red}33`, borderRadius:8,
                padding:"6px 14px", color:B.red, fontSize:13, fontWeight:700, cursor:"pointer" }}>
              End Call
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ background:"rgba(4,10,20,0.97)", border:`1px solid ${B.border}`,
          borderTop:"none", borderBottom:"none", height:340, overflowY:"auto", padding:"20px 24px",
          display:"flex", flexDirection:"column", gap:14, backdropFilter:"blur(20px)" }}>
          {messages.map((m,i) => (
            <div key={i}>
              <div style={{ display:"flex", justifyContent: m.role==="user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth:"78%", padding:"12px 16px",
                  borderRadius: m.role==="user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                  background: m.role==="user" ? gradBlue : "rgba(12,24,44,0.95)",
                  border: m.role==="ai" ? `1px solid ${B.border}` : "none",
                  fontSize:14, lineHeight:1.6, color:B.white, whiteSpace:"pre-line",
                  boxShadow: m.role==="user" ? `0 4px 20px ${B.blueGlow}` : "0 2px 12px rgba(0,0,0,0.3)",
                }}>
                  {m.text.replace(/\[.*?\]/g,"")}
                </div>
              </div>
              {/* Booking confirmation card — renders directly after the [BOOKED:] message */}
              {m.text.includes("[BOOKED:") && (
                <BookingCard bookingText={m.text} platform={demoPlatform}/>
              )}
            </div>
          ))}
          {phase === "thinking" && (
            <div style={{ display:"flex", gap:6, padding:"12px 16px",
              background:"rgba(12,24,44,0.95)", border:`1px solid ${B.border}`,
              borderRadius:"4px 16px 16px 16px", width:"fit-content" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:B.blue,
                  animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite` }}/>
              ))}
            </div>
          )}
          {phase === "listening" && transcript && (
            <div style={{ color:B.sub, fontSize:13, fontStyle:"italic", textAlign:"right" }}>
              "{transcript}"
            </div>
          )}
        </div>

        {/* Status bar */}
        <div style={{ background:"rgba(6,12,24,0.98)", border:`1px solid ${B.border}`,
          borderTop:"none", borderBottom:"none", padding:"10px 24px",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {phase === "speaking" && <Wave color={phaseColor} size={18}/>}
            {phase === "listening" && <Wave color={B.green} size={18}/>}
            {(phase === "idle" || phase === "thinking") && (
              <div style={{ width:8, height:8, borderRadius:"50%", background:phaseColor,
                animation: phase==="thinking" ? "pulseFast 0.8s ease-in-out infinite" : "none" }}/>
            )}
            <span style={{ fontSize:12, color:phaseColor, fontWeight:600 }}>{statusLabel[phase]}</span>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => setInputMode(m => m==="voice"?"text":"voice")}
              style={{ background:B.blueDim, border:`1px solid ${B.border}`, borderRadius:8,
                padding:"5px 12px", color:B.blue, fontSize:12, fontWeight:600, cursor:"pointer" }}>
              {inputMode === "voice" ? "⌨️ Type" : "🎤 Voice"}
            </button>
          </div>
        </div>

        {/* Input area */}
        <div style={{ background:"rgba(6,14,28,0.98)", border:`1px solid ${B.border}`,
          borderTop:"none", borderRadius:"0 0 16px 16px", padding:"20px 24px",
          backdropFilter:"blur(20px)" }}>
          {inputMode === "voice" ? (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
              {micError && (
                <div style={{ color:B.amber, fontSize:13, textAlign:"center", marginBottom:4 }}>
                  ⚠️ {micError} — try typing instead
                </div>
              )}
              <button onClick={handleMicClick}
                style={{
                  width:72, height:72, borderRadius:"50%", border:"none", cursor:"pointer",
                  background: listening ? gradGreen : phase==="speaking" ? `rgba(79,142,247,0.2)` : gradBlue,
                  boxShadow: listening ? `0 0 0 8px ${B.greenDim}, 0 8px 32px ${B.greenGlow}` : `0 0 0 4px ${B.blueDim}, 0 8px 24px ${B.blueGlow}`,
                  transition:"all .3s ease", display:"flex", alignItems:"center", justifyContent:"center",
                  animation: listening ? "pulse 1.5s ease-in-out infinite" : "none",
                }}>
                <svg width={28} height={28} viewBox="0 0 24 24" fill="white">
                  {listening
                    ? <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    : <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>}
                </svg>
              </button>
              <p style={{ fontSize:13, color:B.sub, textAlign:"center" }}>
                {listening ? "Listening… tap again to stop" : phase==="speaking" ? "Tap to interrupt" : "Tap to speak"}
              </p>
            </div>
          ) : (
            <div style={{ display:"flex", gap:10 }}>
              <input
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => e.key==="Enter" && handleTextSend()}
                placeholder="Type your message…"
                style={{ flex:1, background:B.blueFaint, border:`1px solid ${B.border}`,
                  borderRadius:10, padding:"12px 16px", color:B.white, fontSize:14,
                  outline:"none", fontFamily:"inherit" }}/>
              <Btn onClick={handleTextSend} variant="primary" disabled={!textInput.trim()}>Send</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── SUMMARY SCREEN ─────────────────────────────────────────────── */
const SummaryScreen = ({ onRestart, onBack }) => (
  <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
    padding:24, position:"relative", zIndex:2 }}>
    <TiltCard style={{ maxWidth:560, width:"100%" }}>
      <div style={{ background:"rgba(6,14,28,0.95)", border:`1px solid ${B.greenGlow}`,
        borderRadius:20, padding:"48px 40px", backdropFilter:"blur(20px)",
        boxShadow:`0 0 60px ${B.greenGlow}` }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
            width:72, height:72, borderRadius:"50%", background:gradGreen, marginBottom:20,
            boxShadow:`0 8px 32px ${B.greenGlow}` }}>
            <svg width={34} height={34} viewBox="0 0 24 24" fill="white">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </div>
          <h2 style={{ fontSize:30, fontWeight:800, color:B.white, marginBottom:10 }}>
            That's AfterHours AI.
          </h2>
          <p style={{ color:B.sub, lineHeight:1.7, fontSize:15, marginBottom:32 }}>
            Every missed call is a missed opportunity. AfterHours AI just handled that entire interaction
            — appointment booked, lead captured, customer delighted — with zero staff, zero cost, at 2 AM.
          </p>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:32 }}>
            {[
              { label:"Response time", value:"< 1 sec" },
              { label:"Available", value:"24 / 7 / 365" },
              { label:"Cost per call", value:"$0" },
            ].map(s => (
              <div key={s.label} style={{ background:B.greenDim, border:`1px solid ${B.green}22`,
                borderRadius:12, padding:"16px 12px", textAlign:"center" }}>
                <div style={{ fontSize:22, fontWeight:800, color:B.green }}>{s.value}</div>
                <div style={{ fontSize:11, color:B.sub, marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:12, flexDirection:"column" }}>
            <Btn onClick={onBack} variant="green" size="lg" style={{ justifyContent:"center" }}>
              See Pricing → Get Started
            </Btn>
            <Btn onClick={onRestart} variant="ghost" style={{ justifyContent:"center" }}>
              Try Another Call
            </Btn>
          </div>
        </div>
      </div>
    </TiltCard>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   LANDING PAGE SECTIONS
   ─────────────────────────────────────────────────────────────────── */

/* ─── NAVBAR ─────────────────────────────────────────────────────── */
const Navbar = ({ onTrial }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive:true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      padding:"0 28px", height:66,
      background: scrolled ? "rgba(2,11,20,0.96)" : "transparent",
      backdropFilter: scrolled ? "blur(24px)" : "none",
      borderBottom: scrolled ? `1px solid ${B.border}` : "none",
      transition:"all .3s ease",
      display:"flex", alignItems:"center", justifyContent:"space-between",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:34, height:34, borderRadius:10, background:gradAurora,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:`0 4px 16px ${B.violetGlow}` }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2zm0-2h2V7h-2z"/>
          </svg>
        </div>
        <span style={{ fontSize:18, fontWeight:800, color:B.white, letterSpacing:"-.02em" }}>
          AfterHours<span style={{ color:B.blue }}>.AI</span>
        </span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        {["Features","Pricing","Compare"].map(l => (
          <a key={l} href={`#${l.toLowerCase()}`}
            style={{ color:B.sub, fontSize:14, fontWeight:500, textDecoration:"none",
              padding:"6px 12px", borderRadius:8, transition:"color .2s",
              cursor:"pointer" }}
            onMouseEnter={e => e.target.style.color=B.white}
            onMouseLeave={e => e.target.style.color=B.sub}>{l}</a>
        ))}
        <Btn onClick={onTrial} variant="primary" size="sm" style={{ marginLeft:8 }}>
          Try Free Demo
        </Btn>
      </div>
    </nav>
  );
};

/* ─── HERO SECTION ───────────────────────────────────────────────── */
const HeroSection = ({ onTrial }) => {
  const [wordIdx, setWordIdx] = useState(0);
  const words = ["Revenue.", "Bookings.", "Leads.", "Customers."];
  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i+1) % words.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{ minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", textAlign:"center",
      padding:"120px 24px 80px", position:"relative", zIndex:2 }}>

      {/* Floating stat orbs */}
      <div style={{ position:"absolute", top:"22%", left:"6%",
        animation:"float1 6s ease-in-out infinite", display:"none" }} className="float-stat">
        <div style={{ background:"rgba(6,14,28,0.9)", border:`1px solid ${B.green}33`,
          borderRadius:14, padding:"12px 18px", backdropFilter:"blur(16px)",
          boxShadow:`0 4px 24px rgba(0,0,0,0.4)` }}>
          <div style={{ fontSize:22, fontWeight:800, color:B.green }}>$2.4M</div>
          <div style={{ fontSize:11, color:B.sub }}>Revenue recovered</div>
        </div>
      </div>

      <Badge color={B.cyan} style={{ marginBottom:28 }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:B.cyan,
          display:"inline-block", animation:"pulse 1.6s ease-in-out infinite" }}/>
        Live 24/7 AI Receptionist
      </Badge>

      <h1 style={{ fontSize:"clamp(42px,7vw,88px)", fontWeight:900, lineHeight:1.05,
        letterSpacing:"-.04em", color:B.white, maxWidth:900, marginBottom:0 }}>
        Never Lose Another
        <br/>
        <ShimmerText style={{ fontSize:"clamp(42px,7vw,88px)", fontWeight:900, lineHeight:1.05 }}>
          <span key={wordIdx} style={{ display:"inline-block", animation:"fadeIn .4s ease" }}>
            {words[wordIdx]}
          </span>
        </ShimmerText>
      </h1>

      <p style={{ fontSize:"clamp(17px,2.2vw,22px)", color:B.sub, maxWidth:640,
        lineHeight:1.7, margin:"28px auto 44px" }}>
        AfterHours AI answers every call, books appointments, and captures leads —
        at <strong style={{ color:B.blueLight }}>2 AM on Christmas morning</strong>.
        While your competitors sleep, you grow.
      </p>

      <div style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center", marginBottom:60 }}>
        <Btn onClick={onTrial} variant="aurora" size="lg">
          <svg width={20} height={20} viewBox="0 0 24 24" fill="white">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
          </svg>
          Hear It Live — Free Demo
        </Btn>
        <Btn variant="outline" size="lg"
          onClick={() => document.getElementById("pricing")?.scrollIntoView({behavior:"smooth"})}>
          View Pricing
        </Btn>
      </div>

      {/* Stats strip */}
      <div style={{ display:"flex", gap:0, flexWrap:"wrap", justifyContent:"center",
        background:"rgba(6,14,28,0.7)", border:`1px solid ${B.border}`,
        borderRadius:20, backdropFilter:"blur(20px)", overflow:"hidden", maxWidth:800, width:"100%" }}>
        {[
          { n:97, s:"%", label:"Calls answered first ring", color:B.green },
          { n:2400, s:"+", label:"Businesses protected", color:B.blue },
          { n:4.2, s:"M+", label:"Leads captured to date", prefix:"$", color:B.violet },
          { n:99.9, s:"%", label:"Uptime guarantee", color:B.cyan },
        ].map((s,i) => (
          <div key={i} style={{ flex:"1 1 160px", padding:"28px 24px", textAlign:"center",
            borderRight: i<3 ? `1px solid ${B.border}` : "none" }}>
            <div style={{ fontSize:32, fontWeight:900, color:s.color, letterSpacing:"-.02em" }}>
              <CountUp end={s.n} prefix={s.prefix||""} suffix={s.s}/>
            </div>
            <div style={{ fontSize:12.5, color:B.sub, marginTop:6, lineHeight:1.4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ─── HOW IT WORKS ───────────────────────────────────────────────── */
const HowItWorks = () => {
  const steps = [
    { icon:"📞", title:"Call Comes In After Hours", desc:"Patient or client calls your number at any time — midnight, 3 AM, holidays. No voicemail. No missed opportunity.", color:B.blue },
    { icon:"🧠", title:"AI Answers Instantly", desc:"AfterHours AI picks up in under 1 second. It introduces itself, understands the caller, and handles the conversation naturally.", color:B.violet },
    { icon:"📅", title:"Books, Captures & Routes", desc:"Appointments are scheduled directly on your calendar. Leads are captured. Urgent cases are escalated immediately via text.", color:B.cyan },
    { icon:"💰", title:"You Wake Up to Revenue", desc:"Check your dashboard each morning to see every call handled, every booking made, every lead saved — while you slept.", color:B.green },
  ];
  return (
    <Section id="features" style={{ paddingTop:80 }}>
      <div style={{ textAlign:"center", marginBottom:64 }}>
        <Badge color={B.violet} style={{ marginBottom:16 }}>How It Works</Badge>
        <h2 style={{ fontSize:"clamp(32px,5vw,54px)", fontWeight:900, color:B.white, letterSpacing:"-.03em", marginBottom:16 }}>
          Set up in 10 minutes.<br/>
          <ShimmerText>Works forever.</ShimmerText>
        </h2>
        <p style={{ color:B.sub, fontSize:17, maxWidth:540, margin:"0 auto" }}>
          No complex integrations. No training period. Just install and your AI receptionist is live.
        </p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:24 }}>
        {steps.map((s,i) => (
          <TiltCard key={i}>
            <div style={{ background:B.card, border:`1px solid ${B.borderCard}`,
              borderRadius:18, padding:"32px 28px", backdropFilter:"blur(16px)",
              height:"100%", transition:"border-color .3s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor=`${s.color}33`}
              onMouseLeave={e => e.currentTarget.style.borderColor=B.borderCard}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
                <div style={{ width:52, height:52, borderRadius:14, fontSize:26,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  background:`${s.color}15`, border:`1px solid ${s.color}25` }}>{s.icon}</div>
                <div style={{ width:28, height:28, borderRadius:"50%", background:s.color,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:13, fontWeight:900, color:B.void, flexShrink:0 }}>{i+1}</div>
              </div>
              <h3 style={{ fontSize:18, fontWeight:800, color:B.white, marginBottom:10, lineHeight:1.3 }}>
                {s.title}
              </h3>
              <p style={{ color:B.sub, fontSize:14, lineHeight:1.65 }}>{s.desc}</p>
            </div>
          </TiltCard>
        ))}
      </div>
    </Section>
  );
};

/* ─── ROI SECTION ────────────────────────────────────────────────── */
const ROISection = () => (
  <Section style={{ paddingTop:40, paddingBottom:60 }}>
    <div style={{ background:`linear-gradient(135deg, rgba(79,142,247,0.08), rgba(167,139,250,0.08))`,
      border:`1px solid ${B.border}`, borderRadius:24, padding:"60px 48px",
      backdropFilter:"blur(20px)", textAlign:"center", position:"relative", overflow:"hidden" }}>
      {/* Glow orb inside card */}
      <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translateX(-50%)",
        width:500, height:300, borderRadius:"50%",
        background:`radial-gradient(ellipse, ${B.blueGlow} 0%, transparent 70%)`,
        pointerEvents:"none", filter:"blur(40px)" }}/>
      <div style={{ position:"relative", zIndex:1 }}>
        <Badge color={B.amber} style={{ marginBottom:20 }}>💰 The Real Math</Badge>
        <h2 style={{ fontSize:"clamp(28px,4.5vw,50px)", fontWeight:900, color:B.white,
          letterSpacing:"-.03em", marginBottom:16 }}>
          One missed call pays for<br/>
          <ShimmerText>a full year of AfterHours AI</ShimmerText>
        </h2>
        <p style={{ color:B.sub, fontSize:16, maxWidth:560, margin:"0 auto 40px", lineHeight:1.7 }}>
          The average dental practice misses 35% of after-hours calls. Each booked appointment is worth
          $350–$2,400. Our AI pays for itself before lunch on day one.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",
          gap:20, maxWidth:800, margin:"0 auto" }}>
          {[
            { label:"Avg value per booked call", value:"$850", color:B.green, icon:"📞" },
            { label:"Calls recovered per month", value:"28+", color:B.blue, icon:"🔁" },
            { label:"Monthly revenue recovered", value:"$23,800", color:B.violet, icon:"💎" },
            { label:"Your investment (Pro plan)", value:"$497/mo", color:B.amber, icon:"✅" },
          ].map(s => (
            <div key={s.label} style={{ background:"rgba(6,14,28,0.8)", border:`1px solid ${s.color}25`,
              borderRadius:16, padding:"24px 20px" }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:26, fontWeight:900, color:s.color, marginBottom:6 }}>{s.value}</div>
              <div style={{ fontSize:12, color:B.sub, lineHeight:1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </Section>
);

/* ─── PRICING SECTION ────────────────────────────────────────────── */
const PricingSection = () => {
  const plans = [
    {
      name:"Starter",
      price:297,
      period:"mo",
      tagline:"Perfect for solo practices & small businesses",
      color:B.cyan,
      features:[
        "1 location covered",
        "Unlimited calls answered",
        "Appointment booking",
        "Lead capture & SMS alerts",
        "Business hours Q&A",
        "3 AI voices (Aria, Zoe, Morgan)",
        "CRM export (CSV)",
        "Email support",
      ],
      missing:["Multiple locations","Custom AI persona","Priority escalation","Dedicated success manager"],
    },
    {
      name:"Pro",
      price:497,
      period:"mo",
      tagline:"Most popular — growing practices",
      color:B.blue,
      popular:true,
      features:[
        "Up to 3 locations",
        "Unlimited calls answered",
        "Smart appointment booking",
        "Lead capture + CRM sync",
        "Custom call scripts",
        "Custom AI voice — any style",
        "Priority SMS escalation",
        "Analytics dashboard",
        "Phone + email support",
      ],
      missing:["Unlimited locations","White-label option","Dedicated success manager"],
    },
    {
      name:"Business",
      price:897,
      period:"mo",
      tagline:"Multi-location operations",
      color:B.violet,
      features:[
        "Up to 10 locations",
        "Unlimited calls answered",
        "Custom AI persona & voice — unlimited",
        "Full CRM integration",
        "Advanced analytics",
        "Priority escalation & routing",
        "Dedicated success manager",
        "99.99% uptime SLA",
      ],
      missing:["Unlimited locations","White-label"],
    },
    {
      name:"Agency",
      price:1497,
      period:"mo",
      tagline:"Resellers & enterprise chains",
      color:B.amber,
      features:[
        "Unlimited locations",
        "Unlimited calls answered",
        "White-label (your brand)",
        "Custom AI persona & voice — unlimited",
        "Clone any voice style or accent",
        "Full API access",
        "Enterprise CRM integrations",
        "Dedicated success manager",
        "Custom SLA & contracts",
        "Quarterly strategy calls",
      ],
      missing:[],
    },
  ];

  return (
    <Section id="pricing" style={{ paddingTop:60 }}>
      <div style={{ textAlign:"center", marginBottom:64 }}>
        <Badge color={B.green} style={{ marginBottom:16 }}>Simple Pricing</Badge>
        <h2 style={{ fontSize:"clamp(32px,5vw,54px)", fontWeight:900, color:B.white, letterSpacing:"-.03em", marginBottom:16 }}>
          Invest in growth.<br/>
          <ShimmerText>Cancel anytime.</ShimmerText>
        </h2>
        <p style={{ color:B.sub, fontSize:17, maxWidth:520, margin:"0 auto" }}>
          Every plan includes unlimited calls. No per-call fees, ever.
          Most clients see 10–47× ROI within the first month.
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:20, alignItems:"start" }}>
        {plans.map((p) => {
          const card = (
            <div style={{
              background: p.popular ? B.liftHi : B.card,
              border:`1px solid ${p.popular ? B.borderHi : B.borderCard}`,
              borderRadius:p.popular ? 18 : 18,
              padding:"36px 30px",
              backdropFilter:"blur(20px)",
              position:"relative",
              height:"100%",
            }}>
              {p.popular && (
                <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)",
                  background:gradBlue, padding:"5px 20px", borderRadius:100, fontSize:12,
                  fontWeight:800, color:B.white, letterSpacing:".06em", textTransform:"uppercase",
                  whiteSpace:"nowrap", boxShadow:`0 4px 20px ${B.blueGlow2}` }}>
                  ⚡ Most Popular
                </div>
              )}
              <div style={{ marginBottom:24 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ fontSize:20, fontWeight:800, color:B.white }}>{p.name}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:p.color, background:`${p.color}15`,
                    border:`1px solid ${p.color}25`, padding:"3px 10px", borderRadius:100 }}>
                    {p.name === "Agency" ? "White-label" : p.name === "Business" ? "10 locs" : p.name === "Pro" ? "3 locs" : "1 loc"}
                  </span>
                </div>
                <p style={{ fontSize:13, color:B.sub, marginBottom:20, lineHeight:1.5 }}>{p.tagline}</p>
                <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                  <span style={{ fontSize:14, color:B.sub, marginTop:4 }}>$</span>
                  <span style={{ fontSize:52, fontWeight:900, color:B.white, lineHeight:1, letterSpacing:"-.04em" }}>
                    {p.price.toLocaleString()}
                  </span>
                  <span style={{ fontSize:14, color:B.sub }}>/mo</span>
                </div>
                <div style={{ fontSize:12, color:B.muted, marginTop:4 }}>
                  Billed monthly · Cancel anytime
                </div>
              </div>

              <div style={{ marginBottom:28, display:"flex", flexDirection:"column", gap:10 }}>
                {p.features.map((f,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, fontSize:14, color:B.text, lineHeight:1.4 }}>
                    <CheckIcon color={p.color} size={17}/>
                    {f}
                  </div>
                ))}
                {p.missing.slice(0,2).map((f,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, fontSize:14, color:B.muted, lineHeight:1.4 }}>
                    <XIcon size={17}/>
                    {f}
                  </div>
                ))}
              </div>

              <Btn variant={p.popular ? "primary" : "ghost"} style={{ width:"100%", justifyContent:"center" }}
                onClick={() => document.getElementById("trial")?.scrollIntoView({behavior:"smooth"})}>
                {p.popular ? "Get Started →" : "Start Free Trial"}
              </Btn>
            </div>
          );
          return (
            <TiltCard key={p.name} intensity={p.popular ? 8 : 10}>
              {p.popular ? <GradBorder>{card}</GradBorder> : card}
            </TiltCard>
          );
        })}
      </div>

      <div style={{ textAlign:"center", marginTop:40 }}>
        <p style={{ color:B.sub, fontSize:14 }}>
          🔒 30-day money-back guarantee · 📞 All plans include unlimited calls · 🚀 Live in 10 minutes
        </p>
      </div>
    </Section>
  );
};

/* ─── COMPARISON TABLE ───────────────────────────────────────────── */
const CompareSection = () => {
  const rows = [
    { feat:"Available 24/7/365",        ah:true,  human:false, vm:false },
    { feat:"Answers in < 1 second",     ah:true,  human:false, vm:false },
    { feat:"Books appointments live",   ah:true,  human:true,  vm:false },
    { feat:"Captures lead data",        ah:true,  human:true,  vm:false },
    { feat:"Zero hold time",            ah:true,  human:false, vm:false },
    { feat:"No training required",      ah:true,  human:false, vm:true  },
    { feat:"Handles unlimited calls",   ah:true,  human:false, vm:true  },
    { feat:"Never calls in sick",       ah:true,  human:false, vm:true  },
    { feat:"Monthly cost",              ah:"$297–1,497", human:"$1,800–4,200", vm:"Free–$80" },
    { feat:"Revenue per missed call",   ah:"$0 lost", human:"$0 lost", vm:"$850 avg lost" },
  ];

  return (
    <Section id="compare" style={{ paddingTop:40 }}>
      <div style={{ textAlign:"center", marginBottom:52 }}>
        <Badge color={B.amber} style={{ marginBottom:16 }}>Side-by-Side</Badge>
        <h2 style={{ fontSize:"clamp(28px,4.5vw,48px)", fontWeight:900, color:B.white, letterSpacing:"-.03em" }}>
          AfterHours AI vs. the<br/>
          <ShimmerText>alternatives</ShimmerText>
        </h2>
      </div>

      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"separate", borderSpacing:0,
          background:B.card, border:`1px solid ${B.border}`, borderRadius:20, overflow:"hidden" }}>
          <thead>
            <tr>
              {["Feature","AfterHours AI","Human Answering Svc.","Voicemail"].map((h,i) => (
                <th key={h} style={{
                  padding:"18px 20px", textAlign: i===0 ? "left" : "center",
                  fontSize:13, fontWeight:800, letterSpacing:".04em", textTransform:"uppercase",
                  color: i===1 ? B.blue : B.sub,
                  background: i===1 ? "rgba(79,142,247,0.08)" : "transparent",
                  borderBottom:`1px solid ${B.border}`,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i) => (
              <tr key={r.feat} style={{ background: i%2===0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                <td style={{ padding:"14px 20px", fontSize:14, color:B.text, borderBottom:`1px solid ${B.border}33` }}>
                  {r.feat}
                </td>
                {[r.ah, r.human, r.vm].map((v,ci) => (
                  <td key={ci} style={{
                    padding:"14px 20px", textAlign:"center",
                    borderBottom:`1px solid ${B.border}33`,
                    background: ci===0 ? "rgba(79,142,247,0.04)" : "transparent",
                  }}>
                    {typeof v === "boolean"
                      ? (v ? <CheckIcon color={ci===0?B.green:B.muted} size={20}/>
                             : <XIcon color={B.redDim} size={20}/>)
                      : <span style={{ fontSize:13, fontWeight:700,
                          color: ci===0 ? B.green : ci===2 && r.feat.includes("cost") ? B.sub : B.sub }}>
                          {v}
                        </span>
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
};

/* ─── TESTIMONIALS ───────────────────────────────────────────────── */
const TestimonialsSection = () => {
  const reviews = [
    { name:"Dr. Sarah Chen", role:"Orthodontist · San Diego, CA", stars:5, color:B.blue,
      text:"We were losing $15K+ a month in missed after-hours calls. AfterHours AI recovered all of it in the first week. It sounds completely natural — patients can't tell the difference." },
    { name:"Marcus Williams", role:"Owner · Apex Plumbing · Dallas, TX", stars:5, color:B.green,
      text:"An emergency call at 2 AM turned into a $7,200 job. Before this, that call would have gone to voicemail. ROI in one night. Game changer for our business." },
    { name:"Jennifer Park", role:"Practice Manager · LuxMed Dermatology", stars:5, color:B.violet,
      text:"We handle 300+ patient calls per month. AfterHours AI manages every after-hours call perfectly. Our front desk team focuses on in-person care. Worth every penny." },
    { name:"Robert Torres", role:"Franchisee · 6 Locations · Miami, FL", stars:5, color:B.amber,
      text:"Running 6 locations, I needed something that scaled. AfterHours AI handles all 6 simultaneously for less than one part-time receptionist. The Agency plan is a steal." },
    { name:"Dr. Amanda Foster", role:"DDS · Foster Family Dental · Chicago, IL", stars:5, color:B.cyan,
      text:"Patients love how professional and helpful the AI sounds. We've had multiple people comment that our 'receptionist' is always available and incredibly helpful. We just smile." },
    { name:"Kevin Zhao", role:"CEO · PeakFit Gyms · 12 Locations", stars:5, color:B.rose,
      text:"We book 40+ memberships per month that would have been missed calls before. At $1,497/mo across 12 locations, it's the best investment we make in our business." },
  ];

  return (
    <Section style={{ paddingTop:60 }}>
      <div style={{ textAlign:"center", marginBottom:52 }}>
        <Badge color={B.green} style={{ marginBottom:16 }}>Real Results</Badge>
        <h2 style={{ fontSize:"clamp(30px,5vw,52px)", fontWeight:900, color:B.white, letterSpacing:"-.03em", marginBottom:14 }}>
          Join 2,400+ businesses<br/>
          <ShimmerText>growing with AfterHours AI</ShimmerText>
        </h2>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:20 }}>
        {reviews.map((r,i) => (
          <TiltCard key={i} intensity={8}>
            <div style={{ background:B.card, border:`1px solid ${B.borderCard}`,
              borderRadius:18, padding:"28px 26px", backdropFilter:"blur(16px)", height:"100%",
              transition:"border-color .3s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor=`${r.color}33`}
              onMouseLeave={e => e.currentTarget.style.borderColor=B.borderCard}>
              {/* Stars */}
              <div style={{ display:"flex", gap:3, marginBottom:16 }}>
                {Array(r.stars).fill(0).map((_,si) => (
                  <span key={si} style={{ color:B.amber, fontSize:16 }}>★</span>
                ))}
              </div>
              <p style={{ color:B.text, fontSize:14.5, lineHeight:1.7, marginBottom:20, fontStyle:"italic" }}>
                "{r.text}"
              </p>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:"50%", flexShrink:0,
                  background:`${r.color}20`, border:`2px solid ${r.color}40`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:16, fontWeight:800, color:r.color }}>
                  {r.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:B.white }}>{r.name}</div>
                  <div style={{ fontSize:12, color:B.sub }}>{r.role}</div>
                </div>
                <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:5,
                  background:B.greenDim, border:`1px solid ${B.green}25`,
                  borderRadius:8, padding:"3px 10px", flexShrink:0 }}>
                  <CheckIcon size={12} color={B.green}/>
                  <span style={{ fontSize:11, color:B.green, fontWeight:700 }}>Verified</span>
                </div>
              </div>
            </div>
          </TiltCard>
        ))}
      </div>
    </Section>
  );
};

/* ─── CTA SECTION ────────────────────────────────────────────────── */
const CTASection = ({ onTrial }) => (
  <Section id="trial" style={{ paddingBottom:120 }}>
    <GradBorder style={{ maxWidth:760, margin:"0 auto" }}>
      <div style={{ background:"rgba(4,10,22,0.97)", borderRadius:18, padding:"64px 48px",
        textAlign:"center", backdropFilter:"blur(20px)" }}>
        <div style={{ fontSize:56, marginBottom:20 }}>🔮</div>
        <h2 style={{ fontSize:"clamp(28px,5vw,50px)", fontWeight:900, color:B.white,
          letterSpacing:"-.03em", marginBottom:16 }}>
          Hear your AI receptionist<br/>
          <ShimmerText>answer right now</ShimmerText>
        </h2>
        <p style={{ color:B.sub, fontSize:16, lineHeight:1.7, maxWidth:480, margin:"0 auto 36px" }}>
          No sign-up. No credit card. Just press the button and experience AfterHours AI
          live — exactly as your customers will.
        </p>
        <Btn onClick={onTrial} variant="aurora" size="lg">
          <svg width={20} height={20} viewBox="0 0 24 24" fill="white">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
          </svg>
          Start Free Live Demo
        </Btn>
        <p style={{ color:B.muted, fontSize:13, marginTop:18 }}>
          No credit card required · Works in any browser · Chrome recommended for mic access
        </p>
      </div>
    </GradBorder>
  </Section>
);

/* ─── FOOTER ─────────────────────────────────────────────────────── */
const Footer = () => (
  <footer style={{ position:"relative", zIndex:2, borderTop:`1px solid ${B.border}`,
    padding:"48px 28px", textAlign:"center" }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:16 }}>
      <div style={{ width:30, height:30, borderRadius:8, background:gradAurora,
        display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="white">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v2h-2zm0-2h2V7h-2z"/>
        </svg>
      </div>
      <span style={{ fontSize:16, fontWeight:800, color:B.white }}>
        AfterHours<span style={{ color:B.blue }}>.AI</span>
      </span>
    </div>
    <p style={{ color:B.muted, fontSize:13, marginBottom:8 }}>
      © 2025 AfterHours AI · Never miss another call
    </p>
    <p style={{ color:B.muted, fontSize:12 }}>
      Plans start at $297/mo · Cancel anytime · 30-day money-back guarantee
    </p>
  </footer>
);

/* ═══════════════════════════════════════════════════════════════════
   ROOT APP
   ─────────────────────────────────────────────────────────────────── */
export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | briefing | call | summary
  const [selectedVoice, setSelectedVoice]       = useState(VOICE_PROFILES[0]);
  // ElevenLabs key — persists across briefing → call session
  const [elevenLabsKey, setElevenLabsKey]       = useState("");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }}/>
      <AuroraBackground/>
      <NoiseOverlay/>
      <DotGrid/>
      <LiveNotifications/>

      {screen === "landing" && (
        <div style={{ position:"relative", zIndex:2 }}>
          <Navbar onTrial={() => setScreen("briefing")}/>
          <HeroSection onTrial={() => setScreen("briefing")}/>
          <Marquee/>
          <HowItWorks/>
          <ROISection/>
          <PricingSection/>
          <CompareSection/>
          <TestimonialsSection/>
          <CTASection onTrial={() => setScreen("briefing")}/>
          <Footer/>
        </div>
      )}

      {screen === "briefing" && (
        <BriefingScreen
          onStart={() => setScreen("call")}
          onBack={() => setScreen("landing")}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          elevenLabsKey={elevenLabsKey}
          setElevenLabsKey={setElevenLabsKey}
        />
      )}

      {screen === "call" && (
        <LiveCallScreen
          onEnd={() => setScreen("summary")}
          voiceProfile={selectedVoice}
          elevenLabsKey={elevenLabsKey}
        />
      )}

      {screen === "summary" && (
        <SummaryScreen
          onRestart={() => setScreen("briefing")}
          onBack={() => { setScreen("landing"); setTimeout(() => document.getElementById("pricing")?.scrollIntoView({behavior:"smooth"}), 100); }}
        />
      )}
    </>
  );
}
