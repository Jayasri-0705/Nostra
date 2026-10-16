import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getJSON } from '../api.js'

const clean = (t) => ' ' + String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

export default function Collections() {
  const [products, setProducts] = useState(null)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [text, setText] = useState('')
  const [params] = useSearchParams()
  const selected = params.get('category') || ''

  useEffect(() => {
    Promise.all([getJSON('/api/products/'), getJSON('/api/categories/')])
      .then(([p, c]) => {
        setProducts(p)
        setCategories(c)
      })
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <p className="error-note">{error}</p>
  if (!products) return <p className="loading-note">Loading...</p>

  const q = clean(text)
  const shown = products.filter(
    (p) =>
      (!selected || String(p.category) === selected) &&
      (q.trim() === '' || clean(p.name + ' ' + p.category_name).includes(q)),
  )

  return (
    <>
      <form className="search-form" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoComplete="off"
        />
        <button type="submit">🔍</button>
      </form>

      <div className="chips">
        <Link to="/collections" className={'chip' + (!selected ? ' active' : '')}>All</Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            to={'/collections?category=' + c.id}
            className={'chip' + (String(c.id) === selected ? ' active' : '')}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="product-grid">
        {shown.map((p) => (
          <Link key={p.id} to={'/product/' + p.id} className="product-card">
            <img src={p.image_url} alt={p.name} />
            <p>{p.name}</p>
          </Link>
        ))}
      </div>

      {shown.length === 0 && <p className="empty-note">No dresses found.</p>}
    </>
  )
}
