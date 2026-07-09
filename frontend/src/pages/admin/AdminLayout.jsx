import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Book, Package, Users, MessageSquare, ArrowLeft } from 'lucide-react'
import GlassPanel from '../../components/GlassPanel'
import './Admin.css'

const NAV_ITEMS = [
  { to: '/admin', label: '개요', icon: LayoutDashboard, end: true },
  { to: '/admin/books', label: '도서 관리', icon: Book },
  { to: '/admin/orders', label: '주문 관리', icon: Package },
  { to: '/admin/members', label: '회원 관리', icon: Users },
  { to: '/admin/board', label: '게시판 관리', icon: MessageSquare },
]

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <GlassPanel as="aside" className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <LayoutDashboard size={20} strokeWidth={1.75} />
          <strong>Admin</strong>
        </div>

        <nav className="admin-sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
              }
            >
              <item.icon size={17} strokeWidth={1.75} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__back">
          <NavLink to="/" className="admin-sidebar__link">
            <ArrowLeft size={17} strokeWidth={1.75} />
            사이트로 돌아가기
          </NavLink>
        </div>
      </GlassPanel>

      <nav className="admin-topnav glass">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `admin-topnav__link ${isActive ? 'admin-topnav__link--active' : ''}`
            }
          >
            <item.icon size={15} strokeWidth={1.75} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
