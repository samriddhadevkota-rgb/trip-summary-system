import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Leaf, UserPlus } from "lucide-react"
import FuelScene from "../components/FuelScene"

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = () => {
    setError(""); setLoading(true)
    fetch(API + "/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      .then(r => r.json())
      .then(data => {
        setLoading(false)
        if (data.id || data.username) navigate("/login")
        else setError(data.detail || "Registration failed.")
      })
      .catch(() => { setLoading(false); setError("Server unreachable.") })
  }

  return (
    <div style={{ width: "100%", minHeight: "100vh", display: "flex", background: "var(--bg-primary)" }}>
      {/* Left panel — premium mesh background + fuel scene */}
      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
        className="mesh-bg"
        style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px", position: "relative", overflow: "hidden" }}>

        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
            <div style={{ width: 44, height: 44, background: "var(--gradient-premium)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 30px rgba(13,150,104,0.45)" }}>
              <Leaf size={22} color="#06120c" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: "white" }}>TripSync</span>
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 800, color: "white", lineHeight: 1.2, marginBottom: 16 }}>
            Join the future of<br />
            <span className="gold-text">Fleet Management</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 380, marginBottom: 8 }}>
            Create your account and start tracking trips, generating invoices, and growing your business today.
          </p>
          <div style={{ display: "flex", gap: 24, marginTop: 32 }}>
            {[["500+", "Trips Tracked"], ["99%", "Uptime"], ["3x", "Faster Billing"]].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "white" }}>{v}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "absolute", right: -20, bottom: -20, opacity: 0.95, zIndex: 1 }}>
          <FuelScene />
        </div>
      </motion.div>

      {/* Right panel — form */}
      <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
        style={{ width: 480, display: "flex", alignItems: "center", justifyContent: "center", padding: 40, background: "var(--bg-secondary)", borderLeft: "1px solid var(--border)" }}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>Get started</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>Create an account to access TripSync</p>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ background: "rgba(229,72,77,0.1)", border: "1px solid rgba(229,72,77,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#e5484d" }}>
              {error}
            </motion.div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Username</label>
            <input placeholder="Choose a username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Password</label>
            <input type="password" placeholder="Create a password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === "Enter" && handleRegister()} />
          </div>

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleRegister} disabled={loading}
            style={{ width: "100%", padding: "12px", background: "var(--gradient-premium)", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#06120c", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 24px rgba(13,150,104,0.35)" }}>
            {loading ? "Creating account..." : <><UserPlus size={16} /><span>Create Account</span></>}
          </motion.button>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <span style={{ color: "var(--accent-bright)", cursor: "pointer", fontWeight: 500 }} onClick={() => navigate("/login")}>Sign in</span>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
