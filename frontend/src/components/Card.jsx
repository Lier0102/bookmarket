import './Card.css'

export default function Card({ interactive = false, className = '', children, ...rest }) {
  const classes = `card ${interactive ? 'card--interactive' : ''} ${className}`.trim()
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}
