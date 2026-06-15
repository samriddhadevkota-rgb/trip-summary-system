import { motion } from "framer-motion"

// ── Layout ─────────────────────────────────────────────────────────────────

export function PageLayout({ children }) {
  return (
    <div style={{ marginLeft: "var(--sidebar-width)", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 28px" }}>
        {children}
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  )
}

// ── Card ───────────────────────────────────────────────────────────────────

export function Card({ children, style = {}, hoverable = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      whileHover={hoverable ? { y: -2, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" } : {}}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: 20,
        ...style
      }}>
      {children}
    </motion.div>
  )
}

// ── Stat Card ──────────────────────────────────────────────────────────────

export function StatCard({ label, value, icon: Icon, color = "var(--accent)", trend }) {
  return (
    <Card hoverable style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{label}</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)" }}>{value}</p>
          {trend && <p style={{ fontSize: 12, color: trend > 0 ? "var(--success)" : "var(--danger)", marginTop: 4 }}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% this month
          </p>}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${color}20`,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </Card>
  )
}

// ── Button ─────────────────────────────────────────────────────────────────

export function Button({ children, onClick, variant = "primary", size = "md", icon: Icon, disabled = false, style = {} }) {
  const variants = {
    primary: { background: "var(--accent)", color: "white", border: "none" },
    secondary: { background: "var(--bg-hover)", color: "var(--text-primary)", border: "1px solid var(--border)" },
    danger: { background: "transparent", color: "var(--danger)", border: "1px solid var(--danger)" },
    ghost: { background: "transparent", color: "var(--text-secondary)", border: "none" },
    success: { background: "var(--success)", color: "white", border: "none" },
  }
  const sizes = {
    sm: { padding: "6px 12px", fontSize: 12 },
    md: { padding: "9px 16px", fontSize: 13 },
    lg: { padding: "12px 24px", fontSize: 15 },
  }
  return (
    <motion.button
      whileHover={{ opacity: 0.9, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        borderRadius: 8, fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1, transition: "all 0.15s",
        ...variants[variant], ...sizes[size], ...style
      }}>
      {Icon && <Icon size={14} />}
      {children}
    </motion.button>
  )
}

// ── Badge ──────────────────────────────────────────────────────────────────

export function Badge({ children, color = "var(--accent)" }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      background: `${color}20`, color,
      border: `1px solid ${color}40`
    }}>{children}</span>
  )
}

// ── Table ──────────────────────────────────────────────────────────────────

export function Table({ columns, data, emptyMessage = "No data yet" }) {
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      {data.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>{columns.map(col => <th key={col.key}>{col.label}</th>)}</tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  {columns.map(col => (
                    <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

// ── Empty State ────────────────────────────────────────────────────────────

export function EmptyState({ message, icon = "📭" }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{message}</p>
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────

export function Skeleton({ width = "100%", height = 20, style = {} }) {
  return <div className="skeleton" style={{ width, height, ...style }} />
}

export function SkeletonCard() {
  return (
    <Card>
      <Skeleton height={14} width="40%" style={{ marginBottom: 12 }} />
      <Skeleton height={32} width="60%" style={{ marginBottom: 8 }} />
      <Skeleton height={12} width="30%" />
    </Card>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        <Skeleton height={12} width="80%" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 16 }}>
          <Skeleton height={12} width="20%" />
          <Skeleton height={12} width="30%" />
          <Skeleton height={12} width="25%" />
          <Skeleton height={12} width="15%" />
        </div>
      ))}
    </Card>
  )
}

// ── Input ──────────────────────────────────────────────────────────────────

export function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>{label}</label>}
      <input {...props} />
    </div>
  )
}

export function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>{label}</label>}
      <select {...props}>{children}</select>
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────────────────────────

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 20
      }}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", padding: 24, width: "100%", maxWidth: 480,
          boxShadow: "var(--shadow-lg)"
        }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", color: "var(--text-muted)", fontSize: 20, cursor: "pointer" }}>×</button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}

// ── Search ─────────────────────────────────────────────────────────────────

export function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div style={{ position: "relative", maxWidth: 300 }}>
      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14 }}>🔍</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ paddingLeft: 36 }} />
    </div>
  )
}

// ── Divider ────────────────────────────────────────────────────────────────

export function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      {label && <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{label}</span>}
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  )
}
