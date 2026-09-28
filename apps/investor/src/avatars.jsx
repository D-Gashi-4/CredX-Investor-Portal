// avatars.jsx - flat low-poly animal avatars investors can pick from.
// All drawings are inline SVG so they re-tint cleanly under dark mode
// and stay crisp at any size. Each avatar is a 100x100 viewBox with
// a circle background and a stylised forward-facing animal head.

// Display names + short descriptions, surfaced in the picker UI.
const AVATAR_META = {
  fox:     { name: "Fox",     desc: "Clever, agile" },
  bear:    { name: "Bear",    desc: "Steady, strong" },
  panda:   { name: "Panda",   desc: "Calm, deliberate" },
  lion:    { name: "Lion",    desc: "Bold, confident" },
  tiger:   { name: "Tiger",   desc: "Focused, sharp" },
  deer:    { name: "Deer",    desc: "Graceful, alert" },
  hound:   { name: "Hound",   desc: "Loyal, steady" },
  rabbit:  { name: "Rabbit",  desc: "Quick, watchful" },
  giraffe: { name: "Giraffe", desc: "Long view, patient" },
  owl:     { name: "Owl",     desc: "Wise, methodical" },
  eagle:   { name: "Eagle",   desc: "Far-sighted, decisive" },
  monkey:  { name: "Monkey",  desc: "Curious, playful" },
};

const AVATAR_PALETTE = {
  fox:     { bg: "#fafaf6", primary: "#d97757", secondary: "#fff" },
  bear:    { bg: "#fafaf6", primary: "#5a3a2a", secondary: "#fff" },
  panda:   { bg: "#fafaf6", primary: "#fff",    secondary: "#0e1418" },
  lion:    { bg: "#fafaf6", primary: "#d3a64a", secondary: "#fff" },
  tiger:   { bg: "#fafaf6", primary: "#e89a3c", secondary: "#fff" },
  deer:    { bg: "#fafaf6", primary: "#7c4a2a", secondary: "#fff" },
  hound:   { bg: "#fafaf6", primary: "#c79256", secondary: "#fff" },
  rabbit:  { bg: "#fafaf6", primary: "#9aa5ad", secondary: "#fff" },
  giraffe: { bg: "#fafaf6", primary: "#c79256", secondary: "#fff" },
  owl:     { bg: "#fafaf6", primary: "#7a5a3a", secondary: "#fff" },
  eagle:   { bg: "#fafaf6", primary: "#5a3a2a", secondary: "#fff" },
  monkey:  { bg: "#fafaf6", primary: "#7a4a2a", secondary: "#f0d8b8" },
};

