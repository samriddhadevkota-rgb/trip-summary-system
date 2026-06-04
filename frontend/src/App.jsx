import { useState } from "react"

function App() {
  const [page, setPage] = useState("login")
  const [token, setToken] = useState("")
  const [trips, setTrips] = useState([])
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [editTrip, setEditTrip] = useState(null)
  const [newTrip, setNewTrip] = useState({ driver_name: "", total_gallons: "", total_stops: "", status: "" })

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
        fetchTrips(tok)
        setPage("trips")
      } else {
        setError("Wrong username or password!")
      }
    })
    .catch(() => setError("Login failed!"))
  }

  const fetchTrips = (tok) => {
    fetch("http://localhost:8000/trips", {
      method: "GET",
      headers: { "Authorization": "Bearer " + tok }
    })
    .then(res => res.json())
    .then(data => setTrips(data))
  }

  const createTrip = () => {
    fetch("http://localhost:8000/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify({
        ...newTrip,
        total_gallons: parseFloat(newTrip.total_gallons),
        total_stops: parseInt(newTrip.total_stops)
      })
    })
    .then(() => {
      setNewTrip({ driver_name: "", total_gallons: "", total_stops: "", status: "" })
      fetchTrips(token)
    })
  }

  const deleteTrip = (id) => {
    fetch("http://localhost:8000/trips/" + id, {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + token }
    })
    .then(() => fetchTrips(token))
  }

  const updateTrip = (id) => {
    fetch("http://localhost:8000/trips/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
      body: JSON.stringify({
        ...editTrip,
        total_gallons: parseFloat(editTrip.total_gallons),
        total_stops: parseInt(editTrip.total_stops)
      })
    })
    .then(() => {
      setEditTrip(null)
      fetchTrips(token)
    })
  }

  if (page === "login") return (
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

      <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }}>
        <h2 style={{ color: "#4f46e5" }}>➕ Add New Trip</h2>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input style={{ padding: "8px", borderRadius: "6px", border: "1px solid #4f46e5" }}
            placeholder="Driver Name" value={newTrip.driver_name}
            onChange={e => setNewTrip({...newTrip, driver_name: e.target.value})} />
          <input style={{ padding: "8px", borderRadius: "6px", border: "1px solid #4f46e5" }}
            placeholder="Total Gallons" value={newTrip.total_gallons}
            onChange={e => setNewTrip({...newTrip, total_gallons: e.target.value})} />
          <input style={{ padding: "8px", borderRadius: "6px", border: "1px solid #4f46e5" }}
            placeholder="Total Stops" value={newTrip.total_stops}
            onChange={e => setNewTrip({...newTrip, total_stops: e.target.value})} />
          <select style={{ padding: "8px", borderRadius: "6px", border: "1px solid #4f46e5" }}
            value={newTrip.status} onChange={e => setNewTrip({...newTrip, status: e.target.value})}>
            <option value="">Select Status</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Incomplete</option>
            <option value="pending">Pending</option>
          </select>
          <button style={{ padding: "8px 15px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
            onClick={createTrip}>Add Trip</button>
        </div>
      </div>

      {editTrip && (
        <div style={{ backgroundColor: "#fff3f3", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }}>
          <h2 style={{ color: "#4f46e5" }}>✏️ Edit Trip</h2>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input style={{ padding: "8px", borderRadius: "6px", border: "1px solid #4f46e5" }}
              placeholder="Driver Name" value={editTrip.driver_name}
              onChange={e => setEditTrip({...editTrip, driver_name: e.target.value})} />
            <input style={{ padding: "8px", borderRadius: "6px", border: "1px solid #4f46e5" }}
              placeholder="Total Gallons" value={editTrip.total_gallons}
              onChange={e => setEditTrip({...editTrip, total_gallons: e.target.value})} />
            <input style={{ padding: "8px", borderRadius: "6px", border: "1px solid #4f46e5" }}
              placeholder="Total Stops" value={editTrip.total_stops}
              onChange={e => setEditTrip({...editTrip, total_stops: e.target.value})} />
            <select style={{ padding: "8px", borderRadius: "6px", border: "1px solid #4f46e5" }}
              value={editTrip.status} onChange={e => setEditTrip({...editTrip, status: e.target.value})}>
              <option value="">Select Status</option>
              <option value="completed">Completed</option>
              <option value="incomplete">Incomplete</option>
              <option value="pending">Pending</option>
            </select>
            <button style={{ padding: "8px 15px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
              onClick={() => updateTrip(editTrip.id)}>Save</button>
            <button style={{ padding: "8px 15px", backgroundColor: "gray", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
              onClick={() => setEditTrip(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "10px" }}>
        <h2 style={{ color: "#4f46e5" }}>📋 All Trips</h2>
        <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#4f46e5", color: "white" }}>
              <th style={{ padding: "10px" }}>ID</th>
              <th style={{ padding: "10px" }}>Driver Name</th>
              <th style={{ padding: "10px" }}>Total Gallons</th>
              <th style={{ padding: "10px" }}>Total Stops</th>
              <th style={{ padding: "10px" }}>Status</th>
              <th style={{ padding: "10px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map(trip => (
              <tr key={trip.id}>
                <td style={{ padding: "10px" }}>{trip.id}</td>
                <td style={{ padding: "10px" }}>{trip.driver_name}</td>
                <td style={{ padding: "10px" }}>{trip.total_gallons}</td>
                <td style={{ padding: "10px" }}>{trip.total_stops}</td>
                <td style={{ padding: "10px" }}>
                  <span style={{ backgroundColor: trip.status === "completed" ? "green" : "orange", color: "white", padding: "3px 8px", borderRadius: "10px" }}>
                    {trip.status}
                  </span>
                </td>
                <td style={{ padding: "10px" }}>
                  <button style={{ padding: "6px 12px", backgroundColor: "blue", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", marginRight: "5px" }}
                    onClick={() => setEditTrip(trip)}>Update</button>
                  <button style={{ padding: "6px 12px", backgroundColor: "red", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                    onClick={() => deleteTrip(trip.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App