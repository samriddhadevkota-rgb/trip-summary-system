import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Register() {
  const [regData, setRegData] = useState({ username: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  const handleRegister = () => {
    setError("")
    fetch("http://localhost:8000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(regData)
    })
    .then(res => res.json())
    .then(data => {
      if (data.id) {
        setMessage("Account created! Please login!")
        setTimeout(() => navigate("/login"), 2000)
      } else {
        setError("Registration failed! Username may already exist.")
      }
    })
    .catch(() => setError("Registration failed!"))
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}>
      <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "10px", border: "2px solid #4f46e5", width: "300px" }}>
        <h1 style={{ color: "#4f46e5", textAlign: "center" }}>🚗 Trip Summary System</h1>
        <h2 style={{ textAlign: "center", color: "#4f46e5" }}>Register</h2>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        {message && <p style={{ color: "green", textAlign: "center" }}>{message}</p>}
        <p>Username:</p>
        <input style={{ width: "100%", padding: "8px", marginBottom: "15px", boxSizing: "border-box", borderRadius: "5px", border: "1px solid #4f46e5" }}
          value={regData.username} onChange={e => setRegData({...regData, username: e.target.value})} />
        <p>Email:</p>
        <input style={{ width: "100%", padding: "8px", marginBottom: "15px", boxSizing: "border-box", borderRadius: "5px", border: "1px solid #4f46e5" }}
          value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})} />
        <p>Password:</p>
        <input style={{ width: "100%", padding: "8px", marginBottom: "15px", boxSizing: "border-box", borderRadius: "5px", border: "1px solid #4f46e5" }}
          type="password" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} />
        <button style={{ width: "100%", padding: "10px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}
          onClick={handleRegister}>Register</button>
        <p style={{ textAlign: "center", marginTop: "10px" }}>
          Already have account?{" "}
          <span style={{ color: "#4f46e5", cursor: "pointer" }} onClick={() => navigate("/login")}>
            Login here
          </span>
        </p>
      </div>
    </div>
  )
}

export default Register