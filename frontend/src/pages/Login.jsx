import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

const API = "http://localhost:8000"

function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Show error from OAuth callback redirect
  const oauthError = searchParams.get("error")
  const oauthMessages = {
    google_denied: "You cancelled the Google login.",
    no_code: "Google login failed — no code returned.",
    token_exchange_failed: "Could not verify your Google account. Please try again.",
  }

  const handleLogin = () => {
    setError("")
    setLoading(true)
    const formData = new URLSearchParams()
    formData.append("username", username)
    formData.append("password", password)
    fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false)
        if (data.access_token) {
          localStorage.setItem("token", data.access_token)
          navigate("/dashboard")
        } else {
          setError("Wrong username or password!")
        }
      })
      .catch(() => {
        setLoading(false)
        setError("Login failed — server not reachable.")
      })
  }

  const handleGoogleLogin = () => {
    setError("")
    setLoading(true)
    // Generate state for CSRF protection
    const state = crypto.randomUUID()
    sessionStorage.setItem("oauth_state", state)

    fetch(`${API}/auth/google/login`)
      .then(res => res.json())
      .then(data => {
        setLoading(false)
        if (data.auth_url) {
          window.location.href = data.auth_url
        } else {
          setError("Could not start Google login. Check server configuration.")
        }
      })
      .catch(() => {
        setLoading(false)
        setError("Could not reach server. Make sure backend is running.")
      })
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "80px" }}>
      <div style={{
        backgroundColor: "rgba(255,255,255,0.92)",
        padding: "40px",
        borderRadius: "12px",
        border: "2px solid #4f46e5",
        width: "320px",
        boxShadow: "0 8px 32px rgba(79,70,229,0.15)"
      }}>
        <h1 style={{ color: "#4f46e5", textAlign: "center", fontSize: "22px" }}>⛽ Trip Summary System</h1>
        <h2 style={{ textAlign: "center", color: "#4f46e5", fontSize: "18px", marginBottom: "20px" }}>Login</h2>

        {(error || oauthError) && (
          <p style={{ color: "red", textAlign: "center", fontSize: "13px", marginBottom: "10px" }}>
            {error || oauthMessages[oauthError] || "Login failed."}
          </p>
        )}

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "11px", marginBottom: "20px",
            backgroundColor: "white", color: "#333",
            border: "1px solid #ddd", borderRadius: "6px",
            cursor: "pointer", fontSize: "14px", fontWeight: "500",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
          }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {loading ? "Redirecting..." : "Continue with Google"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }} />
          <span style={{ color: "#999", fontSize: "12px" }}>or sign in with password</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#ddd" }} />
        </div>

        <p style={{ margin: "0 0 5px", fontSize: "14px" }}>Username:</p>
        <input
          style={{ width: "100%", padding: "8px", marginBottom: "15px", boxSizing: "border-box", borderRadius: "5px", border: "1px solid #4f46e5" }}
          value={username} onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
        />
        <p style={{ margin: "0 0 5px", fontSize: "14px" }}>Password:</p>
        <input
          style={{ width: "100%", padding: "8px", marginBottom: "20px", boxSizing: "border-box", borderRadius: "5px", border: "1px solid #4f46e5" }}
          type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: "100%", padding: "10px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{ textAlign: "center", marginTop: "15px", fontSize: "13px" }}>
          Don't have account?{" "}
          <span style={{ color: "#4f46e5", cursor: "pointer" }} onClick={() => navigate("/register")}>
            Register here
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login
