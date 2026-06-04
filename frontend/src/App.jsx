 import { useState, useEffect } from "react"

function App() {
  const [page, setPage] = useState("login")
  const [token, setToken] = useState(null)
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editTrip, setEditTrip] = useState(null)
  const [message, setMessage] = useState(null)

  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [registerData, setRegisterData] = useState({ username: "", email: "", password: "" })
  const [newTrip, setNewTrip] = useState({ driver_name: "", total_gallons: "", total_stops: "", status: "" })

  useEffect(() => { fetchTrips() }, [])

  const fetchTrips = (tok) => {
    setLoading(true)
    fetch("http://localhost:8000/trips", {
      headers: { Authorization: `Bearer ${tok}` }
    })
      .then(res => res.json())
      .then(data => { setTrips(data); setLoading(false) })
      .catch(() => { setError("Failed to fetch trips!"); setLoading(false) })
  }

  const handleLogin = () => {
    const formData = new URLSearchParams()
    formData.append("username", loginData.username)
    formData.append("password", loginData.password)
    fetch("http://localhost:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.access_token) {
          setToken(data.access_token)
          setPage("trips")
          fetchTrips(data.access_token)
        } else {
          setError("Invalid username or password!")
        }
      })
      .catch(() => setError("Login failed!"))
  }

  const handleRegister = () => {
    fetch("http://localhost:8000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setMessage("Account created! Please login!")
          setPage("login")
        } else {
          setError("Registration failed!")
        }
      })
      .catch(() => setError("Registration failed!"))
  }

  const createTrip = () => {
    fetch("http://localhost:8000/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...newTrip, total_gallons: parseFloat(newTrip.total_gallons), total_stops: parseInt(newTrip.total_stops) })
    })
      .then(() => { setNewTrip({ driver_name: "", total_gallons: "", total_stops: "", status: "" }); fetchTrips(token) })
  }

  const deleteTrip = (id) => {
    fetch(`http://localhost:8000/trips/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => fetchTrips(token))
  }

  const updateTrip = (id) => {
    fetch(`http://localhost:8000/trips/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...editTrip, total_gallons: parseFloat(editTrip.total_gallons), total_stops: parseInt(editTrip.total_stops) })
    }).then(() => { setEditTrip(null); fetchTrips(token) })
  }

  const handleLogout = () => {
    setToken(null)
    setTrips([])
    setPage("login")
  }

  if (page === "login") return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>🚗 Trip Summary System</h1>
        <h2 style={{ color: "#4f46e5", textAlign: "center" }}>Login</h2>
        {error && <p style={errorStyle}>{error}</p>}
        {message && <p style={successStyle}>{message}</p>}
        <input style={inputStyle} placeholder="Username" value={loginData.username}
          onChange={e => setLoginData({...loginData, username: e.target.value})} />
        <input style={inputStyle} placeholder="Password" type="password" value={loginData.password}
          onChange={e => setLoginData({...loginData, password: e.target.value})} />
        <button style={btnStyle} onClick={handleLogin}>Login</button>
        <p style={{ textAlign: "center", marginTop: "10px" }}>
          Don't have account?{" "}
          <span style={{ color: "#4f46e5", cursor: "pointer" }} onClick={() => { setPage("register"); setError(null) }}>
            Register here
          </span>
        </p>
      </div>
    </div>
  )

  if (page === "register") return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>🚗 Trip Summary System</h1>
        <h2 style={{ color: "#4f46e5", textAlign: "center" }}>Register</h2>
        {error && <p style={errorStyle}>{error}</p>}
        <input style={inputStyle} placeholder="Username" value={registerData.username}
          onChange={e => setRegisterData({...registerData, username: e.target.value})} />
        <input style={inputStyle} placeholder="Email" value={registerData.email}
          onChange={e => setRegisterData({...registerData, email: e.target.value})} />
        <input style={inputStyle} placeholder="Password" type="password" value={registerData.password}
          onChange={e => setRegisterData({...registerData, password: e.target.value})} />
        <button style={btnStyle} onClick={handleRegister}>Register</button>
        <p style={{ textAlign: "center", marginTop: "10px" }}>
          Already have account?{" "}
          <span style={{ color: "#4f46e5", cursor: "pointer" }} onClick={() => { setPage("login"); setError(null) }}>
            Login here
          </span>
        </p>
      </div>
    </div>
  )

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>

      <div style={{ backgroundColor: "#4f46e5", padding: "20px", borderRadius: "10px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "white", margin: 0, letterSpacing: "2px", fontSize: "26px" }}>🚗 Trip Summary System</h1>
        <button style={{...btnStyle, backgroundColor: "red", width: "auto"}} onClick={handleLogout}>Logout</button>
      </div>

      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }}>
        <h2 style={{ color: "#4f46e5" }}>➕ Add New Trip</h2>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input style={inputStyle} placeholder="Driver Name" value={newTrip.driver_name}
            onChange={e => setNewTrip({...newTrip, driver_name: e.target.value})} />
          <input style={inputStyle} placeholder="Total Gallons" value={newTrip.total_gallons}
            onChange={e => setNewTrip({...newTrip, total_gallons: e.target.value})} />
          <input style={inputStyle} placeholder="Total Stops" value={newTrip.total_stops}
            onChange={e => setNewTrip({...newTrip, total_stops: e.target.value})} />
          <select style={inputStyle} value={newTrip.status}
            onChange={e => setNewTrip({...newTrip, status: e.target.value})}>
            <option value="">Select Status</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Incomplete</option>
            <option value="pending">Pending</option>
          </select>
          <button style={{...btnStyle, width: "auto"}} onClick={createTrip}>Add Trip</button>
        </div>
      </div>

      {editTrip && (
        <div style={{ backgroundColor: "#fff3f3", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }}>
          <h2 style={{ color: "#4f46e5" }}>✏️ Edit Trip</h2>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input style={inputStyle} placeholder="Driver Name" value={editTrip.driver_name}
              onChange={e => setEditTrip({...editTrip, driver_name: e.target.value})} />
            <input style={inputStyle} placeholder="Total Gallons" value={editTrip.total_gallons}
              onChange={e => setEditTrip({...editTrip, total_gallons: e.target.value})} />
            <input style={inputStyle} placeholder="Total Stops" value={editTrip.total_stops}
              onChange={e => setEditTrip({...editTrip, total_stops: e.target.value})} />
            <select style={inputStyle} value={editTrip.status}
              onChange={e => setEditTrip({...editTrip, status: e.target.value})}>
              <option value="">Select Status</option>
              <option value="completed">Completed</option>
              <option value="incomplete">Incomplete</option>
              <option value="pending">Pending</option>
            </select>
            <button style={{...btnStyle, width: "auto"}} onClick={() => updateTrip(editTrip.id)}>Save</button>
            <button style={{...btnStyle, backgroundColor: "gray", width: "auto"}} onClick={() => setEditTrip(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px" }}>
        <h2 style={{ color: "#4f46e5" }}>📋 All Trips</h2>
        {loading ? <p>Loading...</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#4f46e5", color: "white" }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Driver Name</th>
                <th style={thStyle}>Total Gallons</th>
                <th style={thStyle}>Total Stops</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map(trip => (
                <tr key={trip.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={tdStyle}>{trip.id}</td>
                  <td style={tdStyle}>{trip.driver_name}</td>
                  <td style={tdStyle}>{trip.total_gallons}</td>
                  <td style={tdStyle}>{trip.total_stops}</td>
                  <td style={tdStyle}>
                    <span style={{ backgroundColor: trip.status === "completed" ? "green" : "orange", color: "white", padding: "3px 8px", borderRadius: "10px" }}>
                      {trip.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button style={{...btnStyle, backgroundColor: "blue", width: "auto", marginRight: "5px"}} onClick={() => setEditTrip(trip)}>Update</button>
                    <button style={{...btnStyle, backgroundColor: "red", width: "auto"}} onClick={() => deleteTrip(trip.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const pageStyle = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f5f5f5" }
const cardStyle = { backgroundColor: "white", padding: "40px", borderRadius: "15px", width: "400px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }
const titleStyle = { color: "#4f46e5", textAlign: "center", marginBottom: "20px", fontSize: "28px", letterSpacing: "2px", fontWeight: "bold" }
const inputStyle = { padding: "10px 15px", borderRadius: "8px", border: "1px solid #4f46e5", fontSize: "14px", width: "200px", marginBottom: "10px", boxSizing: "border-box" }
const btnStyle = { padding: "10px 20px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px" }
const errorStyle = { backgroundColor: "#ffe0e0", color: "red", padding: "10px", borderRadius: "8px", textAlign: "center" }
const successStyle = { backgroundColor: "#e0ffe0", color: "green", padding: "10px", borderRadius: "8px", textAlign: "center" }
const thStyle = { padding: "12px", textAlign: "left" }
const tdStyle = { padding: "10px", textAlign: "left" }

export default App