export default function PageShell({ as: Comp = 'div', className = '', children }) {
  return <Comp className={`container ${className}`.trim()}>{children}</Comp>
}

