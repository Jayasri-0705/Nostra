import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getJSON, rupees } from '../api.js'

export default function OrderSuccess() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getJSON('/api/orders/' + id + '/').then(setOrder).catch((e) => setError(e.message))
  }, [id])

  if (error) return <p className="error-note">{error}</p>
  if (!order) return <p className="loading-note">Loading...</p>

  return (
    <section className="page" style={{ textAlign: 'center', margin: '0 auto' }}>
      <h2>Thank you, {order.full_name}!</h2>
      <p>Your order #{order.id} has been placed.</p>
      <p>Total: {rupees(order.total)}</p>
      <Link to="/collections" className="btn-shop cart-btn">Continue shopping</Link>
    </section>
  )
}
