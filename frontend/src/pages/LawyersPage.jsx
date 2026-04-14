import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MapPin, User, Star, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/AuthContext.jsx'
import * as avocatsApi from '../api/avocats.js'
import '../styles/Lawyers.css'

const rankFromProfile = (avocat) => {
  if (avocat.verificationStatus === 'APPROVED') return 'S-TIER'
  if (avocat.verificationStatus === 'PENDING') return 'A-TIER'
  return 'B-TIER'
}

const TradingCard = ({ lawyer, canContact, canBook, onContact, onBook, t }) => {
  const fullName = `Me. ${lawyer.userPrenom ?? ''} ${lawyer.userNom ?? ''}`.trim()
  const specialty = lawyer.specialiteLibelle || lawyer.specialite || '—'
  const statusText = lawyer.verificationStatus === 'APPROVED'
    ? 'Profil vérifié'
    : lawyer.verificationStatus === 'PENDING'
      ? 'Demande en attente'
      : 'Demande non approuvée'

  return (
    <div className="lawyer-card-wrapper">
      <div className="lawyer-card">
        <div className="card-header">
          <div className="card-header-bg" />
          <div className="card-rank">{rankFromProfile(lawyer)}</div>
          <div className="card-avatar">
            {lawyer.profilePhotoPublicUrl ? (
              <img
                src={lawyer.profilePhotoPublicUrl}
                alt={fullName}
              />
            ) : (
              <User size={40} className="icon-heavy-shadow" />
            )}
          </div>
        </div>

        <div className="card-body">
          <h3 className="card-name">{fullName}</h3>
          <span className="card-specialty">{specialty}</span>

          <div className="card-stats">
            <div className="stat-box">
              <span className="stat-value">{lawyer.verifie ? '100%' : '—'}</span>
              <span className="stat-label">profil</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{lawyer.anneesExperience ?? 0} {t('lawyer_years')}</span>
              <span className="stat-label">{t('lawyer_xp')}</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{lawyer.totalDossiers ?? 0}</span>
              <span className="stat-label">{t('lawyer_cases')}</span>
            </div>
            <div className="stat-box">
              <span className="stat-value" style={{ color: 'var(--gold)' }}>
                {(lawyer.noteMoyenne ?? 0).toFixed(1)} <Star size={10} className="icon-heavy-shadow" style={{ display: 'inline', fill: 'var(--gold)' }} />
              </span>
              <span className="stat-label">{t('lawyer_rating')}</span>
            </div>
          </div>

          <p className="card-location">
            <MapPin size={14} className="icon-heavy-shadow" /> {lawyer.ville || 'Tunisie'}
          </p>
          <p className="card-location" style={{ marginTop: '0.2rem', opacity: 0.8 }}>
            {statusText}
          </p>

          <div style={{ marginTop: 'auto', display: 'grid', gap: '0.5rem' }}>
            <button className="brutal-btn card-action" onClick={onContact} disabled={!canContact}>
              {canContact ? 'Contacter' : 'Connexion requise'}
            </button>
            <button className="brutal-btn card-action" onClick={onBook} disabled={!canBook}>
              {canBook ? 'Prendre RDV' : 'Client requis'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const LawyersPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [selectedSpecs, setSelectedSpecs] = useState([])
  const [lawyers, setLawyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        // No `verifie` filter intentionally: includes newly submitted lawyer requests.
        const page = await avocatsApi.listPublicAvocats({ page: 0, size: 80 })
        if (!cancelled) setLawyers(page?.content ?? [])
      } catch (e) {
        if (!cancelled) setError(e?.message || String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const specialties = useMemo(() => {
    const set = new Set(
      lawyers
        .map((l) => l.specialiteLibelle || l.specialite)
        .filter(Boolean),
    )
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'))
  }, [lawyers])

  const filteredLawyers = useMemo(() => (
    selectedSpecs.length === 0
      ? lawyers
      : lawyers.filter((l) => selectedSpecs.includes(l.specialiteLibelle || l.specialite))
  ), [lawyers, selectedSpecs])

  const toggleSpec = (spec) => {
    setSelectedSpecs((prev) => (
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    ))
  }

  const canContact = isAuthenticated && (user?.roleUser === 'client' || user?.roleUser === 'avocat')
  const canBook = isAuthenticated && user?.roleUser === 'client'

  return (
    <div className="lawyers-page">
      <PageHeader
        className="lawyers-header"
        tag={t('lawyers_tag')}
        tagClassName="lawyers-header-tag"
        title={t('lawyers_title')}
        titleClassName="lawyers-title"
      />

      {error && (
        <div style={{ color: '#ffb4a8', padding: '0 2rem 1rem' }}>{error}</div>
      )}

      <div className="lawyers-content">
        <aside className="lawyers-sidebar">
          <div className="filter-group">
            <h3 className="filter-title">{t('lawyers_filter')}</h3>
            {specialties.map((spec) => (
              <label key={spec} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={selectedSpecs.includes(spec)}
                  onChange={() => toggleSpec(spec)}
                />
                {spec}
              </label>
            ))}
          </div>
        </aside>

        <main className="cards-grid">
          {loading && (
            <div style={{ padding: '2rem', color: 'var(--gold)' }}>
              <Loader2 className="forsalaw-spin" size={24} />
            </div>
          )}

          {!loading && filteredLawyers.map((lawyer, idx) => (
            <motion.div
              key={lawyer.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.25 }}
            >
              <TradingCard
                lawyer={lawyer}
                canContact={canContact}
                canBook={canBook}
                t={t}
                onContact={() => {
                  if (!canContact) {
                    navigate('/auth')
                    return
                  }
                  navigate(`/inbox?avocatId=${encodeURIComponent(lawyer.id)}`)
                }}
                onBook={() => {
                  if (!canBook) {
                    navigate('/auth')
                    return
                  }
                  navigate(`/appointments/new/${encodeURIComponent(lawyer.id)}`)
                }}
              />
            </motion.div>
          ))}

          {!loading && filteredLawyers.length === 0 && (
            <div style={{ padding: '2rem', opacity: 0.8 }}>Aucun avocat ne correspond au filtre.</div>
          )}
        </main>
      </div>
    </div>
  )
}

export default LawyersPage