const ART = {
  // ── Fox ────────────────────────────────────────────────────────
  fox: (P) => (
    <>
      {/* Pointed ears - large triangles at the crown */}
      <path d="M22 26 L34 30 L30 50 Z" fill={P.primary} />
      <path d="M78 26 L66 30 L70 50 Z" fill={P.primary} />
      <path d="M26 32 L31 40 L28 46 Z" fill="#0e1418" />
      <path d="M74 32 L69 40 L72 46 Z" fill="#0e1418" />
      {/* Head - rounder, with cheek tufts */}
      <ellipse cx="50" cy="58" rx="30" ry="28" fill={P.primary} />
      <path d="M22 60 L30 62 L28 70 Z" fill={P.primary} />
      <path d="M78 60 L70 62 L72 70 Z" fill={P.primary} />
      {/* White face mask - diamond shape */}
      <path d="M50 46 L34 62 L50 82 L66 62 Z" fill={P.secondary} />
      {/* Eyes */}
      <ellipse cx="40" cy="56" rx="3" ry="3.6" fill="#0e1418" />
      <ellipse cx="60" cy="56" rx="3" ry="3.6" fill="#0e1418" />
      <circle cx="40.5" cy="55" r="1" fill={P.secondary} />
      <circle cx="60.5" cy="55" r="1" fill={P.secondary} />
      {/* Nose */}
      <ellipse cx="50" cy="68" rx="3.5" ry="2.8" fill="#0e1418" />
      {/* Mouth */}
      <path d="M50 71 V74 M50 74 Q47 77 44 76 M50 74 Q53 77 56 76" stroke="#0e1418" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Whisker dots */}
      <circle cx="38" cy="72" r="0.7" fill="#0e1418" />
      <circle cx="62" cy="72" r="0.7" fill="#0e1418" />
    </>
  ),
  // ── Bear ───────────────────────────────────────────────────────
  bear: (P) => (
    <>
      {/* Round ears */}
      <circle cx="24" cy="30" r="11" fill={P.primary} />
      <circle cx="76" cy="30" r="11" fill={P.primary} />
      <circle cx="24" cy="30" r="5" fill="#3a2418" />
      <circle cx="76" cy="30" r="5" fill="#3a2418" />
      {/* Head */}
      <ellipse cx="50" cy="58" rx="32" ry="28" fill={P.primary} />
      {/* Lighter muzzle */}
      <ellipse cx="50" cy="68" rx="16" ry="12" fill={P.secondary} />
      {/* Eyes */}
      <ellipse cx="40" cy="54" rx="3" ry="3.6" fill="#0e1418" />
      <ellipse cx="60" cy="54" rx="3" ry="3.6" fill="#0e1418" />
      <circle cx="40.5" cy="53" r="1" fill={P.secondary} />
      <circle cx="60.5" cy="53" r="1" fill={P.secondary} />
      {/* Brow */}
      <path d="M36 50 Q40 48 44 50" stroke="#3a2418" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M56 50 Q60 48 64 50" stroke="#3a2418" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* Nose */}
      <ellipse cx="50" cy="65" rx="4" ry="3" fill="#0e1418" />
      {/* Mouth */}
      <path d="M50 68 V72 M50 72 Q47 75 44 74 M50 72 Q53 75 56 74" stroke="#0e1418" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </>
  ),
  // ── Panda ──────────────────────────────────────────────────────
  panda: (P) => (
    <>
      {/* Big black ears */}
      <circle cx="22" cy="30" r="12" fill="#0e1418" />
      <circle cx="78" cy="30" r="12" fill="#0e1418" />
      <circle cx="22" cy="30" r="4" fill="#3a3a3a" />
      <circle cx="78" cy="30" r="4" fill="#3a3a3a" />
      {/* White round head */}
      <ellipse cx="50" cy="58" rx="32" ry="28" fill={P.primary} />
      {/* Black eye patches - teardrop shape angled inward */}
      <ellipse cx="38" cy="55" rx="7" ry="10" fill="#0e1418" transform="rotate(-12 38 55)" />
      <ellipse cx="62" cy="55" rx="7" ry="10" fill="#0e1418" transform="rotate(12 62 55)" />
      {/* Eyes within patches */}
      <circle cx="39" cy="56" r="2.6" fill={P.primary} />
      <circle cx="61" cy="56" r="2.6" fill={P.primary} />
      <circle cx="39.5" cy="55.5" r="1" fill="#0e1418" />
      <circle cx="61.5" cy="55.5" r="1" fill="#0e1418" />
      {/* Nose */}
      <ellipse cx="50" cy="66" rx="3.5" ry="2.8" fill="#0e1418" />
      {/* Mouth */}
      <path d="M50 69 V72 M50 72 Q47 75 44 74 M50 72 Q53 75 56 74" stroke="#0e1418" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </>
  ),
  // ── Lion ───────────────────────────────────────────────────────
  lion: (P) => (
    <>
      {/* Mane - layered scallops around the head */}
      <g fill="#a87a35">
        {Array.from({ length: 14 }).map((_, i) => {
          const a = (i / 14) * Math.PI * 2;
          const x = 50 + Math.cos(a) * 32;
          const y = 54 + Math.sin(a) * 32;
          return <circle key={i} cx={x} cy={y} r="10" />;
        })}
      </g>
      <g fill={P.primary}>
        {Array.from({ length: 14 }).map((_, i) => {
          const a = ((i + 0.5) / 14) * Math.PI * 2;
          const x = 50 + Math.cos(a) * 28;
          const y = 54 + Math.sin(a) * 28;
          return <circle key={i} cx={x} cy={y} r="9" />;
        })}
      </g>
      {/* Inner head */}
      <ellipse cx="50" cy="56" rx="22" ry="22" fill={P.primary} />
      {/* Small rounded ears poking from mane */}
      <circle cx="34" cy="38" r="5" fill={P.primary} />
      <circle cx="66" cy="38" r="5" fill={P.primary} />
      <circle cx="34" cy="38" r="2.5" fill="#d97757" />
      <circle cx="66" cy="38" r="2.5" fill="#d97757" />
      {/* Lighter muzzle */}
      <ellipse cx="50" cy="66" rx="14" ry="11" fill={P.secondary} />
      {/* Eyes */}
      <ellipse cx="42" cy="54" rx="2.8" ry="3.4" fill="#0e1418" />
      <ellipse cx="58" cy="54" rx="2.8" ry="3.4" fill="#0e1418" />
      <circle cx="42.5" cy="53" r="0.9" fill={P.secondary} />
      <circle cx="58.5" cy="53" r="0.9" fill={P.secondary} />
      {/* Nose - upside-down triangle */}
      <path d="M46 63 L54 63 L50 68 Z" fill="#0e1418" />
      {/* Mouth - upside-down W */}
      <path d="M50 68 V71 M50 71 Q47 74 45 73 M50 71 Q53 74 55 73" stroke="#0e1418" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* Whisker dots */}
      <circle cx="42" cy="68" r="0.7" fill="#0e1418" />
      <circle cx="58" cy="68" r="0.7" fill="#0e1418" />
    </>
  ),
  // ── Tiger ──────────────────────────────────────────────────────
  tiger: (P) => (
    <>
      {/* Ears - rounded, set wide */}
      <circle cx="22" cy="32" r="9" fill={P.primary} />
      <circle cx="78" cy="32" r="9" fill={P.primary} />
      <circle cx="22" cy="32" r="4" fill="#0e1418" />
      <circle cx="78" cy="32" r="4" fill="#0e1418" />
      {/* Head - rounder than before, with subtle ruff */}
      <ellipse cx="50" cy="58" rx="30" ry="28" fill={P.primary} />
      {/* Cheek ruff tufts */}
      <path d="M20 56 L26 64 L24 70 Z" fill={P.primary} />
      <path d="M80 56 L74 64 L76 70 Z" fill={P.primary} />
      {/* White muzzle / chin patch */}
      <ellipse cx="50" cy="68" rx="20" ry="16" fill={P.secondary} />
      {/* Stripes - bold, asymmetric like a real tiger */}
      <path d="M50 30 Q49 38 50 46" stroke="#0e1418" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M40 34 Q38 42 36 48" stroke="#0e1418" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M60 34 Q62 42 64 48" stroke="#0e1418" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M30 42 Q28 48 30 54" stroke="#0e1418" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M70 42 Q72 48 70 54" stroke="#0e1418" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M24 60 L30 62" stroke="#0e1418" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M76 60 L70 62" stroke="#0e1418" strokeWidth="2.5" strokeLinecap="round" />
      {/* Eyes */}
      <ellipse cx="40" cy="56" rx="3.4" ry="3.8" fill="#0e1418" />
      <ellipse cx="60" cy="56" rx="3.4" ry="3.8" fill="#0e1418" />
      <circle cx="41" cy="55" r="1" fill={P.secondary} />
      <circle cx="61" cy="55" r="1" fill={P.secondary} />
      {/* Nose */}
      <path d="M46 66 L54 66 L50 71 Z" fill="#0e1418" />
      {/* Mouth */}
      <path d="M50 71 Q50 76 46 77 M50 71 Q50 76 54 77" stroke="#0e1418" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Whisker dots */}
      <circle cx="40" cy="72" r="0.8" fill="#0e1418" />
      <circle cx="60" cy="72" r="0.8" fill="#0e1418" />
      <circle cx="38" cy="76" r="0.8" fill="#0e1418" />
      <circle cx="62" cy="76" r="0.8" fill="#0e1418" />
    </>
  ),
  // ── Deer ───────────────────────────────────────────────────────
  deer: (P) => (
    <>
      {/* Antlers - branching out from the crown */}
      <path d="M30 16 L34 28 M30 16 L22 22 M34 22 L26 28 M30 22 L36 26" stroke="#8a6038" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M70 16 L66 28 M70 16 L78 22 M66 22 L74 28 M70 22 L64 26" stroke="#8a6038" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Ears - large angled */}
      <ellipse cx="24" cy="36" rx="6" ry="11" fill={P.primary} transform="rotate(-25 24 36)" />
      <ellipse cx="76" cy="36" rx="6" ry="11" fill={P.primary} transform="rotate(25 76 36)" />
      <ellipse cx="25" cy="37" rx="2.5" ry="6" fill={P.secondary} transform="rotate(-25 25 37)" />
      <ellipse cx="75" cy="37" rx="2.5" ry="6" fill={P.secondary} transform="rotate(25 75 37)" />
      {/* Head - oval, slightly elongated */}
      <ellipse cx="50" cy="58" rx="26" ry="28" fill={P.primary} />
      {/* White spots scattered */}
      <circle cx="38" cy="42" r="2" fill={P.secondary} opacity="0.5" />
      <circle cx="62" cy="44" r="2" fill={P.secondary} opacity="0.5" />
      <circle cx="33" cy="60" r="1.8" fill={P.secondary} opacity="0.5" />
      <circle cx="67" cy="58" r="1.8" fill={P.secondary} opacity="0.5" />
      {/* Lighter muzzle */}
      <ellipse cx="50" cy="72" rx="12" ry="10" fill={P.secondary} />
      {/* Eyes */}
      <ellipse cx="41" cy="56" rx="3" ry="3.6" fill="#0e1418" />
      <ellipse cx="59" cy="56" rx="3" ry="3.6" fill="#0e1418" />
      <circle cx="41.5" cy="55" r="1" fill={P.secondary} />
      <circle cx="59.5" cy="55" r="1" fill={P.secondary} />
      {/* Lashes */}
      <path d="M39 53 L38 50 M43 53 L44 50" stroke="#0e1418" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M61 53 L62 50 M57 53 L56 50" stroke="#0e1418" strokeWidth="0.9" strokeLinecap="round" />
      {/* Nose */}
      <ellipse cx="50" cy="68" rx="3.5" ry="2.5" fill="#0e1418" />
      {/* Mouth */}
      <path d="M50 71 V74 M50 74 Q47 76 45 75 M50 74 Q53 76 55 75" stroke="#0e1418" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </>
  ),
  // ── Hound (dog) ────────────────────────────────────────────────
  // Long-eared hound, replacing the raccoon. Tan coat with darker
  // ears and muzzle, a soulful look.
  hound: (P) => (
    <>
      {/* Long droopy ears - fall outside the head outline */}
      <ellipse cx="24" cy="58" rx="10" ry="22" fill="#5a3a2a" />
      <ellipse cx="76" cy="58" rx="10" ry="22" fill="#5a3a2a" />
      {/* Head - rounded with slight elongation */}
      <ellipse cx="50" cy="54" rx="22" ry="24" fill={P.primary} />
      {/* Crown of head darker */}
      <path d="M28 50 Q50 28 72 50 Q70 56 50 54 Q30 56 28 50 Z" fill="#5a3a2a" />
      {/* Long muzzle */}
      <ellipse cx="50" cy="70" rx="14" ry="12" fill={P.primary} />
      <ellipse cx="50" cy="73" rx="11" ry="8" fill={P.secondary} />
      {/* Eyes - soulful, with slight droop */}
      <ellipse cx="40" cy="56" rx="3" ry="3.6" fill="#0e1418" />
      <ellipse cx="60" cy="56" rx="3" ry="3.6" fill="#0e1418" />
      <circle cx="40.5" cy="55" r="1" fill={P.secondary} />
      <circle cx="60.5" cy="55" r="1" fill={P.secondary} />
      {/* Brow ridges - giving it that hound-dog look */}
      <path d="M36 52 Q40 50 44 52" stroke="#5a3a2a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M56 52 Q60 50 64 52" stroke="#5a3a2a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Nose - large black */}
      <ellipse cx="50" cy="68" rx="4.5" ry="3.5" fill="#0e1418" />
      <circle cx="49" cy="67" r="0.8" fill={P.secondary} />
      {/* Mouth */}
      <path d="M50 72 V76 M50 76 Q46 79 43 78 M50 76 Q54 79 57 78" stroke="#0e1418" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Tongue hint */}
      <ellipse cx="50" cy="79" rx="2" ry="1.5" fill="#d97757" />
    </>
  ),
  // ── Rabbit ─────────────────────────────────────────────────────
  rabbit: (P) => (
    <>
      {/* Long upright ears */}
      <ellipse cx="36" cy="22" rx="5" ry="15" fill={P.primary} />
      <ellipse cx="64" cy="22" rx="5" ry="15" fill={P.primary} />
      <ellipse cx="36" cy="24" rx="2" ry="9" fill="#f0b8c8" />
      <ellipse cx="64" cy="24" rx="2" ry="9" fill="#f0b8c8" />
      {/* Head - rounder */}
      <ellipse cx="50" cy="58" rx="28" ry="26" fill={P.primary} />
      {/* Lighter muzzle */}
      <ellipse cx="50" cy="68" rx="14" ry="11" fill={P.secondary} />
      {/* Eyes */}
      <ellipse cx="40" cy="54" rx="3" ry="3.6" fill="#0e1418" />
      <ellipse cx="60" cy="54" rx="3" ry="3.6" fill="#0e1418" />
      <circle cx="40.5" cy="53" r="1" fill={P.secondary} />
      <circle cx="60.5" cy="53" r="1" fill={P.secondary} />
      {/* Pink nose */}
      <path d="M50 64 L46 67 L50 70 L54 67 Z" fill="#e88aa0" />
      {/* Mouth - cleft */}
      <path d="M50 70 V73 M50 73 Q47 75 45 74 M50 73 Q53 75 55 74" stroke="#0e1418" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {/* Front teeth */}
      <rect x="48" y="75" width="1.6" height="3" fill={P.secondary} />
      <rect x="50.4" y="75" width="1.6" height="3" fill={P.secondary} />
      {/* Whisker dots */}
      <circle cx="39" cy="68" r="0.7" fill="#0e1418" />
      <circle cx="61" cy="68" r="0.7" fill="#0e1418" />
    </>
  ),
  // ── Giraffe ────────────────────────────────────────────────────
  // Forward-facing giraffe head with ossicones (the horn-like tufts),
  // angled ears, spotted pattern, and a long elegant nose.
  giraffe: (P) => (
    <>
      {/* Ossicones - small stalks topped with tufts */}
      <rect x="38" y="14" width="3" height="10" fill={P.primary} />
      <rect x="59" y="14" width="3" height="10" fill={P.primary} />
      <circle cx="39.5" cy="13" r="3" fill="#5a3a2a" />
      <circle cx="60.5" cy="13" r="3" fill="#5a3a2a" />
      {/* Large angled ears */}
      <ellipse cx="26" cy="32" rx="6" ry="10" fill={P.primary} transform="rotate(-30 26 32)" />
      <ellipse cx="74" cy="32" rx="6" ry="10" fill={P.primary} transform="rotate(30 74 32)" />
      <ellipse cx="27" cy="33" rx="3" ry="6" fill={P.secondary} transform="rotate(-30 27 33)" />
      <ellipse cx="73" cy="33" rx="3" ry="6" fill={P.secondary} transform="rotate(30 73 33)" />
      {/* Long elongated head/snout - tapered downward */}
      <path d="M36 36 L64 36 L60 86 L40 86 Z" fill={P.primary} />
      {/* Soft rounded crown */}
      <path d="M36 36 Q50 28 64 36 Z" fill={P.primary} />
      {/* Spots */}
      <ellipse cx="42" cy="44" rx="3.5" ry="3" fill="#5a3a2a" opacity="0.55" />
      <ellipse cx="57" cy="46" rx="3" ry="2.8" fill="#5a3a2a" opacity="0.55" />
      <ellipse cx="50" cy="54" rx="3" ry="2.6" fill="#5a3a2a" opacity="0.55" />
      <ellipse cx="41" cy="60" rx="3" ry="2.6" fill="#5a3a2a" opacity="0.55" />
      <ellipse cx="58" cy="62" rx="3" ry="2.6" fill="#5a3a2a" opacity="0.55" />
      {/* Eyes - high on the head, gentle */}
      <ellipse cx="43" cy="50" rx="2.4" ry="3" fill="#0e1418" />
      <ellipse cx="57" cy="50" rx="2.4" ry="3" fill="#0e1418" />
      <circle cx="43.5" cy="49" r="0.9" fill={P.secondary} />
      <circle cx="57.5" cy="49" r="0.9" fill={P.secondary} />
      {/* Long lashes */}
      <path d="M41 47 L40 44 M45 46 L45.5 43" stroke="#0e1418" strokeWidth="1" strokeLinecap="round" />
      <path d="M59 47 L60 44 M55 46 L54.5 43" stroke="#0e1418" strokeWidth="1" strokeLinecap="round" />
      {/* Lower muzzle - lighter */}
      <ellipse cx="50" cy="78" rx="10" ry="6" fill={P.secondary} />
      {/* Nostrils */}
      <ellipse cx="46" cy="76" rx="1" ry="1.6" fill="#0e1418" />
      <ellipse cx="54" cy="76" rx="1" ry="1.6" fill="#0e1418" />
      {/* Mouth */}
      <path d="M48 82 Q50 84 52 82" stroke="#0e1418" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </>
  ),
  // ── Owl ────────────────────────────────────────────────────────
  // Owl with distinctive heart-shaped face, large round eyes,
  // ear tufts, and a fluffy chest pattern.
  owl: (P) => (
    <>
      {/* Ear tufts - small triangular peaks */}
      <path d="M28 22 L34 38 L24 32 Z" fill={P.primary} />
      <path d="M72 22 L66 38 L76 32 Z" fill={P.primary} />
      {/* Round body / head */}
      <ellipse cx="50" cy="58" rx="32" ry="30" fill={P.primary} />
      {/* Heart-shaped face disk - lighter */}
      <path d="M50 36
               Q30 36 28 56
               Q28 72 50 76
               Q72 72 72 56
               Q70 36 50 36 Z" fill={P.secondary} />
      {/* Subtle chest feather pattern */}
      <path d="M40 78 Q45 82 50 80 Q55 82 60 78" stroke={P.primary} strokeWidth="1.2" fill="none" opacity="0.5" />
      <path d="M44 82 Q47 84 50 83 Q53 84 56 82" stroke={P.primary} strokeWidth="1.2" fill="none" opacity="0.5" />
      {/* Large round eyes */}
      <circle cx="40" cy="54" r="9" fill={P.secondary} />
      <circle cx="60" cy="54" r="9" fill={P.secondary} />
      <circle cx="40" cy="54" r="7" fill="#0e1418" />
      <circle cx="60" cy="54" r="7" fill="#0e1418" />
      <circle cx="40" cy="54" r="3.8" fill="#3a4a18" />
      <circle cx="60" cy="54" r="3.8" fill="#3a4a18" />
      {/* Eye highlights */}
      <circle cx="42" cy="52" r="1.4" fill={P.secondary} />
      <circle cx="62" cy="52" r="1.4" fill={P.secondary} />
      {/* Beak - small triangle below eyes */}
      <path d="M50 60 L46 67 L50 70 L54 67 Z" fill="#d97757" />
      <path d="M50 60 L50 70" stroke="#8a4a2a" strokeWidth="0.8" />
    </>
  ),
};

