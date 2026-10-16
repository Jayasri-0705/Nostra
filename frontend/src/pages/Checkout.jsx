import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import ErrorList from '../components/ErrorList.jsx'
import { errorMap, getJSON, postJSON, rupees } from '../api.js'
import { useShop } from '../shop.jsx'

export default function Checkout() {
  const { user, setCartCount } = useShop()
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: user ? user.username : '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
  })

  useEffect(() => {
    getJSON('/api/cart/').then(setCart).catch((e) => setErrors({ __all__: [e.message] }))
  }, [])

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      const data = await postJSON('/api/checkout/', form)
      setCartCount(0)
      navigate('/order/success/' + data.order_id)
    } catch (err) {
      setErrors(errorMap(err))
      setSaving(false)
    }
  }

  if (!cart) return <p className="loading-note">Loading...</p>
  if (cart.items.length === 0 && !saving) return <Navigate to="/cart" replace />

  return (
    <>
      <h2 className="cart-title">Checkout</h2>

      <section className="checkout">
        <form className="checkout-form" onSubmit={submit}>
          <ErrorList list={errors.__all__} />

          <ErrorList list={errors.full_name} />
          <p>
            <label htmlFor="full_name">Full name:</label>
            <input id="full_name" type="text" maxLength={150} value={form.full_name} onChange={set('full_name')} required />
          </p>
          <ErrorList list={errors.phone} />
          <p>
            <label htmlFor="phone">Phone:</label>
            <input id="phone" type="text" maxLength={15} value={form.phone} onChange={set('phone')} required />
          </p>
          <ErrorList list={errors.address} />
          <p>
            <label htmlFor="address">Address:</label>
            <textarea id="address" rows={3} value={form.address} onChange={set('address')} required />
          </p>
          <ErrorList list={errors.city} />
          <p>
            <label htmlFor="city">City:</label>
            <input id="city" type="text" maxLength={100} value={form.city} onChange={set('city')} required />
          </p>
          <ErrorList list={errors.pincode} />
          <p>
            <label htmlFor="pincode">Pincode:</label>
            <input id="pincode" type="text" maxLength={10} value={form.pincode} onChange={set('pincode')} required />
          </p>

          <button type="submit" className="btn-cart" disabled={saving}>Place order</button>
        </form>

        <aside className="summary">
          <h3>Order summary</h3>
          {cart.items.map(({ product, quantity, subtotal }) => (
            <div className="summary-row" key={product.id}>
              <span>{product.name} × {quantity}</span>
              <span>{rupees(subtotal)}</span>
            </div>
          ))}
          <div className="summary-row total">
            <span>Total</span>
            <strong>{rupees(cart.total)}</strong>
          </div>
        </aside>
      </section>
    </>
  )
}
