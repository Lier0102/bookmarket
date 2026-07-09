import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BookOpen, ImagePlus, Save } from 'lucide-react'
import GlassPanel from '../../components/GlassPanel'
import Button from '../../components/Button'
import Loader from '../../components/Loader'
import Input, { Textarea } from '../../components/Input'
import { getBook, bookImageUrl, uploadBookImage, updateBook, createBook } from '../../api/books'
import { getErrorMessage } from '../../utils/errors'
import { useToast } from '../../context/ToastContext'
import './Admin.css'

const CONDITION_OPTIONS = ['new', 'old', 'E-book']

const ISBN_PATTERN = /^ISBN[0-9]+$/

function emptyForm() {
  return {
    bookId: '',
    name: '',
    author: '',
    price: '',
    unitInStock: '',
    publisher: '',
    category: '',
    releaseDate: '',
    condition: CONDITION_OPTIONS[0],
    description: '',
  }
}

export default function AdminBookForm() {
  const { bookId } = useParams()
  const isEdit = !!bookId
  const navigate = useNavigate()
  const toast = useToast()
  const fileInputRef = useRef(null)

  const [form, setForm] = useState(emptyForm())
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imgError, setImgError] = useState(false)
  const [hadExistingImage, setHadExistingImage] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    let cancelled = false

    async function fetchBook() {
      setLoading(true)
      try {
        const book = await getBook(bookId)
        if (cancelled) return
        setForm({
          bookId: book.bookId,
          name: book.name ?? '',
          author: book.author ?? '',
          price: book.unitPrice ?? '',
          unitInStock: book.unitsInStock ?? '',
          publisher: book.publisher ?? '',
          category: book.category ?? '',
          releaseDate: book.releaseDate ?? '',
          condition: book.bookCondition ?? CONDITION_OPTIONS[0],
          description: book.description ?? '',
        })
        setHadExistingImage(!!book.fileName)
      } catch (err) {
        if (!cancelled) {
          toast.error(getErrorMessage(err))
          navigate('/admin/books', { replace: true })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchBook()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, isEdit])

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImgError(false)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  function validate() {
    const next = {}
    if (!isEdit) {
      if (!form.bookId.trim()) next.bookId = 'ISBN을 입력해주세요.'
      else if (!ISBN_PATTERN.test(form.bookId.trim())) {
        next.bookId = 'ISBN은 "ISBN" 뒤에 숫자로 구성되어야 합니다. 예: ISBN20260001'
      }
    }
    if (!form.name.trim() || form.name.trim().length < 4 || form.name.trim().length > 100) {
      next.name = '제목은 4~100자로 입력해주세요.'
    }
    if (form.price === '' || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
      next.price = '올바른 가격을 입력해주세요.'
    }
    if (form.unitInStock === '' || Number.isNaN(Number(form.unitInStock)) || Number(form.unitInStock) < 0) {
      next.unitInStock = '올바른 재고 수량을 입력해주세요.'
    }
    if (!form.author.trim()) next.author = '저자를 입력해주세요.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function buildPayload() {
    return {
      name: form.name.trim(),
      price: Number(form.price),
      author: form.author.trim(),
      description: form.description.trim(),
      publisher: form.publisher.trim(),
      category: form.category.trim(),
      unitInStock: Number(form.unitInStock),
      releaseDate: form.releaseDate,
      condition: form.condition,
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      let targetBookId = bookId

      if (isEdit) {
        await updateBook(bookId, buildPayload())
      } else {
        targetBookId = form.bookId.trim()
        await createBook({ bookId: targetBookId, ...buildPayload() })
      }

      if (imageFile) {
        try {
          await uploadBookImage(targetBookId, imageFile)
        } catch (imgErr) {
          toast.error(`도서는 저장되었지만 이미지 업로드에 실패했습니다: ${getErrorMessage(imgErr)}`)
          navigate('/admin/books')
          return
        }
      }

      toast.success(isEdit ? '도서 정보를 수정했습니다.' : '새 도서를 등록했습니다.')
      navigate('/admin/books')
    } catch (err) {
      if (err?.fieldErrors) setErrors((prev) => ({ ...prev, ...err.fieldErrors }))
      if (err?.status === 409) {
        toast.error('이미 존재하는 ISBN입니다.')
        setErrors((prev) => ({ ...prev, bookId: '이미 사용 중인 ISBN입니다.' }))
      } else {
        toast.error(getErrorMessage(err))
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader label="도서 정보를 불러오는 중..." fullHeight />

  const showPreview = imagePreview || (isEdit && hadExistingImage && !imgError)
  const previewSrc = imagePreview || (isEdit ? bookImageUrl(bookId) : undefined)

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="admin-header__eyebrow">Catalog</p>
          <h1>{isEdit ? '도서 수정' : '새 도서 추가'}</h1>
          <p>{isEdit ? `ISBN: ${bookId}` : '새 도서 정보를 입력해주세요.'}</p>
        </div>
      </header>

      <GlassPanel as="form" className="admin-form" onSubmit={handleSubmit} noValidate>
        <div className="admin-form__grid">
          <Input
            label="ISBN"
            placeholder="ISBN20260001"
            value={isEdit ? bookId : form.bookId}
            onChange={(e) => updateField('bookId', e.target.value)}
            error={errors.bookId}
            disabled={isEdit}
          />
          <Input
            label="제목"
            placeholder="도서 제목 (4~100자)"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            error={errors.name}
          />
        </div>

        <div className="admin-form__grid">
          <Input
            label="저자"
            value={form.author}
            onChange={(e) => updateField('author', e.target.value)}
            error={errors.author}
          />
          <Input
            label="출판사"
            value={form.publisher}
            onChange={(e) => updateField('publisher', e.target.value)}
            error={errors.publisher}
          />
        </div>

        <div className="admin-form__grid">
          <Input
            label="가격"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => updateField('price', e.target.value)}
            error={errors.price}
          />
          <Input
            label="재고 수량"
            type="number"
            min="0"
            step="1"
            value={form.unitInStock}
            onChange={(e) => updateField('unitInStock', e.target.value)}
            error={errors.unitInStock}
          />
        </div>

        <div className="admin-form__grid">
          <Input
            label="카테고리"
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
            error={errors.category}
          />
          <Input
            label="출간일"
            type="date"
            value={form.releaseDate}
            onChange={(e) => updateField('releaseDate', e.target.value)}
            error={errors.releaseDate}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="admin-book-condition">
            상태
          </label>
          <select
            id="admin-book-condition"
            className="admin-form__select"
            value={form.condition}
            onChange={(e) => updateField('condition', e.target.value)}
          >
            {CONDITION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <Textarea
          label="설명"
          rows={6}
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          error={errors.description}
        />

        <div className="admin-form__section-title">표지 이미지</div>
        <div className="admin-image-upload">
          {showPreview ? (
            <img
              className="admin-image-upload__preview"
              src={previewSrc}
              alt="표지 미리보기"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="admin-image-upload__placeholder">
              <BookOpen size={28} strokeWidth={1.25} />
            </div>
          )}
          <div className="admin-image-upload__controls">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={ImagePlus}
              onClick={() => fileInputRef.current?.click()}
            >
              이미지 선택
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            {imageFile && <span className="admin-image-upload__filename">{imageFile.name}</span>}
            <span className="admin-form__hint">
              {isEdit
                ? '새 이미지를 선택하면 기존 표지를 대체합니다.'
                : '도서 저장 직후 이미지가 업로드됩니다.'}
            </span>
          </div>
        </div>

        <div className="admin-form__actions">
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/books')} disabled={submitting}>
            취소
          </Button>
          <Button type="submit" variant="accent" icon={Save} loading={submitting}>
            {isEdit ? '수정 저장' : '도서 등록'}
          </Button>
        </div>
      </GlassPanel>
    </>
  )
}
