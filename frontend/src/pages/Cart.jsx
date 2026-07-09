import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import GlassPanel from '../components/GlassPanel'
import Button from '../components/Button'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import { useCart } from '../context/CartContext'
import { bookImageUrl } from '../api/books'
import { formatPrice } from '../utils/format'
import { getErrorMessage } from '../utils/errors'
import { useToast } from '../context/ToastContext'
import './Cart.css'

function CartLineImage({ bookId, bookName }) {
  const [imgError, setImgError] = useState(false)

  if (imgError) {
    return (
      <div className="cart-item__placeholder">
        <ShoppingBag size={22} strokeWidth={1.25} />
      </div>
    )
  }

  return (
    <img
      className="cart-item__image"
      src={bookImageUrl(bookId)}
      alt={bookName}
      onError={() => setImgError(true)}
      loading="lazy"
    />
  )
}

function CartLine({ item, onChangeQuantity, onRemove, busy }) {
  // Local optimistic quantity so the stepper feels instant; synced back to
  // the server with a short debounce rather than firing a request per click.
  const [localQuantity, setLocalQuantity] = useState(item.quantity)
  const [prevServerQuantity, setPrevServerQuantity] = useState(item.quantity)
  const debounceRef = useRef(null)

  // Keep the optimistic local quantity in sync whenever the server value
  // changes underneath us (e.g. after the debounced update resolves),
  // without introducing an extra render via a synchronizing effect.
  if (item.quantity !== prevServerQuantity) {
    setPrevServerQuantity(item.quantity)
    setLocalQuantity(item.quantity)
  }

  useEffect(() => () => clearTimeout(debounceRef.current), [])

  const scheduleUpdate = (next) => {
    setLocalQuantity(next)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChangeQuantity(item.cartItemId, next)
    }, 350)
  }

  const dec = () => {
    const next = Math.max(1, localQuantity - 1)
    if (next !== localQuantity) scheduleUpdate(next)
  }

  const inc = () => {
    scheduleUpdate(localQuantity + 1)
  }

  const unitPrice = item.quantity > 0 ? item.totalPrice / item.quantity : item.price
  const lineTotal = unitPrice * localQuantity

  return (
    <div className="cart-item">
      <CartLineImage bookId={item.bookId} bookName={item.bookName} />

      <div className="cart-item__info">
        <p className="cart-item__name">{item.bookName}</p>
        <p className="cart-item__unit-price">{formatPrice(unitPrice)}</p>
      </div>

      <div className="cart-item__stepper">
        <button
          type="button"
          className="stepper__btn"
          onClick={dec}
          disabled={busy || localQuantity <= 1}
          aria-label="수량 감소"
        >
          <Minus size={14} strokeWidth={1.75} />
        </button>
        <span className="stepper__value">{localQuantity}</span>
        <button
          type="button"
          className="stepper__btn"
          onClick={inc}
          disabled={busy}
          aria-label="수량 증가"
        >
          <Plus size={14} strokeWidth={1.75} />
        </button>
      </div>

      <p className="cart-item__line-total">{formatPrice(lineTotal)}</p>

      <button
        type="button"
        className="cart-item__remove"
        onClick={() => onRemove(item.cartItemId)}
        disabled={busy}
        aria-label="장바구니에서 삭제"
      >
        <Trash2 size={17} strokeWidth={1.75} />
      </button>
    </div>
  )
}

export default function Cart() {
  const { cart, loading, updateItem, removeItem } = useCart()
  const toast = useToast()
  const [busyId, setBusyId] = useState(null)

  const items = cart?.items ?? []

  const handleChangeQuantity = async (cartItemId, quantity) => {
    setBusyId(cartItemId)
    try {
      await updateItem(cartItemId, quantity)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  const handleRemove = async (cartItemId) => {
    setBusyId(cartItemId)
    try {
      await removeItem(cartItemId)
    } catch (err) {
      toast.error(getErrorMessage(err))
      setBusyId(null)
    }
  }

  if (loading && !cart) {
    return (
      <div className="container section">
        <Loader label="장바구니를 불러오는 중..." fullHeight />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container section">
        <EmptyState
          icon={ShoppingBag}
          title="장바구니가 비어 있습니다"
          description="마음에 드는 책을 담아보세요. 이곳에서 한눈에 모아볼 수 있습니다."
          action={
            <Button variant="primary" to="/books">
              도서 둘러보기
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="container section cart-page">
      <div className="cart-page__header">
        <h1>장바구니</h1>
        <p>담아둔 책 {cart.totalQuantity}권을 확인하고 결제를 진행하세요.</p>
      </div>

      <div className="cart-page__layout">
        <div className="cart-list">
          {items.map((item) => (
            <CartLine
              key={item.cartItemId}
              item={item}
              onChangeQuantity={handleChangeQuantity}
              onRemove={handleRemove}
              busy={busyId === item.cartItemId}
            />
          ))}
        </div>

        <GlassPanel className="cart-summary">
          <h3>주문 요약</h3>
          <div className="cart-summary__row">
            <span>총 수량</span>
            <span>{cart.totalQuantity}권</span>
          </div>
          <div className="cart-summary__row cart-summary__row--total">
            <span>총 결제 금액</span>
            <span className="cart-summary__total-price">{formatPrice(cart.grandTotal)}</span>
          </div>
          <Button variant="accent" size="lg" to="/checkout" className="cart-summary__checkout">
            결제하기
          </Button>
          <Link to="/books" className="cart-summary__continue">
            쇼핑 계속하기
          </Link>
        </GlassPanel>
      </div>
    </div>
  )
}
