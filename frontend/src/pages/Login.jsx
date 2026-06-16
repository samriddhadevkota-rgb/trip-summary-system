import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { Leaf, ArrowRight } from "lucide-react"
import FuelScene from "../components/FuelScene"
import TripLoadingAnimation from "../components/TripLoadingAnimation"

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const oauthError = searchParams.get("error")
  const oauthMessages = {
    google_denied: "You cancelled Google login.",
    no_code: "Google login failed — no code returned.",
    token_exchange_failed: "Could not verify your Google account.",
  }

  const handleLogin = () => {
    setError(""); setLoading(true)
    const formData = new URLSearchParams()
    formData.append("username", username)
    formData.append("password", password)
    fetch(`${API}/login`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: formData.toString() })
      .then(r => r.json())
      .then(data => {
        setLoading(false)
        if (data.access_token) { localStorage.setItem("token", data.access_token); navigate("/dashboard") }
        else setError("Wrong username or password.")
      })
      .catch(() => { setLoading(false); setError("Server unreachable.") })
  }

  const handleGoogle = () => {
    setError(""); setLoading(true)
    fetch(`${API}/auth/google/login`)
      .then(r => r.json())
      .then(data => { setLoading(false); if (data.auth_url) window.location.href = data.auth_url; else setError("Google login failed.") })
      .catch(() => { setLoading(false); setError("Server unreachable.") })
  }

  return (
    <TripLoadingAnimation loading={false}>
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
            Fuel &amp; Freight<br />
            <span className="gold-text">Management</span>
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 380, marginBottom: 8 }}>
            Streamline your operations, generate professional invoices, and track deliveries — all in one place.
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

      {/* Right panel */}
      <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
        style={{ width: 480, display: "flex", alignItems: "center", justifyContent: "center", padding: 40, background: "var(--bg-secondary)", borderLeft: "1px solid var(--border)" }}>
        <div style={{ width: "100%", maxWidth: 360 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>Welcome back</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>Sign in to your account to continue</p>

          {(error || oauthError) && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: "rgba(229,72,77,0.1)", border: "1px solid rgba(229,72,77,0.3)", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "#e5484d" }}>
              {error || oauthMessages[oauthError] || "Login failed."}
            </motion.div>
          )}

          {/* Google Button */}
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleGoogle} disabled={loading}
            style={{ width: "100%", padding: "11px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500, color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20, transition: "all 0.15s" }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </motion.button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>or continue with password</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter username" />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Enter password" />
          </div>

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleLogin} disabled={loading}
            style={{ width: "100%", padding: "12px", background: "var(--gradient-premium)", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#06120c", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 24px rgba(13,150,104,0.35)" }}>
            {loading ? "Signing in..." : <><span>Sign In</span><ArrowRight size={16} /></>}
          </motion.button>

          <p style={{ textAlign: "center", marginTop: 14, fontSize: 13 }}>
            <span style={{ color: "var(--text-muted)", cursor: "pointer" }} onClick={() => navigate("/forgot-password")}>Forgot password?</span>
          </p>
          <p style={{ textAlign: "center", marginTop: 8, fontSize: 13, color: "var(--text-muted)" }}>
            No account?{" "}
            <span style={{ color: "var(--accent-bright)", cursor: "pointer", fontWeight: 500 }} onClick={() => navigate("/register")}>Create one</span>
          </p>
        </div>
      </motion.div>
    </div>
    </TripLoadingAnimation>
  )
}
