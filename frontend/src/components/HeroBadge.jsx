import './HeroBadge.css'

export default function HeroBadge({ icon: Icon, children }) {
  return (
    <div className="hero-badge glass">
      {Icon && <Icon size={15} strokeWidth={1.75} />}
      <span>{children}</span>
    </div>
  )
}
