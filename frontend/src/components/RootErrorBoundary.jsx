import React from 'react'

/**
 * Attrape les erreurs de rendu avant AppErrorBoundary (ex. écran blanc si crash au 1er paint).
 */
export default class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[RootErrorBoundary]', error, info?.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            padding: '2rem',
            background: '#121212',
            color: '#f5f5f5',
            fontFamily: 'system-ui, sans-serif',
            maxWidth: '42rem',
            margin: '0 auto',
          }}
        >
          <p style={{ color: '#e8c76b', letterSpacing: '0.2em', fontSize: '0.7rem', marginBottom: '1rem' }}>
            ERREUR DE CHARGEMENT
          </p>
          <h1 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>L’application n’a pas pu s’afficher.</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '1rem', lineHeight: 1.6 }}>
            Ouvre la console du navigateur (F12 → Console) pour le détail. Après correction, recharge la page.
          </p>
          <pre
            style={{
              padding: '1rem',
              background: '#000',
              border: '1px solid rgba(232, 199, 107, 0.4)',
              fontSize: '0.8rem',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {this.state.error?.message || String(this.state.error)}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
