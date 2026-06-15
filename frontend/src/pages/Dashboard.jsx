import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import toast, { Toaster } from "react-hot-toast"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { TrendingUp, Users, Plus, Edit2, Trash2, MapPin, Fuel } from "lucide-react"
import { motion } from "framer-motion"
import Sidebar from "../components/Sidebar"
import { PageLayout, PageHeader, Card, StatCard, Button, Badge, Modal, Input, Select, SearchBar, SkeletonCard, SkeletonTable } from "../components/UI"

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000"
const H = () => ({ Authorization: "Bearer " + localStorage.getItem("token"), "Content-Type": "application/json" })
const STATUS_COLORS = { completed: "var(--success)", pending: "var(--warning)", in_progress: "var(--accent)", cancelled: "var(--danger)" }
const STATUS_OPTIONS = ["pending", "in_progress", "completed", "cancelled"]
const EMPTY = { driver_name: "", origin: "", destination: "", total_gallons: "", total_stops: "", revenue: "", status: "pending", notes: "" }

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
      <p style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</p>
      <p style={{ color: "var(--accent)", fontWeight: 600 }}>${(payload[0]?.value || 0).toLocaleString()} revenue</p>
      <p style={{ color: "var(--success)" }}>{payload[1]?.value || 0} trips</p>
    </div>
  )
}

