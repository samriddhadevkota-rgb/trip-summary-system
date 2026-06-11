import NavBar from "../components/NavBar"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

const API = "http://localhost:8000"

function EmailSettings() {
  const token = localStorage.getItem("token")
  const [settings, setSettings] = useState({ email: "", password: "" })
  const [testEmail, setTestEmail] = useState({ to_email: "", subject: "", body: "", attachment_path: "" })
  const [message, setMessage] = useState("")
  const [configured, setConfigured] = useState(false)
  const [logoMessage, setLogoMessage] = useState("")

  const { data: logoStatus, refetch: refetchLogo } = useQuery({
    queryKey: ["logo-status"],
    queryFn: () => fetch(API + "/settings/logo/exists").then(r => r.json())
  })

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    fetch(API + "/settings/logo", { method: "POST", body: formData })
      .then(r => r.json())
      .then(data => {
        setLogoMessage(data.message || data.error)
        refetchLogo()
      })
  }

  const handleConfigure = () => {
    fetch(API + "/email/configure", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify(settings)
    })
      .then(res => res.json())
      .then(data => {
        setMessage(data.message || data.error)
        setConfigured(true)
      })
  }

  const handleSendTest = () => {
    fetch(API + "/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify(testEmail)
    })
      .then(res => res.json())
      .then(data => setMessage(data.message || data.error))
  }

  return (
    <div>
      <NavBar />
      <div style={{ padding: "20px" }}>
      <h2 style={{ color: "#4f46e5" }}>Company Settings</h2>

      <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }}>
        <h3 style={{ color: "#4f46e5" }}>Company Logo</h3>
        <p style={{ color: "#666", fontSize: "13px" }}>Upload your company logo. It will appear on all generated PDFs.</p>
        {logoStatus?.exists && (
          <div style={{ marginBottom: "10px" }}>
            <img src={`${API}/settings/logo?t=${Date.now()}`} alt="Logo" style={{ height: "60px", border: "1px solid #ccc", borderRadius: "4px", padding: "4px" }} />
            <span style={{ marginLeft: "10px", color: "green", fontSize: "13px" }}>✓ Logo uploaded</span>
          </div>
        )}
        {logoMessage && <p style={{ color: "green" }}>{logoMessage}</p>}
        <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ marginTop: "8px" }} />
      </div>

      <h2 style={{ color: "#4f46e5" }}>📧 Email Settings</h2>

      {message && (
        <div style={{ backgroundColor: message.includes("success") || message.includes("sent") ? "#d4edda" : "#f8d7da",
          padding: "10px", borderRadius: "6px", marginBottom: "15px", color: message.includes("success") || message.includes("sent") ? "green" : "red" }}>
          {message}
        </div>
      )}

      <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }}>
        <h3 style={{ color: "#4f46e5" }}>⚙️ Configure SMTP (Gmail)</h3>
        <p style={{ color: "#666", fontSize: "13px" }}>
          Use Gmail with an <strong>App Password</strong> (not your regular password).
          Enable 2FA on your Google account, then go to Google Account → Security → App Passwords to generate one.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
          <div>
            <label style={labelStyle}>Gmail Address</label>
            <input style={inputStyle} type="email" placeholder="you@gmail.com"
              value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>App Password</label>
            <input style={inputStyle} type="password" placeholder="16-character app password"
              value={settings.password} onChange={e => setSettings({ ...settings, password: e.target.value })} />
          </div>
          <button style={btnStyle} onClick={handleConfigure}>Save Email Settings</button>
          {configured && <span style={{ color: "green" }}>✓ Email configured</span>}
        </div>
      </div>

      <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "10px", border: "2px solid #4f46e5" }}>
        <h3 style={{ color: "#4f46e5" }}>✉️ Send Test Email</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
          <div>
            <label style={labelStyle}>To Email</label>
            <input style={inputStyle} type="email" placeholder="recipient@example.com"
              value={testEmail.to_email} onChange={e => setTestEmail({ ...testEmail, to_email: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Subject</label>
            <input style={inputStyle} placeholder="Invoice #1001"
              value={testEmail.subject} onChange={e => setTestEmail({ ...testEmail, subject: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Body</label>
            <textarea style={{ ...inputStyle, height: "80px", resize: "vertical" }}
              placeholder="Email body..."
              value={testEmail.body} onChange={e => setTestEmail({ ...testEmail, body: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Attachment Path (optional)</label>
            <input style={inputStyle} placeholder="generated_documents/invoice_1.pdf"
              value={testEmail.attachment_path} onChange={e => setTestEmail({ ...testEmail, attachment_path: e.target.value })} />
          </div>
          <button style={btnStyle} onClick={handleSendTest}>Send Test Email</button>
        </div>
      </div>
    </div>
    </div>
  )
}

const labelStyle = { display: "block", marginBottom: "4px", fontWeight: "600" }
const inputStyle = { padding: "8px", borderRadius: "6px", border: "1px solid #4f46e5", fontSize: "14px", width: "100%" }
const btnStyle = { padding: "8px 15px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }

export default EmailSettings
