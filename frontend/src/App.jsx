import { useState, useEffect } from "react"

function App() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
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
  }, [])

  if (loading) return <h2>Loading trips...</h2>
  if (error) return <h2>{error}</h2>

  return (
    <div>
      <h1>Trip Summary System</h1>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Driver Name</th>
            <th>Total Gallons</th>
            <th>Total Stops</th>
            <th>Status</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App