import { useState, useEffect } from "react"

function App() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editTrip, setEditTrip] = useState(null)

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = () => {
    fetch("http://localhost:8000/trips")
      .then(res => res.json())
      .then(data => {
        setTrips(data)
        setLoading(false)
      })
      .catch(err => {
        setError("Failed to fetch trips!")
        setLoading(false)
      })
  }

  const deleteTrip = (id) => {
    fetch(`http://localhost:8000/trips/${id}`, {
      method: "DELETE"
    })
    .then(() => fetchTrips())
  }

  const updateTrip = (id) => {
    fetch(`http://localhost:8000/trips/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editTrip)
    })
    .then(() => {
      setEditTrip(null)
      fetchTrips()
    })
  }

  if (loading) return <h2>Loading trips...</h2>
  if (error) return <h2>{error}</h2>

  return (
    <div>
      <h1>Trip Summary System</h1>

      {editTrip && (
        <div>
          <h2>Edit Trip</h2>
          <input
            placeholder="Driver Name"
            value={editTrip.driver_name}
            onChange={e => setEditTrip({...editTrip, driver_name: e.target.value})}
          />
          <input
            placeholder="Total Gallons"
            value={editTrip.total_gallons}
            onChange={e => setEditTrip({...editTrip, total_gallons: e.target.value})}
          />
          <input
            placeholder="Total Stops"
            value={editTrip.total_stops}
            onChange={e => setEditTrip({...editTrip, total_stops: e.target.value})}
          />
          <input
            placeholder="Status"
            value={editTrip.status}
            onChange={e => setEditTrip({...editTrip, status: e.target.value})}
          />
          <button onClick={() => updateTrip(editTrip.id)}>Save</button>
          <button onClick={() => setEditTrip(null)}>Cancel</button>
        </div>
      )}

      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Driver Name</th>
            <th>Total Gallons</th>
            <th>Total Stops</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {trips.map(trip => (
            <tr key={trip.id}>
              <td>{trip.id}</td>
              <td>{trip.driver_name}</td>
              <td>{trip.total_gallons}</td>
              <td>{trip.total_stops}</td>
              <td>{trip.status}</td>
              <td>
                <button onClick={() => setEditTrip(trip)}>Update</button>
                <button onClick={() => deleteTrip(trip.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App