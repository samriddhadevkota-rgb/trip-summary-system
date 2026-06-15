import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { Search } from "lucide-react"

// ── Animated counter ────────────────────────────────────────────────────────
export function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!target) return
    const numeric = parseFloat(String(target).replace(/[^0-9.]/g, ""))
    if (isNaN(numeric)) return
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * numeric))
      if (progress < 1) requestAnimationFrame(step)
      else setValue(numeric)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return value
}

// ── Layout ───────────────────────────────────────────────────────────────────
export function PageLayout({ children }) {
  return (
    <div className="page-layout" style={{
      flex: 1, minHeight: "100vh", background: "var(--bg-primary)",
      padding: "32px 28px"
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>{children}</div>
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <motion.div className="page-header" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 3, letterSpacing: "-0.03em" }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, hoverable = false, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={hoverable ? { y: -3, boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.15)" } : {}}
      style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", padding: 20, ...style
      }}>
      {children}
    </motion.div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, color = "var(--accent)", trend, delay = 0 }) {
  const isMonetary = String(value).startsWith("$")
  const raw = String(value).replace(/[$,]/g, "")
  const counted = useCountUp(parseFloat(raw) || 0, 1000)
  const display = isMonetary ? "$" + counted.toLocaleString() : (isNaN(parseFloat(raw)) ? value : counted.toLocaleString())

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(16,185,129,0.1)" }}
      style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", padding: 20, cursor: "default"
      }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: 10 }}>{label}</p>
          <motion.p key={display} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 30, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.04em" }}>
            {display}
          </motion.p>
          {trend !== undefined && (
            <p style={{ fontSize: 12, color: trend > 0 ? "var(--success)" : "var(--danger)", marginTop: 6, fontWeight: 600 }}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% this month
            </p>
          )}
        </div>
        <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 400 }}
          style={{ width: 46, height: 46, borderRadius: 13, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={21} color={color} />
        </motion.div>
      </div>
    </motion.div>
  )
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Button({ children, onClick, variant = "primary", size = "md", icon: Icon, disabled = false, style = {} }) {
  const variants = {
    primary:   { background: "linear-gradient(135deg,#10b981,#059669)", color: "white", border: "none", boxShadow: "0 4px 16px rgba(16,185,129,0.3)" },
    secondary: { background: "var(--bg-hover)", color: "var(--text-primary)", border: "1px solid var(--border)" },
    danger:    { background: "transparent", color: "var(--danger)", border: "1px solid rgba(239,68,68,0.4)" },
    ghost:     { background: "transparent", color: "var(--text-secondary)", border: "none" },
    success:   { background: "linear-gradient(135deg,#10b981,#059669)", color: "white", border: "none" },
    outline:   { background: "transparent", color: "var(--accent)", border: "1px solid var(--accent)" },
  }
  const sizes = {
    sm: { padding: "5px 11px", fontSize: 12, borderRadius: 7 },
    md: { padding: "9px 16px", fontSize: 13, borderRadius: 9 },
    lg: { padding: "12px 24px", fontSize: 15, borderRadius: 10 },
  }
  return (
    <motion.button whileHover={{ scale: disabled ? 1 : 1.02, opacity: disabled ? 0.5 : 0.93 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={disabled ? undefined : onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.15s",
        opacity: disabled ? 0.5 : 1, ...variants[variant], ...sizes[size], ...style
      }}>
      {Icon && <Icon size={size === "sm" ? 13 : 14} />}
      {children}
    </motion.button>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ children, color = "var(--accent)" }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "3px 10px",
      borderRadius: 20, fontSize: 11, fontWeight: 700,
      background: `${color}18`, color, border: `1px solid ${color}30`,
      whiteSpace: "nowrap"
    }}>{children}</span>
  )
}

// ── Input / Select ────────────────────────────────────────────────────────────
export function Input({ label, error, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{label}</label>}
      <input {...props} style={{ ...(error ? { borderColor: "var(--danger)" } : {}), ...props.style }} />
      {error && <p style={{ fontSize: 11, color: "var(--danger)", marginTop: 4 }}>{error}</p>}
    </div>
  )
}

export function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{label}</label>}
      <select {...props}>{children}</select>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 480 }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose() }
    if (open) window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <motion.div className="modal-content" initial={{ scale: 0.93, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.93, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: 26, width: "100%", maxWidth: width,
              boxShadow: "var(--shadow-lg)"
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>{title}</h2>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose}
                style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-muted)", width: 28, height: 28, borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>×</motion.button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Search Bar ────────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div style={{ position: "relative", minWidth: 220 }}>
      <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ paddingLeft: 34, background: "var(--bg-secondary)" }} />
    </div>
  )
}

// ── Skeleton loaders ──────────────────────────────────────────────────────────
export function Skeleton({ width = "100%", height = 18, style = {} }) {
  return <div className="skeleton" style={{ width, height, ...style }} />
}

export function SkeletonCard() {
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20 }}>
      <Skeleton height={11} width="45%" style={{ marginBottom: 14 }} />
      <Skeleton height={34} width="65%" style={{ marginBottom: 10 }} />
      <Skeleton height={11} width="30%" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ padding: "15px 18px", borderBottom: "1px solid var(--border)", display: "flex", gap: 16, alignItems: "center" }}>
          <Skeleton height={11} width="8%" />
          <Skeleton height={11} width="22%" />
          <Skeleton height={11} width="28%" />
          <Skeleton height={11} width="16%" />
          <Skeleton height={24} width="14%" style={{ borderRadius: 20 }} />
        </div>
      ))}
    </div>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────
export function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      {label && <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>}
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: "center", padding: "64px 32px" }}>
      {Icon && (
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          style={{ width: 60, height: 60, borderRadius: 18, background: "var(--accent-glow)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Icon size={28} color="var(--accent)" style={{ opacity: 0.6 }} />
        </motion.div>
      )}
      <p style={{ fontWeight: 700, fontSize: 15, color: "var(--text-secondary)", marginBottom: 6 }}>{title}</p>
      {desc && <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: action ? 20 : 0 }}>{desc}</p>}
      {action}
    </motion.div>
  )
}
