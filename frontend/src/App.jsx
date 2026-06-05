import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const API = "http://localhost:8000"

function App() {
  const [page, setPage] = useState("login")
  const [token, setToken] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [editTrip, setEditTrip] = useState(null)
  const [newTrip, setNewTrip] = useState({ driver_name: "", total_gallons: "", total_stops: "", status: "" })
  const [regData, setRegData] = useState({ username: "", email: "", password: "" })

  const queryClient = useQueryClient()

  // Fetch trips using TanStack Query
  const { data: trips = [], isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: () =>
      fetch(API + "/trips", {
        headers: { Authorization: "Bearer " + token }
      }).then(res => res.json()),
    enabled: !!token && page === "trips"
  })

  // Login
  const handleLogin = () => {
    setError("")
    const formData = new URLSearchParams()
    formData.append("username", username)
    formData.append("password", password)
    fetch(API + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    })
    .then(res => res.json())
    .then(data => {
      if (data.access_token) {
        setToken(data.access_token)
        setPage("trips")
      } else {
        setError("Wrong username or password!")
      }
    })
    .catch(() => setError("Login failed!"))
  }

  // Register
  const handleRegister = () => {
    setError("")
    fetch(API + "/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(regData)
    })
    .then(res => res.json())
    .then(data => {
      if (data.id) {
        setMessage("Account created! Please login!")
        setPage("login")
      } else {
        setError("Registration failed! Username may already exist.")
      }
    })
    .catch(() => setError("Registration failed!"))
  }

  // Create Trip
  const createMutation = useMutation({
    mutationFn: (trip) =>
      fetch(API + "/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({
          ...trip,
          total_gallons: parseFloat(trip.total_gallons),
          total_stops: parseInt(trip.total_stops)
        })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(["trips"])
      setNewTrip({ driver_name: "", total_gallons: "", total_stops: "", status: "" })
    }
  })

  // Update Trip
  const updateMutation = useMutation({
    mutationFn: (trip) =>
      fetch(API + "/trips/" + trip.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({
          ...trip,
          total_gallons: parseFloat(trip.total_gallons),
          total_stops: parseInt(trip.total_stops)
        })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(["trips"])
      setEditTrip(null)
    }
  })

  // Delete Trip
  const deleteMutation = useMutation({
    mutationFn: (id) =>
      fetch(API + "/trips/" + id, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries(["trips"])
  })

  // LOGIN PAGE
  if (page === "login") return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}>
      <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "10px", border: "2px solid #4f46e5", width: "300px" }}>
        <h1 style={{ color: "#4f46e5", textAlign: "center" }}>🚗 Trip Summary System</h1>
        <h2 style={{ textAlign: "center", color: "#4f46e5" }}>Login</h2>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        {message && <p style={{ color: "green", textAlign: "center" }}>{message}</p>}
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
          <span style={{ color: "#4f46e5", cursor: "pointer" }}
            onClick={() => { setPage("register"); setError(""); setMessage("") }}>
            Register here
          </span>
        </p>
      </div>
    </div>
  )

  // REGISTER PAGE
  if (page === "register") return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}>
      <div style={{ backgroundColor: "white", padding: "40px", borderRadius: "10px", border: "2px solid #4f46e5", width: "300px" }}>
        <h1 style={{ color: "#4f46e5", textAlign: "center" }}>🚗 Trip Summary System</h1>
        <h2 style={{ textAlign: "center", color: "#4f46e5" }}>Register</h2>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
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
          <span style={{ color: "#4f46e5", cursor: "pointer" }}
            onClick={() => { setPage("login"); setError("") }}>
            Login here
          </span>
        </p>
      </div>
    </div>
  )

  // TRIPS PAGE
  return (
    <div style={{ padding: "20px", backgroundColor: "white", minHeight: "100vh" }}>
      <div style={{ backgroundColor: "#4f46e5", padding: "15px", borderRadius: "10px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "white", margin: 0 }}>🚗 Trip Summary System</h1>
        <button style={{ padding: "8px 15px", backgroundColor: "red", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
          onClick={() => { setToken(""); setPage("login") }}>Logout</button>
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
            onClick={() => createMutation.mutate(newTrip)}>Add Trip</button>
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
              onClick={() => updateMutation.mutate(editTrip)}>Save</button>
            <button style={{ padding: "8px 15px", backgroundColor: "gray", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
              onClick={() => setEditTrip(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "10px" }}>
        <h2 style={{ color: "#4f46e5" }}>📋 All Trips</h2>
        {isLoading ? <p>Loading trips...</p> : (
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
                      onClick={() => deleteMutation.mutate(trip.id)}>Delete</button>
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

export default App