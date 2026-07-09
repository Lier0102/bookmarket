import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom'
import {
  BookOpen,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
  ArrowLeft,
  ChevronRight,
  PackageX,
  Building2,
  Sparkles,
} from 'lucide-react'
import GlassPanel from '../components/GlassPanel'
import Button from '../components/Button'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import BookCard from '../components/BookCard'
import { getBook, getBooksByCategory, bookImageUrl } from '../api/books'
import { formatPrice, formatDate, isNewRelease } from '../utils/format'
import { getErrorMessage } from '../utils/errors'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import './BookDetail.css'

export default function BookDetail() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const toast = useToast()

  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [imgError, setImgError] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)

  const [recommended, setRecommended] = useState([])

  useEffect(() => {
    let cancelled = false

    async function fetchBook() {
      setLoading(true)
      setNotFound(false)
      setImgError(false)
      setQuantity(1)
      setRecommended([])
      try {
        const data = await getBook(bookId)
        if (!cancelled) setBook(data)
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchBook()
    return () => {
      cancelled = true
    }
  }, [bookId])

  useEffect(() => {
    if (!book?.category) return undefined
    let cancelled = false

    async function fetchRecommended() {
      try {
        const list = await getBooksByCategory(book.category)
        if (!cancelled) {
          setRecommended((list ?? []).filter((b) => String(b.bookId) !== String(book.bookId)))
        }
      } catch {
        // Non-critical section: hide quietly on error (e.g. zero matches -> 404).
        if (!cancelled) setRecommended([])
      }
    }

    fetchRecommended()
    return () => {
      cancelled = true
    }
  }, [book?.category, book?.bookId])

  const inStock = (book?.unitsInStock ?? 0) > 0
  const isLowStock = inStock && book.unitsInStock <= 5
  const isNew = !!book && isNewRelease(book.releaseDate)
  const showImage = book?.fileName && !imgError
  const subtotal = book ? Number(book.unitPrice) * quantity : 0

  function handleDecrement() {
    setQuantity((q) => Math.max(1, q - 1))
  }

  function handleIncrement() {
    setQuantity((q) => Math.min(book?.unitsInStock ?? 1, q + 1))
  }

  async function handleAddToCart() {
    if (!isAuthenticated) {
      toast.info('로그인이 필요합니다')
      navigate('/login', { state: { from: location } })
      return
    }
    if (!inStock) return

    setAdding(true)
    try {
      await addItem(book.bookId, quantity)
      toast.success('장바구니에 담았습니다')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setAdding(false)
    }
  }

  async function handleBuyNow() {
    if (!isAuthenticated) {
      toast.info('로그인이 필요합니다')
      navigate('/login', { state: { from: location } })
      return
    }
    if (!inStock) return

    setBuying(true)
    try {
      await addItem(book.bookId, quantity)
      navigate('/checkout')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBuying(false)
    }
  }

  if (loading) {
    return <Loader label="도서 정보를 불러오는 중..." fullHeight />
  }

  if (notFound || !book) {
    return (
      <div className="container section">
        <EmptyState
          icon={PackageX}
          title="도서를 찾을 수 없습니다"
          description="요청하신 도서가 존재하지 않거나 삭제되었을 수 있습니다."
          action={
            <Button variant="secondary" to="/books" icon={ArrowLeft}>
              목록으로
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="container section book-detail">
      <nav className="book-detail__breadcrumb" aria-label="이동 경로">
        <Link to="/">홈</Link>
        <ChevronRight size={13} strokeWidth={1.75} />
        <Link to="/books">전체 도서</Link>
        {book.category && (
          <>
            <ChevronRight size={13} strokeWidth={1.75} />
            <Link to={`/books?category=${encodeURIComponent(book.category)}`}>{book.category}</Link>
          </>
        )}
        <ChevronRight size={13} strokeWidth={1.75} />
        <span className="book-detail__breadcrumb-current">{book.name}</span>
      </nav>

      <div className="book-detail__layout">
        <div className="book-detail__cover">
          {showImage ? (
            <img
              src={bookImageUrl(book.bookId)}
              alt={book.name}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="book-detail__cover-placeholder glass">
              <BookOpen size={56} strokeWidth={1.25} />
            </div>
          )}
        </div>

        <div className="book-detail__info">
          {book.category && <p className="book-detail__eyebrow">{book.category}</p>}
          <h1 className="book-detail__title">{book.name}</h1>
          <p className="book-detail__author">
            {book.author}
            {book.publisher && (
              <>
                <span aria-hidden="true"> · </span>
                <span className="book-detail__publisher">
                  <Building2 size={14} strokeWidth={1.75} />
                  {book.publisher}
                </span>
              </>
            )}
          </p>

          {(isNew || !inStock || isLowStock) && (
            <div className="book-detail__badges">
              {isNew && <span className="badge badge--accent">신간</span>}
              {!inStock && <span className="badge badge--danger">품절</span>}
              {isLowStock && <span className="badge badge--muted">재고 {book.unitsInStock}권 남음</span>}
            </div>
          )}

          {book.description && (
            <p className="book-detail__description">{book.description}</p>
          )}

          <GlassPanel className="book-detail__purchase">
            <div className="book-detail__price-row">
              <span className="book-detail__price-label">판매가</span>
              <span className="book-detail__price">{formatPrice(book.unitPrice)}</span>
            </div>

            <div className="book-detail__purchase-row">
              <span>배송</span>
              <span>주문 시 입력한 배송지로 발송</span>
            </div>
            <div className="book-detail__purchase-row">
              <span>재고</span>
              <span className={inStock ? 'book-detail__stock' : 'book-detail__stock--out'}>
                {inStock ? `${book.unitsInStock}권` : '품절'}
              </span>
            </div>

            {inStock && (
              <div className="book-detail__purchase-row book-detail__purchase-row--stepper">
                <span>수량</span>
                <div className="book-detail__stepper">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    aria-label="수량 감소"
                  >
                    <Minus size={16} strokeWidth={1.75} />
                  </button>
                  <span className="book-detail__stepper-value">{quantity}</span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={quantity >= book.unitsInStock}
                    aria-label="수량 증가"
                  >
                    <Plus size={16} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            )}

            {inStock && (
              <div className="book-detail__purchase-row book-detail__purchase-row--total">
                <span>총 상품금액</span>
                <span className="book-detail__subtotal">{formatPrice(subtotal)}</span>
              </div>
            )}

            <div className="book-detail__actions">
              <Button
                variant="secondary"
                size="lg"
                icon={inStock ? ShoppingCart : undefined}
                disabled={!inStock}
                loading={adding}
                onClick={handleAddToCart}
                className="book-detail__cta"
              >
                {inStock ? '장바구니 담기' : '품절'}
              </Button>
              <Button
                variant="accent"
                size="lg"
                icon={inStock ? Zap : undefined}
                disabled={!inStock}
                loading={buying}
                onClick={handleBuyNow}
                className="book-detail__cta"
              >
                바로 구매
              </Button>
            </div>
          </GlassPanel>
        </div>
      </div>

      <section className="book-detail__specs">
        <h2>상품 정보</h2>
        <GlassPanel as="div" className="book-detail__specs-panel">
          <table className="spec-table">
            <tbody>
              <tr>
                <th scope="row">ISBN</th>
                <td>{book.bookId}</td>
              </tr>
              <tr>
                <th scope="row">저자</th>
                <td>{book.author || '-'}</td>
              </tr>
              <tr>
                <th scope="row">출판사</th>
                <td>{book.publisher || '-'}</td>
              </tr>
              <tr>
                <th scope="row">카테고리</th>
                <td>{book.category || '-'}</td>
              </tr>
              <tr>
                <th scope="row">발행일</th>
                <td>{book.releaseDate ? formatDate(book.releaseDate) : '-'}</td>
              </tr>
              <tr>
                <th scope="row">상태</th>
                <td>{book.bookCondition || '-'}</td>
              </tr>
            </tbody>
          </table>
        </GlassPanel>
      </section>

      {recommended.length > 0 && (
        <section className="book-detail__recommended">
          <div className="book-detail__recommended-header">
            <Sparkles size={18} strokeWidth={1.75} />
            <h2>비슷한 카테고리의 도서</h2>
          </div>
          <div className="book-detail__recommended-grid">
            {recommended.map((b) => (
              <div className="book-detail__recommended-item" key={b.bookId}>
                <BookCard book={b} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
