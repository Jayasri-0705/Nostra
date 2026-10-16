import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJSON, rupees } from '../api.js'

function formatDate(iso) {
  return new Date(iso)
    .toLocaleString('en-GB', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .replace(/am|pm/, (s) => s.toUpperCase())
}

export default function MyOrders() {
  const [orders, setOrders] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getJSON('/api/orders/').then(setOrders).catch((e) => setError(e.message))
  }, [])

  if (error) return <p className="error-note">{error}</p>
  if (!orders) return <p className="loading-note">Loading...</p>

  return (
    <>
      <h2 className="cart-title">My Orders</h2>

      <section className="orders-page">
        {orders.map((order) => (
          <div className="order-card" key={order.id}>
            <div className="order-head">
              <div><span>Order</span> <strong>#{order.id}</strong></div>
              <div><span>Placed on</span> {formatDate(order.created_at)}</div>
              <div><span>Total</span> <strong>{rupees(order.total)}</strong></div>
            </div>

            {order.items.map((item, i) => (
              <div className="order-line" key={i}>
                {item.image_url && <img src={item.image_url} alt={item.name} />}
                <div className="info">
                  <h4>{item.name}</h4>
                  <p>{rupees(item.price)} × {item.quantity}</p>
                </div>
                <strong>{rupees(item.price)}</strong>
              </div>
            ))}
          </div>
        ))}

        {orders.length === 0 && (
          <>
            <p>You have no orders yet.</p>
            <Link to="/collections" className="btn-shop cart-btn">Start shopping</Link>
          </>
        )}
      </section>
    </>
  )
}
