import { useNavigate, useLocation } from "react-router-dom"

const links = [
  { path: "/dashboard", label: "Trips" },
  { path: "/customers", label: "Customers" },
  { path: "/vendors", label: "Vendors" },
  { path: "/products", label: "Products" },
  { path: "/fees", label: "Fees" },
  { path: "/taxes", label: "Taxes" },
  { path: "/configurations", label: "Configurations" },
  { path: "/templates", label: "Templates" },
  { path: "/documents", label: "Documents" },
  { path: "/email-settings", label: "Email" },
]

function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  return (
    <div>
      <div style={{ backgroundColor: "#4f46e5", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "white", margin: 0, fontSize: "20px" }}>Trip Summary System</h1>
        <button onClick={handleLogout}
          style={{ padding: "7px 14px", backgroundColor: "#dc2626", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Logout
        </button>
      </div>
      <div style={{ backgroundColor: "#3730a3", padding: "8px 20px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {links.map(link => (
          <button key={link.path} onClick={() => navigate(link.path)}
            style={{
              padding: "6px 12px",
              backgroundColor: location.pathname === link.path ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: location.pathname === link.path ? "bold" : "normal"
            }}>
            {link.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default NavBar
