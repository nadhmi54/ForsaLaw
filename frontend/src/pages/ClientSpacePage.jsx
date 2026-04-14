import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Calendar,
  MessageSquare,
  FilePlus2,
  LogOut,
  User,
  ChevronRight,
  Video,
  Loader2,
  Camera,
  Shield,
  Bell,
  Trash2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import * as usersApi from '../api/users.js'
import * as rdvApi from '../api/rdv.js'
import '../styles/PlatformSpaces.css'

const MOCK_CASES = [
  { id: 'DOS-2026-0142', subject: 'Litige Foncier — Terrain Ariana', avocat: 'Me. Y. Mansour', status: 'in-progress', statusLabel: 'EN COURS' },
  { id: 'DOS-2026-0089', subject: 'Harcèlement Professionnel', avocat: 'Me. K. Ouertani', status: 'open', statusLabel: 'OUVERTE' },
  { id: 'DOS-2025-0402', subject: 'Contestation Héritage', avocat: 'Me. S. Ben Amor', status: 'closed', statusLabel: 'CLOSE' },
]

const VALID_TABS = new Set(['cases', 'appointments', 'messages', 'profile'])

function formatApiDate(v) {
  if (v == null) return '—'
  if (typeof v === 'string') return v.includes('T') ? v.split('T')[0] : v
  if (Array.isArray(v) && v.length >= 3) {
    const [y, m, d] = v
    return `${String(y)}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }
  return String(v)
}

function fmtDateTime(v) {
  if (!v) return '—'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v)
  return d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function ClientSpacePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { token, user, isAuthenticated, logout, refreshUser } = useAuth()

  const tabFromUrl = searchParams.get('tab')
  const activeTab = VALID_TABS.has(tabFromUrl) ? tabFromUrl : 'cases'

  const setActiveTab = (key) => {
    setSearchParams(key === 'cases' ? {} : { tab: key })
  }

  const [me, setMe] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [loadingMe, setLoadingMe] = useState(true)

  const [editNom, setEditNom] = useState('')
  const [editPrenom, setEditPrenom] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [profileEditing, setProfileEditing] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)

  const [pwdCurrent, setPwdCurrent] = useState('')
  const [pwdNew, setPwdNew] = useState('')
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdMsg, setPwdMsg] = useState(null)

  const [notif, setNotif] = useState(null)
  const [notifLoading, setNotifLoading] = useState(false)
  const [notifSaving, setNotifSaving] = useState(false)
  const [notifMsg, setNotifMsg] = useState(null)

  const [photoBlobUrl, setPhotoBlobUrl] = useState(null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoMsg, setPhotoMsg] = useState(null)

  const [deleteBusy, setDeleteBusy] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)

  const reloadMe = useCallback(async () => {
    if (!token) return
    setLoadingMe(true)
    setLoadError(null)
    try {
      const dto = await usersApi.getMe(token)
      setMe(dto)
      setEditNom(dto.nom ?? '')
      setEditPrenom(dto.prenom ?? '')
      setEditEmail(dto.email ?? '')
    } catch (e) {
      setLoadError(e?.message || String(e))
    } finally {
      setLoadingMe(false)
    }
  }, [token])

  useEffect(() => {
    if (!token || !isAuthenticated) return
    reloadMe()
  }, [token, isAuthenticated, reloadMe])

  useEffect(() => {
    if (!token || activeTab !== 'profile') return
    let cancelled = false
    ;(async () => {
      setNotifLoading(true)
      setNotifMsg(null)
      try {
        const p = await usersApi.getNotificationPreferences(token)
        if (!cancelled) setNotif(p)
      } catch (e) {
        if (!cancelled) setNotifMsg(e?.message || String(e))
      } finally {
        if (!cancelled) setNotifLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, activeTab])

  useEffect(() => {
    if (!token || activeTab !== 'appointments') return
    let cancelled = false
    ;(async () => {
      setAppointmentsLoading(true)
      try {
        const page = await rdvApi.listClientAppointments(token, { page: 0, size: 50 })
        if (!cancelled) setAppointments(page?.content ?? [])
      } catch (e) {
        if (!cancelled) setLoadError(e?.message || String(e))
      } finally {
        if (!cancelled) setAppointmentsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, activeTab])

  const reloadAppointments = useCallback(async () => {
    if (!token) return
    const page = await rdvApi.listClientAppointments(token, { page: 0, size: 50 })
    setAppointments(page?.content ?? [])
  }, [token])

  useEffect(() => {
    if (!token) {
      setPhotoBlobUrl(null)
      return
    }
    let revoked = false
    let url
    ;(async () => {
      try {
        const blob = await usersApi.downloadProfilePhotoBlob(token)
        if (blob && !revoked) {
          url = URL.createObjectURL(blob)
          setPhotoBlobUrl(url)
        } else {
          setPhotoBlobUrl(null)
        }
      } catch {
        setPhotoBlobUrl(null)
      }
    })()
    return () => {
      revoked = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [token, me?.profilePhotoUrl])

  const initials = useMemo(() => {
    const p = me?.prenom ?? user?.prenom
    const n = me?.nom ?? user?.nom
    return ((p?.[0] ?? '') + (n?.[0] ?? '')).toUpperCase() || '?'
  }, [me, user])

  const displayName = useMemo(() => {
    const p = me?.prenom ?? user?.prenom
    const n = me?.nom ?? user?.nom
    return [p, n].filter(Boolean).join(' ') || user?.email || '—'
  }, [me, user])

  const CLIENT_NAV = [
    { key: 'cases', label: t('client_nav_cases'), icon: <FileText size={16} /> },
    { key: 'appointments', label: t('client_nav_appointments'), icon: <Calendar size={16} /> },
    { key: 'messages', label: t('client_nav_messages'), icon: <MessageSquare size={16} /> },
    { key: 'profile', label: t('client_nav_profile'), icon: <User size={16} /> },
  ]

  if (!isAuthenticated || !token) {
    return <Navigate to="/" replace />
  }

  if (user?.roleUser !== 'client') {
    return <Navigate to="/" replace />
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!token) return
    setProfileSaving(true)
    setProfileMsg(null)
    try {
      const updated = await usersApi.updateMe(token, {
        nom: editNom.trim(),
        prenom: editPrenom.trim(),
        email: editEmail.trim(),
      })
      setMe(updated)
      await refreshUser()
      setProfileEditing(false)
      setProfileMsg(t('client_profile_saved'))
    } catch (err) {
      setProfileMsg(err?.message || String(err))
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!token) return
    setPwdSaving(true)
    setPwdMsg(null)
    try {
      await usersApi.changePassword(token, {
        motDePasseActuel: pwdCurrent,
        nouveauMotDePasse: pwdNew,
      })
      setPwdCurrent('')
      setPwdNew('')
      setPwdMsg(t('client_password_saved'))
    } catch (err) {
      setPwdMsg(err?.message || String(err))
    } finally {
      setPwdSaving(false)
    }
  }

  const handleSaveNotif = async () => {
    if (!token || !notif) return
    setNotifSaving(true)
    setNotifMsg(null)
    try {
      const updated = await usersApi.updateNotificationPreferences(token, notif)
      setNotif(updated)
      setNotifMsg(t('client_notif_saved'))
    } catch (err) {
      setNotifMsg(err?.message || String(err))
    } finally {
      setNotifSaving(false)
    }
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !token) return
    setPhotoUploading(true)
    setPhotoMsg(null)
    try {
      const updated = await usersApi.uploadProfilePhoto(token, file)
      setMe(updated)
      await refreshUser()
      setPhotoMsg(t('client_photo_saved'))
      const blob = await usersApi.downloadProfilePhotoBlob(token)
      setPhotoBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return blob ? URL.createObjectURL(blob) : null
      })
    } catch (err) {
      setPhotoMsg(err?.message || String(err))
    } finally {
      setPhotoUploading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!token) return
    if (!window.confirm(t('client_delete_confirm'))) return
    setDeleteBusy(true)
    try {
      await usersApi.deleteMe(token)
      logout()
      navigate('/', { replace: true })
    } catch (err) {
      window.alert(err?.message || String(err))
    } finally {
      setDeleteBusy(false)
    }
  }

  const toggleNotif = (key) => {
    setNotif((prev) => (prev ? { ...prev, [key]: !prev[key] } : prev))
  }

  return (
    <motion.main
      className="platform-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <p className="platform-eyebrow">{t('client_space_tag')}</p>
      <h1 className="platform-title">{t('client_space_title')}</h1>
      <div className="platform-title-divider" />
      <p className="platform-subtitle">{t('client_space_subtitle')}</p>

      {loadError && (
        <p className="client-banner-error" style={{ color: '#ff8a80', marginBottom: '1rem', fontSize: '0.85rem' }}>
          {loadError}
        </p>
      )}

      <div className="client-layout">
        <div className="client-profile-col">
          <div className="client-profile-card">
            <div className="client-avatar-ring" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
              {photoBlobUrl ? (
                <img src={photoBlobUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
              {loadingMe && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.45)',
                  }}
                >
                  <Loader2 className="forsalaw-spin" size={22} />
                </div>
              )}
            </div>
            <div className="client-profile-name">{displayName}</div>
            <div className="client-profile-email">{me?.email ?? user?.email}</div>
            <span className="role-badge client">{(me?.roleUser ?? user?.roleUser ?? 'CLIENT').toString().toUpperCase()}</span>
            <div
              style={{
                marginTop: 12,
                fontSize: '0.5rem',
                color: 'rgba(255,255,255,0.15)',
                fontFamily: 'monospace',
                letterSpacing: '0.2em',
              }}
            >
              {t('client_member_since')} {formatApiDate(me?.dateCreation)}
            </div>
          </div>

          <nav className="client-nav-list">
            {CLIENT_NAV.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`client-nav-item${activeTab === item.key ? ' active' : ''}`}
                onClick={() => setActiveTab(item.key)}
              >
                {item.icon}
                {item.label}
                <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.3 }} />
              </button>
            ))}
          </nav>

          <div className="platform-section-header" style={{ marginTop: 'auto', borderTop: '4px solid var(--black)' }}>
            <span className="platform-section-title">{t('client_quick_actions')}</span>
          </div>
          <button type="button" className="quick-action-btn">
            <FilePlus2 size={16} />
            {t('client_action_new_case')}
          </button>
          <button type="button" className="quick-action-btn">
            <MessageSquare size={16} />
            {t('client_action_contact')}
          </button>
          <button
            type="button"
            className="quick-action-btn"
            style={{ color: 'rgba(255,107,107,0.5)' }}
            onClick={() => {
              logout()
              navigate('/')
            }}
          >
            <LogOut size={16} style={{ color: 'rgba(255,107,107,0.5)' }} />
            {t('client_action_logout')}
          </button>
        </div>

        <div className="client-main-col">
          {activeTab === 'cases' && (
            <>
              <div className="platform-section-header">
                <span className="platform-section-title">
                  <FileText size={12} style={{ display: 'inline', marginRight: 6 }} />
                  {t('client_cases_active')}
                </span>
                <span className="platform-section-badge">
                  {MOCK_CASES.length} {t('client_cases_count')}
                </span>
              </div>
              {MOCK_CASES.map((c, i) => (
                <motion.div
                  key={c.id}
                  className="case-row"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <div>
                    <div className="case-id">{c.id}</div>
                  </div>
                  <div>
                    <div className="case-subject">{c.subject}</div>
                  </div>
                  <div className="case-lawyer">{c.avocat}</div>
                  <span className={`status-badge-admin ${c.status}`}>{c.statusLabel}</span>
                </motion.div>
              ))}
            </>
          )}

          {activeTab === 'appointments' && (
            <>
              <div className="platform-section-header">
                <span className="platform-section-title">
                  <Calendar size={12} style={{ display: 'inline', marginRight: 6 }} />
                  {t('client_appts_upcoming')}
                </span>
                <span className="platform-section-badge">
                  {appointments.length} {t('client_appts_count')}
                </span>
              </div>
              {appointmentsLoading && (
                <div style={{ padding: '1rem', color: 'var(--gold)' }}>
                  <Loader2 className="forsalaw-spin" size={18} />
                </div>
              )}
              {!appointmentsLoading && appointments.length === 0 && (
                <div style={{ padding: '1rem', opacity: 0.7 }}>Aucune demande de rendez-vous pour le moment.</div>
              )}
              {!appointmentsLoading && appointments.map((a, i) => (
                <motion.div
                  key={a.idRendezVous}
                  className="appt-row"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="appt-date-block">
                    <span className="appt-day">{(a.dateHeureDebut ? new Date(a.dateHeureDebut) : new Date()).getDate()}</span>
                    <span className="appt-month">{a.dateHeureDebut ? new Date(a.dateHeureDebut).toLocaleString('fr-FR', { month: 'short' }).toUpperCase() : '—'}</span>
                  </div>
                  <div className="appt-info">
                    <div className="appt-subject">{a.motifConsultation || 'Demande de rendez-vous'}</div>
                    <div className="appt-meta">
                      Me. {a.nomAvocat} · {fmtDateTime(a.dateHeureDebut)} {a.dateHeureFin ? `→ ${fmtDateTime(a.dateHeureFin)}` : ''} · {a.typeRendezVous}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span className="status-badge-admin open">{a.statutRendezVous}</span>
                    {a.statutRendezVous === 'PROPOSE' && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="brutal-btn"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.6rem' }}
                          onClick={async () => {
                            try {
                              await rdvApi.clientAcceptProposal(token, a.idRendezVous)
                              await reloadAppointments()
                            } catch (e) {
                              window.alert(e?.message || String(e))
                            }
                          }}
                        >
                          Accepter
                        </button>
                        <button
                          type="button"
                          className="brutal-btn"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.6rem', background: '#2b1b1b', color: '#ffc9c9' }}
                          onClick={async () => {
                            const raison = window.prompt('Raison du refus ?') || ''
                            try {
                              await rdvApi.clientRefuseProposal(token, a.idRendezVous, raison)
                              await reloadAppointments()
                            } catch (e) {
                              window.alert(e?.message || String(e))
                            }
                          }}
                        >
                          Refuser
                        </button>
                      </div>
                    )}
                    {a.statutRendezVous !== 'ANNULE' && (
                      <button
                        type="button"
                        className="brutal-btn"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.6rem' }}
                        onClick={async () => {
                          const raison = window.prompt('Raison d annulation ?') || ''
                          try {
                            await rdvApi.clientCancelAppointment(token, a.idRendezVous, raison)
                            await reloadAppointments()
                          } catch (e) {
                            window.alert(e?.message || String(e))
                          }
                        }}
                      >
                        Annuler
                      </button>
                    )}
                    {a.statutRendezVous === 'CONFIRME' && a.typeRendezVous === 'EN_LIGNE' && (
                      <button
                        type="button"
                        className="brutal-btn"
                        style={{
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.65rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: '#333',
                        }}
                        onClick={async () => {
                          try {
                            const x = await rdvApi.clientMeetingAccess(token, a.idRendezVous)
                            const url = x.joinPath?.startsWith('http') ? x.joinPath : `${window.location.origin}${x.joinPath}`
                            window.open(url, '_blank', 'noopener,noreferrer')
                          } catch (e) {
                            window.alert(e?.message || String(e))
                          }
                        }}
                      >
                        <Video size={12} /> {t('client_appts_join')}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </>
          )}

          {activeTab === 'messages' && (
            <>
              <div className="platform-section-header">
                <span className="platform-section-title">{t('client_nav_messages')}</span>
              </div>
              <div
                style={{
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.15)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.3em',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                }}
              >
                {t('client_msg_notice')}
              </div>
            </>
          )}

          {activeTab === 'profile' && (
            <div className="client-pro">
              <header className="client-pro__intro">
                <p className="client-pro__eyebrow">{t('client_space_tag')}</p>
                <h2 className="client-pro__title">{t('client_nav_profile')}</h2>
                <p className="client-pro__lede">{t('client_profile_intro')}</p>
              </header>

              <section className="client-pro-card client-pro-card--accent">
                <div className="client-pro-card__head">
                  <div className="client-pro-card__title-wrap">
                    <Shield size={18} className="client-pro-card__icon" aria-hidden />
                    <div>
                      <h3 className="client-pro-card__title">{t('client_profile_info')}</h3>
                      <p className="client-pro-card__sub">{t('client_profile_info_sub')}</p>
                    </div>
                  </div>
                </div>
                <div className="client-pro-card__body">
                  <div className="client-pro-kpis">
                    <div className="client-pro-kpi">
                      <span className="client-pro-kpi__label">{t('client_profile_status')}</span>
                      <span className={`client-pro-pill ${me?.actif ? 'client-pro-pill--ok' : 'client-pro-pill--off'}`}>
                        {me?.actif ? t('client_profile_active_yes') : t('client_profile_active_no')}
                      </span>
                    </div>
                    <div className="client-pro-kpi">
                      <span className="client-pro-kpi__label">{t('client_member_since')}</span>
                      <span className="client-pro-kpi__value">{formatApiDate(me?.dateCreation)}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="client-pro-card">
                <div className="client-pro-card__head">
                  <div className="client-pro-card__title-wrap">
                    <Camera size={18} className="client-pro-card__icon" aria-hidden />
                    <div>
                      <h3 className="client-pro-card__title">{t('client_photo_section')}</h3>
                      <p className="client-pro-card__sub">{t('client_photo_hint')}</p>
                    </div>
                  </div>
                </div>
                <div className="client-pro-card__body">
                  <div className="client-pro-photo">
                    <div className="client-pro-photo__preview" aria-hidden>
                      {photoBlobUrl ? (
                        <img src={photoBlobUrl} alt="" />
                      ) : (
                        <span className="client-pro-photo__placeholder">{initials}</span>
                      )}
                    </div>
                    <div className="client-pro-photo__actions">
                      <label className="client-pro-btn client-pro-btn--primary">
                        <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handlePhotoChange} disabled={photoUploading} />
                        {photoUploading ? <Loader2 className="forsalaw-spin" size={16} /> : <Camera size={16} />}
                        {t('client_photo_choose')}
                      </label>
                      {photoMsg && <p className="client-pro-feedback">{photoMsg}</p>}
                    </div>
                  </div>
                </div>
              </section>

              <section className="client-pro-card">
                <div className="client-pro-card__head client-pro-card__head--split">
                  <div className="client-pro-card__title-wrap">
                    <User size={18} className="client-pro-card__icon" aria-hidden />
                    <div>
                      <h3 className="client-pro-card__title">{t('client_profile_identity')}</h3>
                      <p className="client-pro-card__sub">{t('client_profile_identity_sub')}</p>
                    </div>
                  </div>
                  {!profileEditing ? (
                    <button type="button" className="client-pro-btn client-pro-btn--sm client-pro-btn--goldline" onClick={() => setProfileEditing(true)}>
                      {t('client_profile_edit')}
                    </button>
                  ) : null}
                </div>
                <div className="client-pro-card__body">
                  <form className="client-pro-form" onSubmit={handleSaveProfile}>
                    <div className="client-pro-form__grid">
                      <label className="client-pro-field">
                        <span className="client-pro-field__label">{t('client_profile_fn')}</span>
                        <input
                          value={editPrenom}
                          onChange={(e) => setEditPrenom(e.target.value)}
                          disabled={!profileEditing || profileSaving}
                          autoComplete="given-name"
                        />
                      </label>
                      <label className="client-pro-field">
                        <span className="client-pro-field__label">{t('client_profile_ln')}</span>
                        <input
                          value={editNom}
                          onChange={(e) => setEditNom(e.target.value)}
                          disabled={!profileEditing || profileSaving}
                          autoComplete="family-name"
                        />
                      </label>
                    </div>
                    <label className="client-pro-field client-pro-field--full">
                      <span className="client-pro-field__label">{t('client_profile_email')}</span>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        disabled={!profileEditing || profileSaving}
                        autoComplete="email"
                      />
                    </label>
                    {profileEditing && (
                      <div className="client-pro-form__actions">
                        <button type="submit" className="client-pro-btn client-pro-btn--primary" disabled={profileSaving}>
                          {profileSaving ? <Loader2 className="forsalaw-spin" size={16} /> : null}
                          {t('client_profile_save')}
                        </button>
                        <button
                          type="button"
                          className="client-pro-btn client-pro-btn--ghost"
                          onClick={() => {
                            setProfileEditing(false)
                            setEditNom(me?.nom ?? '')
                            setEditPrenom(me?.prenom ?? '')
                            setEditEmail(me?.email ?? '')
                            setProfileMsg(null)
                          }}
                          disabled={profileSaving}
                        >
                          {t('client_profile_cancel')}
                        </button>
                      </div>
                    )}
                    {profileMsg && <p className="client-pro-feedback">{profileMsg}</p>}
                  </form>
                </div>
              </section>

              <section className="client-pro-card">
                <div className="client-pro-card__head">
                  <div className="client-pro-card__title-wrap">
                    <Shield size={18} className="client-pro-card__icon" aria-hidden />
                    <div>
                      <h3 className="client-pro-card__title">{t('client_password_section')}</h3>
                      <p className="client-pro-card__sub">{t('client_password_sub')}</p>
                    </div>
                  </div>
                </div>
                <div className="client-pro-card__body">
                  <form className="client-pro-form" onSubmit={handleChangePassword}>
                    <div className="client-pro-form__grid">
                      <label className="client-pro-field">
                        <span className="client-pro-field__label">{t('client_password_current')}</span>
                        <input
                          type="password"
                          value={pwdCurrent}
                          onChange={(e) => setPwdCurrent(e.target.value)}
                          autoComplete="current-password"
                        />
                      </label>
                      <label className="client-pro-field">
                        <span className="client-pro-field__label">{t('client_password_new')}</span>
                        <input type="password" value={pwdNew} onChange={(e) => setPwdNew(e.target.value)} autoComplete="new-password" />
                      </label>
                    </div>
                    <div className="client-pro-form__actions">
                      <button type="submit" className="client-pro-btn client-pro-btn--primary" disabled={pwdSaving}>
                        {pwdSaving ? <Loader2 className="forsalaw-spin" size={16} /> : null}
                        {t('client_password_save')}
                      </button>
                    </div>
                    {pwdMsg && <p className="client-pro-feedback">{pwdMsg}</p>}
                  </form>
                </div>
              </section>

              <section className="client-pro-card">
                <div className="client-pro-card__head">
                  <div className="client-pro-card__title-wrap">
                    <Bell size={18} className="client-pro-card__icon" aria-hidden />
                    <div>
                      <h3 className="client-pro-card__title">{t('client_notif_section')}</h3>
                      <p className="client-pro-card__sub">{t('client_notif_sub')}</p>
                    </div>
                  </div>
                </div>
                <div className="client-pro-card__body">
                  {notifLoading && (
                    <div className="client-pro-loading">
                      <Loader2 className="forsalaw-spin" size={22} />
                    </div>
                  )}
                  {notif && (
                    <>
                      <ul className="client-pro-notif-list">
                        {[
                          ['emailRdvDemandeRecue', t('client_notif_demand')],
                          ['emailRdvCreneauPropose', t('client_notif_slot')],
                          ['emailRdvRappelJ1', t('client_notif_j1')],
                          ['emailRdvRappelH1', t('client_notif_h1')],
                          ['emailRdvAnnulation', t('client_notif_cancel')],
                        ].map(([key, label]) => (
                          <li key={key}>
                            <label className="client-pro-notif-row">
                              <span className="client-pro-notif-row__text">{label}</span>
                              <input type="checkbox" className="client-pro-notif-row__check" checked={Boolean(notif[key])} onChange={() => toggleNotif(key)} />
                            </label>
                          </li>
                        ))}
                      </ul>
                      <div className="client-pro-form__actions">
                        <button type="button" className="client-pro-btn client-pro-btn--primary" onClick={handleSaveNotif} disabled={notifSaving}>
                          {notifSaving ? <Loader2 className="forsalaw-spin" size={16} /> : null}
                          {t('client_notif_save')}
                        </button>
                      </div>
                    </>
                  )}
                  {notifMsg && <p className="client-pro-feedback">{notifMsg}</p>}
                </div>
              </section>

              <section className="client-pro-card client-pro-card--danger">
                <div className="client-pro-card__head">
                  <div className="client-pro-card__title-wrap">
                    <Trash2 size={18} className="client-pro-card__icon client-pro-card__icon--danger" aria-hidden />
                    <div>
                      <h3 className="client-pro-card__title client-pro-card__title--danger">{t('client_delete_section')}</h3>
                      <p className="client-pro-card__sub">{t('client_delete_hint')}</p>
                    </div>
                  </div>
                </div>
                <div className="client-pro-card__body">
                  <button type="button" className="client-pro-btn client-pro-btn--danger" onClick={handleDeleteAccount} disabled={deleteBusy}>
                    {deleteBusy ? <Loader2 className="forsalaw-spin" size={16} /> : null}
                    {t('client_delete_account')}
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </motion.main>
  )
}
