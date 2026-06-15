import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import toast, { Toaster } from "react-hot-toast"
import { Plus, Edit2, Trash2, Package, Tag } from "lucide-react"
import Sidebar from "../components/Sidebar"
import { PageLayout, PageHeader, Card, Button, Badge, Modal, Input, Select, SearchBar, SkeletonTable } from "../components/UI"

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000"
const H = () => ({ Authorization: "Bearer " + localStorage.getItem("token"), "Content-Type": "application/json" })

export default function Products() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [showProductModal, setShowProductModal] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ name: "", product_category_id: "" })
  const [catForm, setCatForm] = useState({ name: "" })

  const { data: products = [], isLoading } = useQuery({ queryKey: ["products"], queryFn: () => fetch(API + "/products", { headers: H() }).then(r => r.json()) })
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: () => fetch(API + "/products/categories", { headers: H() }).then(r => r.json()) })

  const createProduct = useMutation({ mutationFn: d => fetch(API+"/products",{method:"POST",headers:H(),body:JSON.stringify({...d,product_category_id:parseInt(d.product_category_id)})}).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries(["products"]);toast.success("Product added!");setShowProductModal(false);setForm({name:"",product_category_id:""})} })
  const deleteProduct = useMutation({ mutationFn: id=>fetch(API+"/products/"+id,{method:"DELETE",headers:H()}).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries(["products"]);toast.success("Deleted")} })
  const createCat = useMutation({ mutationFn: d => fetch(API+"/products/categories",{method:"POST",headers:H(),body:JSON.stringify(d)}).then(r=>r.json()), onSuccess:()=>{qc.invalidateQueries(["categories"]);toast.success("Category added!");setShowCatModal(false);setCatForm({name:""})} })

  const filtered = products.filter(p => (p.name||"").toLowerCase().includes(search.toLowerCase()) || (p.category?.name||"").toLowerCase().includes(search.toLowerCase()))

  return (<>
    <Toaster position="top-right" toastOptions={{style:{background:"var(--bg-card)",color:"var(--text-primary)",border:"1px solid var(--border)"}}} />
    <Sidebar />
    <PageLayout>
      <PageHeader title="Products" subtitle={`${products.length} products, ${categories.length} categories`}
        action={<div style={{display:"flex",gap:8}}>
          <Button variant="secondary" icon={Tag} size="sm" onClick={()=>setShowCatModal(true)}>Add Category</Button>
          <Button icon={Plus} onClick={()=>{setForm({name:"",product_category_id:""});setEditItem(null);setShowProductModal(true)}}>Add Product</Button>
        </div>} />

      <div style={{display:"flex",gap:12,marginBottom:16,alignItems:"center"}}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search products..." />
        {categories.length>0 && <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {categories.map(c=><Badge key={c.id} color="var(--accent)">{c.name}</Badge>)}
        </div>}
      </div>

      <Card style={{padding:0,overflow:"hidden"}}>
        {isLoading ? <SkeletonTable /> : filtered.length===0 ? (
          <div style={{textAlign:"center",padding:"48px",color:"var(--text-muted)"}}>
            <Package size={40} style={{margin:"0 auto 12px",display:"block",opacity:0.3}} />
            <p>{search?"No results":"No products yet"}</p>
          </div>
        ) : <table>
          <thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(item=>(
            <tr key={item.id}>
              <td style={{color:"var(--text-muted)",fontSize:12}}>#{item.id}</td>
              <td style={{color:"var(--text-primary)",fontWeight:500}}>{item.name}</td>
              <td><Badge color="var(--info)">{item.category?.name||"Uncategorized"}</Badge></td>
              <td><div style={{display:"flex",gap:6}}>
                <Button variant="danger" size="sm" icon={Trash2} onClick={()=>{if(confirm("Delete?"))deleteProduct.mutate(item.id)}} />
              </div></td>
            </tr>
          ))}</tbody>
        </table>}
      </Card>

      <Modal open={showProductModal} onClose={()=>setShowProductModal(false)} title="Add Product">
        <Input label="Product Name" placeholder="e.g. Diesel" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
        <Select label="Category" value={form.product_category_id} onChange={e=>setForm({...form,product_category_id:e.target.value})}>
          <option value="">Select category</option>
          {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
          <Button variant="secondary" onClick={()=>setShowProductModal(false)}>Cancel</Button>
          <Button onClick={()=>createProduct.mutate(form)}>Add Product</Button>
        </div>
      </Modal>

      <Modal open={showCatModal} onClose={()=>setShowCatModal(false)} title="Add Category">
        <Input label="Category Name" placeholder="e.g. Fuel" value={catForm.name} onChange={e=>setCatForm({name:e.target.value})} />
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
          <Button variant="secondary" onClick={()=>setShowCatModal(false)}>Cancel</Button>
          <Button onClick={()=>createCat.mutate(catForm)}>Add Category</Button>
        </div>
      </Modal>
    </PageLayout>
  </>)
}
