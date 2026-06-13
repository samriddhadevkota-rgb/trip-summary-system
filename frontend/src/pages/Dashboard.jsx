import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const API = "http://localhost:8000"

function Dashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const token = localStorage.getItem("token")

  const [editTrip, setEditTrip] = useState(null)
  const [newTrip, setNewTrip] = useState({ driver_name: "", total_gallons: "", total_stops: "", status: "" })

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: () =>
      fetch(API + "/trips", {
        headers: { Authorization: "Bearer " + token }
      }).then(res => res.json()),
  })

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

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      fetch(API + "/trips/" + id, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries(["trips"])
  })

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  return (
    <div style={{ fontFamily: "Arial", minHeight: "100vh", backgroundColor: "transparent" }}>

      {/* Header */}
      <div style={{ backgroundColor: "#4f46e5", padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "white", margin: 0, fontSize: "22px" }}>🚗 Trip Summary System</h1>
        <button style={{ padding: "8px 15px", backgroundColor: "red", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
          onClick={handleLogout}>Logout</button>
      </div>

      {/* Navigation */}
      <div style={{ backgroundColor: "#3730a3", padding: "10px 20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button style={navBtn} onClick={() => navigate("/dashboard")}>🚗 Trips</button>
        <button style={navBtn} onClick={() => navigate("/customers")}>👥 Customers</button>
        <button style={navBtn} onClick={() => navigate("/vendors")}>🏢 Vendors</button>
        <button style={navBtn} onClick={() => navigate("/products")}>📦 Products</button>
        <button style={navBtn} onClick={() => navigate("/fees")}>💰 Fees</button>
        <button style={navBtn} onClick={() => navigate("/taxes")}>📊 Taxes</button>
        <button style={navBtn} onClick={() => navigate("/documents")}>📄 Documents</button>
        <button style={navBtn} onClick={() => navigate("/configurations")}>⚙️ Configurations</button>
        <button style={navBtn} onClick={() => navigate("/templates")}>📋 Templates</button>
        <button style={navBtn} onClick={() => navigate("/email-settings")}>📧 Email</button>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }}>
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
            <button style={btnStyle} onClick={() => createMutation.mutate(newTrip)}>Add Trip</button>
          </div>
        </div>

        {editTrip && (
          <div style={{ backgroundColor: "rgba(255,243,243,0.75)", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }}>
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
              <button style={btnStyle} onClick={() => updateMutation.mutate(editTrip)}>Save</button>
              <button style={{...btnStyle, backgroundColor: "gray"}} onClick={() => setEditTrip(null)}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{ backgroundColor: "rgba(255,255,255,0.85)", padding: "20px", borderRadius: "10px" }}>
          <h2 style={{ color: "#4f46e5" }}>📋 All Trips</h2>
          {isLoading ? <p>Loading trips...</p> : (
            <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
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
                  <tr key={trip.id}>
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
                      <button style={{...btnStyle, backgroundColor: "blue", marginRight: "5px"}} onClick={() => setEditTrip(trip)}>Update</button>
                      <button style={{...btnStyle, backgroundColor: "red"}} onClick={() => deleteMutation.mutate(trip.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

const navBtn = { padding: "8px 15px", backgroundColor: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "5px", cursor: "pointer", fontSize: "14px" }
const inputStyle = { padding: "8px", borderRadius: "6px", border: "1px solid #4f46e5", fontSize: "14px" }
const btnStyle = { padding: "8px 15px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }
const thStyle = { padding: "12px", textAlign: "left" }
const tdStyle = { padding: "10px" }

export default Dashboard