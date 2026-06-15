import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import toast, { Toaster } from "react-hot-toast"
import { Plus, Edit2, Trash2, Users } from "lucide-react"
import Sidebar from "../components/Sidebar"
import { PageLayout, PageHeader, Card, Button, Modal, Input, SearchBar, SkeletonTable } from "../components/UI"
const API = "http://localhost:8000"
const H = () => ({ Authorization: "Bearer " + localStorage.getItem("token"), "Content-Type": "application/json" })
const EMPTY = { name: "", email: "", billing_address: "" }
export default function Customers() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const { data: items = [], isLoading } = useQuery({ queryKey: ["customers"], queryFn: () => fetch(API + "/customers", { headers: H() }).then(r => r.json()) })
  const create = useMutation({ mutationFn: d => fetch(API+"/customers",{method:"POST",headers:H(),body:JSON.stringify(d)}).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries(["customers"]);toast.success("Customer added!");setShowModal(false);setForm(EMPTY)} })
  const update = useMutation({ mutationFn: ({id,data})=>fetch(API+"/customers/"+id,{method:"PUT",headers:H(),body:JSON.stringify(data)}).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries(["customers"]);toast.success("Updated!");setShowModal(false);setEditItem(null)} })
  const del = useMutation({ mutationFn: id=>fetch(API+"/customers/"+id,{method:"DELETE",headers:H()}).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries(["customers"]);toast.success("Deleted")} })
  const openCreate = () => { setForm(EMPTY); setEditItem(null); setShowModal(true) }
  const openEdit = item => { setForm({...item}); setEditItem(item); setShowModal(true) }
  const submit = () => editItem ? update.mutate({id:editItem.id,data:form}) : create.mutate(form)
  const filtered = items.filter(i => [i.name,i.email,i.billing_address].some(v=>(v||"").toLowerCase().includes(search.toLowerCase())))
  return (<>
    <Toaster position="top-right" toastOptions={{style:{background:"var(--bg-card)",color:"var(--text-primary)",border:"1px solid var(--border)"}}} />
    <Sidebar />
    <PageLayout>
      <PageHeader title="Customers" subtitle={`${items.length} total`} action={<Button icon={Plus} onClick={openCreate}>Add Customer</Button>} />
      <div style={{marginBottom:16}}><SearchBar value={search} onChange={setSearch} placeholder="Search customers..." /></div>
      <Card style={{padding:0,overflow:"hidden"}}>
        {isLoading ? <SkeletonTable /> : filtered.length===0 ? (
          <div style={{textAlign:"center",padding:"48px",color:"var(--text-muted)"}}>
            <Users size={40} style={{margin:"0 auto 12px",display:"block",opacity:0.3}} /><p>{search?"No results":"No customers yet"}</p>
          </div>
        ) : <table>
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Billing Address</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(item=>(
            <tr key={item.id}>
              <td style={{color:"var(--text-muted)",fontSize:12}}>#{item.id}</td>
              <td style={{color:"var(--text-primary)",fontWeight:500}}>{item.name}</td>
              <td>{item.email}</td>
              <td style={{color:"var(--text-muted)"}}>{item.billing_address}</td>
              <td><div style={{display:"flex",gap:6}}>
                <Button variant="ghost" size="sm" icon={Edit2} onClick={()=>openEdit(item)} />
                <Button variant="danger" size="sm" icon={Trash2} onClick={()=>{if(confirm("Delete?"))del.mutate(item.id)}} />
              </div></td>
            </tr>
          ))}</tbody>
        </table>}
      </Card>
      <Modal open={showModal} onClose={()=>{setShowModal(false);setEditItem(null)}} title={editItem?"Edit Customer":"Add Customer"}>
        <Input label="Name" placeholder="Company name" value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} />
        <Input label="Email" type="email" placeholder="email@company.com" value={form.email||""} onChange={e=>setForm({...form,email:e.target.value})} />
        <Input label="Billing Address" placeholder="123 Main St" value={form.billing_address||""} onChange={e=>setForm({...form,billing_address:e.target.value})} />
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
          <Button variant="secondary" onClick={()=>{setShowModal(false);setEditItem(null)}}>Cancel</Button>
          <Button onClick={submit}>{editItem?"Save Changes":"Add Customer"}</Button>
        </div>
      </Modal>
    </PageLayout>
  </>)
}
