import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowDownUp, LibraryBig, SearchX, Tag } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import BookCard from '../components/BookCard'
import Pagination from '../components/Pagination'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'
import { listBooks } from '../api/books'
import { getErrorMessage } from '../utils/errors'
import './BookList.css'

const PAGE_SIZE = 12

const SORT_OPTIONS = [
  { value: 'name-desc', label: '이름순', sortField: 'name', sortDir: 'desc' },
  { value: 'releaseDate-desc', label: '최신 출간일순', sortField: 'releaseDate', sortDir: 'desc' },
  { value: 'releaseDate-asc', label: '오래된 출간일순', sortField: 'releaseDate', sortDir: 'asc' },
  { value: 'unitPrice-asc', label: '낮은 가격순', sortField: 'unitPrice', sortDir: 'asc' },
  { value: 'unitPrice-desc', label: '높은 가격순', sortField: 'unitPrice', sortDir: 'desc' },
]
const DEFAULT_SORT = SORT_OPTIONS[0].value

export default function BookList() {
  const [searchParams, setSearchParams] = useSearchParams()

  const pageNumber = Number(searchParams.get('page') ?? '0') || 0
  const query = searchParams.get('q') ?? ''
  const category = searchParams.get('category') ?? ''
  const sortValue = searchParams.get('sort') ?? DEFAULT_SORT
  const sort = SORT_OPTIONS.find((s) => s.value === sortValue) ?? SORT_OPTIONS[0]

  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Debounced text actually sent to the server, separate from the input's live value,
  // so we don't fire a request on every keystroke.
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 350)
    return () => clearTimeout(id)
  }, [query])

  useEffect(() => {
    let cancelled = false

    async function fetchBooks() {
      setLoading(true)
      setError('')
      try {
        const data = await listBooks({
          page: pageNumber,
          size: PAGE_SIZE,
          sortField: sort.sortField,
          sortDir: sort.sortDir,
          keyword: debouncedQuery.trim(),
        })
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
  }, [pageNumber, sort.sortField, sort.sortDir, debouncedQuery])

  const books = useMemo(() => page?.content ?? [], [page])

  // Category options are derived from whatever is currently loaded — the backend
  // treats category as a free-text field, not an enum, so there is no canonical list.
  const categories = useMemo(() => {
    const set = new Set()
    books.forEach((book) => {
      if (book.category) set.add(book.category)
    })
    return Array.from(set).sort()
  }, [books])

  // Category is narrowed client-side against the current (already keyword-filtered) page —
  // the backend's category filter is a separate, non-paginated endpoint, so combining
  // "search this page's results by category" here keeps a single paginated data source.
  const filteredBooks = useMemo(() => {
    if (!category) return books
    return books.filter((book) => book.category === category)
  }, [books, category])

  function updateParams(next) {
    const params = new URLSearchParams(searchParams)
    Object.entries(next).forEach(([key, value]) => {
      if (value === '' || value == null) params.delete(key)
      else params.set(key, String(value))
    })
    setSearchParams(params)
  }

  function handleQueryChange(value) {
    updateParams({ q: value, page: 0 })
  }

  function handleCategoryChange(value) {
    updateParams({ category: value === category ? '' : value })
  }

  function handleSortChange(value) {
    updateParams({ sort: value, page: 0 })
  }

  function handlePageChange(next) {
    updateParams({ page: next })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hasActiveFilter = !!query || !!category

  return (
    <div className="container section book-list">
      <header className="book-list__header">
        <p className="book-list__eyebrow">Catalog</p>
        <h1>모든 도서</h1>
        <p className="book-list__lede">엄선된 컬렉션 속에서 다음 이야기를 찾아보세요.</p>
      </header>

      <div className="book-list__controls">
        <SearchBar
          value={query}
          onChange={handleQueryChange}
          placeholder="제목 또는 저자 이름으로 검색"
        />

        <div className="book-list__sort">
          <label className="book-list__sort-label" htmlFor="book-sort">
            <ArrowDownUp size={14} strokeWidth={1.75} />
            정렬
          </label>
          <select
            id="book-sort"
            className="book-list__sort-select"
            value={sort.value}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {categories.length > 0 && (
          <div className="book-list__categories">
            <span className="book-list__categories-label">
              <Tag size={14} strokeWidth={1.75} />
              카테고리
            </span>
            <div className="book-list__chips">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`book-list__chip ${category === c ? 'book-list__chip--active' : ''}`}
                  onClick={() => handleCategoryChange(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading && <Loader label="도서를 불러오는 중..." fullHeight />}

      {!loading && error && (
        <EmptyState
          icon={SearchX}
          title="도서를 불러오지 못했습니다"
          description={error}
          action={
            <Button variant="secondary" onClick={() => setSearchParams(new URLSearchParams(searchParams))}>
              다시 시도
            </Button>
          }
        />
      )}

      {!loading && !error && filteredBooks.length === 0 && (
        <EmptyState
          icon={hasActiveFilter ? SearchX : LibraryBig}
          title={hasActiveFilter ? '검색 결과가 없습니다' : '등록된 도서가 없습니다'}
          description={
            hasActiveFilter
              ? '다른 검색어나 카테고리를 시도해보세요.'
              : '곧 새로운 도서가 채워질 예정입니다.'
          }
          action={
            hasActiveFilter ? (
              <Button variant="secondary" onClick={() => updateParams({ q: '', category: '' })}>
                필터 초기화
              </Button>
            ) : undefined
          }
        />
      )}

      {!loading && !error && filteredBooks.length > 0 && (
        <div className="book-list__grid">
          {filteredBooks.map((book) => (
            <BookCard key={book.bookId} book={book} />
          ))}
        </div>
      )}

      {!loading && !error && page && (
        <Pagination pageNumber={page.pageNumber} totalPages={page.totalPages} onChange={handlePageChange} />
      )}
    </div>
  )
}
