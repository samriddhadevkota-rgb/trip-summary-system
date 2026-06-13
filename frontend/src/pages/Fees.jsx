import NavBar from "../components/NavBar"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const API = "http://localhost:8000"

function Fees() {
  const queryClient = useQueryClient()
  const token = localStorage.getItem("token")
  const [newFee, setNewFee] = useState({ name: "", default_rate: "" })
  const [editFee, setEditFee] = useState(null)

  const { data: fees = [] } = useQuery({
    queryKey: ["fees"],
    queryFn: () => fetch(API + "/fees", {
      headers: { Authorization: "Bearer " + token }
    }).then(res => res.json())
  })

  const createMutation = useMutation({
    mutationFn: (fee) => fetch(API + "/fees", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({...fee, default_rate: parseFloat(fee.default_rate)})
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(["fees"])
      setNewFee({ name: "", default_rate: "" })
    }
  })

  const updateMutation = useMutation({
    mutationFn: (fee) => fetch(API + "/fees/" + fee.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({name: fee.name, default_rate: parseFloat(fee.default_rate)})
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(["fees"])
      setEditFee(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(API + "/fees/" + id, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries(["fees"])
  })

  return (
    <div>
      <NavBar />
      <div style={{ padding: "20px" }}>
      <h2 style={{ color: "#4f46e5" }}>💰 Fee Management</h2>

      <div style={{ backgroundColor: "rgba(255,255,255,0.85)", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }}>
        <h3 style={{ color: "#4f46e5" }}>➕ Add Fee</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input style={inputStyle} placeholder="Fee Name" value={newFee.name}
            onChange={e => setNewFee({...newFee, name: e.target.value})} />
          <input style={inputStyle} placeholder="Default Rate" value={newFee.default_rate}
            onChange={e => setNewFee({...newFee, default_rate: e.target.value})} />
          <button style={btnStyle} onClick={() => createMutation.mutate(newFee)}>Add</button>
        </div>
      </div>

      {editFee && (
        <div style={{ backgroundColor: "#fff3f3", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }}>
          <h3 style={{ color: "#4f46e5" }}>✏️ Edit Fee</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input style={inputStyle} placeholder="Fee Name" value={editFee.name}
              onChange={e => setEditFee({...editFee, name: e.target.value})} />
            <input style={inputStyle} placeholder="Default Rate" value={editFee.default_rate}
              onChange={e => setEditFee({...editFee, default_rate: e.target.value})} />
            <button style={btnStyle} onClick={() => updateMutation.mutate(editFee)}>Save</button>
            <button style={{...btnStyle, backgroundColor: "gray"}} onClick={() => setEditFee(null)}>Cancel</button>
          </div>
        </div>
      )}

      <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#4f46e5", color: "white" }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Default Rate</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {fees.map(fee => (
            <tr key={fee.id}>
              <td style={tdStyle}>{fee.id}</td>
              <td style={tdStyle}>{fee.name}</td>
              <td style={tdStyle}>${fee.default_rate}</td>
              <td style={tdStyle}>
                <button style={{...btnStyle, backgroundColor: "blue", marginRight: "5px"}}
                  onClick={() => setEditFee(fee)}>Update</button>
                <button style={{...btnStyle, backgroundColor: "red"}}
                  onClick={() => deleteMutation.mutate(fee.id)}>Delete</button>
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

export default Fees
