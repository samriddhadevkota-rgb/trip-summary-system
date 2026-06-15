import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { Fuel, CheckCircle, XCircle } from "lucide-react"

export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState("Verifying your Google account...")
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const token = searchParams.get("token")
    const error = searchParams.get("error")

    if (error) {
      const messages = { google_denied: "You cancelled the Google login.", no_code: "Google did not return an authorization code.", token_exchange_failed: "Could not verify your Google account. Please try again." }
      setStatus(messages[error] || "Login failed. Please try again.")
      setIsError(true)
      setTimeout(() => navigate("/login"), 3000)
      return
    }

    if (token) {
      localStorage.setItem("token", token)
      setStatus("Login successful! Taking you to the dashboard...")
      setTimeout(() => navigate("/dashboard"), 1200)
    } else {
      setStatus("Something went wrong. Redirecting to login...")
      setIsError(true)
      setTimeout(() => navigate("/login"), 2000)
    }
  }, [searchParams, navigate])

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
        style={{ textAlign: "center", padding: 40, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", maxWidth: 340, boxShadow: "var(--shadow-lg)" }}>

        <div style={{ width: 52, height: 52, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 0 30px rgba(99,102,241,0.4)" }}>
          <Fuel size={24} color="white" />
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>TripSync</h2>

        {isError
          ? <XCircle size={32} color="var(--danger)" style={{ margin: "12px auto", display: "block" }} />
          : <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              style={{ width: 32, height: 32, border: "3px solid var(--accent-glow)", borderTop: "3px solid var(--accent)", borderRadius: "50%", margin: "12px auto" }} />}

        <p style={{ color: isError ? "var(--danger)" : "var(--text-secondary)", fontSize: 14, marginTop: 12 }}>{status}</p>
        {isError && <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 8 }}>Redirecting to login...</p>}
      </motion.div>
    </div>
  )
}
