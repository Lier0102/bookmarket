import { createPortal } from 'react-dom'
import { useEffect } from 'react'
import { X } from 'lucide-react'
import GlassPanel from './GlassPanel'
import './Modal.css'

export default function Modal({ open, onClose, title, children, actions }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <GlassPanel className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal__header">
          {title && <h3>{title}</h3>}
          <button type="button" className="modal__close" onClick={onClose} aria-label="닫기">
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {actions && <div className="modal__actions">{actions}</div>}
      </GlassPanel>
    </div>,
    document.body,
  )
}
