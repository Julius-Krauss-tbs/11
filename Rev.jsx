export default function Rev({ size = 64, animate = true }) {
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 100 130"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <radialGradient id="skinGrad" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#fcd5a8" />
          <stop offset="100%" stopColor="#f5b880" />
        </radialGradient>
        <radialGradient id="overallGrad" cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#3b5bdb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </radialGradient>
        {animate && (
          <style>{`
            @keyframes rev-wave {
              0%,100% { transform: rotate(0deg); transform-origin: 22px 72px; }
              30%      { transform: rotate(-18deg); transform-origin: 22px 72px; }
              60%      { transform: rotate(10deg); transform-origin: 22px 72px; }
            }
            @keyframes rev-blink {
              0%,88%,100% { scaleY: 1; }
              92%         { transform: scaleY(0.1); }
            }
            @keyframes rev-float {
              0%,100% { transform: translateY(0); }
              50%     { transform: translateY(-2px); }
            }
            .rev-arm-l  { animation: rev-wave 2.8s ease-in-out infinite; }
            .rev-body-g { animation: rev-float 3s ease-in-out infinite; }
          `}</style>
        )}
      </defs>

      <g className="rev-body-g">

        {/* ── KAPPE ── */}
        <path d="M30 32 Q31 20 50 18 Q69 20 70 32 Z" fill="#1e3a8a"/>
        <path d="M26 33 Q28 30 74 30 Q76 33 26 33 Z" fill="#1e40af"/>
        {/* Kappe Schirm */}
        <path d="M26 33 Q18 34 17 37 Q22 37 26 33 Z" fill="#1e3a8a"/>
        {/* Kappe Logo */}
        <text x="44" y="28" fontSize="6" fontWeight="900" fill="#ef4444" textAnchor="middle">REV</text>

        {/* ── GESICHT ── */}
        <ellipse cx="50" cy="44" rx="19" ry="18" fill="url(#skinGrad)"/>
        {/* Ohren */}
        <ellipse cx="31" cy="44" rx="3.5" ry="4.5" fill="#f5b880"/>
        <ellipse cx="69" cy="44" rx="3.5" ry="4.5" fill="#f5b880"/>

        {/* Augen */}
        <ellipse cx="43" cy="41" rx="3.5" ry="3.8" fill="white"/>
        <ellipse cx="57" cy="41" rx="3.5" ry="3.8" fill="white"/>
        <circle cx="44" cy="42" r="2.2" fill="#3b2506"/>
        <circle cx="58" cy="42" r="2.2" fill="#3b2506"/>
        <circle cx="44.8" cy="41.2" r="0.8" fill="white"/>
        <circle cx="58.8" cy="41.2" r="0.8" fill="white"/>
        {/* Augenbrauen */}
        <path d="M40 37.5 Q43 36 46 37.5" fill="none" stroke="#7c4b00" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M54 37.5 Q57 36 60 37.5" fill="none" stroke="#7c4b00" strokeWidth="1.4" strokeLinecap="round"/>

        {/* Nase */}
        <ellipse cx="50" cy="46" rx="2" ry="1.5" fill="#e8a066" opacity="0.7"/>

        {/* Lächeln */}
        <path d="M43 51 Q50 56 57 51" fill="none" stroke="#c07040" strokeWidth="1.8" strokeLinecap="round"/>
        {/* Grübchen */}
        <circle cx="42" cy="51" r="1" fill="#e8956a" opacity="0.5"/>
        <circle cx="58" cy="51" r="1" fill="#e8956a" opacity="0.5"/>

        {/* Öl-Fleck auf Wange */}
        <ellipse cx="38" cy="48" rx="2.5" ry="1.5" fill="#1e293b" opacity="0.3" transform="rotate(-15 38 48)"/>

        {/* ── OVERALL / TORSO ── */}
        <path d="M28 65 Q26 70 27 88 L73 88 Q74 70 72 65 Q63 60 50 60 Q37 60 28 65 Z"
          fill="url(#overallGrad)" stroke="#1e40af" strokeWidth="0.5"/>
        {/* Overall-Reißverschluss */}
        <line x1="50" y1="61" x2="50" y2="87" stroke="#93c5fd" strokeWidth="1" strokeDasharray="2,2" opacity="0.5"/>
        {/* Overall-Taschen */}
        <rect x="32" y="72" width="10" height="8" rx="2" fill="#1e40af" stroke="#3b82f6" strokeWidth="0.8" opacity="0.7"/>
        <rect x="58" y="72" width="10" height="8" rx="2" fill="#1e40af" stroke="#3b82f6" strokeWidth="0.8" opacity="0.7"/>
        {/* Rotes Namensschild */}
        <rect x="36" y="64" width="14" height="5" rx="1.5" fill="#dc2626"/>
        <text x="43" y="68" fontSize="3.5" fontWeight="900" fill="white" textAnchor="middle">MECH</text>

        {/* ── HALS ── */}
        <rect x="45" y="58" width="10" height="5" rx="2" fill="#f5b880"/>

        {/* ── LINKER ARM (winkt mit Schraubenschlüssel) ── */}
        <g className="rev-arm-l">
          <path d="M28 67 Q16 70 12 78" fill="none" stroke="#1e40af" strokeWidth="9" strokeLinecap="round"/>
          <path d="M28 67 Q16 70 12 78" fill="none" stroke="#3b5bdb" strokeWidth="7" strokeLinecap="round"/>
          {/* Hand */}
          <circle cx="11" cy="79" r="4.5" fill="#f5b880"/>
          {/* Schraubenschlüssel */}
          <rect x="5" y="72" width="4" height="12" rx="1.5" fill="#71717a" transform="rotate(-15 7 78)"/>
          <ellipse cx="5.5" cy="72" rx="3" ry="2.5" fill="none" stroke="#71717a" strokeWidth="1.5" transform="rotate(-15 7 78)"/>
          <ellipse cx="9" cy="84" rx="3" ry="2.5" fill="none" stroke="#71717a" strokeWidth="1.5" transform="rotate(-15 7 78)"/>
        </g>

        {/* ── RECHTER ARM (locker zur Seite) ── */}
        <path d="M72 67 Q84 70 87 76" fill="none" stroke="#1e40af" strokeWidth="9" strokeLinecap="round"/>
        <path d="M72 67 Q84 70 87 76" fill="none" stroke="#3b5bdb" strokeWidth="7" strokeLinecap="round"/>
        <circle cx="88" cy="77" r="4.5" fill="#f5b880"/>
        {/* Daumen hoch */}
        <path d="M88 73 Q91 71 92 74" fill="none" stroke="#f5b880" strokeWidth="2.5" strokeLinecap="round"/>

        {/* ── GÜRTEL ── */}
        <rect x="27" y="86" width="46" height="5" rx="2" fill="#1e3a8a"/>
        <rect x="46" y="87" width="8" height="3" rx="1" fill="#f59e0b"/>

        {/* ── BEINE ── */}
        <path d="M36 91 Q34 105 35 116" fill="none" stroke="#1e3a8a" strokeWidth="13" strokeLinecap="round"/>
        <path d="M36 91 Q34 105 35 116" fill="none" stroke="#3b5bdb" strokeWidth="11" strokeLinecap="round"/>
        <path d="M64 91 Q66 105 65 116" fill="none" stroke="#1e3a8a" strokeWidth="13" strokeLinecap="round"/>
        <path d="M64 91 Q66 105 65 116" fill="none" stroke="#3b5bdb" strokeWidth="11" strokeLinecap="round"/>

        {/* Knie-Flicken */}
        <ellipse cx="35" cy="104" rx="5" ry="5.5" fill="#1e40af" stroke="#3b82f6" strokeWidth="0.8" opacity="0.6"/>
        <ellipse cx="65" cy="104" rx="5" ry="5.5" fill="#1e40af" stroke="#3b82f6" strokeWidth="0.8" opacity="0.6"/>

        {/* ── SCHUHE ── */}
        <path d="M29 114 Q27 122 32 124 L41 124 Q44 122 40 114 Z" fill="#1c1917" stroke="#44403c" strokeWidth="0.8"/>
        <path d="M59 114 Q57 122 62 124 L71 124 Q74 122 70 114 Z" fill="#1c1917" stroke="#44403c" strokeWidth="0.8"/>
        {/* Schuh-Streifen */}
        <line x1="30" y1="120" x2="40" y2="120" stroke="#ef4444" strokeWidth="1" opacity="0.7"/>
        <line x1="60" y1="120" x2="70" y2="120" stroke="#ef4444" strokeWidth="1" opacity="0.7"/>

      </g>
    </svg>
  );
}
