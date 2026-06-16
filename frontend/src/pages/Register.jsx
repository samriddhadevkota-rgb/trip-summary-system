import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Leaf, UserPlus } from "lucide-react"

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
    <div className="mesh-bg" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="glass"
        style={{ width: "100%", maxWidth: 380, borderRadius: "var(--radius)", padding: 32, boxShadow: "var(--shadow-lg)" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 40, height: 40, background: "var(--gradient-premium)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(13,150,104,0.4)" }}>
            <Leaf size={20} color="#06120c" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>TripSync</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Create your account</div>
          </div>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>Get started</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 24 }}>Create an account to access TripSync</p>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ background: "rgba(229,72,77,0.1)", border: "1px solid rgba(229,72,77,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#e5484d" }}>
            {error}
          </motion.div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Username</label>
          <input placeholder="Choose a username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
        </div>
        <div style={{ marginBottom: 12 }}>
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
      </motion.div>
    </div>
  )
}
