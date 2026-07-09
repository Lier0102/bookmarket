import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'

import Home from './pages/Home'
import BookList from './pages/BookList'
import BookDetail from './pages/BookDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MyPage from './pages/MyPage'
import NotFound from './pages/NotFound'

import BoardList from './pages/board/BoardList'
import BoardDetail from './pages/board/BoardDetail'
import BoardForm from './pages/board/BoardForm'

import AdminLayout from './pages/admin/AdminLayout'
import AdminOverview from './pages/admin/AdminOverview'
import AdminBooks from './pages/admin/AdminBooks'
import AdminBookForm from './pages/admin/AdminBookForm'
import AdminOrders from './pages/admin/AdminOrders'
import AdminOrderDetail from './pages/admin/AdminOrderDetail'
import AdminMembers from './pages/admin/AdminMembers'
import AdminBoard from './pages/admin/AdminBoard'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="books" element={<BookList />} />
        <Route path="books/:bookId" element={<BookDetail />} />
        <Route path="board" element={<BoardList />} />
        <Route path="board/:boardId" element={<BoardDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="mypage" element={<MyPage />} />
          <Route path="board/new" element={<BoardForm />} />
          <Route path="board/:boardId/edit" element={<BoardForm />} />
        </Route>

        <Route path="admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="books" element={<AdminBooks />} />
            <Route path="books/new" element={<AdminBookForm />} />
            <Route path="books/:bookId/edit" element={<AdminBookForm />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:orderId" element={<AdminOrderDetail />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="board" element={<AdminBoard />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
