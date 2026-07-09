import { Search, X } from 'lucide-react'
import GlassPanel from './GlassPanel'
import './SearchBar.css'

export default function SearchBar({ value, onChange, placeholder = '도서, 저자, 출판사 검색', ...rest }) {
  return (
    <GlassPanel as="div" className="search-bar">
      <Search size={18} strokeWidth={1.75} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        {...rest}
      />
      {value && (
        <button type="button" className="search-bar__clear" onClick={() => onChange?.('')} aria-label="지우기">
          <X size={16} strokeWidth={1.75} />
        </button>
      )}
    </GlassPanel>
  )
}
