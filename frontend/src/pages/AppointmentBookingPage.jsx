import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import * as avocatsApi from '../api/avocats.js'
import * as rdvApi from '../api/rdv.js'
import '../styles/PlatformSpaces.css'

function toIso(dt) {
  return dt.toISOString().slice(0, 19)
}

export default function AppointmentBookingPage() {
  const { avocatId } = useParams()
  const navigate = useNavigate()
  const { token, user, isAuthenticated } = useAuth()

  const [avocat, setAvocat] = useState(null)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [motif, setMotif] = useState('')
  const [type, setType] = useState('EN_LIGNE')

  const range = useMemo(() => {
    const now = new Date()
    const end = new Date(now)
    end.setDate(end.getDate() + 21)
    return { start: toIso(now), end: toIso(end) }
  }, [])

  useEffect(() => {
    if (!avocatId) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [a, s] = await Promise.all([
          avocatsApi.getPublicAvocatById(avocatId),
          token ? rdvApi.listAvailableSlots(token, avocatId, range.start, range.end) : Promise.resolve(null),
        ])
        if (!cancelled) {
          setAvocat(a)
          setSlots(s?.creneaux ?? [])
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [avocatId, token, range.start, range.end])

  if (!isAuthenticated || !token || user?.roleUser !== 'client') {
    return <Navigate to="/auth" replace />
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!motif.trim()) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await rdvApi.createClientAppointmentRequest(token, avocatId, {
        motifConsultation: motif.trim(),
        typeRendezVous: type,
      })
      setSuccess('Demande envoyee. L avocat proposera un creneau selon son agenda.')
      setMotif('')
      setTimeout(() => navigate('/client-space?tab=appointments'), 800)
    } catch (e2) {
      setError(e2?.message || String(e2))
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.main className="platform-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <p className="platform-eyebrow">Rendez-vous</p>
      <h1 className="platform-title">Prise de rendez-vous</h1>
      <div className="platform-title-divider" />
      <p className="platform-subtitle">Creer une demande depuis le profil avocat, puis valider/refuser la proposition de creneau.</p>

      {loading && <Loader2 className="forsalaw-spin" size={22} />}
      {error && <p style={{ color: '#ff9f9f' }}>{error}</p>}
      {success && <p style={{ color: '#9fd4b4' }}>{success}</p>}

      {!loading && avocat && (
        <>
          <section className="client-pro-card">
            <div className="client-pro-card__body">
              <strong>Avocat:</strong> Me. {avocat.userPrenom} {avocat.userNom} - {avocat.specialiteLibelle ?? avocat.specialite}
            </div>
          </section>

          <section className="client-pro-card" style={{ marginTop: '1rem' }}>
            <div className="client-pro-card__body">
              <form className="client-pro-form" onSubmit={submit}>
                <label>
                  <span>Motif</span>
                  <textarea value={motif} onChange={(e) => setMotif(e.target.value)} rows={4} required />
                </label>
                <label>
                  <span>Type</span>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="EN_LIGNE">En ligne</option>
                    <option value="CABINET">Cabinet</option>
                    <option value="TELEPHONE">Telephone</option>
                  </select>
                </label>
                <button className="lawyer-space-btn-primary" disabled={saving}>
                  {saving ? 'Envoi...' : 'Envoyer la demande'}
                </button>
              </form>
            </div>
          </section>

          <section className="client-pro-card" style={{ marginTop: '1rem' }}>
            <div className="client-pro-card__head">
              <h3 className="client-pro-card__title">Creneaux disponibles (info)</h3>
            </div>
            <div className="client-pro-card__body">
              {slots.length === 0 ? (
                <p>Aucun creneau publie sur la periode.</p>
              ) : (
                slots.slice(0, 30).map((s, i) => (
                  <p key={i}>{String(s.debut).replace('T', ' ')} {'\u2192'} {String(s.fin).replace('T', ' ')}</p>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </motion.main>
  )
}
