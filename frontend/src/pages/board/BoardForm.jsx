import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PenSquare } from 'lucide-react'
import GlassPanel from '../../components/GlassPanel'
import Button from '../../components/Button'
import Loader from '../../components/Loader'
import Input, { Textarea } from '../../components/Input'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { createBoard, getBoard, updateBoard } from '../../api/board'
import { getErrorMessage } from '../../utils/errors'
import './BoardForm.css'

const TITLE_MAX = 200

export default function BoardForm() {
  const { boardId } = useParams()
  const isEdit = !!boardId
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    let cancelled = false

    async function fetchPost() {
      setLoading(true)
      try {
        const post = await getBoard(boardId)
        if (cancelled) return
        if (post.writerId !== user?.memberId) {
          toast.error('본인이 작성한 게시글만 수정할 수 있습니다.')
          navigate(`/board/${boardId}`, { replace: true })
          return
        }
        setTitle(post.title)
        setContent(post.content)
      } catch (err) {
        if (!cancelled) {
          toast.error(getErrorMessage(err))
          navigate('/board', { replace: true })
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
  }, [boardId, isEdit])

  function validate() {
    const next = {}
    if (!title.trim()) next.title = '제목을 입력해주세요.'
    else if (title.length > TITLE_MAX) next.title = `제목은 ${TITLE_MAX}자를 넘을 수 없습니다.`
    if (!content.trim()) next.content = '내용을 입력해주세요.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      if (isEdit) {
        const updated = await updateBoard(boardId, { title: title.trim(), content })
        toast.success('게시글이 수정되었습니다.')
        navigate(`/board/${updated.id ?? boardId}`)
      } else {
        const created = await createBoard({ title: title.trim(), content })
        toast.success('게시글이 등록되었습니다.')
        navigate(`/board/${created.id}`)
      }
    } catch (err) {
      if (err?.fieldErrors) setErrors(err.fieldErrors)
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const cancelTo = isEdit ? `/board/${boardId}` : '/board'

  if (loading) return <Loader label="게시글을 불러오는 중..." fullHeight />

  return (
    <div className="container section board-form">
      <GlassPanel className="board-form__panel">
        <header className="board-form__header">
          <p className="board-form__eyebrow">Community</p>
          <h1>{isEdit ? '게시글 수정' : '새 글쓰기'}</h1>
        </header>

        <form className="board-form__form" onSubmit={handleSubmit} noValidate>
          <Input
            label="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            placeholder="제목을 입력하세요"
            maxLength={TITLE_MAX}
          />

          <Textarea
            label="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            error={errors.content}
            placeholder="이야기를 나눠보세요"
            rows={12}
          />

          <div className="board-form__actions">
            <Link to={cancelTo} className="board-form__cancel">
              취소
            </Link>
            <Button type="submit" variant="accent" icon={PenSquare} loading={submitting}>
              {isEdit ? '수정하기' : '게시하기'}
            </Button>
          </div>
        </form>
      </GlassPanel>
    </div>
  )
}
