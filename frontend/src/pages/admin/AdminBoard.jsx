import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MessageSquare, Trash2, SearchX, AlertTriangle, ExternalLink } from 'lucide-react'
import GlassPanel from '../../components/GlassPanel'
import Button from '../../components/Button'
import Pagination from '../../components/Pagination'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import Modal from '../../components/Modal'
import { listBoards, deleteBoard } from '../../api/board'
import { formatDateTime } from '../../utils/format'
import { getErrorMessage } from '../../utils/errors'
import { useToast } from '../../context/ToastContext'
import './Admin.css'

const PAGE_SIZE = 10

export default function AdminBoard() {
  const [searchParams, setSearchParams] = useSearchParams()
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

    async function fetchBoards() {
      setLoading(true)
      setError('')
      try {
        const data = await listBoards({ page: pageNumber, size: PAGE_SIZE, sortField: 'createdDate', sortDir: 'desc' })
        if (!cancelled) setPage(data)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchBoards()
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
      await deleteBoard(deleteTarget.id)
      toast.success('게시글을 삭제했습니다.')
      setDeleteTarget(null)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const posts = page?.content ?? []

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="admin-header__eyebrow">Community</p>
          <h1>게시판 관리</h1>
          <p>부적절한 게시글을 삭제할 수 있습니다. 수정은 작성자만 가능합니다.</p>
        </div>
      </header>

      {loading && <Loader label="게시글을 불러오는 중..." fullHeight />}

      {!loading && error && (
        <EmptyState
          icon={SearchX}
          title="게시글을 불러오지 못했습니다"
          description={error}
          action={
            <Button variant="secondary" onClick={() => setRefreshKey((k) => k + 1)}>
              다시 시도
            </Button>
          }
        />
      )}

      {!loading && !error && posts.length === 0 && (
        <EmptyState icon={MessageSquare} title="게시글이 없습니다" description="아직 작성된 게시글이 없습니다." />
      )}

      {!loading && !error && posts.length > 0 && (
        <GlassPanel className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>제목</th>
                  <th>작성자</th>
                  <th>작성일</th>
                  <th style={{ textAlign: 'right' }}>작업</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td className="admin-table__primary">{post.title}</td>
                    <td>{post.writerName}</td>
                    <td>{formatDateTime(post.createdDate)}</td>
                    <td>
                      <div className="admin-table__actions">
                        <Link
                          to={`/board/${post.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-table__icon-btn"
                          aria-label="게시글 보기"
                        >
                          <ExternalLink size={15} strokeWidth={1.75} />
                        </Link>
                        <button
                          type="button"
                          className="admin-table__icon-btn admin-table__icon-btn--danger"
                          aria-label="삭제"
                          onClick={() => setDeleteTarget(post)}
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
        title="게시글 삭제"
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
          <strong>{deleteTarget?.title}</strong>을(를) 삭제하시겠습니까?
        </p>
        <div className="admin-modal__warning">
          <AlertTriangle size={16} strokeWidth={1.75} />
          <span>이 작업은 되돌릴 수 없습니다.</span>
        </div>
      </Modal>
    </>
  )
}
