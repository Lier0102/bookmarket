import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import './Button.css'

export default function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  children,
  ...rest
}) {
  const classes = `btn btn--${variant} btn--${size} ${className}`.trim()
  const content = (
    <>
      {loading ? (
        <Loader2 className="btn__spinner" size={16} strokeWidth={1.75} />
      ) : (
        Icon && iconPosition === 'left' && <Icon size={16} strokeWidth={1.75} />
      )}
      {children && <span>{children}</span>}
      {!loading && Icon && iconPosition === 'right' && <Icon size={16} strokeWidth={1.75} />}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} aria-disabled={disabled} {...rest}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    )
  }

  return (
    <button type="button" className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  )
}
