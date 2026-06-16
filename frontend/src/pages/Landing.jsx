import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Leaf, BarChart3, FileText, Users, Zap, Shield, Clock, Check, ArrowRight } from "lucide-react"
import FuelScene from "../components/FuelScene"

const FEATURES = [
  { icon: BarChart3, title: "Real-time Analytics", desc: "Revenue trends, trip stats, and customer insights on a beautiful dashboard.", color: "#34d399" },
  { icon: FileText, title: "PDF Generation", desc: "Professional invoices, delivery tickets, and freight invoices auto-generated daily.", color: "#d4af6a" },
  { icon: Users, title: "Customer Management", desc: "Full CRM with customer profiles, ship-to addresses, and history.", color: "#5b9bd5" },
  { icon: Zap, title: "Automated Scheduling", desc: "Documents auto-generate every day at 8 AM and email to clients.", color: "#34d399" },
  { icon: Shield, title: "Secure & Reliable", desc: "JWT auth, Google OAuth, encrypted token storage, and enterprise security.", color: "#e5484d" },
  { icon: Clock, title: "Trip Tracking", desc: "Track every trip — driver, origin, destination, gallons, revenue, and status.", color: "#d4af6a" },
]

const STATS = [["500+", "Trips Tracked"], ["99.9%", "Uptime SLA"], ["3x", "Faster Billing"], ["$0", "Setup Cost"]]

const PLANS = [
  { name: "Starter", price: "$0", desc: "Perfect to get started", features: ["Up to 50 trips/month", "Basic PDF generation", "1 user", "Email support"], cta: "Get Started Free", highlight: false, action: "register" },
  { name: "Premium", price: "$20", desc: "For growing businesses", features: ["Unlimited trips", "Automated scheduling", "5 users", "Priority support", "Custom branding", "Analytics dashboard"], cta: "Get Premium", highlight: true, action: "checkout" },
  { name: "Enterprise", price: "Custom", desc: "For large operations", features: ["Everything in Premium", "Multi-tenant", "API access", "Dedicated support", "Custom integrations", "SLA guarantee"], cta: "Contact Sales", highlight: false, action: "register" },
]