// Re-use bear with darker primary for the "bear2" entry
ART.bear2 = ART.bear;
ART.fox2  = ART.fox;

// ── Eagle ──────────────────────────────────────────────────────
// Bald eagle: pure white head and neck contrasting a dark body,
// fierce yellow eye with sharp brow, and an unmistakable hooked
// yellow beak with a clear cere line.
ART.eagle = (P) => (
  <>
    {/* Dark body / shoulders peeking up behind the head */}
    <ellipse cx="50" cy="86" rx="32" ry="12" fill={P.primary} />
    <path d="M18 84 Q18 60 32 56 L32 86 Z" fill={P.primary} />
    <path d="M82 84 Q82 60 68 56 L68 86 Z" fill={P.primary} />
    {/* Body feather streaks */}
    <path d="M38 78 L40 86 M46 76 L46 86 M54 76 L54 86 M62 78 L60 86" stroke="#3a2418" strokeWidth="0.8" />

    {/* Crisp white head silhouette */}
    <path d="M22 54
             Q22 30 50 26
             Q78 30 78 54
             Q78 72 60 76
             L40 76
             Q22 72 22 54 Z" fill={P.secondary} />
    {/* Subtle ruff line where head meets body */}
    <path d="M28 70 Q50 80 72 70" stroke="#d8d3c5" strokeWidth="1.2" fill="none" />

    {/* Sharp angular brow - signature eagle frown */}
    <path d="M28 44 L46 50 L44 56 L28 51 Z" fill={P.primary} />
    <path d="M72 44 L54 50 L56 56 L72 51 Z" fill={P.primary} />

    {/* Piercing yellow eyes - intense */}
    <circle cx="38" cy="55" r="3.6" fill="#f0c040" />
    <circle cx="62" cy="55" r="3.6" fill="#f0c040" />
    <circle cx="38" cy="55.5" r="1.8" fill="#0e1418" />
    <circle cx="62" cy="55.5" r="1.8" fill="#0e1418" />
    <circle cx="38.5" cy="54.8" r="0.7" fill={P.secondary} />
    <circle cx="62.5" cy="54.8" r="0.7" fill={P.secondary} />

    {/* Iconic hooked yellow beak */}
    <path d="M44 62
             Q50 60 56 62
             L57 70
             Q56 74 53 75
             L50 77
             Q46 76 44 73
             L43 66 Z" fill="#f0c040" />
    {/* Hook tip - curves under */}
    <path d="M48 76 Q50 80 52 76 Q50 78 48 76 Z" fill="#c08820" />
    {/* Cere - separation line between beak and face */}
    <path d="M44 64 Q50 62 56 64" stroke="#c08820" strokeWidth="0.8" fill="none" />
    {/* Mid-beak shadow line */}
    <path d="M50 62 L50 76" stroke="#c08820" strokeWidth="0.6" />
    {/* Nostril */}
    <ellipse cx="50" cy="66" rx="0.8" ry="0.6" fill="#0e1418" />
  </>
);

