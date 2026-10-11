import { useEffect, useState } from 'react'

export default function App() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetch('/api/products/')
      .then((res) => res.json())
      .then((data) => setProducts(data))
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Nostra</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {products.map((p) => (
          <div key={p.id}>
            <img src={p.image_url} alt={p.name} style={{ width: '100%' }} />
            <p>{p.name}</p>
            <strong>₹{p.price}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
