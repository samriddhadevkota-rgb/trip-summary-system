import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleLogin = () => {
    setError("")
    const formData = new URLSearchParams()
    formData.append("username", username)
    formData.append("password", password)
    fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    })
    .then(res => res.json())
    .then(data => {
      if (data.access_token) {
        localStorage.setItem("token", data.access_token)
        navigate("/dashboard")
      } else {
        setError("Wrong username or password!")
      }
    })
    .catch(() => setError("Login failed!"))
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}>
      <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "10px", border: "2px solid #4f46e5", width: "300px" }}>
        <h1 style={{ color: "#4f46e5", textAlign: "center" }}>🚗 Trip Summary System</h1>
        <h2 style={{ textAlign: "center", color: "#4f46e5" }}>Login</h2>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        <p>Username:</p>
        <input style={{ width: "100%", padding: "8px", marginBottom: "15px", boxSizing: "border-box", borderRadius: "5px", border: "1px solid #4f46e5" }}
          value={username} onChange={e => setUsername(e.target.value)} />
        <p>Password:</p>
        <input style={{ width: "100%", padding: "8px", marginBottom: "15px", boxSizing: "border-box", borderRadius: "5px", border: "1px solid #4f46e5" }}
          type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button style={{ width: "100%", padding: "10px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}
          onClick={handleLogin}>Login</button>
        <p style={{ textAlign: "center", marginTop: "10px" }}>
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