// ── Monkey ─────────────────────────────────────────────────────
ART.monkey = (P) => (
  <>
    {/* Large round ears - sticking out */}
    <circle cx="22" cy="50" r="10" fill={P.primary} />
    <circle cx="78" cy="50" r="10" fill={P.primary} />
    <circle cx="22" cy="50" r="5" fill={P.secondary} />
    <circle cx="78" cy="50" r="5" fill={P.secondary} />
    {/* Head */}
    <ellipse cx="50" cy="56" rx="28" ry="28" fill={P.primary} />
    {/* Lighter heart-shaped face mask */}
    <path d="M50 36
             Q34 38 32 56
             Q34 74 50 78
             Q66 74 68 56
             Q66 38 50 36 Z" fill={P.secondary} />
    {/* Forehead lock - tuft of fur */}
    <path d="M44 36 Q50 30 56 36 Q54 40 50 38 Q46 40 44 36 Z" fill={P.primary} />
    {/* Eyes - close-set */}
    <ellipse cx="43" cy="54" rx="3.2" ry="3.8" fill="#0e1418" />
    <ellipse cx="57" cy="54" rx="3.2" ry="3.8" fill="#0e1418" />
    <circle cx="43.5" cy="53" r="1" fill={P.secondary} />
    <circle cx="57.5" cy="53" r="1" fill={P.secondary} />
    {/* Brow ridges */}
    <path d="M38 50 Q43 48 47 50" stroke="#4a2818" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <path d="M53 50 Q57 48 62 50" stroke="#4a2818" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    {/* Wide flat nose */}
    <ellipse cx="50" cy="64" rx="5" ry="3" fill="#4a2818" />
    <ellipse cx="48" cy="64" rx="1" ry="1.4" fill="#0e1418" />
    <ellipse cx="52" cy="64" rx="1" ry="1.4" fill="#0e1418" />
    {/* Mouth - a wide smile */}
    <path d="M42 72 Q50 76 58 72" stroke="#4a2818" strokeWidth="1.6" fill="none" strokeLinecap="round" />
  </>
);

