import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import toast, { Toaster } from "react-hot-toast"
import { Plus, Edit2, Trash2, Percent } from "lucide-react"
import Sidebar from "../components/Sidebar"
import { PageLayout, PageHeader, Card, Button, Badge, Modal, Input, SearchBar, SkeletonTable } from "../components/UI"
const API = "http://localhost:8000"
const H = () => ({ Authorization: "Bearer " + localStorage.getItem("token"), "Content-Type": "application/json" })
const EMPTY = { name: "", percentage: "" }
export default function Taxes() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const { data: items = [], isLoading } = useQuery({ queryKey: ["taxes"], queryFn: () => fetch(API + "/taxes", { headers: H() }).then(r => r.json()) })
  const create = useMutation({ mutationFn: d => fetch(API+"/taxes",{method:"POST",headers:H(),body:JSON.stringify({...d,percentage:parseFloat(d.percentage)||0})}).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries(["taxes"]);toast.success("Tax added!");setShowModal(false);setForm(EMPTY)} })
  const update = useMutation({ mutationFn: ({id,data})=>fetch(API+"/taxes/"+id,{method:"PUT",headers:H(),body:JSON.stringify({...data,percentage:parseFloat(data.percentage)||0})}).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries(["taxes"]);toast.success("Updated!");setShowModal(false);setEditItem(null)} })
  const del = useMutation({ mutationFn: id=>fetch(API+"/taxes/"+id,{method:"DELETE",headers:H()}).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries(["taxes"]);toast.success("Deleted")} })
  const openCreate = () => { setForm(EMPTY); setEditItem(null); setShowModal(true) }
  const openEdit = item => { setForm({...item}); setEditItem(item); setShowModal(true) }
  const submit = () => editItem ? update.mutate({id:editItem.id,data:form}) : create.mutate(form)
  const filtered = items.filter(i => (i.name||"").toLowerCase().includes(search.toLowerCase()))
  return (<>
    <Toaster position="top-right" toastOptions={{style:{background:"var(--bg-card)",color:"var(--text-primary)",border:"1px solid var(--border)"}}} />
    <Sidebar />
    <PageLayout>
      <PageHeader title="Taxes" subtitle={`${items.length} tax rates`} action={<Button icon={Plus} onClick={openCreate}>Add Tax</Button>} />
      <div style={{marginBottom:16}}><SearchBar value={search} onChange={setSearch} placeholder="Search taxes..." /></div>
      <Card style={{padding:0,overflow:"hidden"}}>
        {isLoading ? <SkeletonTable /> : filtered.length===0 ? (
          <div style={{textAlign:"center",padding:"48px",color:"var(--text-muted)"}}>
            <Percent size={40} style={{margin:"0 auto 12px",display:"block",opacity:0.3}} /><p>No taxes yet</p>
          </div>
        ) : <table>
          <thead><tr><th>ID</th><th>Name</th><th>Rate</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(item=>(
            <tr key={item.id}>
              <td style={{color:"var(--text-muted)",fontSize:12}}>#{item.id}</td>
              <td style={{color:"var(--text-primary)",fontWeight:500}}>{item.name}</td>
              <td><Badge color="var(--warning)">{item.percentage}%</Badge></td>
              <td><div style={{display:"flex",gap:6}}>
                <Button variant="ghost" size="sm" icon={Edit2} onClick={()=>openEdit(item)} />
                <Button variant="danger" size="sm" icon={Trash2} onClick={()=>{if(confirm("Delete?"))del.mutate(item.id)}} />
              </div></td>
            </tr>
          ))}</tbody>
        </table>}
      </Card>
      <Modal open={showModal} onClose={()=>{setShowModal(false);setEditItem(null)}} title={editItem?"Edit Tax":"Add Tax"}>
        <Input label="Tax Name" placeholder="e.g. Sales Tax" value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} />
        <Input label="Percentage (%)" type="number" placeholder="8.5" value={form.percentage||""} onChange={e=>setForm({...form,percentage:e.target.value})} />
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
          <Button variant="secondary" onClick={()=>{setShowModal(false);setEditItem(null)}}>Cancel</Button>
          <Button onClick={submit}>{editItem?"Save Changes":"Add Tax"}</Button>
        </div>
      </Modal>
    </PageLayout>
  </>)
}
