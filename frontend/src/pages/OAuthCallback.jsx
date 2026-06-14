import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState("Processing your Google login...")

  useEffect(() => {
    const token = searchParams.get("token")
    const error = searchParams.get("error")

    if (error) {
      const messages = {
        google_denied: "You cancelled the Google login.",
        no_code: "Google did not return an authorization code.",
        token_exchange_failed: "Failed to verify your Google account. Please try again.",
      }
      setStatus(messages[error] || "Login failed. Please try again.")
      setTimeout(() => navigate("/login"), 3000)
      return
    }

    if (token) {
      localStorage.setItem("token", token)
      setStatus("Login successful! Redirecting...")
      setTimeout(() => navigate("/dashboard"), 1000)
    } else {
      setStatus("Something went wrong. Redirecting to login...")
      setTimeout(() => navigate("/login"), 2000)
    }
  }, [searchParams, navigate])

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <div style={{ backgroundColor: "rgba(255,255,255,0.9)", padding: "40px", borderRadius: "10px", border: "2px solid #4f46e5", textAlign: "center", width: "320px" }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>⛽</div>
        <h2 style={{ color: "#4f46e5", marginBottom: "15px" }}>Trip Summary System</h2>
        <p style={{ color: "#555" }}>{status}</p>
        <div style={{ marginTop: "20px" }}>
          <div style={{ width: "40px", height: "4px", backgroundColor: "#4f46e5", borderRadius: "2px", margin: "0 auto", animation: "pulse 1s infinite" }} />
        </div>
      </div>
    </div>
  )
}

export default OAuthCallback
