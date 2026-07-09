import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  MapPin,
  Package,
  Save,
  ShoppingBag,
  Trash2,
  Truck,
  User,
} from 'lucide-react'
import GlassPanel from '../components/GlassPanel'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Modal from '../components/Modal'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import Pagination from '../components/Pagination'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { updateMe, deleteMe } from '../api/members'
import { getMyOrders } from '../api/orders'
import { formatPrice, formatDateTime } from '../utils/format'
import { getErrorMessage } from '../utils/errors'
import './MyPage.css'

const TABS = [
  { id: 'profile', label: '프로필', icon: User },
  { id: 'orders', label: '주문 내역', icon: Package },
  { id: 'danger', label: '계정 삭제', icon: AlertTriangle },
]

function profileFormFromUser(user) {
  return {
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    address: user?.address ?? '',
    newPassword: '',
  }
}

// Keyed by user.id from the parent so this remounts (and its lazy initial
// state re-derives from the freshest `user`) whenever refreshProfile() swaps
// in a new user object — avoids syncing props into state via an effect.
function ProfileSection({ user, onUpdated }) {
  const toast = useToast()
  const [form, setForm] = useState(() => profileFormFromUser(user))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = '이름을 입력해주세요.'
    if (!form.phone.trim()) next.phone = '연락처를 입력해주세요.'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = '올바른 이메일 형식이 아닙니다.'
    }
    if (!form.address.trim()) next.address = '주소를 입력해주세요.'
    if (form.newPassword && form.newPassword.length < 4) {
      next.newPassword = '비밀번호는 4자 이상이어야 합니다.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      // Always send the full current values for name/phone/email/address —
      // the backend overwrites with null anything omitted here.
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
      }
      if (form.newPassword.trim()) {
        payload.newPassword = form.newPassword.trim()
      }
      await updateMe(payload)
      await onUpdated()
      setForm((f) => ({ ...f, newPassword: '' }))
      toast.success('프로필이 저장되었습니다.')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <GlassPanel className="mypage-panel">
      <div className="mypage-panel__heading">
        <User size={20} strokeWidth={1.75} />
        <div>
          <h2>프로필</h2>
          <p>회원 정보를 확인하고 수정할 수 있습니다.</p>
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="profile-form__grid">
          <Input
            label="아이디"
            value={user?.memberId ?? ''}
            disabled
            readOnly
          />
          <Input
            label="이름"
            placeholder="홍길동"
            value={form.name}
            onChange={update('name')}
            error={errors.name}
          />
        </div>

        <div className="profile-form__grid">
          <Input
            label="연락처"
            type="tel"
            placeholder="010-1234-5678"
            value={form.phone}
            onChange={update('phone')}
            error={errors.phone}
          />
          <Input
            label="이메일"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={update('email')}
            error={errors.email}
          />
        </div>

        <Input
          label="주소"
          placeholder="서울특별시 강남구 테헤란로 123"
          value={form.address}
          onChange={update('address')}
          error={errors.address}
        />

        <Input
          label="새 비밀번호 (선택)"
          type="password"
          placeholder="변경하지 않으려면 비워두세요"
          value={form.newPassword}
          onChange={update('newPassword')}
          error={errors.newPassword}
        />

        <div className="mypage-panel__actions">
          <Button type="submit" variant="accent" icon={Save} loading={saving}>
            변경사항 저장
          </Button>
        </div>
      </form>
    </GlassPanel>
  )
}

function OrderItem({ order }) {
  return (
    <Card className="order-card">
      <div className="order-card__header">
        <div className="order-card__title">
          <span className="order-card__id">주문번호 #{order.orderId}</span>
          <span className="order-card__date">{formatDateTime(order.createdDate)}</span>
        </div>
        <span className="order-card__total">{formatPrice(order.grandTotal)}</span>
      </div>

      <div className="order-card__items">
        {order.items.map((item) => (
          <div key={item.id} className="order-card__item">
            <span className="order-card__item-name">{item.bookName}</span>
            <span className="order-card__item-qty">x{item.quantity}</span>
            <span className="order-card__item-price">{formatPrice(item.totalPrice)}</span>
          </div>
        ))}
      </div>

      <div className="order-card__shipping">
        <div className="order-card__shipping-row">
          <Truck size={15} strokeWidth={1.75} />
          <span>
            {order.shippingName} · 배송 희망일 {order.shippingDate}
          </span>
        </div>
        <div className="order-card__shipping-row">
          <MapPin size={15} strokeWidth={1.75} />
          <span>
            ({order.shippingAddress?.zipcode}) {order.shippingAddress?.addressName}{' '}
            {order.shippingAddress?.detailName}
          </span>
        </div>
      </div>
    </Card>
  )
}

