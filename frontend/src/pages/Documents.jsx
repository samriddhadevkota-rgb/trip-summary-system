import NavBar from "../components/NavBar"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

const API = "http://localhost:8000"

function Documents() {
  const token = localStorage.getItem("token")
  const [configId, setConfigId] = useState("")
  const [message, setMessage] = useState("")

  const { data: documents = [], refetch } = useQuery({
    queryKey: ["documents"],
    queryFn: () => fetch(API + "/documents/list", {
      headers: { Authorization: "Bearer " + token }
    }).then(res => res.json())
  })

  const generate = (type) => {
    const url = type === "invoice"
      ? `/documents/generate-invoice/${configId}`
      : type === "delivery"
      ? `/documents/generate-delivery-ticket/${configId}`
      : `/documents/generate-freight-invoice/${configId}`

    fetch(API + url, {
      method: "POST",
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => {
        setMessage(data.message || data.error)
        refetch()
      })
  }

  const typeLabel = { invoice: "Invoice", delivery_ticket: "Delivery Ticket", freight_invoice: "Freight Invoice" }

  return (
    <div>
      <NavBar />
      <div style={{ padding: "20px" }}>
      <h2 style={{ color: "#4f46e5" }}>📄 Generated Documents</h2>

      <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }}>
        <h3 style={{ color: "#4f46e5" }}>🔧 Generate Document Manually</h3>
        {message && <p style={{ color: "green" }}>{message}</p>}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <input style={inputStyle} placeholder="Configuration ID"
            value={configId} onChange={e => setConfigId(e.target.value)} />
          <button style={btnStyle} onClick={() => generate("invoice")}>Generate Invoice</button>
          <button style={{ ...btnStyle, backgroundColor: "#059669" }} onClick={() => generate("delivery")}>Generate Delivery Ticket</button>
          <button style={{ ...btnStyle, backgroundColor: "#d97706" }} onClick={() => generate("freight")}>Generate Freight Invoice</button>
        </div>
        <p style={{ color: "#666", fontSize: "12px", marginTop: "8px" }}>
          PDFs also auto-generate daily at 8:00 AM via the scheduler.
        </p>
      </div>

      <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "10px" }}>
        <h3 style={{ color: "#4f46e5" }}>📁 All Generated Documents</h3>
        <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#4f46e5", color: "white" }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Filename</th>
              <th style={thStyle}>Generated At</th>
              <th style={thStyle}>Email Sent</th>
              <th style={thStyle}>Download</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td style={tdStyle}>{doc.id}</td>
                <td style={tdStyle}>{typeLabel[doc.document_type] || doc.document_type}</td>
                <td style={tdStyle}>{doc.filename}</td>
                <td style={tdStyle}>{doc.generated_at ? new Date(doc.generated_at).toLocaleString() : "—"}</td>
                <td style={tdStyle}>
                  {doc.email_sent
                    ? <span style={{ color: "green" }}>✓ {doc.email_to}</span>
                    : <span style={{ color: "#999" }}>Not sent</span>}
                </td>
                <td style={tdStyle}>
                  <a href={`${API}/documents/download/${doc.filename}`}
                    style={{ ...btnStyle, textDecoration: "none", display: "inline-block" }}
                    download>Download</a>
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr><td colSpan="6" style={{ ...tdStyle, textAlign: "center", color: "#999" }}>No documents generated yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  )
}

const inputStyle = { padding: "8px", borderRadius: "6px", border: "1px solid #4f46e5", fontSize: "14px" }
const btnStyle = { padding: "8px 15px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }
const thStyle = { padding: "10px", textAlign: "left" }
const tdStyle = { padding: "10px" }

export default Documents
