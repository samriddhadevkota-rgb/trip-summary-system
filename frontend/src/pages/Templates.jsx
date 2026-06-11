import NavBar from "../components/NavBar"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const API = "http://localhost:8000"

const INVOICE_FIELDS = [
  { key: "show_logo", label: "Company Logo" },
  { key: "show_customer_name", label: "Customer Name" },
  { key: "show_ship_to", label: "Ship To" },
  { key: "show_fees", label: "Fees" },
  { key: "show_taxes", label: "Taxes" },
  { key: "show_due_date", label: "Due Date" },
  { key: "show_delivery_date", label: "Delivery Date" },
]

const DELIVERY_FIELDS = [
  { key: "show_logo", label: "Company Logo" },
  { key: "show_delivery_address", label: "Delivery Address" },
  { key: "show_delivery_timestamp", label: "Delivery Timestamp" },
]

const FREIGHT_FIELDS = [
  { key: "show_logo", label: "Company Logo" },
  { key: "show_vendor_address", label: "Vendor Address" },
  { key: "show_product_category", label: "Product Category" },
  { key: "show_fees", label: "Fees" },
]

const fieldsByType = {
  invoice: INVOICE_FIELDS,
  delivery_ticket: DELIVERY_FIELDS,
  freight_invoice: FREIGHT_FIELDS,
}

const defaultState = {
  document_type: "invoice",
  show_logo: true,
  show_fees: true,
  show_taxes: true,
  show_due_date: true,
  show_delivery_date: true,
  show_customer_name: true,
  show_ship_to: true,
  show_vendor_address: true,
  show_product_category: true,
  show_delivery_timestamp: true,
  show_delivery_address: true,
}

function Templates() {
  const queryClient = useQueryClient()
  const token = localStorage.getItem("token")
  const [form, setForm] = useState(defaultState)
  const [editId, setEditId] = useState(null)

  const { data: templates = [] } = useQuery({
    queryKey: ["templates"],
    queryFn: () => fetch(API + "/document-templates", {
      headers: { Authorization: "Bearer " + token }
    }).then(res => res.json())
  })

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const url = editId ? `${API}/document-templates/${editId}` : `${API}/document-templates`
      return fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify(data)
      }).then(res => res.json())
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["templates"])
      setForm(defaultState)
      setEditId(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(`${API}/document-templates/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries(["templates"])
  })

  const fields = fieldsByType[form.document_type] || []

  return (
    <div>
      <NavBar />
      <div style={{ padding: "20px" }}>
      <h2 style={{ color: "#4f46e5" }}>📋 Document Template Builder</h2>

      <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }}>
        <h3 style={{ color: "#4f46e5" }}>{editId ? "✏️ Edit Template" : "➕ New Template"}</h3>

        <div style={{ marginBottom: "15px" }}>
          <label style={labelStyle}>Document Type</label>
          <select style={inputStyle} value={form.document_type}
            onChange={e => setForm({ ...defaultState, document_type: e.target.value })}>
            <option value="invoice">Product Invoice</option>
            <option value="delivery_ticket">Delivery Ticket</option>
            <option value="freight_invoice">Freight Invoice</option>
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "15px" }}>
          {fields.map(field => (
            <label key={field.key} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input type="checkbox" checked={form[field.key] || false}
                onChange={e => setForm({ ...form, [field.key]: e.target.checked })} />
              <span>{field.label}</span>
            </label>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button style={btnStyle} onClick={() => saveMutation.mutate(form)}>
            {editId ? "Save Changes" : "Create Template"}
          </button>
          {editId && (
            <button style={{ ...btnStyle, backgroundColor: "gray" }}
              onClick={() => { setForm(defaultState); setEditId(null) }}>Cancel</button>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "10px" }}>
        <h3 style={{ color: "#4f46e5" }}>Saved Templates</h3>
        <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#4f46e5", color: "white" }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Document Type</th>
              <th style={thStyle}>Logo</th>
              <th style={thStyle}>Fees</th>
              <th style={thStyle}>Taxes</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map(t => (
              <tr key={t.id}>
                <td style={tdStyle}>{t.id}</td>
                <td style={tdStyle}>{t.document_type}</td>
                <td style={tdStyle}>{t.show_logo ? "✓" : "✗"}</td>
                <td style={tdStyle}>{t.show_fees ? "✓" : "✗"}</td>
                <td style={tdStyle}>{t.show_taxes ? "✓" : "✗"}</td>
                <td style={tdStyle}>
                  <button style={{ ...btnStyle, backgroundColor: "blue", marginRight: "5px" }}
                    onClick={() => { setForm({ ...t }); setEditId(t.id) }}>Edit</button>
                  <button style={{ ...btnStyle, backgroundColor: "red" }}
                    onClick={() => deleteMutation.mutate(t.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  )
}

const labelStyle = { display: "block", marginBottom: "4px", fontWeight: "600" }
const inputStyle = { padding: "8px", borderRadius: "6px", border: "1px solid #4f46e5", fontSize: "14px", width: "200px" }
const btnStyle = { padding: "8px 15px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }
const thStyle = { padding: "10px", textAlign: "left" }
const tdStyle = { padding: "10px" }

export default Templates
