import { useState } from "react"

function App() {
  const [page, setPage] = useState("login")
  const [token, setToken] = useState("")
  const [trips, setTrips] = useState([])
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = () => {
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
        const tok = data.access_token
        setToken(tok)
        fetch("http://localhost:8000/trips", {
          method: "GET",
          headers: { 
            "Authorization": "Bearer " + tok,
            "Content-Type": "application/json"
          }
        })
        .then(res => res.json())
        .then(tripsData => {
          setTrips(tripsData)
          setPage("trips")
        })
      } else {
        setError("Wrong username or password!")
      }
    })
    .catch(() => setError("Login failed!"))
  }

  if (page === "login") return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}>
      <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "10px", border: "2px solid #4f46e5", width: "300px" }}>
        <h1 style={{ color: "#4f46e5", textAlign: "center" }}>🚗 Trip Summary System</h1>
        <h2 style={{ textAlign: "center", color: "#4f46e5" }}>Login</h2>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        <p style={{ marginBottom: "5px" }}>Username:</p>
        <input style={{ width: "100%", padding: "8px", marginBottom: "15px", boxSizing: "border-box", borderRadius: "5px", border: "1px solid #4f46e5" }}
          value={username} onChange={e => setUsername(e.target.value)} />
        <p style={{ marginBottom: "5px" }}>Password:</p>
        <input style={{ width: "100%", padding: "8px", marginBottom: "15px", boxSizing: "border-box", borderRadius: "5px", border: "1px solid #4f46e5" }}
          type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button style={{ width: "100%", padding: "10px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px" }}
          onClick={handleLogin}>Login</button>
      </div>
    </div>
  )

  return (
    <div style={{ padding: "20px", backgroundColor: "white", minHeight: "100vh" }}>
      <div style={{ backgroundColor: "#4f46e5", padding: "15px", borderRadius: "10px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "white", margin: 0 }}>🚗 Trip Summary System</h1>
        <button style={{ padding: "8px 15px", backgroundColor: "red", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
          onClick={() => { setToken(""); setTrips([]); setPage("login") }}>Logout</button>
      </div>

      <h2 style={{ color: "#4f46e5" }}>📋 All Trips</h2>
      <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#4f46e5", color: "white" }}>
            <th style={{ padding: "10px" }}>ID</th>
            <th style={{ padding: "10px" }}>Driver Name</th>
            <th style={{ padding: "10px" }}>Total Gallons</th>
            <th style={{ padding: "10px" }}>Total Stops</th>
            <th style={{ padding: "10px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {trips.map(trip => (
            <tr key={trip.id}>
              <td style={{ padding: "10px" }}>{trip.id}</td>
              <td style={{ padding: "10px" }}>{trip.driver_name}</td>
              <td style={{ padding: "10px" }}>{trip.total_gallons}</td>
              <td style={{ padding: "10px" }}>{trip.total_stops}</td>
              <td style={{ padding: "10px" }}>{trip.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App