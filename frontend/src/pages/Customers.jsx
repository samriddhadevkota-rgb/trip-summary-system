import NavBar from "../components/NavBar"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const API = "http://localhost:8000"

function Customers() {
  const queryClient = useQueryClient()
  const token = localStorage.getItem("token")
  const [newCustomer, setNewCustomer] = useState({ name: "", billing_address: "", email: "" })
  const [editCustomer, setEditCustomer] = useState(null)
  const [newShipTo, setNewShipTo] = useState({ customer_id: "", name: "", address: "" })

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => fetch(API + "/customers", {
      headers: { Authorization: "Bearer " + token }
    }).then(res => res.json())
  })

  const createMutation = useMutation({
    mutationFn: (customer) => fetch(API + "/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify(customer)
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"])
      setNewCustomer({ name: "", billing_address: "", email: "" })
    }
  })

  const updateMutation = useMutation({
    mutationFn: (customer) => fetch(API + "/customers/" + customer.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify(customer)
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"])
      setEditCustomer(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(API + "/customers/" + id, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries(["customers"])
  })

  const shipToMutation = useMutation({
    mutationFn: (shipto) => fetch(API + "/customers/ship-tos", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify(shipto)
    }).then(res => res.json()),
    onSuccess: () => setNewShipTo({ customer_id: "", name: "", address: "" })
  })

  return (
    <div>
      <NavBar />
      <div style={{ padding: "20px" }}>
      <h2 style={{ color: "#4f46e5" }}>👥 Customer Management</h2>

      <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }}>
        <h3 style={{ color: "#4f46e5" }}>➕ Add Customer</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input style={inputStyle} placeholder="Name" value={newCustomer.name}
            onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
          <input style={inputStyle} placeholder="Billing Address" value={newCustomer.billing_address}
            onChange={e => setNewCustomer({...newCustomer, billing_address: e.target.value})} />
          <input style={inputStyle} placeholder="Email" value={newCustomer.email}
            onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} />
          <button style={btnStyle} onClick={() => createMutation.mutate(newCustomer)}>Add</button>
        </div>
      </div>

      {editCustomer && (
        <div style={{ backgroundColor: "#fff3f3", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }}>
          <h3 style={{ color: "#4f46e5" }}>✏️ Edit Customer</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input style={inputStyle} placeholder="Name" value={editCustomer.name}
              onChange={e => setEditCustomer({...editCustomer, name: e.target.value})} />
            <input style={inputStyle} placeholder="Billing Address" value={editCustomer.billing_address}
              onChange={e => setEditCustomer({...editCustomer, billing_address: e.target.value})} />
            <input style={inputStyle} placeholder="Email" value={editCustomer.email}
              onChange={e => setEditCustomer({...editCustomer, email: e.target.value})} />
            <button style={btnStyle} onClick={() => updateMutation.mutate(editCustomer)}>Save</button>
            <button style={{...btnStyle, backgroundColor: "gray"}} onClick={() => setEditCustomer(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }}>
        <h3 style={{ color: "#4f46e5" }}>➕ Add Ship To Location</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input style={inputStyle} placeholder="Customer ID" value={newShipTo.customer_id}
            onChange={e => setNewShipTo({...newShipTo, customer_id: parseInt(e.target.value)})} />
          <input style={inputStyle} placeholder="Name" value={newShipTo.name}
            onChange={e => setNewShipTo({...newShipTo, name: e.target.value})} />
          <input style={inputStyle} placeholder="Address" value={newShipTo.address}
            onChange={e => setNewShipTo({...newShipTo, address: e.target.value})} />
          <button style={btnStyle} onClick={() => shipToMutation.mutate(newShipTo)}>Add Ship To</button>
        </div>
      </div>

      <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#4f46e5", color: "white" }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Billing Address</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.id}>
              <td style={tdStyle}>{customer.id}</td>
              <td style={tdStyle}>{customer.name}</td>
              <td style={tdStyle}>{customer.billing_address}</td>
              <td style={tdStyle}>{customer.email}</td>
              <td style={tdStyle}>
                <button style={{...btnStyle, backgroundColor: "blue", marginRight: "5px"}}
                  onClick={() => setEditCustomer(customer)}>Update</button>
                <button style={{...btnStyle, backgroundColor: "red"}}
                  onClick={() => deleteMutation.mutate(customer.id)}>Delete</button>
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

export default Customers