const ORDERS_PAGE_SIZE = 5

function OrdersSection() {
  const toast = useToast()
  const [page, setPage] = useState(null)
  const [pageNumber, setPageNumber] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const data = await getMyOrders({ page: pageNumber, size: ORDERS_PAGE_SIZE })
        if (!cancelled) setPage(data)
      } catch (err) {
        if (!cancelled) toast.error(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber])

  const orders = page?.content ?? []

  return (
    <GlassPanel className="mypage-panel">
      <div className="mypage-panel__heading">
        <Package size={20} strokeWidth={1.75} />
        <div>
          <h2>주문 내역</h2>
          <p>지금까지 주문한 도서 내역을 확인할 수 있습니다.</p>
        </div>
      </div>

      {loading && <Loader label="주문 내역을 불러오는 중..." />}

      {!loading && orders.length === 0 && (
        <EmptyState
          icon={ShoppingBag}
          title="주문 내역이 없습니다"
          description="아직 주문한 도서가 없습니다. 마음에 드는 책을 둘러보세요."
          action={<Button to="/books">도서 둘러보기</Button>}
        />
      )}

      {!loading && orders.length > 0 && (
        <>
          <div className="order-list">
            {orders.map((order) => (
              <OrderItem key={order.orderId} order={order} />
            ))}
          </div>
          <Pagination pageNumber={page.pageNumber} totalPages={page.totalPages} onChange={setPageNumber} />
        </>
      )}
    </GlassPanel>
  )
}

function DangerZoneSection() {
  const toast = useToast()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteMe()
      logout()
      toast.success('계정이 삭제되었습니다.')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err))
      setDeleting(false)
    }
  }

  return (
    <GlassPanel className="mypage-panel mypage-panel--danger">
      <div className="mypage-panel__heading">
        <AlertTriangle size={20} strokeWidth={1.75} />
        <div>
          <h2>계정 삭제</h2>
          <p>계정을 삭제하면 되돌릴 수 없습니다. 신중하게 결정해주세요.</p>
        </div>
      </div>

      <div className="danger-zone">
        <div className="danger-zone__text">
          <p>
            계정을 삭제하면 장바구니, 주문 내역, 작성한 게시글이 모두 삭제되며 복구할 수
            없습니다.
          </p>
        </div>
        <Button variant="danger" icon={Trash2} onClick={() => setConfirmOpen(true)}>
          계정 삭제
        </Button>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => !deleting && setConfirmOpen(false)}
        title="정말 계정을 삭제하시겠습니까?"
        actions={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={deleting}>
              취소
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              삭제
            </Button>
          </>
        }
      >
        계정을 삭제하면 장바구니, 주문 내역, 작성한 게시글이 모두 삭제되며 복구할 수
        없습니다. 이 작업은 되돌릴 수 없습니다.
      </Modal>
    </GlassPanel>
  )
}

export default function MyPage() {
  const { user, refreshProfile, initializing } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  const greetingName = useMemo(() => user?.name || user?.memberId || '', [user])

  if (initializing || !user) {
    return (
      <div className="container section">
        <Loader label="정보를 불러오는 중..." fullHeight />
      </div>
    )
  }

  return (
    <div className="container section mypage">
      <div className="mypage__header">
        <h1>마이페이지</h1>
        <p>{greetingName}님, 환영합니다. 프로필과 주문 내역을 관리하세요.</p>
      </div>

      <div className="mypage__layout">
        <nav className="mypage-tabs" role="tablist" aria-label="마이페이지 메뉴">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`mypage-tabs__item ${active ? 'mypage-tabs__item--active' : ''} ${
                  tab.id === 'danger' ? 'mypage-tabs__item--danger' : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={17} strokeWidth={1.75} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="mypage-content">
          {activeTab === 'profile' && (
            <ProfileSection key={user.id} user={user} onUpdated={refreshProfile} />
          )}
          {activeTab === 'orders' && <OrdersSection />}
          {activeTab === 'danger' && <DangerZoneSection />}
        </div>
      </div>
    </div>
  )
}
