import NavBar from "../components/NavBar"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

const API = "http://localhost:8000"

function Products() {
  const queryClient = useQueryClient()
  const token = localStorage.getItem("token")
  const [newProduct, setNewProduct] = useState({ name: "", product_category_id: "" })
  const [newCategory, setNewCategory] = useState({ name: "" })
  const [editProduct, setEditProduct] = useState(null)

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetch(API + "/products", {
      headers: { Authorization: "Bearer " + token }
    }).then(res => res.json())
  })

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetch(API + "/products/categories", {
      headers: { Authorization: "Bearer " + token }
    }).then(res => res.json())
  })

  const createCategoryMutation = useMutation({
    mutationFn: (category) => fetch(API + "/products/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify(category)
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"])
      setNewCategory({ name: "" })
    }
  })

  const createMutation = useMutation({
    mutationFn: (product) => fetch(API + "/products", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({...product, product_category_id: parseInt(product.product_category_id)})
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"])
      setNewProduct({ name: "", product_category_id: "" })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(API + "/products/" + id, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries(["products"])
  })

  return (
    <div>
      <NavBar />
      <div style={{ padding: "20px" }}>
      <h2 style={{ color: "#4f46e5" }}>📦 Product Management</h2>

      <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }}>
        <h3 style={{ color: "#4f46e5" }}>➕ Add Category</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input style={inputStyle} placeholder="Category Name" value={newCategory.name}
            onChange={e => setNewCategory({name: e.target.value})} />
          <button style={btnStyle} onClick={() => createCategoryMutation.mutate(newCategory)}>Add Category</button>
        </div>
      </div>

      <div style={{ backgroundColor: "#f9f9f9", padding: "20px", borderRadius: "10px", marginBottom: "20px", border: "2px solid #4f46e5" }}>
        <h3 style={{ color: "#4f46e5" }}>➕ Add Product</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input style={inputStyle} placeholder="Product Name" value={newProduct.name}
            onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
          <select style={inputStyle} value={newProduct.product_category_id}
            onChange={e => setNewProduct({...newProduct, product_category_id: e.target.value})}>
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button style={btnStyle} onClick={() => createMutation.mutate(newProduct)}>Add Product</button>
        </div>
      </div>

      <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#4f46e5", color: "white" }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td style={tdStyle}>{product.id}</td>
              <td style={tdStyle}>{product.name}</td>
              <td style={tdStyle}>{product.category?.name || "N/A"}</td>
              <td style={tdStyle}>
                <button style={{...btnStyle, backgroundColor: "red"}}
                  onClick={() => deleteMutation.mutate(product.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  )
}

const inputStyle = { padding: "8px", borderRadius: "6px", border: "1px solid #4f46e5", fontSize: "14px" }
const btnStyle = { padding: "8px 15px", backgroundColor: "#4f46e5", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }
const thStyle = { padding: "10px", textAlign: "left" }
const tdStyle = { padding: "10px" }

export default Products
