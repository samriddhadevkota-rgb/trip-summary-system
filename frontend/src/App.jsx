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
    </BrowserRouter>
  )
}

export default App
