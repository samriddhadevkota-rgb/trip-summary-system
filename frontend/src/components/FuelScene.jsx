import { motion } from "framer-motion"

export default function FuelScene() {
  return (
    <svg viewBox="0 0 420 420" width="100%" height="100%" style={{ maxWidth: 380 }}>
      <defs>
        <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#d4af6a" />
        </linearGradient>
        <radialGradient id="dropGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="55%" stopColor="#0d9668" />
          <stop offset="100%" stopColor="#065f43" />
        </radialGradient>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Ambient glow orbs */}
      <circle cx="80" cy="340" r="90" fill="#0d9668" opacity="0.08" style={{ animation: "floatSlow 7s ease-in-out infinite" }} />
      <circle cx="340" cy="90" r="70" fill="#d4af6a" opacity="0.07" style={{ animation: "floatSlow 9s ease-in-out infinite reverse" }} />

      {/* Route path */}
      <path d="M 40 320 Q 120 260 160 200 T 280 130 Q 330 100 380 60"
        fill="none" stroke="var(--border-light)" strokeWidth="3" strokeLinecap="round" />
      <path d="M 40 320 Q 120 260 160 200 T 280 130 Q 330 100 380 60"
        fill="none" stroke="url(#routeGrad)" strokeWidth="3" strokeLinecap="round"
        strokeDasharray="14 10" style={{ animation: "dashFlow 3.5s linear infinite" }} />

      {/* Stop markers */}
      <circle cx="40" cy="320" r="7" fill="#0d9668" />
      <circle cx="160" cy="200" r="5" fill="#aab8af" opacity="0.6" />
      <circle cx="380" cy="60" r="8" fill="#d4af6a" />

      {/* Moving truck dot along the path (native SVG animateMotion — works in Safari) */}
      <circle r="7" fill="#ecfdf5" filter="url(#softGlow)">
        <animateMotion
          path="M 40 320 Q 120 260 160 200 T 280 130 Q 330 100 380 60"
          dur="3.5s" repeatCount="indefinite" />
      </circle>

      {/* Fuel drop / gauge centerpiece */}
      <g transform="translate(210,230)">
        <motion.path
          d="M0,-55 C30,-15 48,15 48,40 C48,72 26,92 0,92 C-26,92 -48,72 -48,40 C-48,15 -30,-15 0,-55 Z"
          fill="url(#dropGrad)" filter="url(#softGlow)"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        <motion.path
          d="M0,-55 C30,-15 48,15 48,40 C48,72 26,92 0,92 C-26,92 -48,72 -48,40 C-48,15 -30,-15 0,-55 Z"
          fill="none" stroke="#f0cf8e" strokeWidth="1.5" opacity="0.4"
          animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <text x="0" y="14" textAnchor="middle" fontSize="30" fontWeight="800" fill="#06120c">⛽</text>
      </g>

      {/* Gauge needle pivot, bottom-right accent */}
      <g transform="translate(340,330)" opacity="0.9">
        <circle r="34" fill="none" stroke="var(--border-light)" strokeWidth="3" />
        <path d="M -24 8 A 26 26 0 0 1 24 8" fill="none" stroke="#d4af6a" strokeWidth="3" strokeLinecap="round" />
        <line x1="0" y1="0" x2="0" y2="-22" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round"
          style={{ transformOrigin: "0px 0px", animation: "gaugeSweep 3s ease-in-out infinite" }} />
        <circle r="3" fill="#ecfdf5" />
      </g>
    </svg>
  )
}
