import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import { Leaf, Search, FileText, Download, ArrowLeft, Mail, CheckCircle, Truck } from "lucide-react"
import { Link } from "react-router-dom"

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

function PortalDocument({ doc, idx }) {
  const download = async () => {
    try {
      const r = await fetch(`${API}/documents/${doc.id}/download`)
      if (!r.ok) throw new Error()
      const blob = await r.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url; a.download = doc.filename || `document-${doc.id}.pdf`
      a.click(); URL.revokeObjectURL(url)
    } catch { alert("Download failed — please contact support.") }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06 }}
      style={{
        background: "#111a16", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 14,
        padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(16,185,129,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FileText size={19} color="#10b981" />
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: 14, color: "#ecfdf5", marginBottom: 3 }}>{doc.filename || `Document #${doc.id}`}</p>
          <p style={{ fontSize: 12, color: "#6b7280" }}>
            {doc.created_at ? new Date(doc.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
            {doc.doc_type && <span style={{ marginLeft: 10, background: "rgba(16,185,129,0.1)", color: "#10b981", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{doc.doc_type}</span>}
          </p>
        </div>
      </div>
      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={download}
        style={{ display: "flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg,#10b981,#059669)", color: "white", border: "none", borderRadius: 9, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
        <Download size={14} /> Download
      </motion.button>
    </motion.div>
  )
}

export default function CustomerPortal() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState("")

  const { data, isLoading, error } = useQuery({
    queryKey: ["portal", submitted],
    queryFn: () => fetch(`${API}/portal/documents?email=${encodeURIComponent(submitted)}`).then(r => r.json()),
    enabled: !!submitted,
    retry: false
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email.trim()) setSubmitted(email.trim())
  }

  const docs = Array.isArray(data) ? data : []
  const customer = data?.customer || null

  return (
    <div style={{ minHeight: "100vh", background: "#060a09", color: "#ecfdf5", fontFamily: "'Inter',sans-serif" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid rgba(16,185,129,0.1)", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Leaf size={17} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#ecfdf5", letterSpacing: "-0.02em" }}>TripSync</span>
        </Link>
        <Link to="/login" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
          <ArrowLeft size={14} /> Admin Login
        </Link>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "60px 24px" }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", marginBottom: 48 }}>
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.1))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: "1px solid rgba(16,185,129,0.25)" }}>
            <Truck size={28} color="#10b981" />
          </motion.div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 10 }}>
            Customer <span style={{ color: "#10b981" }}>Portal</span>
          </h1>
          <p style={{ color: "#6b7280", fontSize: 15, lineHeight: 1.6 }}>
            Enter your email address to access your trip documents and delivery summaries.
          </p>
        </motion.div>

        {/* Email lookup form */}
        <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          style={{ background: "#111a16", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 16, padding: 28, marginBottom: 32 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280", marginBottom: 10 }}>
            Your Email Address
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Mail size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#4b5563", pointerEvents: "none" }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@company.com"
                style={{ paddingLeft: 40, width: "100%", background: "#0d1410", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "11px 14px 11px 40px", fontSize: 14, color: "#ecfdf5", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
            <motion.button type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#10b981,#059669)", color: "white", border: "none", borderRadius: 10, padding: "0 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
              <Search size={14} /> Look Up
            </motion.button>
          </div>
        </motion.form>

        {/* Results */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: "center", padding: "48px 0", color: "#6b7280" }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                style={{ width: 36, height: 36, border: "3px solid rgba(16,185,129,0.2)", borderTopColor: "#10b981", borderRadius: "50%", margin: "0 auto 14px" }} />
              <p style={{ fontSize: 14 }}>Looking up your account...</p>
            </motion.div>
          )}

          {!isLoading && error && (
            <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: 20, textAlign: "center", color: "#f87171" }}>
              <p style={{ fontWeight: 600, marginBottom: 4 }}>Something went wrong</p>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>Please check your email address and try again.</p>
            </motion.div>
          )}

          {!isLoading && submitted && !error && docs.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: "#111a16", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
              <FileText size={40} style={{ margin: "0 auto 14px", display: "block", color: "#374151" }} />
              <p style={{ fontWeight: 600, fontSize: 15, color: "#9ca3af", marginBottom: 6 }}>No documents found</p>
              <p style={{ fontSize: 13, color: "#4b5563" }}>No documents are linked to <strong style={{ color: "#6b7280" }}>{submitted}</strong>. Please contact your account manager.</p>
            </motion.div>
          )}

          {!isLoading && docs.length > 0 && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <CheckCircle size={16} color="#10b981" />
                <span style={{ fontSize: 13, color: "#10b981", fontWeight: 600 }}>Found {docs.length} document{docs.length !== 1 ? "s" : ""} for {submitted}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {docs.map((doc, i) => <PortalDocument key={doc.id} doc={doc} idx={i} />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "40px 24px", borderTop: "1px solid rgba(16,185,129,0.07)", marginTop: 60, color: "#374151", fontSize: 13 }}>
        <span>Powered by <span style={{ color: "#10b981", fontWeight: 600 }}>TripSync</span> — Fuel & Delivery Management</span>
      </div>
    </div>
  )
}
