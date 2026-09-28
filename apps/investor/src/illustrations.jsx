// illustrations.jsx - property-specific architectural illustrations
// for opportunity cards and deal detail headers. Original SVG line art,
// brand-consistent (uses --ink, --accent), one design per deal type so
// every card is visually distinct. Inline SVG = no external fetches.

// Each illustration uses a shared 400×225 viewBox (16:9).

function PropIllustration({ dealId, type, category, height }) {
  // Pick a design by dealId first (specific overrides), then by category.
  const fn = ID_TO_ILLUSTRATION[dealId] || CATEGORY_TO_ILLUSTRATION[category] || CATEGORY_TO_ILLUSTRATION[type] || _genericBuilding;
  return (
    <div style={{ width: "100%", height: height || "100%", position: "relative", background: "var(--bg-sunk)", overflow: "hidden" }}>
      <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice"
           style={{ width: "100%", height: "100%", display: "block" }}>
        {/* Sky / backdrop */}
        <defs>
          <linearGradient id={"sky-" + dealId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--bg-sunk)" />
            <stop offset="100%" stopColor="var(--bg-elev)" />
          </linearGradient>
        </defs>
        <rect width="400" height="225" fill={"url(#sky-" + dealId + ")"} />
        {/* Subtle horizon hatching */}
        <g opacity="0.06" stroke="var(--ink)" strokeWidth="1">
          {Array.from({ length: 18 }).map((_, i) => (
            <line key={i} x1="0" x2="400" y1={20 + i * 12} y2={20 + i * 12} strokeDasharray="2 6" />
          ))}
        </g>
        {fn({ dealId })}
        {/* Ground line */}
        <line x1="0" x2="400" y1="195" y2="195" stroke="var(--ink)" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// Shared helpers
const ink = "var(--ink)";
const accent = "var(--accent)";
const litWindow = "var(--accent)";

// ────────────────────────────────────────────────────────────────
// Per-deal designs
// ────────────────────────────────────────────────────────────────

// ASHFORD RETAIL PARADE - 3-storey, 4 shopfronts, awnings, flats above
function _retailParade() {
  return (
    <g stroke={ink} strokeWidth="1.4" fill="none" strokeLinejoin="round">
      {/* Main facade */}
      <rect x="40" y="60" width="320" height="135" fill="var(--bg-elev)" />
      {/* Cornice */}
      <line x1="38" x2="362" y1="74" y2="74" />
      {/* Floor lines */}
      <line x1="40" x2="360" y1="115" y2="115" />
      <line x1="40" x2="360" y1="155" y2="155" />
      {/* Top floor windows (6) */}
      {[60, 110, 160, 210, 260, 310].map((x, i) => (
        <g key={i}>
          <rect x={x} y="84" width="30" height="22" fill="var(--bg-sunk)" />
          <line x1={x + 15} x2={x + 15} y1="84" y2="106" strokeWidth="1" />
        </g>
      ))}
      {/* Middle floor windows */}
      {[60, 110, 160, 210, 260, 310].map((x, i) => (
        <rect key={i} x={x} y="124" width="30" height="22" fill="var(--bg-sunk)" />
      ))}
      {/* Ground floor: 4 shopfronts */}
      {[55, 130, 205, 280].map((x, i) => (
        <g key={i}>
          {/* Awning */}
          <path d={`M${x - 2} 155 L${x + 67} 155 L${x + 60} 167 L${x + 5} 167 Z`} fill="var(--accent-tint)" stroke={accent} />
          {/* Shopfront window */}
          <rect x={x} y="167" width="65" height="28" fill="var(--bg-sunk)" />
          <line x1={x + 32} x2={x + 32} y1="167" y2="195" strokeWidth="1" />
        </g>
      ))}
      {/* Signage band */}
      <rect x="50" y="74" width="300" height="8" fill="var(--accent)" opacity="0.85" />
    </g>
  );
}

// SANDGATE COASTAL RESIDENCE - detached pitched-roof house with sea
function _coastalHouse() {
  return (
    <g stroke={ink} strokeWidth="1.4" fill="none" strokeLinejoin="round">
      {/* Sea / horizon - subtle */}
      <line x1="0" x2="160" y1="155" y2="155" strokeWidth="0.8" opacity="0.4" />
      <line x1="0" x2="100" y1="160" y2="160" strokeWidth="0.8" opacity="0.3" />
      <line x1="0" x2="120" y1="165" y2="165" strokeWidth="0.8" opacity="0.3" />
      {/* Gulls */}
      <path d="M40 80 Q45 76 50 80 Q55 76 60 80" strokeWidth="1" opacity="0.4" />
      <path d="M85 65 Q88 62 91 65" strokeWidth="1" opacity="0.4" />
      {/* House body */}
      <rect x="170" y="110" width="170" height="85" fill="var(--bg-elev)" />
      {/* Pitched roof */}
      <path d="M165 112 L255 60 L345 112 Z" fill="var(--accent-tint)" />
      {/* Chimney */}
      <rect x="285" y="72" width="14" height="22" fill="var(--bg-sunk)" />
      {/* Door */}
      <rect x="240" y="150" width="28" height="45" fill="var(--bg-sunk)" />
      {/* Windows */}
      <rect x="185" y="130" width="32" height="32" fill="var(--bg-sunk)" />
      <line x1="201" x2="201" y1="130" y2="162" strokeWidth="1" />
      <line x1="185" x2="217" y1="146" y2="146" strokeWidth="1" />
      <rect x="285" y="130" width="32" height="32" fill="var(--bg-sunk)" />
      <line x1="301" x2="301" y1="130" y2="162" strokeWidth="1" />
      <line x1="285" x2="317" y1="146" y2="146" strokeWidth="1" />
      {/* Roof detail line */}
      <line x1="165" x2="345" y1="112" y2="112" />
    </g>
  );
}

// ROCHESTER OFFICE - modern Class E office cube, ribbon windows
function _modernOffice() {
  return (
    <g stroke={ink} strokeWidth="1.4" fill="none" strokeLinejoin="round">
      <rect x="60" y="55" width="280" height="140" fill="var(--bg-elev)" />
      {/* Roof line */}
      <line x1="55" x2="345" y1="55" y2="55" />
      {/* Floor lines */}
      {[88, 121, 154].map((y, i) => <line key={i} x1="60" x2="340" y1={y} y2={y} />)}
      {/* Ribbon windows */}
      {[68, 101, 134, 167].map((y, fi) => (
        <g key={fi}>
          {[70, 105, 140, 175, 210, 245, 280, 315].map((x, i) => (
            <rect key={i} x={x} y={y} width="22" height="14"
              fill={fi === 1 && (i === 2 || i === 5) ? litWindow : "var(--bg-sunk)"}
              opacity={fi === 1 && (i === 2 || i === 5) ? 0.7 : 1} />
          ))}
        </g>
      ))}
      {/* Entrance canopy */}
      <rect x="180" y="184" width="60" height="11" fill="var(--accent-tint)" stroke={accent} />
      <line x1="178" x2="242" y1="184" y2="184" strokeWidth="1.6" />
      {/* Subtle vertical accent */}
      <line x1="200" x2="200" y1="55" y2="195" opacity="0.35" />
    </g>
  );
}

// MARGATE MIXED-USE - corner building, café below, flats above
function _mixedUseCorner() {
  return (
    <g stroke={ink} strokeWidth="1.4" fill="none" strokeLinejoin="round">
      {/* Left wing (3/4) */}
      <path d="M40 80 L200 80 L200 195 L40 195 Z" fill="var(--bg-elev)" />
      {/* Right wing (in foreshortened perspective) */}
      <path d="M200 80 L320 90 L320 195 L200 195 Z" fill="var(--bg-elev)" />
      {/* Roof line */}
      <line x1="40" x2="200" y1="80" y2="80" />
      <line x1="200" x2="320" y1="80" y2="90" />
      {/* Decorative cornice */}
      <line x1="38" x2="322" y1="90" y2="100" opacity="0.4" />
      {/* Upper windows - left */}
      {[60, 100, 140, 175].map((x, i) => (
        <rect key={i} x={x} y="108" width="22" height="28" fill="var(--bg-sunk)" />
      ))}
      {[60, 100, 140, 175].map((x, i) => (
        <rect key={i} x={x} y="144" width="22" height="22" fill="var(--bg-sunk)" />
      ))}
      {/* Upper windows - right */}
      {[215, 250, 285].map((x, i) => (
        <rect key={i} x={x} y={113 + i * 1.5} width="22" height="28" fill="var(--bg-sunk)" />
      ))}
      {[215, 250, 285].map((x, i) => (
        <rect key={i} x={x} y={148 + i * 1.5} width="22" height="22" fill="var(--bg-sunk)" />
      ))}
      {/* Ground floor - café (accent-tinted window) */}
      <rect x="48" y="172" width="148" height="23" fill="var(--accent-tint)" stroke={accent} />
      <line x1="124" x2="124" y1="172" y2="195" strokeWidth="1" />
      {/* Door */}
      <rect x="80" y="175" width="14" height="20" fill="var(--bg-elev)" />
      {/* Café sign */}
      <rect x="48" y="160" width="148" height="6" fill={accent} opacity="0.85" />
      {/* Right ground floor - residential entrance */}
      <rect x="208" y="160" width="108" height="35" fill="var(--bg-sunk)" />
    </g>
  );
}

// HYTHE - semi-detached residential under refurb (scaffolding on one half)
function _refurbSemi() {
  return (
    <g stroke={ink} strokeWidth="1.4" fill="none" strokeLinejoin="round">
      {/* Two halves of the semi */}
      <path d="M40 100 L150 60 L150 195 L40 195 Z" fill="var(--bg-elev)" />
      <path d="M150 60 L260 100 L260 195 L150 195 Z" fill="var(--bg-elev)" />
      {/* Roof ridge */}
      <line x1="40" x2="150" y1="100" y2="60" />
      <line x1="150" x2="260" y1="60" y2="100" />
      <line x1="150" x2="150" y1="60" y2="195" />
      {/* Left half - finished */}
      <rect x="60" y="115" width="32" height="32" fill="var(--bg-sunk)" />
      <line x1="76" x2="76" y1="115" y2="147" strokeWidth="1" />
      <rect x="100" y="115" width="32" height="32" fill="var(--bg-sunk)" />
      <line x1="116" x2="116" y1="115" y2="147" strokeWidth="1" />
      <rect x="60" y="155" width="32" height="32" fill="var(--bg-sunk)" />
      <rect x="115" y="160" width="22" height="35" fill="var(--bg-sunk)" />
      {/* Right half - scaffolded */}
      <rect x="170" y="115" width="32" height="32" fill="var(--bg-sunk)" opacity="0.5" />
      <rect x="210" y="115" width="32" height="32" fill="var(--bg-sunk)" opacity="0.5" />
      <rect x="170" y="155" width="32" height="32" fill="var(--bg-sunk)" opacity="0.5" />
      <rect x="210" y="155" width="32" height="32" fill="var(--bg-sunk)" opacity="0.5" />
      {/* Scaffolding poles (horizontal + vertical) */}
      <g stroke={accent} strokeWidth="1.2" opacity="0.9">
        <line x1="160" x2="270" y1="105" y2="105" />
        <line x1="160" x2="265" y1="145" y2="145" />
        <line x1="160" x2="265" y1="185" y2="185" />
        <line x1="165" x2="165" y1="100" y2="195" />
        <line x1="200" x2="200" y1="100" y2="195" />
        <line x1="240" x2="240" y1="100" y2="195" />
        <line x1="265" x2="265" y1="100" y2="195" />
      </g>
      {/* Diagonal scaffolding brace */}
      <line x1="165" x2="200" y1="145" y2="105" stroke={accent} strokeWidth="1" opacity="0.7" />
      <line x1="240" x2="265" y1="105" y2="145" stroke={accent} strokeWidth="1" opacity="0.7" />
    </g>
  );
}

// TONBRIDGE BTL - row of 3 terraced houses
function _terracedRow() {
  return (
    <g stroke={ink} strokeWidth="1.4" fill="none" strokeLinejoin="round">
      {[
        { x: 40,  w: 110 },
        { x: 145, w: 110 },
        { x: 250, w: 110 },
      ].map((b, i) => (
        <g key={i}>
          {/* Pitched roof */}
          <path d={`M${b.x - 4} 95 L${b.x + b.w/2} 50 L${b.x + b.w + 4} 95 Z`}
                fill={i === 1 ? "var(--accent-tint)" : "var(--bg-elev)"} />
          {/* Body */}
          <rect x={b.x} y="95" width={b.w} height="100" fill="var(--bg-elev)" />
          {/* Chimney */}
          <rect x={b.x + b.w - 32} y="62" width="14" height="20" fill="var(--bg-sunk)" />
          {/* Upper windows */}
          <rect x={b.x + 12}        y="108" width="26" height="26" fill="var(--bg-sunk)" />
          <rect x={b.x + b.w - 38}  y="108" width="26" height="26" fill="var(--bg-sunk)" />
          {/* Door */}
          <rect x={b.x + b.w/2 - 13} y="148" width="26" height="47" fill="var(--bg-sunk)" />
          {/* Number plate */}
          <rect x={b.x + b.w/2 - 8} y="142" width="16" height="5" fill={accent} />
        </g>
      ))}
    </g>
  );
}

// MAIDSTONE BUSINESS - light commercial / trade unit with roller door
function _tradeUnit() {
  return (
    <g stroke={ink} strokeWidth="1.4" fill="none" strokeLinejoin="round">
      {/* Body */}
      <rect x="40" y="100" width="320" height="95" fill="var(--bg-elev)" />
      {/* Pitched warehouse roof */}
      <path d="M36 102 L200 65 L364 102 Z" fill="var(--accent-tint)" />
      {/* Roof beam line */}
      <line x1="36" x2="364" y1="102" y2="102" />
      {/* Office portion (left) */}
      <rect x="50" y="115" width="120" height="80" fill="var(--bg-sunk)" />
      <rect x="60"  y="125" width="30" height="22" fill="var(--bg-elev)" />
      <rect x="100" y="125" width="30" height="22" fill="var(--bg-elev)" />
      <rect x="140" y="125" width="22" height="22" fill="var(--bg-elev)" />
      {/* Office door */}
      <rect x="100" y="160" width="22" height="35" fill="var(--bg-elev)" />
      {/* Roller doors (right) */}
      {[185, 250, 315].map((x, i) => (
        <g key={i}>
          <rect x={x} y="125" width="50" height="70" fill="var(--bg-sunk)" />
          {/* Roller bars */}
          {[133, 145, 157, 169, 181].map(y => (
            <line key={y} x1={x} x2={x + 50} y1={y} y2={y} strokeWidth="0.8" opacity="0.5" />
          ))}
          {/* Handle */}
          <line x1={x + 22} x2={x + 28} y1="189" y2="189" strokeWidth="2" />
        </g>
      ))}
      {/* Signage band */}
      <rect x="50" y="100" width="120" height="11" fill={accent} opacity="0.85" />
    </g>
  );
}

// DOVER BOUTIQUE HOTEL - taller building, many windows, awning entrance
function _boutiqueHotel() {
  return (
    <g stroke={ink} strokeWidth="1.4" fill="none" strokeLinejoin="round">
      {/* Body */}
      <rect x="80" y="35" width="240" height="160" fill="var(--bg-elev)" />
      {/* Roof line + cornice */}
      <line x1="76" x2="324" y1="35" y2="35" />
      <line x1="80" x2="320" y1="45" y2="45" opacity="0.4" />
      {/* Hotel-name band */}
      <rect x="80" y="48" width="240" height="14" fill={accent} opacity="0.85" />
      {/* 4 floors × 6 windows */}
      {[72, 102, 132, 162].map((y, fi) => (
        <g key={fi}>
          {[92, 128, 164, 200, 236, 272].map((x, i) => {
            const lit = (fi === 0 && (i === 1 || i === 4)) || (fi === 2 && i === 3);
            return (
              <g key={i}>
                <rect x={x} y={y} width="26" height="22"
                  fill={lit ? litWindow : "var(--bg-sunk)"}
                  opacity={lit ? 0.8 : 1} />
                <line x1={x + 13} x2={x + 13} y1={y} y2={y + 22} strokeWidth="0.8" opacity="0.7" />
              </g>
            );
          })}
        </g>
      ))}
      {/* Entrance - awning + double door */}
      <path d="M170 178 L250 178 L240 192 L180 192 Z" fill="var(--accent-tint)" stroke={accent} />
      <rect x="186" y="178" width="48" height="17" fill="var(--bg-sunk)" />
      <line x1="210" x2="210" y1="178" y2="195" strokeWidth="1" />
    </g>
  );
}

// Generic mixed-use commercial - fallback / used for redeemed
function _genericBuilding() {
  return (
    <g stroke={ink} strokeWidth="1.4" fill="none" strokeLinejoin="round">
      <rect x="60" y="80" width="280" height="115" fill="var(--bg-elev)" />
      <line x1="60" x2="340" y1="120" y2="120" />
      <line x1="60" x2="340" y1="158" y2="158" />
      {[75, 115, 155, 195, 235, 275, 315].map((x, i) => (
        <g key={i}>
          <rect x={x} y="92" width="20" height="22" fill="var(--bg-sunk)" />
          <rect x={x} y="128" width="20" height="22" fill="var(--bg-sunk)" />
        </g>
      ))}
      {[70, 145, 220, 295].map((x, i) => (
        <rect key={i} x={x} y="168" width="50" height="27" fill="var(--accent-tint)" stroke={accent} strokeWidth="1" />
      ))}
    </g>
  );
}

// ────────────────────────────────────────────────────────────────
// Dispatch maps
// ────────────────────────────────────────────────────────────────

const ID_TO_ILLUSTRATION = {
  // Open opportunities
  "CX-2618-K": _retailParade,    // Ashford Retail Parade
  "CX-2619-R": _coastalHouse,    // Sandgate Coastal Residence
  "CX-2620-K": _modernOffice,    // Rochester Office Acquisition
  "CX-2621-K": _mixedUseCorner,  // Margate Mixed-Use Acquisition
  "CX-2622-R": _refurbSemi,      // Hythe Residential Refurb
  "CX-2623-R": _terracedRow,     // Tonbridge BTL Capital Raise
  "CX-2624-B": _tradeUnit,       // Maidstone Trading Business Loan
  "CX-2625-K": _boutiqueHotel,   // Dover Coastal Hotel Refinance

  // Active facilities
  "CX-2604-K": _mixedUseCorner,  // Sevenoaks Mixed-Use Refinance
  "CX-2598-K": _modernOffice,    // Tunbridge Wells Office Acquisition
  "CX-2581-R": _coastalHouse,    // Whitstable Residential Auction
  "CX-2572-D": _tradeUnit,       // Maidstone Light Industrial
  "CX-2540-K": _terracedRow,     // Canterbury HMO Conversion
  "CX-2511-R": _refurbSemi,      // Folkestone Residential Refurb

  // Redeemed (just in case anything queries by id)
  "CX-2488-K": _tradeUnit,
  "CX-2452-R": _refurbSemi,
  "CX-2411-K": _modernOffice,
  "CX-2382-K": _mixedUseCorner,
  "CX-2340-R": _coastalHouse,
  "CX-2295-K": _retailParade,
  "CX-2241-R": _terracedRow,
  "CX-2198-K": _retailParade,
};

const CATEGORY_TO_ILLUSTRATION = {
  "Residential bridging": _coastalHouse,
  "Commercial bridging":  _modernOffice,
  "Business loan":        _tradeUnit,
  Residential:            _coastalHouse,
  Commercial:             _modernOffice,
  Business:               _tradeUnit,
};

Object.assign(window, { PropIllustration });
