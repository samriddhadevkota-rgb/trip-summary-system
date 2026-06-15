import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import toast, { Toaster } from "react-hot-toast"
import { Plus, X, Settings, Truck } from "lucide-react"
import Sidebar from "../components/Sidebar"
import { PageLayout, PageHeader, Card, Button, Badge, Select, Input, SkeletonTable } from "../components/UI"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"
const H = () => ({ Authorization: "Bearer " + localStorage.getItem("token"), "Content-Type": "application/json" })

const EMPTY_INV = { customer_id:"", shipto_id:"", invoice_time:"08:00", products:[{product_id:"",quantity:0,rate:0}], fees:[{fee_id:"",quantity:1,rate:0}], taxes:[{tax_id:""}] }
const EMPTY_FRT = { vendor_id:"", categories:[{category_id:"",quantity:0,freight_rate:0}], fees:[{fee_id:"",quantity:1,rate:0}] }

function LineBtn({ label, color="var(--success)", onClick }) {
  return <button onClick={onClick} style={{padding:"5px 10px",background:`${color}20`,border:`1px solid ${color}40`,color,borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:500}}>{label}</button>
}

export default function Configurations() {
  const qc = useQueryClient()
  const [tab, setTab] = useState("invoice")
  const [invForm, setInvForm] = useState(EMPTY_INV)
  const [frtForm, setFrtForm] = useState(EMPTY_FRT)

  const q = (k,url) => useQuery({queryKey:[k],queryFn:()=>fetch(API+url,{headers:H()}).then(r=>r.json())})
  const { data: invConfigs=[], isLoading: loadingInv } = q("invoice-configs","/invoice-configurations")
  const { data: frtConfigs=[], isLoading: loadingFrt } = q("freight-configs","/freight-configurations")
  const { data: customers=[] } = q("customers","/customers")
  const { data: shipTos=[] } = q("ship-tos","/customers/ship-tos/all")
  const { data: vendors=[] } = q("vendors","/vendors")
  const { data: products=[] } = q("products","/products")
  const { data: fees=[] } = q("fees","/fees")
  const { data: taxes=[] } = q("taxes","/taxes")
  const { data: categories=[] } = q("categories","/products/categories")

  const invMutation = useMutation({ mutationFn: d=>fetch(API+"/invoice-configurations",{method:"POST",headers:H(),body:JSON.stringify(d)}).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries(["invoice-configs"]);toast.success("Invoice config saved!");setInvForm(EMPTY_INV)} })
  const frtMutation = useMutation({ mutationFn: d=>fetch(API+"/freight-configurations",{method:"POST",headers:H(),body:JSON.stringify(d)}).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries(["freight-configs"]);toast.success("Freight config saved!");setFrtForm(EMPTY_FRT)} })

  const updateInvLine = (field, arr, i, k, v) => { const c=[...arr]; c[i]={...c[i],[k]:v}; setInvForm({...invForm,[field]:c}) }
  const addInvLine = (field,emp) => setInvForm({...invForm,[field]:[...invForm[field],emp]})
  const remInvLine = (field,i) => setInvForm({...invForm,[field]:invForm[field].filter((_,idx)=>idx!==i)})

  const updateFrtLine = (field,arr,i,k,v) => { const c=[...arr]; c[i]={...c[i],[k]:v}; setFrtForm({...frtForm,[field]:c}) }
  const addFrtLine = (field,emp) => setFrtForm({...frtForm,[field]:[...frtForm[field],emp]})
  const remFrtLine = (field,i) => setFrtForm({...frtForm,[field]:frtForm[field].filter((_,idx)=>idx!==i)})

  const lineRow = (style) => ({display:"flex",gap:8,marginBottom:8,alignItems:"center",...style})
  const numInput = (val,onChange) => <input type="number" step="0.01" value={val} onChange={onChange} style={{width:80,padding:"8px 10px",background:"var(--bg-secondary)",border:"1px solid var(--border)",borderRadius:6,color:"var(--text-primary)",fontSize:13}} />
  const rmBtn = (onClick) => <button onClick={onClick} style={{padding:"6px 8px",background:"rgba(239,68,68,0.15)",border:"1px solid rgba(239,68,68,0.3)",color:"var(--danger)",borderRadius:6,cursor:"pointer",lineHeight:1}}>×</button>

  const sectionLabel = (label) => <h4 style={{fontSize:12,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",color:"var(--text-muted)",margin:"16px 0 8px"}}>{label}</h4>

  return (<>
    <Toaster position="top-right" toastOptions={{style:{background:"var(--bg-card)",color:"var(--text-primary)",border:"1px solid var(--border)"}}} />
    <Sidebar />
    <PageLayout>
      <PageHeader title="Configurations" subtitle="Invoice & Freight setup" />

      <div style={{display:"flex",gap:8,marginBottom:24}}>
        {[["invoice","Invoice",Settings],["freight","Freight",Truck]].map(([key,label,Icon])=>(
          <button key={key} onClick={()=>setTab(key)} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 18px",borderRadius:8,border:`1px solid ${tab===key?"var(--accent)":"var(--border)"}`,background:tab===key?"var(--accent-glow)":"transparent",color:tab===key?"var(--accent)":"var(--text-secondary)",fontWeight:tab===key?600:400,cursor:"pointer",fontSize:13}}>
            <Icon size={14}/>{label} Config
          </button>
        ))}
      </div>

      {tab==="invoice" && (<>
        <Card style={{marginBottom:20}}>
          <h3 style={{fontSize:15,fontWeight:600,marginBottom:16}}>New Invoice Configuration</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:4}}>
            <Select label="Customer" value={invForm.customer_id} onChange={e=>setInvForm({...invForm,customer_id:parseInt(e.target.value)})}>
              <option value="">Select customer</option>
              {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select label="Ship To" value={invForm.shipto_id} onChange={e=>setInvForm({...invForm,shipto_id:parseInt(e.target.value)})}>
              <option value="">Select ship-to</option>
              {shipTos.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Input label="Invoice Time" type="time" value={invForm.invoice_time} onChange={e=>setInvForm({...invForm,invoice_time:e.target.value})} />
          </div>

          {sectionLabel("Products")}
          {invForm.products.map((p,i)=>(
            <div key={i} style={lineRow()}>
              <Select value={p.product_id} onChange={e=>updateInvLine("products",invForm.products,i,"product_id",parseInt(e.target.value))}>
                <option value="">Product</option>{products.map(pr=><option key={pr.id} value={pr.id}>{pr.name}</option>)}
              </Select>
              {numInput(p.quantity,e=>updateInvLine("products",invForm.products,i,"quantity",parseFloat(e.target.value)))}
              {numInput(p.rate,e=>updateInvLine("products",invForm.products,i,"rate",parseFloat(e.target.value)))}
              {rmBtn(()=>remInvLine("products",i))}
            </div>
          ))}
          <LineBtn label="+ Add Product" onClick={()=>addInvLine("products",{product_id:"",quantity:0,rate:0})} />

          {sectionLabel("Fees")}
          {invForm.fees.map((f,i)=>(
            <div key={i} style={lineRow()}>
              <Select value={f.fee_id} onChange={e=>updateInvLine("fees",invForm.fees,i,"fee_id",parseInt(e.target.value))}>
                <option value="">Fee</option>{fees.map(fe=><option key={fe.id} value={fe.id}>{fe.name}</option>)}
              </Select>
              {numInput(f.quantity,e=>updateInvLine("fees",invForm.fees,i,"quantity",parseFloat(e.target.value)))}
              {numInput(f.rate,e=>updateInvLine("fees",invForm.fees,i,"rate",parseFloat(e.target.value)))}
              {rmBtn(()=>remInvLine("fees",i))}
            </div>
          ))}
          <LineBtn label="+ Add Fee" onClick={()=>addInvLine("fees",{fee_id:"",quantity:1,rate:0})} />

          {sectionLabel("Taxes")}
          {invForm.taxes.map((t,i)=>(
            <div key={i} style={lineRow()}>
              <Select value={t.tax_id} onChange={e=>updateInvLine("taxes",invForm.taxes,i,"tax_id",parseInt(e.target.value))}>
                <option value="">Tax</option>{taxes.map(tx=><option key={tx.id} value={tx.id}>{tx.name} ({tx.percentage}%)</option>)}
              </Select>
              {rmBtn(()=>remInvLine("taxes",i))}
            </div>
          ))}
          <LineBtn label="+ Add Tax" onClick={()=>addInvLine("taxes",{tax_id:""})} />

          <div style={{marginTop:20}}>
            <Button onClick={()=>invMutation.mutate(invForm)}>Save Invoice Configuration</Button>
          </div>
        </Card>

        <Card style={{padding:0,overflow:"hidden"}}>
          <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)"}}><span style={{fontSize:14,fontWeight:600}}>Saved Invoice Configs</span></div>
          {loadingInv ? <SkeletonTable rows={3}/> : invConfigs.length===0 ? <div style={{padding:32,textAlign:"center",color:"var(--text-muted)"}}>No configurations yet</div> :
          <table>
            <thead><tr><th>ID</th><th>Customer</th><th>Ship To</th><th>Time</th><th>Products</th></tr></thead>
            <tbody>{invConfigs.map(c=><tr key={c.id}>
              <td style={{color:"var(--text-muted)",fontSize:12}}>#{c.id}</td>
              <td style={{fontWeight:500}}>{c.customer?.name||c.customer_id}</td>
              <td>{c.shipto?.name||c.shipto_id}</td>
              <td><Badge color="var(--info)">{c.invoice_time}</Badge></td>
              <td>{c.products?.length||0} products</td>
            </tr>)}</tbody>
          </table>}
        </Card>
      </>)}

      {tab==="freight" && (<>
        <Card style={{marginBottom:20}}>
          <h3 style={{fontSize:15,fontWeight:600,marginBottom:16}}>New Freight Configuration</h3>
          <Select label="Vendor" value={frtForm.vendor_id} onChange={e=>setFrtForm({...frtForm,vendor_id:parseInt(e.target.value)})}>
            <option value="">Select vendor</option>
            {vendors.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
          </Select>

          {sectionLabel("Product Categories & Rates")}
          {frtForm.categories.map((c,i)=>(
            <div key={i} style={lineRow()}>
              <Select value={c.category_id} onChange={e=>updateFrtLine("categories",frtForm.categories,i,"category_id",parseInt(e.target.value))}>
                <option value="">Category</option>{categories.map(cat=><option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </Select>
              {numInput(c.quantity,e=>updateFrtLine("categories",frtForm.categories,i,"quantity",parseFloat(e.target.value)))}
              {numInput(c.freight_rate,e=>updateFrtLine("categories",frtForm.categories,i,"freight_rate",parseFloat(e.target.value)))}
              {rmBtn(()=>remFrtLine("categories",i))}
            </div>
          ))}
          <LineBtn label="+ Add Category" onClick={()=>addFrtLine("categories",{category_id:"",quantity:0,freight_rate:0})} />

          {sectionLabel("Fees")}
          {frtForm.fees.map((f,i)=>(
            <div key={i} style={lineRow()}>
              <Select value={f.fee_id} onChange={e=>updateFrtLine("fees",frtForm.fees,i,"fee_id",parseInt(e.target.value))}>
                <option value="">Fee</option>{fees.map(fe=><option key={fe.id} value={fe.id}>{fe.name}</option>)}
              </Select>
              {numInput(f.quantity,e=>updateFrtLine("fees",frtForm.fees,i,"quantity",parseFloat(e.target.value)))}
              {numInput(f.rate,e=>updateFrtLine("fees",frtForm.fees,i,"rate",parseFloat(e.target.value)))}
              {rmBtn(()=>remFrtLine("fees",i))}
            </div>
          ))}
          <LineBtn label="+ Add Fee" onClick={()=>addFrtLine("fees",{fee_id:"",quantity:1,rate:0})} />

          <div style={{marginTop:20}}>
            <Button onClick={()=>frtMutation.mutate(frtForm)}>Save Freight Configuration</Button>
          </div>
        </Card>

        <Card style={{padding:0,overflow:"hidden"}}>
          <div style={{padding:"16px 20px",borderBottom:"1px solid var(--border)"}}><span style={{fontSize:14,fontWeight:600}}>Saved Freight Configs</span></div>
          {loadingFrt ? <SkeletonTable rows={3}/> : frtConfigs.length===0 ? <div style={{padding:32,textAlign:"center",color:"var(--text-muted)"}}>No configurations yet</div> :
          <table>
            <thead><tr><th>ID</th><th>Vendor</th><th>Categories</th><th>Fees</th></tr></thead>
            <tbody>{frtConfigs.map(c=><tr key={c.id}>
              <td style={{color:"var(--text-muted)",fontSize:12}}>#{c.id}</td>
              <td style={{fontWeight:500}}>{c.vendor?.name||c.vendor_id}</td>
              <td>{c.categories?.length||0} categories</td>
              <td>{c.fees?.length||0} fees</td>
            </tr>)}</tbody>
          </table>}
        </Card>
      </>)}
    </PageLayout>
  </>)
}
