import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import toast, { Toaster } from "react-hot-toast"
import { Mail, Image, Send, CheckCircle, Lock } from "lucide-react"
import Sidebar from "../components/Sidebar"
import { PageLayout, PageHeader, Card, Button, Badge, Input } from "../components/UI"

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000"
const H = () => ({ Authorization: "Bearer " + localStorage.getItem("token"), "Content-Type": "application/json" })

export default function EmailSettings() {
  const [smtp, setSmtp] = useState({ email: "", password: "" })
  const [testEmail, setTestEmail] = useState({ to_email: "", subject: "", body: "", attachment_path: "" })
  const [configured, setConfigured] = useState(false)
  const [sending, setSending] = useState(false)
  const [saving, setSaving] = useState(false)
  const [logoMsg, setLogoMsg] = useState("")

  const { data: logoStatus, refetch: refetchLogo } = useQuery({ queryKey:["logo-status"], queryFn:()=>fetch(API+"/settings/logo/exists").then(r=>r.json()) })

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]; if(!file) return
    const fd = new FormData(); fd.append("file", file)
    fetch(API+"/settings/logo",{method:"POST",body:fd}).then(r=>r.json()).then(d=>{
      if(d.message){toast.success("Logo uploaded!");setLogoMsg("")}else{toast.error(d.error||"Upload failed")}
      refetchLogo()
    })
  }

  const handleSaveSmtp = () => {
    if(!smtp.email||!smtp.password){toast.error("Fill in both fields");return}
    setSaving(true)
    fetch(API+"/email/configure",{method:"POST",headers:H(),body:JSON.stringify(smtp)}).then(r=>r.json()).then(d=>{
      setSaving(false)
      if(d.message){toast.success("SMTP configured!");setConfigured(true)}else{toast.error(d.error||"Failed")}
    })
  }

  const handleSendTest = () => {
    if(!testEmail.to_email){toast.error("Enter recipient email");return}
    setSending(true)
    fetch(API+"/email/send",{method:"POST",headers:H(),body:JSON.stringify(testEmail)}).then(r=>r.json()).then(d=>{
      setSending(false)
      if(d.message)toast.success("Email sent!")
      else toast.error(d.error||"Send failed")
    })
  }

  return (<>
    <Toaster position="top-right" toastOptions={{style:{background:"var(--bg-card)",color:"var(--text-primary)",border:"1px solid var(--border)"}}} />
    <Sidebar />
    <PageLayout>
      <PageHeader title="Settings" subtitle="Email & company configuration" />

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
        {/* Logo */}
        <Card>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <div style={{width:36,height:36,borderRadius:10,background:"var(--accent-glow)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Image size={18} color="var(--accent)" />
            </div>
            <div>
              <h3 style={{fontSize:14,fontWeight:600}}>Company Logo</h3>
              <p style={{fontSize:12,color:"var(--text-muted)"}}>Appears on all generated PDFs</p>
            </div>
          </div>

          {logoStatus?.exists && (
            <div style={{marginBottom:16,padding:12,background:"var(--bg-secondary)",borderRadius:8,border:"1px solid var(--border)",display:"flex",alignItems:"center",gap:12}}>
              <img src={`${API}/settings/logo?t=${Date.now()}`} alt="Logo" style={{height:48,maxWidth:120,objectFit:"contain",borderRadius:4}} />
              <Badge color="var(--success)">Logo active</Badge>
            </div>
          )}

          <label style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"var(--bg-secondary)",border:"1px dashed var(--border-light)",borderRadius:8,cursor:"pointer",color:"var(--text-secondary)",fontSize:13,transition:"all 0.15s"}}>
            <Image size={16} />
            {logoStatus?.exists?"Replace logo":"Upload logo (PNG, JPG)"}
            <input type="file" accept="image/*" onChange={handleLogoUpload} style={{display:"none"}} />
          </label>
        </Card>

        {/* SMTP */}
        <Card>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <div style={{width:36,height:36,borderRadius:10,background:"rgba(59,130,246,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Lock size={18} color="var(--info)" />
            </div>
            <div style={{flex:1}}>
              <h3 style={{fontSize:14,fontWeight:600}}>Gmail SMTP</h3>
              <p style={{fontSize:12,color:"var(--text-muted)"}}>Use an App Password, not your regular password</p>
            </div>
            {configured&&<Badge color="var(--success)">Configured</Badge>}
          </div>

          <Input label="Gmail Address" type="email" placeholder="you@gmail.com" value={smtp.email} onChange={e=>setSmtp({...smtp,email:e.target.value})} />
          <Input label="App Password" type="password" placeholder="16-character app password" value={smtp.password} onChange={e=>setSmtp({...smtp,password:e.target.value})} />
          <Button onClick={handleSaveSmtp} disabled={saving}>{saving?"Saving...":"Save SMTP Settings"}</Button>

          <div style={{marginTop:12,padding:"10px 12px",background:"var(--bg-secondary)",borderRadius:6,fontSize:12,color:"var(--text-muted)"}}>
            Enable 2-Step Verification → Google Account Security → App Passwords → Generate
          </div>
        </Card>
      </div>

      {/* Test Email */}
      <Card>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
          <div style={{width:36,height:36,borderRadius:10,background:"rgba(16,185,129,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Send size={18} color="var(--success)" />
          </div>
          <div>
            <h3 style={{fontSize:14,fontWeight:600}}>Send Test Email</h3>
            <p style={{fontSize:12,color:"var(--text-muted)"}}>Verify your email configuration</p>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div>
            <Input label="To Email" type="email" placeholder="recipient@example.com" value={testEmail.to_email} onChange={e=>setTestEmail({...testEmail,to_email:e.target.value})} />
            <Input label="Subject" placeholder="Invoice #1001" value={testEmail.subject} onChange={e=>setTestEmail({...testEmail,subject:e.target.value})} />
          </div>
          <div>
            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:12,fontWeight:500,color:"var(--text-secondary)",marginBottom:6}}>Message Body</label>
              <textarea value={testEmail.body} onChange={e=>setTestEmail({...testEmail,body:e.target.value})} placeholder="Email body..." style={{height:80,resize:"vertical",fontFamily:"inherit"}} />
            </div>
            <Input label="Attachment Path (optional)" placeholder="generated_documents/invoice_1.pdf" value={testEmail.attachment_path} onChange={e=>setTestEmail({...testEmail,attachment_path:e.target.value})} />
          </div>
        </div>
        <Button icon={Send} onClick={handleSendTest} disabled={sending}>{sending?"Sending...":"Send Test Email"}</Button>
      </Card>
    </PageLayout>
  </>)
}