export default function Dashboard() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => fetch(API + "/analytics/stats", { headers: H() }).then(r => r.json()),
    refetchInterval: 30000
  })

  const { data: trips = [], isLoading: tripsLoading } = useQuery({
    queryKey: ["trips", search, statusFilter],
    queryFn: () => fetch(API + `/trips?search=${encodeURIComponent(search)}&status=${statusFilter}`, { headers: H() }).then(r => r.json()),
    keepPreviousData: true
  })

  const create = useMutation({
    mutationFn: d => fetch(API + "/trips", { method: "POST", headers: H(), body: JSON.stringify({ ...d, total_gallons: parseFloat(d.total_gallons) || 0, total_stops: parseInt(d.total_stops) || 0, revenue: parseFloat(d.revenue) || 0 }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries(["trips"]); qc.invalidateQueries(["analytics"]); toast.success("Trip created!"); setShowModal(false); setForm(EMPTY) }
  })
  const upd = useMutation({
    mutationFn: ({ id, data }) => fetch(API + "/trips/" + id, { method: "PUT", headers: H(), body: JSON.stringify({ ...data, total_gallons: parseFloat(data.total_gallons) || 0, total_stops: parseInt(data.total_stops) || 0, revenue: parseFloat(data.revenue) || 0 }) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries(["trips"]); qc.invalidateQueries(["analytics"]); toast.success("Trip updated!"); setShowModal(false); setEditItem(null) }
  })
  const del = useMutation({
    mutationFn: id => fetch(API + "/trips/" + id, { method: "DELETE", headers: H() }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries(["trips"]); qc.invalidateQueries(["analytics"]); toast.success("Deleted") }
  })

  const openCreate = () => { setForm(EMPTY); setEditItem(null); setShowModal(true) }
  const openEdit = t => { setForm({ ...t }); setEditItem(t); setShowModal(true) }
  const submit = () => editItem ? upd.mutate({ id: editItem.id, data: form }) : create.mutate(form)
  const F = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border)" } }} />
      <Sidebar />
      <PageLayout>
        <PageHeader title="Dashboard" subtitle="Welcome back — here's what's happening" action={<Button icon={Plus} onClick={openCreate}>New Trip</Button>} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          {statsLoading ? [1,2,3,4].map(i => <SkeletonCard key={i} />) : <>
            <StatCard label="Total Trips" value={stats?.total_trips ?? 0} icon={Fuel} color="var(--accent)" delay={0} />
            <StatCard label="Completed" value={stats?.completed_trips ?? 0} icon={TrendingUp} color="var(--success)" delay={0.07} />
            <StatCard label="Customers" value={stats?.total_customers ?? 0} icon={Users} color="var(--warning)" delay={0.14} />
            <StatCard label="Total Revenue" value={"$" + (stats?.total_revenue ?? 0).toLocaleString()} icon={TrendingUp} color="var(--info)" delay={0.21} />
          </>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, marginBottom: 24 }}>
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Revenue Trend</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Last 6 months</p>
            {statsLoading ? <div className="skeleton" style={{ height: 200, borderRadius: 8 }} /> : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={stats?.revenue_by_month || []} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                    <linearGradient id="gTrips" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: "#5c5c78", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#5c5c78", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#gRev)" />
                  <Area type="monotone" dataKey="trips" stroke="#10b981" strokeWidth={2} fill="url(#gTrips)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
          <Card>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Trip Status</h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Current distribution</p>
            {statsLoading ? <div className="skeleton" style={{ height: 200, borderRadius: 8 }} /> : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={(stats?.trips_by_status || []).filter(s => s.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4}>
                    {(stats?.trips_by_status || []).filter(s => s.value > 0).map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v + " trips", n]} contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>

        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>All Trips <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: 13 }}>({trips.length})</span></span>
            <div style={{ display: "flex", gap: 10 }}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search driver, route..." />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: "8px 12px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-secondary)", fontSize: 13, width: "auto" }}>
                <option value="">All Status</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
          </div>

          {tripsLoading ? <SkeletonTable rows={6} /> : trips.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
              <Fuel size={44} style={{ margin: "0 auto 14px", display: "block", opacity: 0.2 }} />
              <p style={{ fontWeight: 500 }}>{search || statusFilter ? "No trips match your search" : "No trips yet"}</p>
              {!search && !statusFilter && <p style={{ fontSize: 13, marginTop: 4 }}>Click "New Trip" to get started.</p>}
            </div>
          ) : (
            <table>
              <thead><tr><th>ID</th><th>Driver</th><th>Route</th><th>Gallons</th><th>Revenue</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{trips.map((t, i) => (
                <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>#{t.id}</td>
                  <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{t.driver_name}</td>
                  <td>
                    {(t.origin || t.destination)
                      ? <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                          <MapPin size={12} style={{ opacity: 0.5, flexShrink: 0 }} />{t.origin || "?"} → {t.destination || "?"}
                        </div>
                      : <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>}
                  </td>
                  <td>{t.total_gallons?.toLocaleString()} gal</td>
                  <td style={{ color: "var(--success)", fontWeight: 600 }}>${t.revenue?.toLocaleString()}</td>
                  <td><Badge color={STATUS_COLORS[t.status] || "var(--text-muted)"}>{t.status?.replace("_", " ")}</Badge></td>
                  <td><div style={{ display: "flex", gap: 6 }}>
                    <Button variant="ghost" size="sm" icon={Edit2} onClick={() => openEdit(t)} />
                    <Button variant="danger" size="sm" icon={Trash2} onClick={() => { if (confirm("Delete this trip?")) del.mutate(t.id) }} />
                  </div></td>
                </motion.tr>
              ))}</tbody>
            </table>
          )}
        </Card>

        <Modal open={showModal} onClose={() => { setShowModal(false); setEditItem(null) }} title={editItem ? "Edit Trip" : "New Trip"}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Driver Name" placeholder="e.g. John Smith" value={form.driver_name} onChange={e => F("driver_name", e.target.value)} />
            <Select label="Status" value={form.status} onChange={e => F("status", e.target.value)}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </Select>
            <Input label="Origin" placeholder="City, State" value={form.origin || ""} onChange={e => F("origin", e.target.value)} />
            <Input label="Destination" placeholder="City, State" value={form.destination || ""} onChange={e => F("destination", e.target.value)} />
            <Input label="Gallons" type="number" placeholder="0" value={form.total_gallons} onChange={e => F("total_gallons", e.target.value)} />
            <Input label="Revenue ($)" type="number" placeholder="0.00" value={form.revenue} onChange={e => F("revenue", e.target.value)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>Notes</label>
            <textarea value={form.notes || ""} onChange={e => F("notes", e.target.value)} placeholder="Optional notes..." style={{ height: 72, resize: "vertical", fontFamily: "inherit" }} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => { setShowModal(false); setEditItem(null) }}>Cancel</Button>
            <Button onClick={submit} disabled={create.isPending || upd.isPending}>
              {(create.isPending || upd.isPending) ? "Saving..." : editItem ? "Save Changes" : "Create Trip"}
            </Button>
          </div>
        </Modal>
      </PageLayout>
    </>
  )
}
