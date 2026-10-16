import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getJSON } from '../api.js'

export default function Category() {
  const { id } = useParams()
  const [products, setProducts] = useState(null)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getJSON('/api/products/'), getJSON('/api/categories/')])
      .then(([p, c]) => {
        setProducts(p)
        setCategories(c)
      })
      .catch((e) => setError(e.message))
  }, [id])

  if (error) return <p className="error-note">{error}</p>
  if (!products) return <p className="loading-note">Loading...</p>

  const category = categories.find((c) => String(c.id) === id)
  const items = products.filter((p) => String(p.category) === id)

  return (
    <>
      <div className="page-head">
        <Link to="/collections" className="back-link">&larr; All collections</Link>
        <h1>{category ? category.name : 'Category'}</h1>
        <p>{items.length} {items.length === 1 ? 'item' : 'items'}</p>
      </div>

      <div className="product-grid">
        {items.map((p) => (
          <Link key={p.id} to={'/product/' + p.id} className="product-card">
            <img src={p.image_url} alt={p.name} />
            <p>{p.name}</p>
          </Link>
        ))}
      </div>
    </>
  )
}
