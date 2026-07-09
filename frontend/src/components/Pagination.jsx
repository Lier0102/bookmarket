import { ChevronLeft, ChevronRight } from 'lucide-react'
import './Pagination.css'

function getPageWindow(current, total) {
  const pages = []
  const windowSize = 1
  const start = Math.max(0, current - windowSize)
  const end = Math.min(total - 1, current + windowSize)

  if (start > 0) {
    pages.push(0)
    if (start > 1) pages.push('...')
  }
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) {
    if (end < total - 2) pages.push('...')
    pages.push(total - 1)
  }
  return pages
}

// pageNumber is 0-indexed (matches backend PageResponse)
export default function Pagination({ pageNumber, totalPages, onChange }) {
  if (totalPages <= 1) return null
  const pages = getPageWindow(pageNumber, totalPages)

  return (
    <nav className="pagination" aria-label="페이지 이동">
      <button
        type="button"
        className="pagination__btn"
        disabled={pageNumber === 0}
        onClick={() => onChange(pageNumber - 1)}
        aria-label="이전 페이지"
      >
        <ChevronLeft size={16} strokeWidth={1.75} />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="pagination__ellipsis">
            &hellip;
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={`pagination__btn ${p === pageNumber ? 'pagination__btn--active' : ''}`}
            onClick={() => onChange(p)}
            aria-current={p === pageNumber ? 'page' : undefined}
          >
            {p + 1}
          </button>
        ),
      )}

      <button
        type="button"
        className="pagination__btn"
        disabled={pageNumber >= totalPages - 1}
        onClick={() => onChange(pageNumber + 1)}
        aria-label="다음 페이지"
      >
        <ChevronRight size={16} strokeWidth={1.75} />
      </button>
    </nav>
  )
}
