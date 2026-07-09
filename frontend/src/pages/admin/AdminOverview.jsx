import { useEffect, useState } from 'react'
import { Book, Package, Users, MessageSquare, BarChart3 } from 'lucide-react'
import GlassPanel from '../../components/GlassPanel'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import Button from '../../components/Button'
import { listBooks } from '../../api/books'
import { listMembers } from '../../api/members'
import { adminListOrders } from '../../api/orders'
import { listBoards } from '../../api/board'
import { formatPrice } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'
import './Admin.css'

const RECENT_ORDERS_SIZE = 10

export default function AdminOverview() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    let cancelled = false

    async function fetchOverview() {
      setLoading(true)
      setError('')
      try {
        const [booksPage, members, ordersPage, boardsPage] = await Promise.all([
          listBooks({ page: 0, size: 1 }),
          listMembers(),
          adminListOrders({ page: 0, size: RECENT_ORDERS_SIZE, sortField: 'orderId', sortDir: 'desc' }),
          listBoards({ page: 0, size: 1 }),
        ])

        if (cancelled) return

        const orders = ordersPage?.content ?? []
        const revenue = orders.reduce((sum, o) => sum + (o.grandTotal ?? 0), 0)

        setStats({
          totalBooks: booksPage?.totalElements ?? 0,
          totalMembers: members?.length ?? 0,
          totalOrders: ordersPage?.totalElements ?? 0,
          totalBoards: boardsPage?.totalElements ?? 0,
          recentRevenue: revenue,
          recentOrderCount: orders.length,
        })
        setRecentOrders(orders)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchOverview()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <Loader label="대시보드를 불러오는 중..." fullHeight />

  if (error) {
    return (
      <EmptyState
        icon={BarChart3}
        title="개요를 불러오지 못했습니다"
        description={error}
        action={
          <Button variant="secondary" onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        }
      />
    )
  }

  const maxTotal = Math.max(1, ...recentOrders.map((o) => o.grandTotal ?? 0))
  // Chart reads oldest -> newest left to right; adminListOrders comes back newest-first.
  const chartOrders = [...recentOrders].reverse()

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="admin-header__eyebrow">Dashboard</p>
          <h1>개요</h1>
          <p>스토어 현황을 한눈에 확인하세요.</p>
        </div>
      </header>

      <div className="admin-stats">
        <GlassPanel className="admin-stat-card">
          <div className="admin-stat-card__icon">
            <Book size={18} strokeWidth={1.75} />
          </div>
          <span className="admin-stat-card__label">전체 도서</span>
          <span className="admin-stat-card__value">{stats.totalBooks.toLocaleString()}</span>
        </GlassPanel>

        <GlassPanel className="admin-stat-card">
          <div className="admin-stat-card__icon">
            <Users size={18} strokeWidth={1.75} />
          </div>
          <span className="admin-stat-card__label">전체 회원</span>
          <span className="admin-stat-card__value">{stats.totalMembers.toLocaleString()}</span>
        </GlassPanel>

        <GlassPanel className="admin-stat-card">
          <div className="admin-stat-card__icon">
            <Package size={18} strokeWidth={1.75} />
          </div>
          <span className="admin-stat-card__label">전체 주문</span>
          <span className="admin-stat-card__value">{stats.totalOrders.toLocaleString()}</span>
        </GlassPanel>

        <GlassPanel className="admin-stat-card">
          <div className="admin-stat-card__icon">
            <MessageSquare size={18} strokeWidth={1.75} />
          </div>
          <span className="admin-stat-card__label">게시글</span>
          <span className="admin-stat-card__value">{stats.totalBoards.toLocaleString()}</span>
        </GlassPanel>
      </div>

      <GlassPanel className="admin-stat-card" style={{ maxWidth: 360 }}>
        <div className="admin-stat-card__icon">
          <BarChart3 size={18} strokeWidth={1.75} />
        </div>
        <span className="admin-stat-card__label">
          최근 주문 {stats.recentOrderCount}건 매출 합계
        </span>
        <span className="admin-stat-card__value">{formatPrice(stats.recentRevenue)}</span>
        <span className="admin-stat-card__hint">전체 매출이 아닌, 최근 주문 기준 합계입니다.</span>
      </GlassPanel>

      {chartOrders.length > 0 && (
        <GlassPanel className="admin-chart">
          <div className="admin-chart__header">
            <h2>최근 주문 금액</h2>
            <p>가장 최근 {chartOrders.length}건 (오래된 순)</p>
          </div>
          <div className="admin-chart__bars">
            {chartOrders.map((order) => {
              const height = Math.max(3, Math.round(((order.grandTotal ?? 0) / maxTotal) * 100))
              return (
                <div key={order.orderId} className="admin-chart__bar-col" title={formatPrice(order.grandTotal)}>
                  <div className="admin-chart__bar" style={{ height: `${height}%` }} />
                  <span className="admin-chart__bar-label">#{order.orderId}</span>
                </div>
              )
            })}
          </div>
        </GlassPanel>
      )}
    </>
  )
}
