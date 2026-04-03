export default function PageHeader({
  className = '',
  tag,
  tagClassName = '',
  title,
  titleClassName = '',
  showDivider = true,
  dividerStyle,
  children,
}) {
  return (
    <header className={className}>
      {tag ? <div className={tagClassName}>{tag}</div> : null}
      {title ? <h1 className={titleClassName}>{title}</h1> : null}
      {showDivider ? (
        <div style={{ marginTop: '1rem', height: '1px', background: 'var(--gold)', width: '200px', opacity: 0.3, ...(dividerStyle ?? {}) }} />
      ) : null}
      {children}
    </header>
  )
}

