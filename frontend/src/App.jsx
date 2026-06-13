import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Customers from "./pages/Customers"
import Vendors from "./pages/Vendors"
import Products from "./pages/Products"
import Fees from "./pages/Fees"
import Taxes from "./pages/Taxes"
import Documents from "./pages/Documents"
import Templates from "./pages/Templates"
import EmailSettings from "./pages/EmailSettings"
import Configurations from "./pages/Configurations"

function App() {
  const token = localStorage.getItem("token")

  return (
    <BrowserRouter>
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "550px", opacity: 0.05, zIndex: 0,
        pointerEvents: "none", userSelect: "none", lineHeight: 1
      }}>⛽</div>
      <div style={{ position: "relative", zIndex: 1 }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/customers" element={token ? <Customers /> : <Navigate to="/login" />} />
        <Route path="/vendors" element={token ? <Vendors /> : <Navigate to="/login" />} />
        <Route path="/products" element={token ? <Products /> : <Navigate to="/login" />} />
        <Route path="/fees" element={token ? <Fees /> : <Navigate to="/login" />} />
        <Route path="/taxes" element={token ? <Taxes /> : <Navigate to="/login" />} />
        <Route path="/documents" element={token ? <Documents /> : <Navigate to="/login" />} />
        <Route path="/templates" element={token ? <Templates /> : <Navigate to="/login" />} />
        <Route path="/email-settings" element={token ? <EmailSettings /> : <Navigate to="/login" />} />
        <Route path="/configurations" element={token ? <Configurations /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
