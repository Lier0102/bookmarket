import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, Menu, X, User, LogOut, LayoutDashboard, PackageSearch } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import './Navbar.css'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/books', label: 'Books' },
  { to: '/board', label: 'Board' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <>
      <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner">
          <NavLink to="/" className="navbar__logo">
            BookMarket
          </NavLink>

          <nav className="navbar__links">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="navbar__actions">
            <button
              type="button"
              className="navbar__icon-btn"
              onClick={() => navigate('/cart')}
              aria-label="장바구니"
            >
              <ShoppingBag size={19} strokeWidth={1.75} />
              {itemCount > 0 && <span className="navbar__badge">{itemCount}</span>}
            </button>

            {isAuthenticated ? (
              <div className="navbar__user" ref={menuRef}>
                <button
                  type="button"
                  className="navbar__user-trigger"
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  <span className="navbar__user-avatar">{user?.name?.[0] ?? 'U'}</span>
                  {user?.name}
                </button>
                {menuOpen && (
                  <div className="navbar__dropdown glass">
                    <button
                      type="button"
                      className="navbar__dropdown-item"
                      onClick={() => {
                        setMenuOpen(false)
                        navigate('/mypage')
                      }}
                    >
                      <User size={16} strokeWidth={1.75} /> 마이페이지
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        className="navbar__dropdown-item"
                        onClick={() => {
                          setMenuOpen(false)
                          navigate('/admin')
                        }}
                      >
                        <LayoutDashboard size={16} strokeWidth={1.75} /> 관리자
                      </button>
                    )}
                    <button type="button" className="navbar__dropdown-item" onClick={handleLogout}>
                      <LogOut size={16} strokeWidth={1.75} /> 로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button type="button" className="navbar__icon-btn" onClick={() => navigate('/login')} aria-label="로그인">
                <User size={19} strokeWidth={1.75} />
              </button>
            )}

            <button
              type="button"
              className="navbar__icon-btn navbar__menu-toggle"
              onClick={() => setDrawerOpen(true)}
              aria-label="메뉴 열기"
            >
              <Menu size={20} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {drawerOpen && (
        <div className="navbar-drawer" onMouseDown={(e) => e.target === e.currentTarget && setDrawerOpen(false)}>
          <div className="navbar-drawer__panel glass">
            <button
              type="button"
              className="navbar-drawer__close"
              onClick={() => setDrawerOpen(false)}
              aria-label="메뉴 닫기"
            >
              <X size={24} strokeWidth={1.75} />
            </button>
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setDrawerOpen(false)}
                className={({ isActive }) =>
                  `navbar-drawer__link ${isActive ? 'navbar-drawer__link--active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/cart"
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) => `navbar-drawer__link ${isActive ? 'navbar-drawer__link--active' : ''}`}
            >
              <PackageSearch size={16} strokeWidth={1.75} style={{ display: 'inline', marginRight: 8, verticalAlign: -3 }} />
              장바구니
            </NavLink>
          </div>
        </div>
      )}
    </>
  )
}
