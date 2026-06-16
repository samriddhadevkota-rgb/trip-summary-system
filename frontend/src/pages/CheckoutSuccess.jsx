import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"

export default function CheckoutSuccess() {
  const navigate = useNavigate()
  return (
    <div className="mesh-bg" style={{ width: "100%", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="glass" style={{ textAlign: "center", padding: 44, borderRadius: "var(--radius)", maxWidth: 380 }}>
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.5 }}
          style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--accent-glow2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px" }}>
          <CheckCircle size={30} color="var(--accent-bright)" />
        </motion.div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, color: "var(--text-primary)" }}>Welcome to Premium!</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
          Your subscription is active. All premium features are unlocked on your account.
        </p>
        <motion.button whileHover={{ scale: 1.02 }} onClick={() => navigate("/dashboard")}
          style={{ width: "100%", padding: "12px", background: "var(--gradient-premium)", border: "none", borderRadius: 9, color: "#06120c", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Go to Dashboard
        </motion.button>
      </motion.div>
    </div>
  )
}
