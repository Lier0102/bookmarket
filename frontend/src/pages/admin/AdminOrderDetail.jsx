import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, User, MapPin, Truck, Package, Pencil, Trash2, AlertTriangle, Save } from 'lucide-react'
import GlassPanel from '../../components/GlassPanel'
import Button from '../../components/Button'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import { adminGetOrder, adminUpdateOrder, adminDeleteOrder } from '../../api/orders'
import { formatPrice, formatDate, formatDateTime } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'
import { useToast } from '../../context/ToastContext'
import './Admin.css'

function AddressBlock({ address }) {
  if (!address) return <p className="admin-table__muted">정보 없음</p>
  return (
    <>
      <div className="admin-info-row">
        <span>국가</span>
        <span>{address.country}</span>
      </div>
      <div className="admin-info-row">
        <span>우편번호</span>
        <span>{address.zipcode}</span>
      </div>
      <div className="admin-info-row">
        <span>주소</span>
        <span>{address.addressName}</span>
      </div>
      <div className="admin-info-row">
        <span>상세주소</span>
        <span>{address.detailName || '-'}</span>
      </div>
    </>
  )
}

function emptyEditForm(order) {
  return {
    shippingName: order?.shippingName ?? '',
    shippingDate: order?.shippingDate ?? '',
    zipcode: order?.shippingAddress?.zipcode ?? '',
    addressName: order?.shippingAddress?.addressName ?? '',
    detailName: order?.shippingAddress?.detailName ?? '',
    country: order?.shippingAddress?.country ?? '대한민국',
  }
}

