import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, PenSquare, ScrollText, SearchX, User } from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Pagination from '../../components/Pagination'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { listBoards } from '../../api/board'
import { getErrorMessage } from '../../utils/errors'
import { formatDateTime } from '../../utils/format'
import './BoardList.css'

const PAGE_SIZE = 10

export default function BoardList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const pageNumber = Number(searchParams.get('page') ?? '0') || 0

  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
  }, [pageNumber])

  function handlePageChange(next) {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(next))
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleWriteClick(e) {
    if (!isAuthenticated) {
      e.preventDefault()
      navigate('/login', { state: { from: { pathname: '/board/new' } } })
    }
  }

  const posts = page?.content ?? []

  return (
    <div className="container section board-list">
      <header className="board-list__header">
        <div>
          <p className="board-list__eyebrow">Community</p>
          <h1>독자 게시판</h1>
          <p className="board-list__lede">책에 대한 생각과 이야기를 나누는 공간입니다.</p>
        </div>
        <Button variant="accent" icon={PenSquare} to="/board/new" onClick={handleWriteClick}>
          글쓰기
        </Button>
      </header>

      {loading && <Loader label="게시글을 불러오는 중..." fullHeight />}

      {!loading && error && (
        <EmptyState
          icon={SearchX}
          title="게시글을 불러오지 못했습니다"
          description={error}
          action={
            <Button variant="secondary" onClick={() => setSearchParams(new URLSearchParams(searchParams))}>
              다시 시도
            </Button>
          }
        />
      )}

      {!loading && !error && posts.length === 0 && (
        <EmptyState
          icon={ScrollText}
          title="아직 게시글이 없습니다"
          description="첫 번째 이야기를 남겨보세요."
          action={
            <Button variant="accent" icon={PenSquare} to="/board/new" onClick={handleWriteClick}>
              첫 글 작성하기
            </Button>
          }
        />
      )}

      {!loading && !error && posts.length > 0 && (
        <ul className="board-list__list">
          {posts.map((post) => (
            <li key={post.id}>
              <Card interactive className="board-row">
                <Link to={`/board/${post.id}`} className="board-row__link">
                  <div className="board-row__main">
                    <h3 className="board-row__title">{post.title}</h3>
                  </div>
                  <div className="board-row__meta">
                    <span className="board-row__writer">
                      <User size={14} strokeWidth={1.75} />
                      {post.writerName}
                    </span>
                    <span className="board-row__date">{formatDateTime(post.createdDate)}</span>
                    <ArrowUpRight className="board-row__arrow" size={16} strokeWidth={1.75} />
                  </div>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && page && (
        <Pagination pageNumber={page.pageNumber} totalPages={page.totalPages} onChange={handlePageChange} />
      )}
    </div>
  )
}
