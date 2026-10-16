import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { getJSON } from './api.js'

const ShopContext = createContext(null)

export function useShop() {
  return useContext(ShopContext)
}

export function ShopProvider({ children }) {
  const [user, setUser] = useState(null)
  const [cartCount, setCartCount] = useState(0)
  const [ready, setReady] = useState(false)

  // Apply the answer of /api/me/, /api/login/, /api/logout/ ...
  const apply = useCallback((me) => {
    setUser(me.user)
    setCartCount(me.cart_count)
  }, [])

  useEffect(() => {
    getJSON('/api/me/')
      .then(apply)
      .catch(() => {})
      .finally(() => setReady(true))
  }, [apply])

  return (
    <ShopContext.Provider value={{ user, cartCount, setCartCount, ready, apply }}>
      {children}
    </ShopContext.Provider>
  )
}
