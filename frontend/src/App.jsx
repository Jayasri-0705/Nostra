import { useEffect, useState } from 'react'
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Collections from './pages/Collections.jsx'
import Category from './pages/Category.jsx'
import Product from './pages/Product.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderSuccess from './pages/OrderSuccess.jsx'
import MyOrders from './pages/MyOrders.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import RequireLogin from './components/RequireLogin.jsx'
import Assistant from './components/Assistant.jsx'
import { postJSON } from './api.js'
import { useShop } from './shop.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"></path>
    </svg>
  )
}

export default function App() {
  const { user, cartCount, apply } = useShop()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // close the side menu when the page changes
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // while the menu is open: lock page scroll (CSS) and close with the Esc key
  useEffect(() => {
    if (!menuOpen) return undefined
    document.body.classList.add('menu-open')
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('menu-open')
    }
  }, [menuOpen])

  // if the window becomes wide (desktop), close the menu
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 769px)')
    const onChange = () => {
      if (wide.matches) setMenuOpen(false)
    }
    wide.addEventListener('change', onChange)
    return () => wide.removeEventListener('change', onChange)
  }, [])

  async function logout() {
    try {
      apply(await postJSON('/api/logout/'))
    } finally {
      navigate('/')
    }
  }

  return (
    <>
      <ScrollToTop />
      <header className="navbar">
        <Link to="/" className="logo">Nostra</Link>

        <div className="nav-tools">
          <Link to="/cart" className="cart-link cart-top" aria-label="Cart" title="Cart">
            <CartIcon />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          <button
            type="button"
            className="menu-btn"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            onClick={() => setMenuOpen(true)}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        {menuOpen && <div className="nav-overlay" data-testid="overlay" onClick={() => setMenuOpen(false)} />}

        <nav
          id="site-nav"
          className={menuOpen ? 'open' : ''}
          onClick={(e) => {
            if (e.target.closest('a, button')) setMenuOpen(false)
          }}
        >
          <button type="button" className="drawer-close" aria-label="Close menu">&times;</button>
          <Link to="/">Home</Link>
          <Link to="/collections">Collections</Link>
          {user && <Link to="/my-orders">My Orders</Link>}

          <Link to="/cart" className="cart-link cart-in-nav" aria-label="Cart" title="Cart">
            <CartIcon />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {user ? (
            <button type="button" className="nav-btn" onClick={logout}>Logout ({user.username})</button>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign up</Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/category/:id" element={<Category />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<RequireLogin><Checkout /></RequireLogin>} />
          <Route path="/order/success/:id" element={<RequireLogin><OrderSuccess /></RequireLogin>} />
          <Route path="/my-orders" element={<RequireLogin><MyOrders /></RequireLogin>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<div className="page"><h2>Page not found</h2></div>} />
        </Routes>
      </main>

      <footer className="footer">
        <h3>Nostra</h3>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
        <p>@2025 Nostra.com</p>
      </footer>

      <Assistant />
    </>
  )
}
