import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJSON } from '../api.js'

const SECTION_LABELS = { women: "Women's", men: "Men's", kids: 'Kids' }
const GROUPS = [
  ['new_arrivals', 'New Arrival', 'No new arrivals yet.'],
  ['most_wanted', 'Most Wanted', 'No products yet.'],
]
const sectionLabel = (key) =>
  SECTION_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1)

export default function Home() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getJSON('/api/home/').then(setData).catch((e) => setError(e.message))
  }, [])

  return (
    <>
      <section className="hero-banner" style={{ backgroundImage: "url('/images/hero_wide.jpg')" }}>
        <div className="hero-content">
          <p className="eyebrow">NEW SEASON, FRESH STYLES</p>
          <h1>Level Up<span className="script">Your Style <span className="heart">&#9825;</span></span></h1>
          <p className="tagline">with our gorgeous collection</p>
          <Link to="/collections" className="btn-shop">SHOP NOW &rarr;</Link>
        </div>
      </section>

      <div className="features-head">
        <h2>We Provide Best<br />Customer Experience</h2>
        <p>|| we ensure that our customer have the best shopping experience</p>
      </div>

      <div className="features">
        <div className="feature">🆕<strong>New Arrival Everyday</strong>Fashion e-commerce is the online buying and selling of apparel, footwear and accessories.</div>
        <div className="feature">🚚<strong>Fast and Free Shipping</strong>A high-growth sector focusing on visual merchandising and digital marketing.</div>
        <div className="feature">✅<strong>Satisfaction Guarantee</strong>Personalized shopping experiences to drive sales.</div>
      </div>

      {error && <p className="error-note">{error}</p>}
      {!data && !error && <p className="loading-note">Loading...</p>}

      {data && GROUPS.map(([groupKey, title, emptyText]) => (
        <div key={groupKey}>
          <h2 className="section-title">{title}</h2>
          {Object.keys(data).map((section) => {
            const list = (data[section] && data[section][groupKey]) || []
            return (
              <div key={section}>
                <h3 className="sub-title">{sectionLabel(section)}</h3>
                <div className="product-grid six">
                  {list.length === 0 && <p className="empty-note">{emptyText}</p>}
                  {list.map((c) => (
                    <Link key={c.id} to={'/category/' + c.id} className="product-card">
                      <div className="img-box">
                        <img src={c.image_url} alt={c.name} />
                        <span className="shop-btn">Shop now &rarr;</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </>
  )
}