export default function AdminOrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(emptyEditForm(null))
  const [saving, setSaving] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchOrder() {
      setLoading(true)
      setError('')
      try {
        const data = await adminGetOrder(orderId)
        if (cancelled) return
        setOrder(data)
        setForm(emptyEditForm(data))
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchOrder()
    return () => {
      cancelled = true
    }
  }, [orderId, refreshKey])

  function startEdit() {
    setForm(emptyEditForm(order))
    setEditing(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        shippingName: form.shippingName,
        shippingDate: form.shippingDate,
        shippingAddress: {
          country: form.country,
          zipcode: form.zipcode,
          addressName: form.addressName,
          detailName: form.detailName,
        },
      }
      const updated = await adminUpdateOrder(orderId, payload)
      setOrder(updated)
      setEditing(false)
      toast.success('배송 정보를 수정했습니다.')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await adminDeleteOrder(orderId)
      toast.success('주문을 삭제했습니다.')
      navigate('/admin/orders')
    } catch (err) {
      toast.error(getErrorMessage(err))
      setDeleting(false)
    }
  }

  if (loading) return <Loader label="주문 정보를 불러오는 중..." fullHeight />

  if (error || !order) {
    return (
      <EmptyState
        icon={Package}
        title="주문을 찾을 수 없습니다"
        description={error}
        action={
          <div style={{ display: 'flex', gap: 12 }}>
            <Button variant="secondary" onClick={() => setRefreshKey((k) => k + 1)}>
              다시 시도
            </Button>
            <Button variant="secondary" icon={ArrowLeft} to="/admin/orders">
              목록으로
            </Button>
          </div>
        }
      />
    )
  }

  const items = order.items ?? []

  return (
    <>
      <Link to="/admin/orders" className="admin-back-link">
        <ArrowLeft size={15} strokeWidth={1.75} />
        주문 목록으로
      </Link>

      <header className="admin-header">
        <div>
          <p className="admin-header__eyebrow">Order</p>
          <h1>주문 #{order.orderId}</h1>
          <p>{formatDateTime(order.createdDate)}에 접수됨</p>
        </div>
        <div className="admin-header__actions">
          <Button variant="secondary" icon={Pencil} onClick={startEdit}>
            배송 정보 수정
          </Button>
          <Button variant="danger" icon={Trash2} onClick={() => setDeleteOpen(true)}>
            주문 삭제
          </Button>
        </div>
      </header>

      <div className="admin-detail-grid">
        <GlassPanel className="admin-info-card">
          <div className="admin-info-card__title">
            <User size={16} strokeWidth={1.75} />
            주문자 정보
          </div>
          <div className="admin-info-row">
            <span>회원 ID</span>
            <span>{order.memberId}</span>
          </div>
          <div className="admin-info-row">
            <span>이름</span>
            <span>{order.customerName}</span>
          </div>
          <div className="admin-info-row">
            <span>연락처</span>
            <span>{order.customerPhone}</span>
          </div>
        </GlassPanel>

        <GlassPanel className="admin-info-card">
          <div className="admin-info-card__title">
            <MapPin size={16} strokeWidth={1.75} />
            주문자 주소
          </div>
          <AddressBlock address={order.customerAddress} />
        </GlassPanel>

        <GlassPanel className="admin-info-card">
          <div className="admin-info-card__title">
            <Truck size={16} strokeWidth={1.75} />
            배송 정보
          </div>
          <div className="admin-info-row">
            <span>받는 분</span>
            <span>{order.shippingName}</span>
          </div>
          <div className="admin-info-row">
            <span>배송 희망일</span>
            <span>{formatDate(order.shippingDate)}</span>
          </div>
        </GlassPanel>

        <GlassPanel className="admin-info-card">
          <div className="admin-info-card__title">
            <MapPin size={16} strokeWidth={1.75} />
            배송지 주소
          </div>
          <AddressBlock address={order.shippingAddress} />
        </GlassPanel>
      </div>

      <GlassPanel className="admin-info-card">
        <div className="admin-info-card__title">
          <Package size={16} strokeWidth={1.75} />
          주문 품목 ({items.length})
        </div>
        <table className="admin-items-table">
          <thead>
            <tr>
              <th>도서</th>
              <th>수량</th>
              <th>금액</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.bookName}</td>
                <td>x{item.quantity}</td>
                <td>{formatPrice(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="admin-grand-total">
          <span>총 결제 금액</span>
          <strong>{formatPrice(order.grandTotal)}</strong>
        </div>
      </GlassPanel>

      <Modal
        open={editing}
        onClose={() => (saving ? null : setEditing(false))}
        title="배송 정보 수정"
        actions={
          <>
            <Button variant="secondary" onClick={() => setEditing(false)} disabled={saving}>
              취소
            </Button>
            <Button variant="accent" icon={Save} loading={saving} onClick={handleSave}>
              저장
            </Button>
          </>
        }
      >
        <form className="admin-form" style={{ padding: 0, gap: 16 }} onSubmit={handleSave}>
          <Input
            label="받는 분 이름"
            value={form.shippingName}
            onChange={(e) => setForm((f) => ({ ...f, shippingName: e.target.value }))}
          />
          <Input
            label="배송 희망일"
            type="date"
            value={form.shippingDate}
            onChange={(e) => setForm((f) => ({ ...f, shippingDate: e.target.value }))}
          />
          <Input
            label="우편번호"
            value={form.zipcode}
            onChange={(e) => setForm((f) => ({ ...f, zipcode: e.target.value }))}
          />
          <Input
            label="주소"
            value={form.addressName}
            onChange={(e) => setForm((f) => ({ ...f, addressName: e.target.value }))}
          />
          <Input
            label="상세주소"
            value={form.detailName}
            onChange={(e) => setForm((f) => ({ ...f, detailName: e.target.value }))}
          />
        </form>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => (deleting ? null : setDeleteOpen(false))}
        title="주문 삭제"
        actions={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              취소
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              삭제
            </Button>
          </>
        }
      >
        <p>
          주문 <strong>#{order.orderId}</strong>을(를) 삭제하시겠습니까?
        </p>
        <div className="admin-modal__warning">
          <AlertTriangle size={16} strokeWidth={1.75} />
          <span>이 작업은 되돌릴 수 없으며, 재고는 자동으로 복구되지 않습니다.</span>
        </div>
      </Modal>
    </>
  )
}
