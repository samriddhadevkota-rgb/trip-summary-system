import { useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
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
import CustomerPortal from "./pages/CustomerPortal"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import Checkout from "./pages/Checkout"
import CheckoutSuccess from "./pages/CheckoutSuccess"

function Protected({ children }) {
  const token = localStorage.getItem("token")
  return token ? children : <Navigate to="/login" />
}

const pageVariants = {
  initial: { opacity: 0, x: 16 },
  in:      { opacity: 1, x: 0 },
  out:     { opacity: 0, x: -12 },
}
const pageTransition = { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="in" exit="out"
        transition={pageTransition} style={{ width: "100%", minHeight: "100vh", display: "flex" }}>
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/portal" element={<CustomerPortal />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
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
      </motion.div>
    </AnimatePresence>
  )
}

function useSpotlightTracking() {
  useEffect(() => {
    const handler = (e) => {
      document.documentElement.style.setProperty("--mx", `${e.clientX}px`)
      document.documentElement.style.setProperty("--my", `${e.clientY}px`)
    }
    window.addEventListener("pointermove", handler)
    return () => window.removeEventListener("pointermove", handler)
  }, [])
}

export default function App() {
  useSpotlightTracking()
  return (
    <BrowserRouter>
      <div className="grain-overlay" />
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
