import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Leaf, Check, ShieldCheck, ArrowLeft } from "lucide-react"

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

const FEATURES = [
  "Unlimited trips & documents",
  "Automated daily scheduling",
  "5 team members",
  "Priority email support",
  "Custom branding on invoices",
  "Full analytics dashboard",
]

export default function Checkout() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const token = localStorage.getItem("token")

  const subscribe = async () => {
    if (!token) { navigate("/login?next=/checkout"); return }
    setError(""); setLoading(true)
    try {
      const r = await fetch(`${API}/billing/create-checkout-session?plan=premium`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      })
      const data = await r.json()
      if (r.ok && data.url) window.location.href = data.url
      else setError(data.detail || "Couldn't start checkout. Try again.")
    } catch {
      setError("Server unreachable.")
    }
    setLoading(false)
  }

  return (
    <div className="mesh-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: 460 }}>

        <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", marginBottom: 20 }}>
          <ArrowLeft size={14} /> Back to home
        </button>

        <div className="glass premium-card" style={{ borderRadius: "var(--radius)", padding: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, background: "var(--gradient-gold)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Leaf size={20} color="#1a1306" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>TripSync Premium</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Billed monthly · cancel anytime</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 24 }}>
            <span className="gold-text" style={{ fontSize: 48, fontWeight: 800 }}>$20</span>
            <span style={{ color: "var(--text-muted)", fontSize: 15 }}>/month</span>
          </div>

          <ul style={{ listStyle: "none", marginBottom: 28 }}>
            {FEATURES.map(f => (
              <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, fontSize: 14, color: "var(--text-secondary)" }}>
                <Check size={15} color="var(--accent-bright)" /> {f}
              </li>
            ))}
          </ul>

          {error && (
            <div style={{ background: "rgba(229,72,77,0.1)", border: "1px solid rgba(229,72,77,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#e5484d" }}>
              {error}
            </div>
          )}

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={subscribe} disabled={loading}
            style={{ width: "100%", padding: "13px", background: "var(--gradient-gold)", border: "none", borderRadius: 9, cursor: loading ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 700, color: "#1a1306", opacity: loading ? 0.7 : 1, boxShadow: "0 8px 28px rgba(212,175,106,0.3)" }}>
            {loading ? "Redirecting to checkout..." : token ? "Subscribe with card" : "Sign in to subscribe"}
          </motion.button>

          <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, fontSize: 12, color: "var(--text-muted)" }}>
            <ShieldCheck size={13} /> Secure payment powered by Stripe
          </p>
        </div>
      </motion.div>
    </div>
  )
}
