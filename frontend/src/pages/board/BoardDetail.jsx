import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, ScrollText, Trash2, User } from 'lucide-react'
import GlassPanel from '../../components/GlassPanel'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Loader from '../../components/Loader'
import EmptyState from '../../components/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { deleteBoard, getBoard } from '../../api/board'
import { getErrorMessage } from '../../utils/errors'
import { formatDateTime } from '../../utils/format'
import './BoardDetail.css'

export default function BoardDetail() {
  const { boardId } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const toast = useToast()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchPost() {
      setLoading(true)
      setNotFound(false)
      try {
        const data = await getBoard(boardId)
        if (!cancelled) setPost(data)
      } catch (err) {
        if (!cancelled) {
          setNotFound(true)
          toast.error(getErrorMessage(err))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPost()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId])

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteBoard(boardId)
      toast.success('게시글이 삭제되었습니다.')
      navigate('/board')
    } catch (err) {
      toast.error(getErrorMessage(err))
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  if (loading) return <Loader label="게시글을 불러오는 중..." fullHeight />

  if (notFound || !post) {
    return (
      <div className="container section">
        <EmptyState
          icon={ScrollText}
          title="게시글을 찾을 수 없습니다"
          description="삭제되었거나 존재하지 않는 게시글입니다."
          action={
            <Button variant="secondary" icon={ArrowLeft} to="/board">
              목록으로 돌아가기
            </Button>
          }
        />
      </div>
    )
  }

  const isWriter = post.writerId === user?.memberId
  const canEdit = isWriter
  const canDelete = isWriter || isAdmin
  const wasEdited = post.modifiedDate && post.modifiedDate !== post.createdDate

  return (
    <div className="container section board-detail">
      <Link to="/board" className="board-detail__back">
        <ArrowLeft size={16} strokeWidth={1.75} />
        목록으로
      </Link>

      <GlassPanel className="board-detail__panel">
        <header className="board-detail__header">
          <h1>{post.title}</h1>
          <div className="board-detail__meta">
            <span className="board-detail__writer">
              <User size={14} strokeWidth={1.75} />
              {post.writerName}
            </span>
            <span className="board-detail__dot" aria-hidden="true">
              &middot;
            </span>
            <span>{formatDateTime(post.createdDate)}</span>
            {wasEdited && (
              <>
                <span className="board-detail__dot" aria-hidden="true">
                  &middot;
                </span>
                <span className="board-detail__edited">수정됨 &middot; {formatDateTime(post.modifiedDate)}</span>
              </>
            )}
          </div>
        </header>

        <div className="board-detail__content">{post.content}</div>

        {(canEdit || canDelete) && (
          <div className="board-detail__actions">
            {canEdit && (
              <Button variant="secondary" size="sm" icon={Pencil} to={`/board/${post.id}/edit`}>
                수정
              </Button>
            )}
            {canDelete && (
              <Button variant="danger" size="sm" icon={Trash2} onClick={() => setConfirmOpen(true)}>
                삭제
              </Button>
            )}
          </div>
        )}
      </GlassPanel>

      <Modal
        open={confirmOpen}
        onClose={() => !deleting && setConfirmOpen(false)}
        title="게시글 삭제"
        actions={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={deleting}>
              취소
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              삭제
            </Button>
          </>
        }
      >
        정말 이 게시글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
      </Modal>
    </div>
  )
}
