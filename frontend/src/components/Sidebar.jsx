import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Users, Truck, Package, DollarSign,
  Percent, Settings, FileText, Mail, LogOut, Leaf,
  ChevronRight, FolderOpen, X, Menu, ExternalLink
} from "lucide-react"

const nav = [
  { section: "Main" },
  { path: "/dashboard",      label: "Dashboard",      icon: LayoutDashboard },
  { section: "Operations" },
  { path: "/customers",      label: "Customers",      icon: Users },
  { path: "/vendors",        label: "Vendors",        icon: Truck },
  { path: "/products",       label: "Products",       icon: Package },
  { section: "Finance" },
  { path: "/fees",           label: "Fees",           icon: DollarSign },
  { path: "/taxes",          label: "Taxes",          icon: Percent },
  { path: "/configurations", label: "Configurations", icon: Settings },
  { section: "Documents" },
  { path: "/templates",      label: "Templates",      icon: FileText },
  { path: "/documents",      label: "Documents",      icon: FolderOpen },
  { section: "Settings" },
  { path: "/email-settings", label: "Email",          icon: Mail },
  { section: "Portal" },
  { path: "/portal",         label: "Customer Portal", icon: ExternalLink },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setOpen(false) }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const logout = () => { localStorage.removeItem("token"); navigate("/login") }

  const SidebarContent = () => (
    <div style={{
      width: "var(--sidebar-width)", minHeight: "100vh",
      background: "var(--bg-secondary)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column"
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: "linear-gradient(135deg, #10b981, #059669)",
            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(16,185,129,0.4)"
          }}>
            <Leaf size={17} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>TripSync</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>Fuel & Freight</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 10px", overflowY: "auto" }}>
        {nav.map((item, i) => {
          if (item.section) return (
            <div key={i} style={{
              fontSize: 10, fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.12em", color: "var(--text-muted)",
              padding: "14px 10px 5px"
            }}>{item.section}</div>
          )
          const Icon = item.icon
          const active = pathname === item.path
          return (
            <motion.button key={item.path}
              whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(item.path)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "9px 10px", borderRadius: 9, marginBottom: 2,
                background: active ? "var(--accent-glow)" : "transparent",
                border: active ? "1px solid rgba(16,185,129,0.25)" : "1px solid transparent",
                color: active ? "var(--accent)" : "var(--text-secondary)",
                fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer",
                transition: "all 0.15s",
              }}>
              <Icon size={15} />
              {item.label}
              {active && <ChevronRight size={13} style={{ marginLeft: "auto", opacity: 0.7 }} />}
            </motion.button>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "10px", borderTop: "1px solid var(--border)" }}>
        <motion.button whileHover={{ x: 3 }} onClick={logout}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "9px 10px", borderRadius: 9,
            background: "transparent", border: "1px solid transparent",
            color: "var(--danger)", fontSize: 13, cursor: "pointer", transition: "all 0.15s",
          }}>
          <LogOut size={15} /> Logout
        </motion.button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button className="mobile-menu-btn" onClick={() => setOpen(true)}>
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div className="sidebar-overlay open"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)} />
        )}
      </AnimatePresence>

      {/* Desktop sidebar — fixed */}
      <div className="sidebar" style={{
        position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100,
      }} data-open={open}>
        <style>{`
          @media (min-width: 769px) { .sidebar { transform: none !important; } }
          @media (max-width: 768px) {
            .sidebar { transform: ${open ? 'translateX(0)' : 'translateX(-100%)'} !important; transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); }
          }
        `}</style>
        {open && (
          <button onClick={() => setOpen(false)} style={{
            position: "absolute", top: 14, right: -44, width: 36, height: 36,
            background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-primary)", cursor: "pointer", zIndex: 101
          }}><X size={16} /></button>
        )}
        <SidebarContent />
      </div>

      {/* Desktop spacer */}
      <div style={{ width: "var(--sidebar-width)", flexShrink: 0 }} className="sidebar-spacer">
        <style>{`@media (max-width: 768px) { .sidebar-spacer { display: none; } }`}</style>
      </div>
    </>
  )
}
