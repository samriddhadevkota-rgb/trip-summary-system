import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import toast, { Toaster } from "react-hot-toast"
import { Edit2, Trash2, FileText } from "lucide-react"
import Sidebar from "../components/Sidebar"
import { PageLayout, PageHeader, Card, Button, Badge, Select, SkeletonTable } from "../components/UI"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"
const H = () => ({ Authorization: "Bearer " + localStorage.getItem("token"), "Content-Type": "application/json" })

const FIELDS = {
  invoice: [["show_logo","Logo"],["show_customer_name","Customer Name"],["show_ship_to","Ship To"],["show_fees","Fees"],["show_taxes","Taxes"],["show_due_date","Due Date"],["show_delivery_date","Delivery Date"]],
  delivery_ticket: [["show_logo","Logo"],["show_delivery_address","Delivery Address"],["show_delivery_timestamp","Timestamp"]],
  freight_invoice: [["show_logo","Logo"],["show_vendor_address","Vendor Address"],["show_product_category","Product Category"],["show_fees","Fees"]],
}
const DEFAULT = { document_type:"invoice", show_logo:true, show_fees:true, show_taxes:true, show_due_date:true, show_delivery_date:true, show_customer_name:true, show_ship_to:true, show_vendor_address:true, show_product_category:true, show_delivery_timestamp:true, show_delivery_address:true }

export default function Templates() {
  const qc = useQueryClient()
  const [form, setForm] = useState(DEFAULT)
  const [editId, setEditId] = useState(null)

  const { data: templates = [], isLoading } = useQuery({ queryKey:["templates"], queryFn:()=>fetch(API+"/document-templates",{headers:H()}).then(r=>r.json()) })

  const save = useMutation({
    mutationFn: d=>fetch(editId?`${API}/document-templates/${editId}`:`${API}/document-templates`,{method:editId?"PUT":"POST",headers:H(),body:JSON.stringify(d)}).then(r=>r.json()),
    onSuccess:()=>{qc.invalidateQueries(["templates"]);toast.success(editId?"Template updated!":"Template created!");setForm(DEFAULT);setEditId(null)}
  })
  const del = useMutation({ mutationFn: id=>fetch(`${API}/document-templates/${id}`,{method:"DELETE",headers:H()}).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries(["templates"]);toast.success("Deleted")} })

  const fields = FIELDS[form.document_type] || []
  const typeColors = { invoice:"var(--accent)", delivery_ticket:"var(--success)", freight_invoice:"var(--warning)" }
  const typeLabels = { invoice:"Invoice", delivery_ticket:"Delivery Ticket", freight_invoice:"Freight Invoice" }

  return (<>
    <Toaster position="top-right" toastOptions={{style:{background:"var(--bg-card)",color:"var(--text-primary)",border:"1px solid var(--border)"}}} />
    <Sidebar />
    <PageLayout>
      <PageHeader title="Templates" subtitle="Document display settings" />

      <div style={{display:"grid",gridTemplateColumns:"380px 1fr",gap:20,alignItems:"start"}}>
        <Card>
          <h3 style={{fontSize:14,fontWeight:600,marginBottom:16}}>{editId?"Edit Template":"New Template"}</h3>
          <Select label="Document Type" value={form.document_type} onChange={e=>setForm({...DEFAULT,document_type:e.target.value})}>
            <option value="invoice">Product Invoice</option>
            <option value="delivery_ticket">Delivery Ticket</option>
            <option value="freight_invoice">Freight Invoice</option>
          </Select>

          <p style={{fontSize:12,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",margin:"12px 0 8px"}}>Show Fields</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
            {fields.map(([key,label])=>(
              <label key={key} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"8px 10px",borderRadius:6,background:form[key]?"var(--accent-glow)":"var(--bg-secondary)",border:`1px solid ${form[key]?"rgba(99,102,241,0.3)":"var(--border)"}`,transition:"all 0.15s"}}>
                <input type="checkbox" checked={form[key]||false} onChange={e=>setForm({...form,[key]:e.target.checked})} style={{width:"auto",margin:0}} />
                <span style={{fontSize:13,color:form[key]?"var(--accent)":"var(--text-secondary)"}}>{label}</span>
              </label>
            ))}
          </div>

          <div style={{display:"flex",gap:8}}>
            <Button onClick={()=>save.mutate(form)}>{editId?"Save Changes":"Create Template"}</Button>
            {editId&&<Button variant="secondary" onClick={()=>{setForm(DEFAULT);setEditId(null)}}>Cancel</Button>}
          </div>
        </Card>

        <Card style={{padding:0,overflow:"hidden"}}>
          <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)"}}>
            <span style={{fontSize:14,fontWeight:600}}>Saved Templates</span>
          </div>
          {isLoading ? <SkeletonTable rows={3}/> : templates.length===0 ? (
            <div style={{textAlign:"center",padding:"48px",color:"var(--text-muted)"}}>
              <FileText size={40} style={{margin:"0 auto 12px",display:"block",opacity:0.3}} />
              <p>No templates yet — create one</p>
            </div>
          ) : <table>
            <thead><tr><th>ID</th><th>Type</th><th>Logo</th><th>Fees</th><th>Taxes</th><th>Actions</th></tr></thead>
            <tbody>{templates.map(t=>(
              <tr key={t.id}>
                <td style={{color:"var(--text-muted)",fontSize:12}}>#{t.id}</td>
                <td><Badge color={typeColors[t.document_type]||"var(--accent)"}>{typeLabels[t.document_type]||t.document_type}</Badge></td>
                <td>{t.show_logo?<span style={{color:"var(--success)"}}>✓</span>:<span style={{color:"var(--text-muted)"}}>—</span>}</td>
                <td>{t.show_fees?<span style={{color:"var(--success)"}}>✓</span>:<span style={{color:"var(--text-muted)"}}>—</span>}</td>
                <td>{t.show_taxes?<span style={{color:"var(--success)"}}>✓</span>:<span style={{color:"var(--text-muted)"}}>—</span>}</td>
                <td><div style={{display:"flex",gap:6}}>
                  <Button variant="ghost" size="sm" icon={Edit2} onClick={()=>{setForm({...t});setEditId(t.id)}} />
                  <Button variant="danger" size="sm" icon={Trash2} onClick={()=>{if(confirm("Delete?"))del.mutate(t.id)}} />
                </div></td>
              </tr>
            ))}</tbody>
          </table>}
        </Card>
      </div>
    </PageLayout>
  </>)
}
