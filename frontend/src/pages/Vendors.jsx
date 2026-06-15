import { useState } from "react"
import { motion } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import toast, { Toaster } from "react-hot-toast"
import { Plus, Edit2, Trash2, Truck } from "lucide-react"
import Sidebar from "../components/Sidebar"
import { PageLayout, PageHeader, Card, Button, Modal, Input, SearchBar, SkeletonTable } from "../components/UI"
const API = "http://localhost:8000"
const H = () => ({ Authorization: "Bearer " + localStorage.getItem("token"), "Content-Type": "application/json" })
const EMPTY = { name: "", email: "", address: "" }
export default function Vendors() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const { data: items = [], isLoading } = useQuery({ queryKey: ["vendors"], queryFn: () => fetch(API + "/vendors", { headers: H() }).then(r => r.json()) })
  const create = useMutation({ mutationFn: d => fetch(API+"/vendors",{method:"POST",headers:H(),body:JSON.stringify(d)}).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries(["vendors"]);toast.success("Vendor added!");setShowModal(false);setForm(EMPTY)} })
  const update = useMutation({ mutationFn: ({id,data})=>fetch(API+"/vendors/"+id,{method:"PUT",headers:H(),body:JSON.stringify(data)}).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries(["vendors"]);toast.success("Updated!");setShowModal(false);setEditItem(null)} })
  const del = useMutation({ mutationFn: id=>fetch(API+"/vendors/"+id,{method:"DELETE",headers:H()}).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries(["vendors"]);toast.success("Deleted")} })
  const openCreate = () => { setForm(EMPTY); setEditItem(null); setShowModal(true) }
  const openEdit = item => { setForm({...item}); setEditItem(item); setShowModal(true) }
  const submit = () => editItem ? update.mutate({id:editItem.id,data:form}) : create.mutate(form)
  const filtered = items.filter(i => [i.name,i.email,i.address].some(v=>(v||"").toLowerCase().includes(search.toLowerCase())))
  return (<>
    <Toaster position="top-right" toastOptions={{style:{background:"var(--bg-card)",color:"var(--text-primary)",border:"1px solid var(--border)"}}} />
    <Sidebar />
    <PageLayout>
      <PageHeader title="Vendors" subtitle={`${items.length} total`} action={<Button icon={Plus} onClick={openCreate}>Add Vendor</Button>} />
      <div style={{marginBottom:16}}><SearchBar value={search} onChange={setSearch} placeholder="Search vendors..." /></div>
      <Card style={{padding:0,overflow:"hidden"}}>
        {isLoading ? <SkeletonTable /> : filtered.length===0 ? (
          <div style={{textAlign:"center",padding:"48px",color:"var(--text-muted)"}}>
            <Truck size={40} style={{margin:"0 auto 12px",display:"block",opacity:0.3}} /><p>{search?"No results":"No vendors yet"}</p>
          </div>
        ) : <table>
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Address</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(item=>(
            <motion.tr key={item.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0}}>
              <td style={{color:"var(--text-muted)",fontSize:12}}>#{item.id}</td>
              <td style={{color:"var(--text-primary)",fontWeight:500}}>{item.name}</td>
              <td>{item.email}</td>
              <td style={{color:"var(--text-muted)"}}>{item.address}</td>
              <td><div style={{display:"flex",gap:6}}>
                <Button variant="ghost" size="sm" icon={Edit2} onClick={()=>openEdit(item)} />
                <Button variant="danger" size="sm" icon={Trash2} onClick={()=>{if(confirm("Delete?"))del.mutate(item.id)}} />
              </div></td>
            </motion.tr>
          ))}</tbody>
        </table>}
      </Card>
      <Modal open={showModal} onClose={()=>{setShowModal(false);setEditItem(null)}} title={editItem?"Edit Vendor":"Add Vendor"}>
        <Input label="Name" placeholder="Vendor name" value={form.name||""} onChange={e=>setForm({...form,name:e.target.value})} />
        <Input label="Email" type="email" placeholder="email@vendor.com" value={form.email||""} onChange={e=>setForm({...form,email:e.target.value})} />
        <Input label="Address" placeholder="123 Depot Rd" value={form.address||""} onChange={e=>setForm({...form,address:e.target.value})} />
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
          <Button variant="secondary" onClick={()=>{setShowModal(false);setEditItem(null)}}>Cancel</Button>
          <Button onClick={submit}>{editItem?"Save Changes":"Add Vendor"}</Button>
        </div>
      </Modal>
    </PageLayout>
  </>)
}
