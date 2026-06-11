import NavBar from "../components/NavBar"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const API = "http://localhost:8000"

function Taxes() {
  const queryClient = useQueryClient()
  const token = localStorage.getItem("token")
  const [newTax, setNewTax] = useState({ name: "", percentage: "" })
  const [editTax, setEditTax] = useState(null)

  const { data: taxes = [] } = useQuery({
    queryKey: ["taxes"],
    queryFn: () => fetch(API + "/taxes", {
      headers: { Authorization: "Bearer " + token }
    }).then(res => res.json())
  })

  const createMutation = useMutation({
    mutationFn: (tax) => fetch(API + "/taxes", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({...tax, percentage: parseFloat(tax.percentage)})
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(["taxes"])
      setNewTax({ name: "", percentage: "" })
    }
  })

  const updateMutation = useMutation({
    mutationFn: (tax) => fetch(API + "/taxes/" + tax.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({name: tax.name, percentage: parseFloat(tax.percentage)})
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(["taxes"])
      setEditTax(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(API + "/taxes/" + id, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries(["taxes"])
  })

  return (
    <div>
      <NavBar />
      <div style={{ padding: "20px" }}>
      <h2 style={{ color: "#4f46e5" }}>📊 Tax Management</h2>
      <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }}>
        <h3 style={{ color: "#4f46e5" }}>➕ Add Tax</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input style={inputStyle} placeholder="Tax Name" value={newTax.name}
            onChange={e => setNewTax({...newTax, name: e.target.value})} />
          <input style={inputStyle} placeholder="Percentage" value={newTax.percentage}
            onChange={e => setNewTax({...newTax, percentage: e.target.value})} />
          <button style={btnStyle} onClick={() => createMutation.mutate(newTax)}>Add</button>
        </div>
      </div>
      {editTax && (
        <div style={{ backgroundColor: "#fff3f3", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }}>
          <h3 style={{ color: "#4f46e5" }}>✏️ Edit Tax</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input style={inputStyle} placeholder="Tax Name" value={editTax.name}
              onChange={e => setEditTax({...editTax, name: e.target.value})} />
            <input style={inputStyle} placeholder="Percentage" value={editTax.percentage}
              onChange={e => setEditTax({...editTax, percentage: e.target.value})} />
            <button style={btnStyle} onClick={() => updateMutation.mutate(editTax)}>Save</button>
            <button style={{...btnStyle, backgroundColor: "gray"}} onClick={() => setEditTax(null)}>Cancel</button>
          </div>
        </div>
      )}
      <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#4f46e5", color: "white" }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Percentage</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {taxes.map(tax => (
            <tr key={tax.id}>
              <td style={tdStyle}>{tax.id}</td>
              <td style={tdStyle}>{tax.name}</td>
              <td style={tdStyle}>{tax.percentage}%</td>
              <td style={tdStyle}>
                <button style={{...btnStyle, backgroundColor: "blue", marginRight: "5px"}}
                  onClick={() => setEditTax(tax)}>Update</button>
                <button style={{...btnStyle, backgroundColor: "red"}}
                  onClick={() => deleteMutation.mutate(tax.id)}>Delete</button>
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

export default Taxes
