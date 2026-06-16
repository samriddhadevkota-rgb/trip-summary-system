import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { Leaf } from "lucide-react"
import { PHASE, useTruckSequence } from "../hooks/useTruckSequence"

const STATION_X = 480
const ENTER_X = -220
const EXIT_X = 760

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const handler = (e) => setReduced(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return reduced
}

function Wheel({ cx, cy, spinning }) {
  return (
    <g transform={`translate(${cx},${cy})`}>
      <circle r="17" fill="#0c0f0d" stroke="#2f3a33" strokeWidth="2" />
      <g style={{ animation: spinning ? "wheelSpin 0.6s linear infinite" : "none" }}>
        {[0, 60, 120].map(deg => (
          <line key={deg} x1="0" y1="-12" x2="0" y2="12" stroke="#5b6b60" strokeWidth="2.5"
            transform={`rotate(${deg})`} />
        ))}
      </g>
      <circle r="5" fill="#aab8af" />
    </g>
  )
}

function Truck({ moving, fueling }) {
  return (
    <g>
      {/* headlight cone */}
      {moving && (
        <ellipse cx="46" cy="-28" rx="60" ry="16" fill="url(#headlightGrad)" opacity="0.55" />
      )}
      {/* exhaust puffs */}
      {moving && [0, 1, 2].map(i => (
        <circle key={i} cx="-98" cy="-58" r="5" fill="#aab8af"
          style={{ animation: `smokePuff 1.1s ease-out ${i * 0.35}s infinite` }} />
      ))}
      {/* cargo box */}
      <rect x="-92" y="-72" width="84" height="62" rx="5" fill="url(#truckBodyGrad)" />
      <rect x="-92" y="-72" width="84" height="62" rx="5" fill="none" stroke="#a9803f" strokeOpacity="0.4" />
      {/* cab */}
      <path d="M-8,-10 L-8,-46 L14,-46 L32,-18 L32,-10 Z" fill="#0d9668" />
      <path d="M-2,-42 L10,-42 L24,-20 L-2,-20 Z" fill="#06120c" opacity="0.5" />
      {/* fuel inlet marker */}
      <circle cx="-46" cy="-72" r="4" fill={fueling ? "#f0cf8e" : "#5b6b60"} />
      {/* wheels */}
      <Wheel cx="-62" cy="-4" spinning={moving} />
      <Wheel cx="10" cy="-4" spinning={moving} />
    </g>
  )
}

function PetrolStation({ glowing }) {
  return (
    <g>
      <ellipse cx="650" cy="230" rx="120" ry="90" fill="var(--gold)" opacity={glowing ? 0.16 : 0.07}
        style={{ transition: "opacity 0.6s" }} />
      <rect x="600" y="170" width="160" height="14" rx="3" fill="#161b18" stroke="#2f3a33" />
      <rect x="612" y="184" width="10" height="116" fill="#161b18" />
      <rect x="738" y="184" width="10" height="116" fill="#161b18" />
      <rect x="660" y="220" width="32" height="80" rx="4" fill="#111513" stroke="#2f3a33" strokeWidth="1.5" />
      <rect x="666" y="228" width="20" height="14" rx="2" fill="#34d399" opacity="0.6" />
      <circle cx="676" cy="180" r="10" fill="var(--gold-bright)" opacity={glowing ? 0.9 : 0.4}
        style={{ transition: "opacity 0.6s", filter: "blur(1px)" }} />
    </g>
  )
}

