import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, CheckCircle2, MapPin, ShoppingBag, Truck } from 'lucide-react'
import GlassPanel from '../components/GlassPanel'
import Button from '../components/Button'
import Input from '../components/Input'
import EmptyState from '../components/EmptyState'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrder } from '../api/orders'
import { formatPrice } from '../utils/format'
import { getErrorMessage } from '../utils/errors'
import { useToast } from '../context/ToastContext'
import './Checkout.css'

const STEPS = [
  { id: 1, label: '배송지' },
  { id: 2, label: '확인' },
  { id: 3, label: '완료' },
]

function StepIndicator({ current }) {
  return (
    <div className="checkout-steps" role="list">
      {STEPS.map((step, idx) => {
        const state =
          step.id < current ? 'done' : step.id === current ? 'active' : 'upcoming'
        return (
          <div key={step.id} className="checkout-steps__item" role="listitem">
            <div className={`checkout-steps__pill glass checkout-steps__pill--${state}`}>
              <span className="checkout-steps__dot">
                {state === 'done' ? <Check size={13} strokeWidth={2} /> : step.id}
              </span>
              <span className="checkout-steps__label">{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <span className={`checkout-steps__connector checkout-steps__connector--${state === 'upcoming' ? 'upcoming' : 'done'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function addressFromUser(user) {
  return { country: '대한민국', zipcode: '', addressName: user?.address ?? '', detailAddress: '' }
}

export default function Checkout() {
  const { cart, loading, refresh } = useCart()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [order, setOrder] = useState(null)

  // Pre-filled from the member's profile so returning customers don't have to
  // retype it every time — still fully editable for a one-off different address.
  const [customerName, setCustomerName] = useState(() => user?.name ?? '')
  const [customerPhone, setCustomerPhone] = useState(() => user?.phone ?? '')
  const [address, setAddress] = useState(() => addressFromUser(user))
  const [shippingName, setShippingName] = useState('')
  const [shippingDate, setShippingDate] = useState('')
  const [errors, setErrors] = useState({})

  const items = cart?.items ?? []
  const hasCart = items.length > 0

  // Guard: don't allow starting/continuing checkout with nothing in the cart,
  // unless we're already on the completion step showing a just-placed order.
  useEffect(() => {
    if (loading) return
    if (!hasCart && step !== 3) {
      toast.info('장바구니가 비어 있습니다.')
      navigate('/cart', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hasCart, step])

  const validateShipping = () => {
    const next = {}
    if (!customerName.trim()) next.customerName = '이름을 입력해주세요.'
    if (!customerPhone.trim()) next.customerPhone = '연락처를 입력해주세요.'
    if (!address.zipcode.trim()) next.zipcode = '우편번호를 입력해주세요.'
    if (!address.addressName.trim()) next.addressName = '주소를 입력해주세요.'
    if (!shippingDate) next.shippingDate = '배송 희망일을 선택해주세요.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const goToReview = () => {
    if (!validateShipping()) return
    setStep(2)
  }

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      const payload = {
        customerName,
        customerPhone,
        customerAddress: address,
        shippingName: shippingName.trim() || customerName,
        shippingDate,
        shippingAddress: address,
      }
      const result = await createOrder(payload)
      setOrder(result)
      setStep(3)
      await refresh()
    } catch (err) {
      toast.error(getErrorMessage(err))
      await refresh()
    } finally {
      setSubmitting(false)
    }
  }

  const grandTotal = useMemo(() => cart?.grandTotal ?? 0, [cart])

  if (loading && !cart && step !== 3) {
    return null
  }

  if (!hasCart && step !== 3) {
    return (
      <div className="container section">
        <EmptyState
          icon={ShoppingBag}
          title="장바구니가 비어 있습니다"
          description="결제를 진행하려면 먼저 장바구니에 도서를 담아주세요."
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
    <div className="container section checkout-page">
      <StepIndicator current={step} />

      {step === 1 && (
        <GlassPanel className="checkout-panel checkout-panel--form">
          <div className="checkout-panel__heading">
            <MapPin size={20} strokeWidth={1.75} />
            <div>
              <h2>배송지 정보</h2>
              <p>주문하시는 분과 받으실 주소를 입력해주세요.</p>
            </div>
          </div>

          <div className="checkout-form__grid">
            <Input
              label="이름"
              placeholder="홍길동"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              error={errors.customerName}
            />
            <Input
              label="연락처"
              type="tel"
              placeholder="010-1234-5678"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              error={errors.customerPhone}
            />
          </div>

          <div className="checkout-form__grid">
            <Input
              label="우편번호"
              placeholder="12345"
              value={address.zipcode}
              onChange={(e) => setAddress((a) => ({ ...a, zipcode: e.target.value }))}
              error={errors.zipcode}
            />
            <Input
              label="주소"
              placeholder="서울특별시 강남구 테헤란로 123"
              value={address.addressName}
              onChange={(e) => setAddress((a) => ({ ...a, addressName: e.target.value }))}
              error={errors.addressName}
            />
          </div>

          <Input
            label="상세 주소 (선택)"
            placeholder="101동 202호"
            value={address.detailAddress}
            onChange={(e) => setAddress((a) => ({ ...a, detailAddress: e.target.value }))}
          />

          <div className="checkout-form__grid">
            <Input
              label="받는 분 이름 (선택, 주문자와 동일 시 비워두세요)"
              placeholder={customerName || '받는 분 이름'}
              value={shippingName}
              onChange={(e) => setShippingName(e.target.value)}
            />
            <Input
              label="배송 희망일"
              type="date"
              value={shippingDate}
              onChange={(e) => setShippingDate(e.target.value)}
              error={errors.shippingDate}
            />
          </div>

          <div className="checkout-panel__actions">
            <Button variant="secondary" to="/cart">
              장바구니로
            </Button>
            <Button variant="accent" onClick={goToReview}>
              다음: 주문 확인
            </Button>
          </div>
        </GlassPanel>
      )}

      {step === 2 && (
        <GlassPanel className="checkout-panel">
          <div className="checkout-panel__heading">
            <Truck size={20} strokeWidth={1.75} />
            <div>
              <h2>주문 확인</h2>
              <p>주문 내용을 확인한 후 결제를 확정해주세요.</p>
            </div>
          </div>

          <div className="review-section">
            <h3 className="review-section__title">배송 정보</h3>
            <div className="review-info">
              <div className="review-info__row">
                <span>받는 분</span>
                <span>{shippingName.trim() || customerName}</span>
              </div>
              <div className="review-info__row">
                <span>연락처</span>
                <span>{customerPhone}</span>
              </div>
              <div className="review-info__row">
                <span>주소</span>
                <span>
                  ({address.zipcode}) {address.addressName} {address.detailAddress}
                </span>
              </div>
              <div className="review-info__row">
                <span>배송 희망일</span>
                <span>{shippingDate}</span>
              </div>
            </div>
          </div>

          <div className="review-section">
            <h3 className="review-section__title">주문 상품 ({cart.totalQuantity}권)</h3>
            <div className="review-items">
              {items.map((item) => (
                <div key={item.cartItemId} className="review-items__row">
                  <span className="review-items__name">{item.bookName}</span>
                  <span className="review-items__qty">x{item.quantity}</span>
                  <span className="review-items__price">{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="review-total">
            <span>총 결제 금액</span>
            <span className="review-total__price">{formatPrice(grandTotal)}</span>
          </div>

          <div className="checkout-panel__actions">
            <Button variant="secondary" onClick={() => setStep(1)} disabled={submitting}>
              이전으로
            </Button>
            <Button variant="accent" onClick={handleConfirm} loading={submitting}>
              결제 확정
            </Button>
          </div>
        </GlassPanel>
      )}

      {step === 3 && order && (
        <GlassPanel className="checkout-panel checkout-panel--complete">
          <div className="complete-icon">
            <CheckCircle2 size={40} strokeWidth={1.5} />
          </div>
          <h2>주문이 완료되었습니다</h2>
          <p className="complete-order-id">주문번호 #{order.orderId}</p>

          <div className="review-section complete-items">
            <h3 className="review-section__title">주문 상품</h3>
            <div className="review-items">
              {order.items.map((item) => (
                <div key={item.id} className="review-items__row">
                  <span className="review-items__name">{item.bookName}</span>
                  <span className="review-items__qty">x{item.quantity}</span>
                  <span className="review-items__price">{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="review-total">
            <span>총 결제 금액</span>
            <span className="review-total__price">{formatPrice(order.grandTotal)}</span>
          </div>

          <div className="checkout-panel__actions checkout-panel__actions--center">
            <Button variant="secondary" to="/">
              확인
            </Button>
            <Button variant="accent" to="/books">
              쇼핑 계속하기
            </Button>
          </div>
        </GlassPanel>
      )}
    </div>
  )
}
