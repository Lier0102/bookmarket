import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as cartApi from '../api/cart'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isAuthenticated, initializing } = useAuth()
  const [cart, setCart] = useState(null)
  // Starts true (not false) so consumers can't observe a false "finished loading,
  // cart is empty" reading before auth has resolved and the initial fetch effect
  // below has had a chance to run.
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await cartApi.getCart()
      setCart(data)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    // Wait for AuthContext to finish resolving the stored token before deciding
    // anything — otherwise `isAuthenticated` is momentarily a stale `false` on
    // every hard reload, and this effect would wrongly conclude "no cart".
    if (initializing) return undefined

    let cancelled = false

    async function run() {
      if (!isAuthenticated) {
        if (!cancelled) {
          setCart(null)
          setLoading(false)
        }
        return
      }
      if (!cancelled) setLoading(true)
      try {
        const data = await cartApi.getCart()
        if (!cancelled) setCart(data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, initializing])

  const addItem = useCallback(async (bookId, quantity) => {
    const data = await cartApi.addCartItem(bookId, quantity)
    setCart(data)
    return data
  }, [])

  const updateItem = useCallback(async (cartItemId, quantity) => {
    const data = await cartApi.updateCartItem(cartItemId, quantity)
    setCart(data)
    return data
  }, [])

  const removeItem = useCallback(async (cartItemId) => {
    const data = await cartApi.removeCartItem(cartItemId)
    setCart(data)
    return data
  }, [])

  const clear = useCallback(async () => {
    await cartApi.clearCart()
    setCart(null)
    await refresh()
  }, [refresh])

  const value = useMemo(
    () => ({
      cart,
      loading,
      itemCount: cart?.totalQuantity ?? 0,
      refresh,
      addItem,
      updateItem,
      removeItem,
      clear,
    }),
    [cart, loading, refresh, addItem, updateItem, removeItem, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with its provider by convention
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
