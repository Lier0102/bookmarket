import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Package, SearchX } from 'lucide-react'
import GlassPanel from '../../components/GlassPanel'
import Button from '../../components/Button'
import Pagination from '../../components/Pagination'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import { adminListOrders } from '../../api/orders'
import { formatPrice, formatDateTime } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'
import './Admin.css'

const PAGE_SIZE = 10

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const pageNumber = Number(searchParams.get('page') ?? '0') || 0

  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchOrders() {
      setLoading(true)
      setError('')
      try {
        const data = await adminListOrders({ page: pageNumber, size: PAGE_SIZE, sortField: 'orderId', sortDir: 'desc' })
        if (!cancelled) setPage(data)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchOrders()
    return () => {
      cancelled = true
    }
  }, [pageNumber, refreshKey])

  function handlePageChange(next) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(next))
    setSearchParams(params)
  }

  const orders = page?.content ?? []

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="admin-header__eyebrow">Sales</p>
          <h1>주문 관리</h1>
          <p>전체 주문 내역을 확인하고 배송 정보를 관리하세요.</p>
        </div>
      </header>

      {loading && <Loader label="주문을 불러오는 중..." fullHeight />}

      {!loading && error && (
        <EmptyState
          icon={SearchX}
          title="주문을 불러오지 못했습니다"
          description={error}
          action={
            <Button variant="secondary" onClick={() => setRefreshKey((k) => k + 1)}>
              다시 시도
            </Button>
          }
        />
      )}

      {!loading && !error && orders.length === 0 && (
        <EmptyState icon={Package} title="주문 내역이 없습니다" description="아직 접수된 주문이 없습니다." />
      )}

      {!loading && !error && orders.length > 0 && (
        <GlassPanel className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>주문번호</th>
                  <th>회원 ID</th>
                  <th>주문자</th>
                  <th>주문일시</th>
                  <th>품목 수</th>
                  <th>결제 금액</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.orderId}
                    className="admin-table__row--clickable"
                    onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                  >
                    <td className="admin-table__primary">#{order.orderId}</td>
                    <td>{order.memberId}</td>
                    <td>{order.customerName}</td>
                    <td>{formatDateTime(order.createdDate)}</td>
                    <td>{order.items?.length ?? 0}</td>
                    <td>{formatPrice(order.grandTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      )}

      {!loading && !error && page && (
        <div className="admin-footer-row">
          <Pagination pageNumber={page.pageNumber} totalPages={page.totalPages} onChange={handlePageChange} />
        </div>
      )}
    </>
  )
}
