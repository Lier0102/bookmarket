import { Loader2 } from 'lucide-react'
import './Loader.css'

export default function Loader({ label = '불러오는 중...', fullHeight = false }) {
  return (
    <div className={`loader ${fullHeight ? 'loader--full' : ''}`}>
      <Loader2 className="loader__spinner" size={28} strokeWidth={1.5} />
      {label && <p>{label}</p>}
    </div>
  )
}