export default function Landing() {
  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const goToPlan = (plan) => {
    if (plan.action === "checkout") navigate("/checkout")
    else navigate("/register")
  }

  return (
    <div className="mesh-bg" style={{ minHeight: "100vh", overflowX: "hidden", width: "100%" }}>

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, borderBottom: "1px solid var(--border)", background: "rgba(7,9,11,0.82)", backdropFilter: "blur(14px)", padding: "0 40px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "var(--gradient-premium)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(13,150,104,0.4)" }}>
            <Leaf size={16} color="#06120c" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>TripSync</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {token
            ? <button onClick={() => navigate("/dashboard")} style={{ padding: "8px 20px", background: "var(--accent)", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Go to Dashboard</button>
            : <>
              <button onClick={() => navigate("/login")} style={{ padding: "8px 16px", background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Sign In</button>
              <button onClick={() => navigate("/register")} style={{ padding: "8px 20px", background: "var(--accent)", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Get Started Free</button>
            </>
          }
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: "relative", padding: "150px 20px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 40, alignItems: "center" }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", background: "var(--gold-glow)", border: "1px solid rgba(212,175,106,0.3)", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "var(--gold-bright)", marginBottom: 24 }}>
              <Zap size={12} /> Now with Google OAuth & Auto-PDF Generation
            </div>

            <h1 className="font-display" style={{ fontSize: "clamp(38px, 5.5vw, 68px)", fontWeight: 600, fontStyle: "italic", lineHeight: 1.08, letterSpacing: "-0.02em", marginBottom: 22, color: "var(--text-primary)" }}>
              Fuel &amp; Freight<br />
              <span className="gold-text">Management</span>
              {" "}Made Simple
            </h1>

            <p style={{ fontSize: 17, color: "var(--text-secondary)", maxWidth: 480, marginBottom: 36, lineHeight: 1.7 }}>
              The premium platform for fuel distributors and freight companies. Track trips, generate professional documents, and grow your business.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/register")}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 28px", background: "var(--gradient-premium)", color: "#06120c", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 700, boxShadow: "0 8px 32px rgba(13,150,104,0.4)" }}>
                Start for Free <ArrowRight size={16} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/login")}
                style={{ padding: "14px 28px", background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
                View Demo
              </motion.button>
            </div>

            <div style={{ display: "flex", gap: 40, marginTop: 56, flexWrap: "wrap" }}>
              {STATS.map(([v, l]) => (
                <div key={l}>
                  <div className="serif-numeral" style={{ fontSize: 30, color: "var(--text-primary)" }}>{v}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }}
            style={{ display: "flex", justifyContent: "center" }}>
            <FuelScene />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "60px 40px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 className="font-display" style={{ fontSize: 38, fontWeight: 600, fontStyle: "italic", marginBottom: 12, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>Everything you need</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>Built for fuel distributors and freight companies who demand the best.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} viewport={{ once: true }}
              className="premium-card spotlight" style={{ padding: 24 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${f.color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <f.icon size={22} color={f.color} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "60px 40px 80px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 className="font-display" style={{ fontSize: 38, fontWeight: 600, fontStyle: "italic", marginBottom: 12, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>Simple, transparent pricing</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>No hidden fees. Cancel anytime.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {PLANS.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className={plan.highlight ? "gradient-border spotlight" : "spotlight"}
              style={{
                background: plan.highlight ? "linear-gradient(160deg, rgba(212,175,106,0.10), rgba(13,150,104,0.06))" : "var(--bg-card)",
                border: `1px solid ${plan.highlight ? "transparent" : "var(--border)"}`,
                borderRadius: 16, padding: 28, position: "relative",
                boxShadow: plan.highlight ? "0 20px 60px rgba(212,175,106,0.12), 0 20px 50px rgba(0,0,0,0.4)" : "none",
              }}>
              {plan.highlight && <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "var(--gradient-gold)", color: "#1a1306", fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 20 }}>MOST POPULAR</div>}
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>{plan.name}</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{plan.desc}</p>
              </div>
              <div style={{ marginBottom: 24 }}>
                <span className="serif-numeral" style={{ fontSize: 44, color: "var(--text-primary)" }}>{plan.price}</span>
                {plan.price !== "Custom" && <span style={{ color: "var(--text-muted)", fontSize: 14 }}>/month</span>}
              </div>
              <ul style={{ listStyle: "none", marginBottom: 28 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 14, color: "var(--text-secondary)" }}>
                    <Check size={15} color={plan.highlight ? "var(--gold-bright)" : "var(--success)"} /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => goToPlan(plan)}
                style={{ width: "100%", padding: "11px", background: plan.highlight ? "var(--gradient-gold)" : "var(--bg-hover)", color: plan.highlight ? "#1a1306" : "var(--text-primary)", border: `1px solid ${plan.highlight ? "transparent" : "var(--border)"}`, borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "60px 40px 100px", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          style={{ maxWidth: 600, margin: "0 auto", background: "linear-gradient(160deg, rgba(13,150,104,0.12), rgba(212,175,106,0.06))", border: "1px solid var(--border-light)", borderRadius: 20, padding: "60px 40px" }}>
          <h2 className="font-display" style={{ fontSize: 36, fontWeight: 600, fontStyle: "italic", marginBottom: 16, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>Ready to get started?</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 32 }}>Join businesses using TripSync to streamline their operations.</p>
          <button onClick={() => navigate("/register")}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", background: "var(--gradient-premium)", color: "#06120c", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 16, fontWeight: 700, boxShadow: "0 8px 32px rgba(13,150,104,0.4)" }}>
            Start for Free <ArrowRight size={16} />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "24px 40px", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>© 2026 TripSync. Built with FastAPI + React.</p>
      </footer>
    </div>
  )
}
