export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
      <div>
        <h1 className="h3 mb-1 page-title">{title}</h1>
        {subtitle && <p className="text-body-secondary mb-0">{subtitle}</p>}
      </div>
      {actions && <div className="d-flex gap-2">{actions}</div>}
    </div>
  )
}
