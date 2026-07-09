import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BookOpen, Plus, Pencil, Trash2, SearchX, AlertTriangle } from 'lucide-react'
import GlassPanel from '../../components/GlassPanel'
import Button from '../../components/Button'
import Pagination from '../../components/Pagination'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import { listBooks, bookImageUrl, deleteBook } from '../../api/books'
import { formatPrice } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'
import { useToast } from '../../context/ToastContext'
import './Admin.css'

const PAGE_SIZE = 10

function CoverCell({ book }) {
  const [imgError, setImgError] = useState(false)
  const showImage = book.fileName && !imgError

  return (
    <div className="admin-table__book-cell">
      {showImage ? (
        <img
          className="admin-table__cover"
          src={bookImageUrl(book.bookId)}
          alt={book.name}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="admin-table__cover admin-table__cover-placeholder">
          <BookOpen size={18} strokeWidth={1.5} />
        </div>
      )}
      <div>
        <div className="admin-table__primary">{book.name}</div>
        <div className="admin-table__muted">{book.author}</div>
      </div>
    </div>
  )
}

export default function AdminBooks() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()

  const pageNumber = Number(searchParams.get('page') ?? '0') || 0

  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchBooks() {
      setLoading(true)
      setError('')
      try {
        const data = await listBooks({ page: pageNumber, size: PAGE_SIZE, sortField: 'name', sortDir: 'asc' })
        if (!cancelled) setPage(data)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchBooks()
    return () => {
      cancelled = true
    }
  }, [pageNumber, refreshKey])

  function handlePageChange(next) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(next))
    setSearchParams(params)
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteBook(deleteTarget.bookId)
      toast.success('도서를 삭제했습니다.')
      setDeleteTarget(null)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const books = page?.content ?? []

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="admin-header__eyebrow">Catalog</p>
          <h1>도서 관리</h1>
          <p>등록된 도서를 확인하고 추가, 수정, 삭제할 수 있습니다.</p>
        </div>
        <div className="admin-header__actions">
          <Button variant="accent" icon={Plus} to="/admin/books/new">
            새 도서 추가
          </Button>
        </div>
      </header>

      {loading && <Loader label="도서를 불러오는 중..." fullHeight />}

      {!loading && error && (
        <EmptyState
          icon={SearchX}
          title="도서를 불러오지 못했습니다"
          description={error}
          action={
            <Button variant="secondary" onClick={() => setRefreshKey((k) => k + 1)}>
              다시 시도
            </Button>
          }
        />
      )}

      {!loading && !error && books.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="등록된 도서가 없습니다"
          description="새 도서를 추가해 카탈로그를 채워보세요."
          action={
            <Button variant="accent" icon={Plus} to="/admin/books/new">
              새 도서 추가
            </Button>
          }
        />
      )}

      {!loading && !error && books.length > 0 && (
        <GlassPanel className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>도서</th>
                  <th>ISBN</th>
                  <th>카테고리</th>
                  <th>가격</th>
                  <th>재고</th>
                  <th style={{ textAlign: 'right' }}>작업</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.bookId}>
                    <td>
                      <CoverCell book={book} />
                    </td>
                    <td>{book.bookId}</td>
                    <td>{book.category || <span className="admin-table__muted">-</span>}</td>
                    <td>{formatPrice(book.unitPrice)}</td>
                    <td>
                      {(book.unitsInStock ?? 0) > 0 ? (
                        book.unitsInStock
                      ) : (
                        <span className="admin-table__badge">품절</span>
                      )}
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          type="button"
                          className="admin-table__icon-btn"
                          aria-label="수정"
                          onClick={() => navigate(`/admin/books/${book.bookId}/edit`)}
                        >
                          <Pencil size={15} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          className="admin-table__icon-btn admin-table__icon-btn--danger"
                          aria-label="삭제"
                          onClick={() => setDeleteTarget(book)}
                        >
                          <Trash2 size={15} strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
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

      <Modal
        open={!!deleteTarget}
        onClose={() => (deleting ? null : setDeleteTarget(null))}
        title="도서 삭제"
        actions={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              취소
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} loading={deleting}>
              삭제
            </Button>
          </>
        }
      >
        <p>
          <strong>{deleteTarget?.name}</strong>({deleteTarget?.bookId})을(를) 삭제하시겠습니까?
        </p>
        <div className="admin-modal__warning">
          <AlertTriangle size={16} strokeWidth={1.75} />
          <span>이 작업은 되돌릴 수 없습니다.</span>
        </div>
      </Modal>
    </>
  )
}
