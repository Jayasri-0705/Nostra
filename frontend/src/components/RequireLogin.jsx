import { Navigate, useLocation } from 'react-router-dom'
import { useShop } from '../shop.jsx'

export default function RequireLogin({ children }) {
  const { user, ready } = useShop()
  const location = useLocation()
  if (!ready) return <p className="loading-note">Loading...</p>
  if (!user) {
    return <Navigate to={'/login?next=' + encodeURIComponent(location.pathname)} replace />
  }
  return children
}
