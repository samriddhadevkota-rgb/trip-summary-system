import { useState } from "react"
import { motion } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import toast, { Toaster } from "react-hot-toast"
import { Plus, Edit2, Trash2, Users, MapPin } from "lucide-react"
import Sidebar from "../components/Sidebar"
import { PageLayout, PageHeader, Card, Button, Modal, Input, SearchBar, SkeletonTable } from "../components/UI"

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000"
const H = () => ({ Authorization: "Bearer " + localStorage.getItem("token"), "Content-Type": "application/json" })
const EMPTY = { name: "", email: "", billing_address: "" }
const EMPTY_SHIP = { name: "", address: "" }

export default function Customers() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const [showShipModal, setShowShipModal] = useState(false)
  const [shipCustomer, setShipCustomer] = useState(null)
  const [shipForm, setShipForm] = useState(EMPTY_SHIP)

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => fetch(API + "/customers", { headers: H() }).then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
  })

  const { data: allShipTos = [] } = useQuery({
    queryKey: ["ship-tos"],
    queryFn: () => fetch(API + "/customers/ship-tos/all", { headers: H() }).then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
  })

  const create = useMutation({
    mutationFn: d => fetch(API + "/customers", { method: "POST", headers: H(), body: JSON.stringify(d) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries(["customers"]); toast.success("Customer added!"); setShowModal(false); setForm(EMPTY) }
  })
  const update = useMutation({
    mutationFn: ({ id, data }) => fetch(API + "/customers/" + id, { method: "PUT", headers: H(), body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries(["customers"]); toast.success("Updated!"); setShowModal(false); setEditItem(null) }
  })
  const del = useMutation({
    mutationFn: id => fetch(API + "/customers/" + id, { method: "DELETE", headers: H() }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries(["customers"]); toast.success("Deleted") }
  })

  const addShipTo = useMutation({
    mutationFn: d => fetch(API + "/customers/ship-tos", { method: "POST", headers: H(), body: JSON.stringify(d) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries(["ship-tos"]); toast.success("Ship-to address added!"); setShipForm(EMPTY_SHIP) }
  })

  const openCreate = () => { setForm(EMPTY); setEditItem(null); setShowModal(true) }
  const openEdit = item => { setForm({ ...item }); setEditItem(item); setShowModal(true) }
  const submit = () => editItem ? update.mutate({ id: editItem.id, data: form }) : create.mutate(form)

  const openShipModal = customer => { setShipCustomer(customer); setShipForm(EMPTY_SHIP); setShowShipModal(true) }

  const filtered = items.filter(i => [i.name, i.email, i.billing_address].some(v => (v || "").toLowerCase().includes(search.toLowerCase())))

  return (<>
    <Toaster position="top-right" toastOptions={{ style: { background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)" } }} />
    <Sidebar />
    <PageLayout>
      <PageHeader title="Customers" subtitle={`${items.length} total`} action={<Button icon={Plus} onClick={openCreate}>Add Customer</Button>} />
      <div style={{ marginBottom: 16 }}><SearchBar value={search} onChange={setSearch} placeholder="Search customers..." /></div>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {isLoading ? <SkeletonTable /> : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
            <Users size={40} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} /><p>{search ? "No results" : "No customers yet"}</p>
          </div>
        ) : <table>
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Billing Address</th><th>Ship-To</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(item => {
            const shipTos = allShipTos.filter(s => s.customer_id === item.id)
            return (
              <motion.tr key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <td style={{ color: "var(--text-muted)", fontSize: 12 }}>#{item.id}</td>
                <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{item.name}</td>
                <td>{item.email}</td>
                <td style={{ color: "var(--text-muted)" }}>{item.billing_address}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    {shipTos.length > 0 ? shipTos.map(s => (
                      <span key={s.id} style={{ fontSize: 11, padding: "2px 8px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-secondary)" }}>
                        {s.name}
                      </span>
                    )) : <span style={{ fontSize: 12, color: "var(--text-muted)" }}>None</span>}
                    <button onClick={() => openShipModal(item)}
                      style={{ fontSize: 11, padding: "2px 8px", background: "transparent", border: "1px dashed var(--border)", borderRadius: 6, color: "var(--accent-bright)", cursor: "pointer" }}>
                      + Add
                    </button>
                  </div>
                </td>
                <td><div style={{ display: "flex", gap: 6 }}>
                  <Button variant="ghost" size="sm" icon={Edit2} onClick={() => openEdit(item)} />
                  <Button variant="danger" size="sm" icon={Trash2} onClick={() => { if (confirm("Delete?")) del.mutate(item.id) }} />
                </div></td>
              </motion.tr>
            )
          })}</tbody>
        </table>}
      </Card>

      {/* Add/Edit Customer Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditItem(null) }} title={editItem ? "Edit Customer" : "Add Customer"}>
        <Input label="Name" placeholder="Company name" value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} />
        <Input label="Email" type="email" placeholder="email@company.com" value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} />
        <Input label="Billing Address" placeholder="123 Main St" value={form.billing_address || ""} onChange={e => setForm({ ...form, billing_address: e.target.value })} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <Button variant="secondary" onClick={() => { setShowModal(false); setEditItem(null) }}>Cancel</Button>
          <Button onClick={submit}>{editItem ? "Save Changes" : "Add Customer"}</Button>
        </div>
      </Modal>

      {/* Ship-To Modal */}
      <Modal open={showShipModal} onClose={() => setShowShipModal(false)} title={`Ship-To Addresses — ${shipCustomer?.name || ""}`}>
        {shipCustomer && (() => {
          const existing = allShipTos.filter(s => s.customer_id === shipCustomer.id)
          return (<>
            {existing.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>Existing addresses:</p>
                {existing.map(s => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--bg-secondary)", borderRadius: 8, marginBottom: 6, fontSize: 13 }}>
                    <MapPin size={13} style={{ color: "var(--accent-bright)", flexShrink: 0 }} />
                    <span style={{ fontWeight: 500 }}>{s.name}</span>
                    <span style={{ color: "var(--text-muted)" }}>— {s.address}</span>
                  </div>
                ))}
                <div style={{ height: 1, background: "var(--border)", margin: "16px 0" }} />
              </div>
            )}
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>Add new ship-to address:</p>
            <Input label="Location Name" placeholder='e.g. "Warehouse A" or "Main Site"' value={shipForm.name} onChange={e => setShipForm({ ...shipForm, name: e.target.value })} />
            <Input label="Address" placeholder="123 Delivery St, City, TX" value={shipForm.address} onChange={e => setShipForm({ ...shipForm, address: e.target.value })} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <Button variant="secondary" onClick={() => setShowShipModal(false)}>Close</Button>
              <Button icon={Plus} onClick={() => addShipTo.mutate({ customer_id: shipCustomer.id, name: shipForm.name, address: shipForm.address })}
                disabled={!shipForm.name || !shipForm.address || addShipTo.isPending}>
                {addShipTo.isPending ? "Saving..." : "Add Address"}
              </Button>
            </div>
          </>)
        })()}
      </Modal>
    </PageLayout>
  </>)
}
