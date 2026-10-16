import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getJSON, postJSON, rupees } from '../api.js'
import { useShop } from '../shop.jsx'

export default function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { setCartCount } = useShop()
  const [product, setProduct] = useState(null)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    setProduct(null)
    setError('')
    getJSON('/api/products/' + id + '/')
      .then(setProduct)
      .catch((e) => setError(e.message))
  }, [id])

  async function addToCart() {
    setAdding(true)
    try {
      const cart = await postJSON('/api/cart/add/' + product.id + '/')
      setCartCount(cart.count)
      navigate('/cart')
    } catch (e) {
      setError(e.message)
      setAdding(false)
    }
  }

  if (error) return <p className="error-note">{error}</p>
  if (!product) return <p className="loading-note">Loading...</p>

  return (
    <section className="detail">
      <div className="detail-photo">
        <img src={product.image_url} alt={product.name} />
      </div>

      <div className="detail-info">
        {product.category && (
          <Link to={'/category/' + product.category} className="crumb">
            &larr; {product.category_name}
          </Link>
        )}

        <h1>{product.name}</h1>
        <p className="price">{rupees(product.price)}</p>

        <hr className="divider" />

        <p className="desc">{product.description}</p>

        <button type="button" className="btn-cart" onClick={addToCart} disabled={adding}>
          Add to cart
        </button>
      </div>
    </section>
  )
}
