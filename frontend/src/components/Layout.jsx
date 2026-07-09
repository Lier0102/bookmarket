import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <>
      <Navbar />
      <main className={isHome ? '' : 'page'}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
