import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { Leaf, Lock, CheckCircle, AlertCircle } from "lucide-react"

const API = "http://localhost:8000"

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  const submit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError("Passwords don't match."); return }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return }
    setError(""); setLoading(true)
    try {
      const r = await fetch(`${API}/reset-password?token=${encodeURIComponent(token)}&new_password=${encodeURIComponent(password)}`, { method: "POST" })
      const data = await r.json()
      if (r.ok) setDone(true)
      else setError(data.detail || "Reset failed. The link may have expired.")
    } catch {
      setError("Server unreachable.")
    }
    setLoading(false)
  }

  if (!token) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", padding: 24 }}>
        <div style={{ textAlign: "center" }}>
          <AlertCircle size={40} color="#ef4444" style={{ margin: "0 auto 16px", display: "block" }} />
          <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>Invalid reset link.</p>
          <button onClick={() => navigate("/forgot-password")}
            style={{ background: "var(--accent)", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer" }}>
            Request new link
          </button>
        </div>
      </div>
    )
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

        {done ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "16px 0" }}>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.4 }}
              style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle size={28} color="#10b981" />
            </motion.div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Password updated!</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>Your password has been changed. Sign in with your new password.</p>
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => navigate("/login")}
              style={{ width: "100%", padding: "11px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 9, color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Go to Login
            </motion.button>
          </motion.div>
        ) : (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Set new password</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 28 }}>Choose a strong password (minimum 8 characters).</p>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#ef4444" }}>
                {error}
              </div>
            )}

            <form onSubmit={submit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>New password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} placeholder="Minimum 8 characters" style={{ paddingLeft: 38 }} />
                </div>
              </div>
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Confirm password</label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required placeholder="Repeat your new password" style={{ paddingLeft: 38, borderColor: confirm && confirm !== password ? "var(--danger)" : undefined }} />
                </div>
                {confirm && confirm !== password && <p style={{ fontSize: 11, color: "var(--danger)", marginTop: 4 }}>Passwords don't match</p>}
              </div>
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#10b981,#059669)", border: "none", borderRadius: 9, color: "white", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Saving..." : "Reset password"}
              </motion.button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
