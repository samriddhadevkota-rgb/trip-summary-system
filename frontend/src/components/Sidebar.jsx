import { useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import {
  LayoutDashboard, Users, Truck, Package, DollarSign,
  Percent, Settings, FileText, Mail, LogOut, Fuel,
  ChevronRight, BookTemplate, FolderOpen
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
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const logout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        width: "var(--sidebar-width)",
        minHeight: "100vh",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0, top: 0, bottom: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div style={{
        padding: "20px 20px 16px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: "10px"
      }}>
        <div style={{
          width: 36, height: 36,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 20px rgba(99,102,241,0.4)"
        }}>
          <Fuel size={18} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>TripSync</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Fuel & Freight</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        {nav.map((item, i) => {
          if (item.section) return (
            <div key={i} style={{
              fontSize: 10, fontWeight: 600, textTransform: "uppercase",
              letterSpacing: "0.1em", color: "var(--text-muted)",
              padding: "16px 10px 6px"
            }}>{item.section}</div>
          )

          const Icon = item.icon
          const active = pathname === item.path

          return (
            <motion.button
              key={item.path}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "9px 10px", borderRadius: 8, marginBottom: 2,
                background: active ? "var(--accent-glow)" : "transparent",
                border: active ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
                color: active ? "var(--accent)" : "var(--text-secondary)",
                fontSize: 13, fontWeight: active ? 600 : 400,
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              <Icon size={16} />
              {item.label}
              {active && <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.6 }} />}
            </motion.button>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)" }}>
        <motion.button
          whileHover={{ x: 2 }}
          onClick={logout}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "9px 10px", borderRadius: 8,
            background: "transparent", border: "1px solid transparent",
            color: "var(--danger)", fontSize: 13, cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <LogOut size={16} />
          Logout
        </motion.button>
      </div>
    </motion.div>
  )
}
