import { useState } from 'react'
import { BookOpen, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from './Card'
import { bookImageUrl } from '../api/books'
import { formatPrice, isNewRelease } from '../utils/format'
import './BookCard.css'

export default function BookCard({ book }) {
  const [imgError, setImgError] = useState(false)
  const showImage = book.fileName && !imgError
  const outOfStock = (book.unitsInStock ?? 0) <= 0
  const isNew = !outOfStock && isNewRelease(book.releaseDate)

  return (
    <Card interactive className="book-card">
      <Link to={`/books/${book.bookId}`} className="book-card__link">
        <div className="book-card__cover">
          {showImage ? (
            <img
              src={bookImageUrl(book.bookId)}
              alt={book.name}
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="book-card__placeholder">
              <BookOpen size={32} strokeWidth={1.25} />
            </div>
          )}
          {(outOfStock || isNew) && (
            <div className="book-card__badges">
              {outOfStock && <span className="badge badge--danger">품절</span>}
              {isNew && <span className="badge badge--accent">신간</span>}
            </div>
          )}
          <span className="book-card__arrow">
            <ArrowUpRight size={16} strokeWidth={1.75} />
          </span>
        </div>
        <div className="book-card__body">
          <h3 className="book-card__title">{book.name}</h3>
          <p className="book-card__author">{book.author}</p>
          <p className="book-card__price">{formatPrice(book.unitPrice)}</p>
        </div>
      </Link>
    </Card>
  )
}
