import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import toast, { Toaster } from "react-hot-toast"
import { FileText, Download, Mail, Clock, Zap } from "lucide-react"
import Sidebar from "../components/Sidebar"
import { PageLayout, PageHeader, Card, Button, Badge, Input, SkeletonTable } from "../components/UI"

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000"
const H = () => ({ Authorization: "Bearer " + localStorage.getItem("token"), "Content-Type": "application/json" })

const TYPE_COLORS = { invoice: "var(--accent)", delivery_ticket: "var(--success)", freight_invoice: "var(--warning)" }
const TYPE_LABELS = { invoice: "Invoice", delivery_ticket: "Delivery Ticket", freight_invoice: "Freight Invoice" }

export default function Documents() {
  const [configId, setConfigId] = useState("")
  const [generating, setGenerating] = useState(null)

  const { data: documents = [], isLoading, refetch } = useQuery({
    queryKey: ["documents"],
    queryFn: () => fetch(API + "/documents/list", { headers: H() }).then(r => r.json())
  })

  const generate = (type) => {
    if (!configId) { toast.error("Enter a configuration ID"); return }
    const urls = { invoice: `/documents/generate-invoice/${configId}`, delivery: `/documents/generate-delivery-ticket/${configId}`, freight: `/documents/generate-freight-invoice/${configId}` }
    setGenerating(type)
    fetch(API + urls[type], { method: "POST", headers: H() })
      .then(r => r.json())
      .then(data => {
        setGenerating(null)
        if (data.error) toast.error(data.error)
        else { toast.success(data.message || "Document generated!"); refetch() }
      })
      .catch(() => { setGenerating(null); toast.error("Generation failed") })
  }

  return (<>
    <Toaster position="top-right" toastOptions={{style:{background:"var(--bg-card)",color:"var(--text-primary)",border:"1px solid var(--border)"}}} />
    <Sidebar />
    <PageLayout>
      <PageHeader title="Documents" subtitle={`${documents.length} generated`} />

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
        <Card>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <div style={{width:36,height:36,borderRadius:10,background:"var(--accent-glow)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Zap size={18} color="var(--accent)" />
            </div>
            <div>
              <h3 style={{fontSize:14,fontWeight:600}}>Generate Document</h3>
              <p style={{fontSize:12,color:"var(--text-muted)"}}>Enter a configuration ID to generate</p>
            </div>
          </div>
          <Input label="Configuration ID" placeholder="e.g. 1" type="number" value={configId} onChange={e=>setConfigId(e.target.value)} />
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <Button onClick={()=>generate("invoice")} disabled={generating==="invoice"}>{generating==="invoice"?"Generating...":"Invoice"}</Button>
            <Button variant="success" onClick={()=>generate("delivery")} disabled={generating==="delivery"}>{generating==="delivery"?"Generating...":"Delivery Ticket"}</Button>
            <Button variant="secondary" onClick={()=>generate("freight")} disabled={generating==="freight"}>{generating==="freight"?"Generating...":"Freight Invoice"}</Button>
          </div>
        </Card>

        <Card>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <div style={{width:36,height:36,borderRadius:10,background:"rgba(16,185,129,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Clock size={18} color="var(--success)" />
            </div>
            <div>
              <h3 style={{fontSize:14,fontWeight:600}}>Auto-generation</h3>
              <p style={{fontSize:12,color:"var(--text-muted)"}}>Scheduled daily at 8:00 AM</p>
            </div>
          </div>
          <div style={{padding:"12px 16px",background:"var(--bg-secondary)",borderRadius:8,border:"1px solid var(--border)"}}>
            <p style={{fontSize:13,color:"var(--text-secondary)",marginBottom:4}}>Status</p>
            <Badge color="var(--success)">Active — Runs every day at 08:00</Badge>
          </div>
          <p style={{fontSize:12,color:"var(--text-muted)",marginTop:12}}>All active configurations will generate PDFs and send via email automatically.</p>
        </Card>
      </div>

      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:8}}>
          <FileText size={16} color="var(--text-muted)" />
          <span style={{fontSize:14,fontWeight:600}}>Generated Files</span>
        </div>
        {isLoading ? <SkeletonTable /> : documents.length===0 ? (
          <div style={{textAlign:"center",padding:"48px",color:"var(--text-muted)"}}>
            <FileText size={40} style={{margin:"0 auto 12px",display:"block",opacity:0.3}} />
            <p>No documents generated yet</p>
          </div>
        ) : <table>
          <thead><tr><th>ID</th><th>Type</th><th>Filename</th><th>Generated</th><th>Email</th><th>Download</th></tr></thead>
          <tbody>{documents.map(doc=>(
            <tr key={doc.id}>
              <td style={{color:"var(--text-muted)",fontSize:12}}>#{doc.id}</td>
              <td><Badge color={TYPE_COLORS[doc.document_type]||"var(--accent)"}>{TYPE_LABELS[doc.document_type]||doc.document_type}</Badge></td>
              <td style={{fontFamily:"monospace",fontSize:12,color:"var(--text-secondary)"}}>{doc.filename}</td>
              <td style={{color:"var(--text-muted)",fontSize:12}}>{doc.generated_at?new Date(doc.generated_at).toLocaleString():"—"}</td>
              <td>{doc.email_sent
                ?<span style={{color:"var(--success)",fontSize:12}}>✓ {doc.email_to}</span>
                :<span style={{color:"var(--text-muted)",fontSize:12}}>Not sent</span>}
              </td>
              <td><Button variant="ghost" size="sm" icon={Download} onClick={()=>window.open(API+"/documents/download/"+doc.filename)}>Download</Button></td>
            </tr>
          ))}</tbody>
        </table>}
      </Card>
    </PageLayout>
  </>)
}
