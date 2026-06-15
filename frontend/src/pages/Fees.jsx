import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import toast, { Toaster } from "react-hot-toast"
import { Plus, Edit2, Trash2, DollarSign } from "lucide-react"
import Sidebar from "../components/Sidebar"
import { PageLayout, PageHeader, Card, Button, Modal, Input, SearchBar, SkeletonTable } from "../components/UI"
const API = import.meta.env.VITE_API_URL || "http://localhost:8000"
const H = () => ({ Authorization: "Bearer " + localStorage.getItem("token"), "Content-Type": "application/json" })
const EMPTY = { name: "", default_rate: "" }
export default function Fees() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const { data: items = [], isLoading } = useQuery({ queryKey: ["fees"], queryFn: () => fetch(API + "/fees", { headers: H() }).then(r => r.json()) })
  const create = useMutation({ mutationFn: d => fetch(API+"/fees",{method:"POST",headers:H(),body:JSON.stringify({...d,default_rate:parseFloat(d.default_rate)||0})}).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries(["fees"]);toast.success("Fee added!");setShowModal(false);setForm(EMPTY)} })
  const update = useMutation({ mutationFn: ({id,data})=>fetch(API+"/fees/"+id,{method:"PUT",headers:H(),body:JSON.stringify({...data,default_rate:parseFloat(data.default_rate)||0})}).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries(["fees"]);toast.success("Updated!");setShowModal(false);setEditItem(null)} })
  const del = useMutation({ mutationFn: id=>fetch(API+"/fees/"+id,{method:"DELETE",headers:H()}).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries(["fees"]);toast.success("Deleted")} })
  const openCreate = () => { setForm(EMPTY); setEditItem(null); setShowModal(true) }
  const openEdit = item => { setForm({...item}); setEditItem(item); setShowModal(true) }
  const submit = () => editItem ? update.mutate({id:editItem.id,data:form}) : create.mutate(form)
  const filtered = items.filter(i => (i.name||"").toLowerCase().includes(search.toLowerCase()))
  return (<>
    <Toaster position="top-right" toastOptions={{style:{background:"var(--bg-card)",color:"var(--text-primary)",border:"1px solid var(--border)"}}} />
    <Sidebar />
    <PageLayout>
      <PageHeader title="Fees" subtitle={`${items.length} fee types`} action={<Button icon={Plus} onClick={openCreate}>Add Fee</Button>} />
      <div style={{marginBottom:16}}><SearchBar value={search} onChange={setSearch} placeholder="Search fees..." /></div>
      <Card style={{padding:0,overflow:"hidden"}}>
        {isLoading ? <SkeletonTable /> : filtered.length===0 ? (
          <div style={{textAlign:"center",padding:"48px",color:"var(--text-muted)"}}>
            <DollarSign size={40} style={{margin:"0 auto 12px",display:"block",opacity:0.3}} /><p>No fees yet</p>
          </div>
        ) : <table>
          <thead><tr><th>ID</th><th>Name</th><th>Default Rate</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(item=>(
            <tr key={item.id}>
              <td style={{color:"var(--text-muted)",fontSize:12}}>#{item.id}</td>
              <td style={{color:"var(--text-primary)",fontWeight:500}}>{item.name}</td>
              <td style={{color:"var(--success)",fontWeight:500}}>${parseFloat(item.default_rate||0).toFixed(2)}</td>
              <td><div style={{display:"flex",gap:6}}>
                <Button variant="ghost" size="sm" icon={Edit2} onClick={()=>openEdit(item)} />
                <Button variant="danger" size="sm" icon={Trash2} onClick={()=>{if(confirm("Delete?"))del.mutate(item.id)}} />
              </div></td>
            </tr>
          ))}</tbody>
        </table>}
      </Card>
      <Modal open={showModal} onClose={()=>{setShowModal(false);setEditItem(null)}} title={editItem?"Edit Fee":"Add Fee"}>
        <Input label="Fee Name" placeholder="e.g. Delivery Fee" value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} />
        <Input label="Default Rate ($)" type="number" placeholder="0.00" value={form.default_rate||""} onChange={e=>setForm({...form,default_rate:e.target.value})} />
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
          <Button variant="secondary" onClick={()=>{setShowModal(false);setEditItem(null)}}>Cancel</Button>
          <Button onClick={submit}>{editItem?"Save Changes":"Add Fee"}</Button>
        </div>
      </Modal>
    </PageLayout>
  </>)
}
