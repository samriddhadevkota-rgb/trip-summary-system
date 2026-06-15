import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Leaf, Mail, ArrowLeft, CheckCircle } from "lucide-react"

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const submit = async (e) => {
    e.preventDefault()
    setError(""); setLoading(true)
    try {
      const r = await fetch(`${API}/forgot-password?email=${encodeURIComponent(email)}`, { method: "POST" })
      if (r.ok) setSent(true)
      else setError("Something went wrong. Try again.")
    } catch {
      setError("Server unreachable.")
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: 420, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: 36 }}>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Leaf size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>TripSync</span>
        </div>

        {sent ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "16px 0" }}>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.4 }}
              style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle size={28} color="#10b981" />
            </motion.div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Check your email</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              If <strong style={{ color: "var(--text-secondary)" }}>{email}</strong> has an account, we sent a reset link. Check your inbox (and spam folder).
            </p>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/login")}
              style={{ width: "100%", padding: "11px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 9, color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Back to Login
            </motion.button>
          </motion.div>
        ) : (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Forgot password?</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>
              Enter your email and we'll send you a reset link valid for 1 hour.
            </p>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#ef4444" }}>
                {error}
              </div>
            )}

            <form onSubmit={submit}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Email address</label>
              <div style={{ position: "relative", marginBottom: 20 }}>
                <Mail size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="you@example.com" style={{ paddingLeft: 38 }} />
              </div>
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 9, color: "white", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginBottom: 16 }}>
                {loading ? "Sending..." : "Send reset link"}
              </motion.button>
            </form>

            <button onClick={() => navigate("/login")}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "transparent", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", padding: 8 }}>
              <ArrowLeft size={14} /> Back to login
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}
