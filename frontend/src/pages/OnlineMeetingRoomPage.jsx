import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Navigate, useParams } from 'react-router-dom'
import { Loader2, Video } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import * as rdvApi from '../api/rdv.js'
import '../styles/PlatformSpaces.css'

export default function OnlineMeetingRoomPage() {
  const { idRendezVous } = useParams()
  const { token, user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [access, setAccess] = useState(null)

  useEffect(() => {
    if (!token || !idRendezVous) return
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const dto = user?.roleUser === 'avocat'
          ? await rdvApi.lawyerMeetingAccess(token, idRendezVous)
          : await rdvApi.clientMeetingAccess(token, idRendezVous)
        setAccess(dto)
      } catch (e) {
        setError(e?.message || String(e))
      } finally {
        setLoading(false)
      }
    })()
  }, [token, idRendezVous, user?.roleUser])

  const jitsiUrl = useMemo(() => {
    const room = access?.roomCode
    if (!room) return null
    return `https://meet.jit.si/${encodeURIComponent(room)}#config.prejoinPageEnabled=false`
  }, [access?.roomCode])

  if (!isAuthenticated || !token) return <Navigate to="/auth" replace />
  if (user?.roleUser !== 'client' && user?.roleUser !== 'avocat') return <Navigate to="/" replace />

  return (
    <motion.main className="platform-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <p className="platform-eyebrow">Rendez-vous en ligne</p>
      <h1 className="platform-title">Salle de consultation</h1>
      <div className="platform-title-divider" />
      <p className="platform-subtitle">Acces securise a la room du rendez-vous confirme.</p>

      {loading && <Loader2 className="forsalaw-spin" size={24} />}
      {error && <p style={{ color: '#ff9f9f' }}>{error}</p>}

      {!loading && !error && access && (
        <section className="client-pro-card">
          <div className="client-pro-card__head">
            <div className="client-pro-card__title-wrap">
              <Video size={18} className="client-pro-card__icon" />
              <div>
                <h3 className="client-pro-card__title">Room {access.roomCode}</h3>
                <p className="client-pro-card__sub">Rendez-vous {access.idRendezVous}</p>
              </div>
            </div>
          </div>
          <div className="client-pro-card__body">
            {jitsiUrl && (
              <iframe
                src={jitsiUrl}
                title="Online meeting room"
                style={{ width: '100%', height: '72vh', border: '4px solid var(--black)', background: '#111' }}
                allow="camera; microphone; fullscreen; display-capture"
              />
            )}
          </div>
        </section>
      )}
    </motion.main>
  )
}