function FuelHose({ active, fueling }) {
  const path = "M662,234 C610,234 560,250 514,288"
  return (
    <g>
      <motion.path d={path} fill="none" stroke="#5b6b60" strokeWidth="3" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: active ? 1 : 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }} />
      {fueling && [0, 1, 2, 3].map(i => (
        <circle key={i} r="3.5" fill="#f0cf8e">
          <animateMotion path={path} dur="1s" begin={`${i * 0.25}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </g>
  )
}

function StarsAndClouds() {
  const stars = useMemo(() => Array.from({ length: 22 }, (_, i) => ({
    cx: (i * 47 + 13) % 1000,
    cy: (i * 29 + 7) % 220,
    r: 0.8 + (i % 3) * 0.5,
    delay: (i % 5) * 0.4,
  })), [])
  return (
    <g>
      {stars.map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#f3f6f3"
          style={{ animation: `twinkle 3s ease-in-out ${s.delay}s infinite` }} />
      ))}
      <g style={{ animation: "cloudDrift 14s linear infinite alternate" }}>
        <ellipse cx="160" cy="90" rx="70" ry="20" fill="#aab8af" opacity="0.06" />
        <ellipse cx="780" cy="60" rx="90" ry="24" fill="#aab8af" opacity="0.05" />
      </g>
    </g>
  )
}

function TruckScene({ phase, fuelPercent }) {
  const moving = phase === PHASE.ENTER || phase === PHASE.EXIT
  const fueling = phase === PHASE.FUEL || phase === PHASE.HOLD
  const truckX = phase === PHASE.EXIT ? EXIT_X : phase === PHASE.ENTER ? STATION_X : STATION_X

  return (
    <motion.div
      style={{ width: "100%", maxWidth: 720 }}
      animate={{ x: phase === PHASE.ENTER ? [0, -6, 0] : 0 }}
      transition={{ duration: 1.7 }}
    >
      <svg viewBox="0 0 1000 380" width="100%" height="auto" role="img" aria-label="Truck driving to a fuel station">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c0f0d" />
            <stop offset="100%" stopColor="#07090b" />
          </linearGradient>
          <linearGradient id="truckBodyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f0cf8e" />
            <stop offset="100%" stopColor="#d4af6a" />
          </linearGradient>
          <radialGradient id="headlightGrad" cx="0%" cy="50%" r="100%">
            <stop offset="0%" stopColor="#fffbe6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fffbe6" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="1000" height="380" fill="url(#skyGrad)" />
        <StarsAndClouds />

        {/* road */}
        <rect x="0" y="300" width="1000" height="80" fill="#0c0f0d" />
        <rect x="0" y="300" width="1000" height="3" fill="#232b26" />
        <line x1="-40" y1="338" x2="1040" y2="338" stroke="var(--gold)" strokeOpacity="0.5" strokeWidth="3" strokeDasharray="30 24"
          style={{ animation: moving ? "roadScroll 0.5s linear infinite" : "none" }} />

        <PetrolStation glowing={fueling} />
        <FuelHose active={fueling} fueling={phase === PHASE.FUEL} />

        <motion.g
          initial={{ x: ENTER_X }}
          animate={{ x: truckX }}
          transition={
            phase === PHASE.ENTER ? { duration: 1.7, ease: [0.25, 0.46, 0.45, 0.94] } :
            phase === PHASE.EXIT ? { duration: 1.5, ease: [0.55, 0, 0.85, 0.35] } :
            { type: "spring", stiffness: 300, damping: 14 }
          }
          style={{ transformOrigin: "0px 300px" }}
        >
          <motion.g transform="translate(0,300)"
            animate={fueling ? { y: [0, -3, 0] } : { y: 0 }}
            transition={fueling ? { duration: 2.2, repeat: Infinity, ease: "easeInOut" } : {}}
          >
            <Truck moving={moving} fueling={phase === PHASE.FUEL} />
          </motion.g>
        </motion.g>
      </svg>
    </motion.div>
  )
}

function SimpleLoader() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        style={{ width: 36, height: 36, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%" }} />
      <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading TripSync...</p>
    </div>
  )
}

export default function TripLoadingAnimation({ loading, skip = false, children }) {
  const reducedMotion = usePrefersReducedMotion()
  const { phase, fuelPercent } = useTruckSequence(skip ? false : loading, { reducedMotion: reducedMotion || skip })
  const showOverlay = !skip && phase !== PHASE.DONE
  const fueling = phase === PHASE.FUEL || phase === PHASE.HOLD

  if (skip) return children

  const overlay = (
    <AnimatePresence>
      {showOverlay && (
        <motion.div
          key="trip-loading-overlay"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{
            position: "fixed", inset: 0, zIndex: 2000, background: "var(--bg-primary)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 28, padding: 20,
          }}
        >
          {!reducedMotion && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--gradient-premium)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Leaf size={16} color="#06120c" />
              </div>
              <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>TripSync</span>
            </div>
          )}

          {reducedMotion ? <SimpleLoader /> : <TruckScene phase={phase} fuelPercent={fuelPercent} />}

          {!reducedMotion && (
            <AnimatePresence>
              {fueling && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  style={{ width: "100%", maxWidth: 280, textAlign: "center" }}
                >
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, letterSpacing: "0.04em" }}>
                    {phase === PHASE.FUEL ? "FUELING UP" : "ALMOST READY"}
                  </div>
                  <div style={{ height: 6, borderRadius: 6, background: "var(--bg-card)", overflow: "hidden", border: "1px solid var(--border)" }}>
                    <motion.div
                      style={{ height: "100%", background: "var(--gradient-gold)", borderRadius: 6 }}
                      animate={{ width: `${phase === PHASE.HOLD ? 100 : fuelPercent}%` }}
                      transition={{ ease: "linear", duration: 0.1 }}
                    />
                  </div>
                  <div style={{ fontSize: 13, color: "var(--gold-bright)", marginTop: 8, fontWeight: 700 }}>
                    {Math.round(phase === PHASE.HOLD ? 100 : fuelPercent)}%
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {typeof document !== "undefined" ? createPortal(overlay, document.body) : overlay}

      <motion.div
        initial={false}
        animate={!showOverlay ? { opacity: 1, scale: 1, filter: "blur(0px)" } : { opacity: 0, scale: 0.97, filter: "blur(6px)" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ visibility: showOverlay ? "hidden" : "visible", width: "100%" }}
      >
        {children}
      </motion.div>
    </div>
  )
}
