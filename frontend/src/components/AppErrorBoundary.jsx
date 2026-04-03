import React from 'react'

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    if (typeof this.props.onError === 'function') {
      this.props.onError(error)
    } else {
      // Keep a visible breadcrumb for debugging in dev.
      console.error(error)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="hero-section" style={{ textAlign: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--gold)', fontSize: '0.75rem', letterSpacing: '0.25em', marginBottom: '1rem' }}>
            INCIDENT DANS LA CHAMBRE
          </p>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            Une erreur a interrompu la séance.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: 560, margin: '0 auto 2rem' }}>
            Revenez au Grand Palais. Si le problème persiste, signalez-le au Greffe.
          </p>
          <a className="brutal-btn" href="/">
            ← Retour au Grand Palais
          </a>
        </main>
      )
    }

    return this.props.children
  }
}

