import { useId } from 'react'
import './Input.css'

export function Input({ label, error, className = '', ...rest }) {
  const id = useId()
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`.trim()}>
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <input id={id} className="field__control" {...rest} />
      {error && <span className="field__error">{error}</span>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...rest }) {
  const id = useId()
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`.trim()}>
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <textarea id={id} className="field__control" {...rest} />
      {error && <span className="field__error">{error}</span>}
    </div>
  )
}

export default Input
