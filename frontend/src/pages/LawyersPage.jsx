import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MapPin, User, Star, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/AuthContext.jsx'
import * as avocatsApi from '../api/avocats.js'
import * as rdvApi from '../api/rdv.js'
import '../styles/Lawyers.css'

const rankFromProfile = (avocat) => {
  if (avocat.verificationStatus === 'APPROVED') return 'S-TIER'
  if (avocat.verificationStatus === 'PENDING') return 'A-TIER'
  return 'B-TIER'
}

const DAY_LABELS = {
  1: 'Lun',
  2: 'Mar',
  3: 'Mer',
  4: 'Jeu',
  5: 'Ven',
  6: 'Sam',
  7: 'Dim',
}

const timeLabel = (v) => (typeof v === 'string' ? v.slice(0, 5) : '')

const TradingCard = ({
  lawyer,
  canContact,
  canBook,
  onContact,
  onBook,
  t,
  scheduleSummary,
  contactLabel,
  showActions = true,
}) => {
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
          <div className="card-schedule">
            <p className="card-schedule__title">Horaires</p>
            {scheduleSummary ? (
              <p className="card-schedule__line">{scheduleSummary}</p>
            ) : (
              <p className="card-schedule__line card-schedule__line--muted">
                Horaires indisponibles pour le moment
              </p>
            )}
          </div>

          {showActions && (
            <div style={{ marginTop: 'auto', display: 'grid', gap: '0.5rem' }}>
              <button className="brutal-btn card-action" onClick={onContact} disabled={!canContact}>
                {canContact ? 'Contacter' : contactLabel}
              </button>
              <button className="brutal-btn card-action" onClick={onBook} disabled={!canBook}>
                {canBook ? 'Prendre RDV' : 'Client requis'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const LawyersPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated, user, token } = useAuth()
  const [selectedSpecs, setSelectedSpecs] = useState([])
  const [lawyers, setLawyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [scheduleByLawyerId, setScheduleByLawyerId] = useState({})
  const [canContactByLawyerId, setCanContactByLawyerId] = useState({})

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

  const canContactBase = isAuthenticated && user?.roleUser === 'client'
  const canBook = isAuthenticated && user?.roleUser === 'client'

  useEffect(() => {
    if (lawyers.length === 0) {
      setScheduleByLawyerId({})
      return
    }

    let cancelled = false

    ;(async () => {
      const pairs = await Promise.all(
        lawyers.map(async (lawyer) => {
          try {
            const agenda = await rdvApi.getPublicAgenda(lawyer.id)
            const plages = agenda?.plages ?? []
            if (plages.length === 0) {
              return [lawyer.id, agenda?.agendaActif === false ? 'Agenda inactif' : 'Horaires non renseignes']
            }
            const plagesSummary = plages
              .map((p) => `${DAY_LABELS[p.dayOfWeek] || `J${p.dayOfWeek}`} ${timeLabel(p.heureDebut)}-${timeLabel(p.heureFin)}`)
              .join(' | ')
            const summary = agenda?.agendaActif === false
              ? `Agenda inactif · ${plagesSummary}`
              : plagesSummary
            return [lawyer.id, summary]
          } catch {
            return [lawyer.id, null]
          }
        }),
      )
      if (!cancelled) setScheduleByLawyerId(Object.fromEntries(pairs))
    })()

    return () => {
      cancelled = true
    }
  }, [lawyers])

  useEffect(() => {
    if (!isAuthenticated || !user || user.roleUser !== 'client') {
      setCanContactByLawyerId({})
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const page = await rdvApi.listClientAppointments(token, { page: 0, size: 300 })
        const confirmedAvocatIds = new Set(
          (page?.content ?? [])
            .filter((r) => r.statutRendezVous === 'CONFIRME')
            .map((r) => String(r.idAvocat ?? r.avocatId ?? ''))
            .filter(Boolean),
        )
        const map = Object.fromEntries(lawyers.map((l) => [l.id, confirmedAvocatIds.has(String(l.id))]))
        if (!cancelled) setCanContactByLawyerId(map)
      } catch {
        if (!cancelled) setCanContactByLawyerId({})
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, user, token, lawyers])

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
                canContact={canContactBase && !!canContactByLawyerId[lawyer.id]}
                canBook={canBook}
                showActions={user?.roleUser !== 'avocat'}
                t={t}
                scheduleSummary={scheduleByLawyerId[lawyer.id] ?? null}
                contactLabel={
                  !isAuthenticated
                    ? 'Connexion requise'
                    : user?.roleUser !== 'client'
                      ? 'Client requis'
                      : '1er RDV confirme requis'
                }
                onContact={() => {
                  const allowed = canContactBase && !!canContactByLawyerId[lawyer.id]
                  if (!allowed) {
                    if (!isAuthenticated) navigate('/auth')
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
