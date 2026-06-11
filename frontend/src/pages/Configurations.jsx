import NavBar from "../components/NavBar"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const API = "http://localhost:8000"

function Configurations() {
  const queryClient = useQueryClient()
  const token = localStorage.getItem("token")

  const [tab, setTab] = useState("invoice")

  // Invoice config form
  const [invoiceForm, setInvoiceForm] = useState({
    customer_id: "", shipto_id: "", invoice_time: "08:00",
    products: [{ product_id: "", quantity: 0, rate: 0 }],
    fees: [{ fee_id: "", quantity: 1, rate: 0 }],
    taxes: [{ tax_id: "" }]
  })

  // Freight config form
  const [freightForm, setFreightForm] = useState({
    vendor_id: "",
    categories: [{ category_id: "", quantity: 0, freight_rate: 0 }],
    fees: [{ fee_id: "", quantity: 1, rate: 0 }]
  })

  const [message, setMessage] = useState("")

  const { data: invoiceConfigs = [] } = useQuery({
    queryKey: ["invoice-configs"],
    queryFn: () => fetch(API + "/invoice-configurations", {
      headers: { Authorization: "Bearer " + token }
    }).then(res => res.json())
  })

  const { data: freightConfigs = [] } = useQuery({
    queryKey: ["freight-configs"],
    queryFn: () => fetch(API + "/freight-configurations", {
      headers: { Authorization: "Bearer " + token }
    }).then(res => res.json())
  })

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => fetch(API + "/customers", { headers: { Authorization: "Bearer " + token } }).then(r => r.json())
  })

  const { data: shipTos = [] } = useQuery({
    queryKey: ["ship-tos"],
    queryFn: () => fetch(API + "/customers/ship-tos/all", { headers: { Authorization: "Bearer " + token } }).then(r => r.json())
  })

  const { data: vendors = [] } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => fetch(API + "/vendors", { headers: { Authorization: "Bearer " + token } }).then(r => r.json())
  })

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetch(API + "/products", { headers: { Authorization: "Bearer " + token } }).then(r => r.json())
  })

  const { data: fees = [] } = useQuery({
    queryKey: ["fees"],
    queryFn: () => fetch(API + "/fees", { headers: { Authorization: "Bearer " + token } }).then(r => r.json())
  })

  const { data: taxes = [] } = useQuery({
    queryKey: ["taxes"],
    queryFn: () => fetch(API + "/taxes", { headers: { Authorization: "Bearer " + token } }).then(r => r.json())
  })

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetch(API + "/products/categories", { headers: { Authorization: "Bearer " + token } }).then(r => r.json())
  })

  const invoiceMutation = useMutation({
    mutationFn: (data) => fetch(API + "/invoice-configurations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(["invoice-configs"])
      setMessage("Invoice configuration saved!")
    }
  })

  const freightMutation = useMutation({
    mutationFn: (data) => fetch(API + "/freight-configurations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(["freight-configs"])
      setMessage("Freight configuration saved!")
    }
  })

  const updateLine = (arr, setArr, index, field, value) => {
    const copy = [...arr]
    copy[index] = { ...copy[index], [field]: value }
    setArr(copy)
  }

  const addLine = (arr, setArr, empty) => setArr([...arr, empty])
  const removeLine = (arr, setArr, index) => setArr(arr.filter((_, i) => i !== index))

  return (
    <div>
      <NavBar />
      <div style={{ padding: "20px" }}>
      <h2 style={{ color: "#4f46e5" }}>⚙️ Invoice & Freight Configurations</h2>

      {message && <div style={{ backgroundColor: "#d4edda", padding: "10px", borderRadius: "6px", marginBottom: "15px", color: "green" }}>{message}</div>}

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button style={{ ...btnStyle, backgroundColor: tab === "invoice" ? "#4f46e5" : "#ccc" }} onClick={() => setTab("invoice")}>Invoice Config</button>
        <button style={{ ...btnStyle, backgroundColor: tab === "freight" ? "#4f46e5" : "#ccc" }} onClick={() => setTab("freight")}>Freight Config</button>
      </div>

      {tab === "invoice" && (
        <div>
          <div style={cardStyle}>
            <h3 style={{ color: "#4f46e5" }}>➕ New Invoice Configuration</h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
              <div>
                <label style={labelStyle}>Customer</label>
                <select style={selectStyle} value={invoiceForm.customer_id}
                  onChange={e => setInvoiceForm({ ...invoiceForm, customer_id: parseInt(e.target.value) })}>
                  <option value="">Select customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Ship To</label>
                <select style={selectStyle} value={invoiceForm.shipto_id}
                  onChange={e => setInvoiceForm({ ...invoiceForm, shipto_id: parseInt(e.target.value) })}>
                  <option value="">Select ship to</option>
                  {shipTos.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Invoice Time</label>
                <input style={inputStyle} type="time" value={invoiceForm.invoice_time}
                  onChange={e => setInvoiceForm({ ...invoiceForm, invoice_time: e.target.value })} />
              </div>
            </div>

            <h4>Products</h4>
            {invoiceForm.products.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                <select style={selectStyle} value={p.product_id}
                  onChange={e => updateLine(invoiceForm.products, (v) => setInvoiceForm({ ...invoiceForm, products: v }), i, "product_id", parseInt(e.target.value))}>
                  <option value="">Product</option>
                  {products.map(pr => <option key={pr.id} value={pr.id}>{pr.name}</option>)}
                </select>
                <input style={numStyle} type="number" placeholder="Qty" value={p.quantity}
                  onChange={e => updateLine(invoiceForm.products, (v) => setInvoiceForm({ ...invoiceForm, products: v }), i, "quantity", parseFloat(e.target.value))} />
                <input style={numStyle} type="number" placeholder="Rate" step="0.01" value={p.rate}
                  onChange={e => updateLine(invoiceForm.products, (v) => setInvoiceForm({ ...invoiceForm, products: v }), i, "rate", parseFloat(e.target.value))} />
                <button style={removeBtn} onClick={() => removeLine(invoiceForm.products, (v) => setInvoiceForm({ ...invoiceForm, products: v }), i)}>✕</button>
              </div>
            ))}
            <button style={addLineBtn} onClick={() => addLine(invoiceForm.products, (v) => setInvoiceForm({ ...invoiceForm, products: v }), { product_id: "", quantity: 0, rate: 0 })}>+ Add Product</button>

            <h4>Fees</h4>
            {invoiceForm.fees.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                <select style={selectStyle} value={f.fee_id}
                  onChange={e => updateLine(invoiceForm.fees, (v) => setInvoiceForm({ ...invoiceForm, fees: v }), i, "fee_id", parseInt(e.target.value))}>
                  <option value="">Fee</option>
                  {fees.map(fe => <option key={fe.id} value={fe.id}>{fe.name}</option>)}
                </select>
                <input style={numStyle} type="number" placeholder="Qty" value={f.quantity}
                  onChange={e => updateLine(invoiceForm.fees, (v) => setInvoiceForm({ ...invoiceForm, fees: v }), i, "quantity", parseFloat(e.target.value))} />
                <input style={numStyle} type="number" placeholder="Rate" step="0.01" value={f.rate}
                  onChange={e => updateLine(invoiceForm.fees, (v) => setInvoiceForm({ ...invoiceForm, fees: v }), i, "rate", parseFloat(e.target.value))} />
                <button style={removeBtn} onClick={() => removeLine(invoiceForm.fees, (v) => setInvoiceForm({ ...invoiceForm, fees: v }), i)}>✕</button>
              </div>
            ))}
            <button style={addLineBtn} onClick={() => addLine(invoiceForm.fees, (v) => setInvoiceForm({ ...invoiceForm, fees: v }), { fee_id: "", quantity: 1, rate: 0 })}>+ Add Fee</button>

            <h4>Taxes</h4>
            {invoiceForm.taxes.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                <select style={selectStyle} value={t.tax_id}
                  onChange={e => updateLine(invoiceForm.taxes, (v) => setInvoiceForm({ ...invoiceForm, taxes: v }), i, "tax_id", parseInt(e.target.value))}>
                  <option value="">Tax</option>
                  {taxes.map(tx => <option key={tx.id} value={tx.id}>{tx.name} ({tx.percentage}%)</option>)}
                </select>
                <button style={removeBtn} onClick={() => removeLine(invoiceForm.taxes, (v) => setInvoiceForm({ ...invoiceForm, taxes: v }), i)}>✕</button>
              </div>
            ))}
            <button style={addLineBtn} onClick={() => addLine(invoiceForm.taxes, (v) => setInvoiceForm({ ...invoiceForm, taxes: v }), { tax_id: "" })}>+ Add Tax</button>

            <div style={{ marginTop: "15px" }}>
              <button style={btnStyle} onClick={() => invoiceMutation.mutate(invoiceForm)}>Save Invoice Configuration</button>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ color: "#4f46e5" }}>Saved Invoice Configurations</h3>
            <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#4f46e5", color: "white" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Ship To</th>
                  <th style={thStyle}>Time</th>
                  <th style={thStyle}>Products</th>
                </tr>
              </thead>
              <tbody>
                {invoiceConfigs.map(c => (
                  <tr key={c.id}>
                    <td style={tdStyle}>{c.id}</td>
                    <td style={tdStyle}>{c.customer?.name || c.customer_id}</td>
                    <td style={tdStyle}>{c.shipto?.name || c.shipto_id}</td>
                    <td style={tdStyle}>{c.invoice_time}</td>
                    <td style={tdStyle}>{c.products?.length || 0} products</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "freight" && (
        <div>
          <div style={cardStyle}>
            <h3 style={{ color: "#4f46e5" }}>➕ New Freight Configuration</h3>
            <div style={{ marginBottom: "15px" }}>
              <label style={labelStyle}>Vendor</label>
              <select style={selectStyle} value={freightForm.vendor_id}
                onChange={e => setFreightForm({ ...freightForm, vendor_id: parseInt(e.target.value) })}>
                <option value="">Select vendor</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>

            <h4>Product Categories & Freight Rates</h4>
            {freightForm.categories.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                <select style={selectStyle} value={c.category_id}
                  onChange={e => updateLine(freightForm.categories, (v) => setFreightForm({ ...freightForm, categories: v }), i, "category_id", parseInt(e.target.value))}>
                  <option value="">Category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                <input style={numStyle} type="number" placeholder="Qty" value={c.quantity}
                  onChange={e => updateLine(freightForm.categories, (v) => setFreightForm({ ...freightForm, categories: v }), i, "quantity", parseFloat(e.target.value))} />
                <input style={numStyle} type="number" placeholder="Freight Rate" step="0.0001" value={c.freight_rate}
                  onChange={e => updateLine(freightForm.categories, (v) => setFreightForm({ ...freightForm, categories: v }), i, "freight_rate", parseFloat(e.target.value))} />
                <button style={removeBtn} onClick={() => removeLine(freightForm.categories, (v) => setFreightForm({ ...freightForm, categories: v }), i)}>✕</button>
              </div>
            ))}
            <button style={addLineBtn} onClick={() => addLine(freightForm.categories, (v) => setFreightForm({ ...freightForm, categories: v }), { category_id: "", quantity: 0, freight_rate: 0 })}>+ Add Category</button>

            <h4>Fees</h4>
            {freightForm.fees.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                <select style={selectStyle} value={f.fee_id}
                  onChange={e => updateLine(freightForm.fees, (v) => setFreightForm({ ...freightForm, fees: v }), i, "fee_id", parseInt(e.target.value))}>
                  <option value="">Fee</option>
                  {fees.map(fe => <option key={fe.id} value={fe.id}>{fe.name}</option>)}
                </select>
                <input style={numStyle} type="number" placeholder="Qty" value={f.quantity}
                  onChange={e => updateLine(freightForm.fees, (v) => setFreightForm({ ...freightForm, fees: v }), i, "quantity", parseFloat(e.target.value))} />
                <input style={numStyle} type="number" placeholder="Rate" step="0.01" value={f.rate}
                  onChange={e => updateLine(freightForm.fees, (v) => setFreightForm({ ...freightForm, fees: v }), i, "rate", parseFloat(e.target.value))} />
                <button style={removeBtn} onClick={() => removeLine(freightForm.fees, (v) => setFreightForm({ ...freightForm, fees: v }), i)}>✕</button>
              </div>
            ))}
            <button style={addLineBtn} onClick={() => addLine(freightForm.fees, (v) => setFreightForm({ ...freightForm, fees: v }), { fee_id: "", quantity: 1, rate: 0 })}>+ Add Fee</button>

            <div style={{ marginTop: "15px" }}>
              <button style={btnStyle} onClick={() => freightMutation.mutate(freightForm)}>Save Freight Configuration</button>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ color: "#4f46e5" }}>Saved Freight Configurations</h3>
            <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#4f46e5", color: "white" }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Vendor</th>
                  <th style={thStyle}>Categories</th>
                  <th style={thStyle}>Fees</th>
                </tr>
              </thead>
              <tbody>
                {freightConfigs.map(c => (
                  <tr key={c.id}>
                    <td style={tdStyle}>{c.id}</td>
                    <td style={tdStyle}>{c.vendor?.name || c.vendor_id}</td>
                    <td style={tdStyle}>{c.categories?.length || 0} categories</td>
                    <td style={tdStyle}>{c.fees?.length || 0} fees</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </div>
  )
}

const cardStyle = { backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }
const labelStyle = { display: "block", marginBottom: "4px", fontWeight: "600" }
const inputStyle = { padding: "8px", borderRadius: "6px", border: "1px solid #4f46e5", fontSize: "14px" }
const selectStyle = { padding: "8px", borderRadius: "6px", border: "1px solid #4f46e5", fontSize: "14px" }
const numStyle = { padding: "8px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px", width: "80px" }
const btnStyle = { padding: "8px 15px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }
const addLineBtn = { padding: "5px 10px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", marginTop: "5px" }
const removeBtn = { padding: "4px 8px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }
const thStyle = { padding: "10px", textAlign: "left" }
const tdStyle = { padding: "10px" }

export default Configurations
