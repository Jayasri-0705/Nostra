import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJSON, postJSON, rupees } from '../api.js'
import { useShop } from '../shop.jsx'

export default function Cart() {
  const { setCartCount } = useShop()
  const [cart, setCart] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getJSON('/api/cart/')
      .then((c) => {
        setCart(c)
        setCartCount(c.count)
      })
      .catch((e) => setError(e.message))
  }, [setCartCount])

  async function change(action, productId) {
    try {
      const c = await postJSON('/api/cart/' + action + '/' + productId + '/')
      setCart(c)
      setCartCount(c.count)
    } catch (e) {
      setError(e.message)
    }
  }

  if (error) return <p className="error-note">{error}</p>
  if (!cart) return <p className="loading-note">Loading...</p>

  return (
    <>
      <h2 className="cart-title">Your Cart</h2>

      <section className="page cart-page">
        {cart.items.map(({ product, quantity, subtotal }) => (
          <div className="cart-item" key={product.id}>
            <img src={product.image_url} alt={product.name} />

            <div className="cart-info">
              <p className="crumb">{product.category_name}</p>
              <Link to={'/product/' + product.id}><h3>{product.name}</h3></Link>
              <p className="unit">{rupees(product.price)}</p>

              <div className="qty">
                <button type="button" className="qty-btn" aria-label="Decrease" onClick={() => change('decrease', product.id)}>&minus;</button>
                <span className="qty-num">{quantity}</span>
                <button type="button" className="qty-btn" aria-label="Increase" onClick={() => change('add', product.id)}>+</button>
              </div>

              <p className="sub">{rupees(subtotal)}</p>
            </div>

            <button type="button" className="btn-remove" onClick={() => change('remove', product.id)}>Remove</button>
          </div>
        ))}

        {cart.items.length === 0 && (
          <>
            <p>Your cart is empty.</p>
            <Link to="/collections" className="btn-shop cart-btn">Continue shopping</Link>
          </>
        )}

        {cart.items.length > 0 && (
          <>
            <div className="cart-total">
              <span>Total</span>
              <strong>{rupees(cart.total)}</strong>
            </div>
            <Link to="/checkout" className="btn-shop cart-btn">Checkout</Link>
          </>
        )}
      </section>
    </>
  )
}
