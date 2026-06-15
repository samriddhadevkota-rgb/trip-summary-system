import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Landing from "./pages/Landing"
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
import OAuthCallback from "./pages/OAuthCallback"

function Protected({ children }) {
  const token = localStorage.getItem("token")
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="/dashboard"      element={<Protected><Dashboard /></Protected>} />
        <Route path="/customers"      element={<Protected><Customers /></Protected>} />
        <Route path="/vendors"        element={<Protected><Vendors /></Protected>} />
        <Route path="/products"       element={<Protected><Products /></Protected>} />
        <Route path="/fees"           element={<Protected><Fees /></Protected>} />
        <Route path="/taxes"          element={<Protected><Taxes /></Protected>} />
        <Route path="/documents"      element={<Protected><Documents /></Protected>} />
        <Route path="/templates"      element={<Protected><Templates /></Protected>} />
        <Route path="/email-settings" element={<Protected><EmailSettings /></Protected>} />
        <Route path="/configurations" element={<Protected><Configurations /></Protected>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
