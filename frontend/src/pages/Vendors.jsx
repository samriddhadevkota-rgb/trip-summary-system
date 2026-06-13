import NavBar from "../components/NavBar"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const API = "http://localhost:8000"

function Vendors() {
  const queryClient = useQueryClient()
  const token = localStorage.getItem("token")
  const [newVendor, setNewVendor] = useState({ name: "", address: "", email: "" })
  const [editVendor, setEditVendor] = useState(null)

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => fetch(API + "/vendors", {
      headers: { Authorization: "Bearer " + token }
    }).then(res => res.json())
  })

  const createMutation = useMutation({
    mutationFn: (vendor) => fetch(API + "/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify(vendor)
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(["vendors"])
      setNewVendor({ name: "", address: "", email: "" })
    }
  })

  const updateMutation = useMutation({
    mutationFn: (vendor) => fetch(API + "/vendors/" + vendor.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify(vendor)
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(["vendors"])
      setEditVendor(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(API + "/vendors/" + id, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries(["vendors"])
  })

  return (
    <div>
      <NavBar />
      <div style={{ padding: "20px" }}>
      <h2 style={{ color: "#4f46e5" }}>🏢 Vendor Management</h2>

      <div style={{ backgroundColor: "rgba(255,255,255,0.85)", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }}>
        <h3 style={{ color: "#4f46e5" }}>➕ Add Vendor</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input style={inputStyle} placeholder="Name" value={newVendor.name}
            onChange={e => setNewVendor({...newVendor, name: e.target.value})} />
          <input style={inputStyle} placeholder="Address" value={newVendor.address}
            onChange={e => setNewVendor({...newVendor, address: e.target.value})} />
          <input style={inputStyle} placeholder="Email" value={newVendor.email}
            onChange={e => setNewVendor({...newVendor, email: e.target.value})} />
          <button style={btnStyle} onClick={() => createMutation.mutate(newVendor)}>Add</button>
        </div>
      </div>

      {editVendor && (
        <div style={{ backgroundColor: "#fff3f3", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }}>
          <h3 style={{ color: "#4f46e5" }}>✏️ Edit Vendor</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input style={inputStyle} placeholder="Name" value={editVendor.name}
              onChange={e => setEditVendor({...editVendor, name: e.target.value})} />
            <input style={inputStyle} placeholder="Address" value={editVendor.address}
              onChange={e => setEditVendor({...editVendor, address: e.target.value})} />
            <input style={inputStyle} placeholder="Email" value={editVendor.email}
              onChange={e => setEditVendor({...editVendor, email: e.target.value})} />
            <button style={btnStyle} onClick={() => updateMutation.mutate(editVendor)}>Save</button>
            <button style={{...btnStyle, backgroundColor: "gray"}} onClick={() => setEditVendor(null)}>Cancel</button>
          </div>
        </div>
      )}

      <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#4f46e5", color: "white" }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Address</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map(vendor => (
            <tr key={vendor.id}>
              <td style={tdStyle}>{vendor.id}</td>
              <td style={tdStyle}>{vendor.name}</td>
              <td style={tdStyle}>{vendor.address}</td>
              <td style={tdStyle}>{vendor.email}</td>
              <td style={tdStyle}>
                <button style={{...btnStyle, backgroundColor: "blue", marginRight: "5px"}}
                  onClick={() => setEditVendor(vendor)}>Update</button>
                <button style={{...btnStyle, backgroundColor: "red"}}
                  onClick={() => deleteMutation.mutate(vendor.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  )
}

const inputStyle = { padding: "8px", borderRadius: "6px", border: "1px solid #4f46e5", fontSize: "14px" }
const btnStyle = { padding: "8px 15px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }
const thStyle = { padding: "10px", textAlign: "left" }
const tdStyle = { padding: "10px" }

export default Vendors