const AVATAR_KEYS = ["fox", "bear", "panda", "lion", "tiger", "deer", "hound", "rabbit", "giraffe", "owl", "eagle", "monkey"];

function AnimalAvatar({ id, size = 40, bg }) {
  const P = AVATAR_PALETTE[id] || AVATAR_PALETTE.fox;
  const draw = ART[id] || ART.fox;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <circle cx="50" cy="50" r="50" fill={bg || P.bg} />
      {draw(P)}
    </svg>
  );
}

// Subscribe to the current theme so the disc can pick its text colour reactively.
function useIsDarkTheme() {
  const read = () => typeof document !== "undefined" &&
    document.documentElement.getAttribute("data-theme") === "dark";
  const [dark, setDark] = React.useState(read);
  React.useEffect(() => {
    const obs = new MutationObserver(() => setDark(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

// Brightness of a hex colour (0–255). Returns null for non-hex inputs.
function hexBrightness(hex) {
  if (!/^#/.test(hex)) return null;
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

// Initials disc with configurable background colour. Defaults to brand ink.
function InitialsAvatar({ initials, size = 40, bg = "var(--ink)" }) {
  const isDark = useIsDarkTheme();
  // Text colour rules:
  //  • bg === var(--ink) pairs with var(--bg) — flips correctly with theme.
  //  • Light mode: contrast against the hex swatch (dark bg → cream, light bg → ink).
  //  • Dark mode: default to ink black; only flip to cream when the swatch is
  //    near-black (otherwise dark-on-dark is unreadable).
  let color;
  if (bg === "var(--ink)") {
    color = "var(--bg)";
  } else {
    const brightness = hexBrightness(bg);
    if (isDark) {
      color = (brightness !== null && brightness < 40) ? "#f4f1ea" : "#0e1418";
    } else {
      color = (brightness !== null && brightness < 140) ? "#f4f1ea" : "#0e1418";
    }
  }
  return (
    <span style={{
      width: size, height: size,
      background: bg,
      color,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--ff-serif)", fontWeight: 500,
      fontSize: Math.max(10, Math.round(size * 0.42)),
    }}>{initials}</span>
  );
}

// Composable avatar: pass the saved avatar id (or null) + initials fallback.
function InvestorAvatar({ avatarId, initials, size = 40, initialsBg, animalBg }) {
  if (avatarId && AVATAR_PALETTE[avatarId]) {
    return <AnimalAvatar id={avatarId} size={size} bg={animalBg} />;
  }
  return <InitialsAvatar initials={initials} size={size} bg={initialsBg || "var(--ink)"} />;
}

// Curated palette for the initials background swatch picker.
const INITIALS_BG_OPTIONS = [
  "#0e1418",   // brand ink
  "#117a82",   // CredX teal
  "#7a2b2b",   // oxblood
  "#3b6a3b",   // British racing green
  "#d97757",   // warm clay
  "#5a3a2a",   // bear brown
  "#c79256",   // giraffe tan
  "#777e84",   // graphite
  "#0e1418",
];

Object.assign(window, {
  AVATAR_KEYS, AVATAR_PALETTE, AVATAR_META, AnimalAvatar, InitialsAvatar, InvestorAvatar, INITIALS_BG_OPTIONS,
});
