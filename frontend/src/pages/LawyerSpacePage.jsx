import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Camera, Key, Loader2, RefreshCw, Scale, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import * as avocatsApi from '../api/avocats.js'
import * as rdvApi from '../api/rdv.js'
import '../styles/PlatformSpaces.css'
import '../styles/LawyerSpacePage.css'

function statusPillClass(status) {
  if (status === 'APPROVED') return 'lawyer-space-pill lawyer-space-pill--ok'
  if (status === 'REJECTED') return 'lawyer-space-pill lawyer-space-pill--bad'
  return 'lawyer-space-pill lawyer-space-pill--wait'
}

export default function LawyerSpacePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { token, user, isAuthenticated, logout, refreshUser } = useAuth()

  const [domaines, setDomaines] = useState([])
  const [domainesError, setDomainesError] = useState(null)

  const [profile, setProfile] = useState(null)
  const [noProfile, setNoProfile] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [loading, setLoading] = useState(true)

  const [createDomain, setCreateDomain] = useState('')
  const [createSpec, setCreateSpec] = useState('')
  const [createYears, setCreateYears] = useState(0)
  const [createVille, setCreateVille] = useState('')
  const [createDesc, setCreateDesc] = useState('')
  const [createCarte, setCreateCarte] = useState('')
  const [createCin, setCreateCin] = useState('')
  const [createBarreau, setCreateBarreau] = useState('')
  const [createBusy, setCreateBusy] = useState(false)
  const [createMsg, setCreateMsg] = useState(null)

  const [editSpec, setEditSpec] = useState('')
  const [editYears, setEditYears] = useState(0)
  const [editVille, setEditVille] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editBusy, setEditBusy] = useState(false)
  const [editError, setEditError] = useState(null)
  const [editSaved, setEditSaved] = useState(false)

  const [pwdCurrent, setPwdCurrent] = useState('')
  const [pwdNew, setPwdNew] = useState('')
  const [pwdBusy, setPwdBusy] = useState(false)
  const [pwdMsg, setPwdMsg] = useState(null)

  const [photoBlobUrl, setPhotoBlobUrl] = useState(null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoMsg, setPhotoMsg] = useState(null)

  const [deactivateBusy, setDeactivateBusy] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [proposeStart, setProposeStart] = useState('')
  const [proposeEnd, setProposeEnd] = useState('')
  const [proposeType, setProposeType] = useState('EN_LIGNE')
  const [proposeComment, setProposeComment] = useState('')
  const [agendaSnapshot, setAgendaSnapshot] = useState(null)

  const jwtRole = useMemo(() => avocatsApi.parseJwtRole(token), [token])
  const canUseAvocatEndpoints = jwtRole === 'avocat'

  const selectedDomainRow = useMemo(
    () => domaines.find((d) => d.code === createDomain),
    [domaines, createDomain],
  )

  const editDomainRow = useMemo(() => {
    if (!profile?.domaine) return null
    return domaines.find((d) => d.code === profile.domaine)
  }, [domaines, profile?.domaine])

  const reloadProfile = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setLoadError(null)
    try {
      const dto = await avocatsApi.getMyAvocatProfileOrNull(token)
      if (dto == null) {
        setProfile(null)
        setNoProfile(true)
      } else {
        setProfile(dto)
        setNoProfile(false)
        setEditSpec(dto.specialite ?? '')
        setEditYears(dto.anneesExperience ?? 0)
        setEditVille(dto.ville ?? '')
        setEditDesc(dto.description ?? '')
      }
      await refreshUser()
    } catch (e) {
      setLoadError(e?.message || String(e))
    } finally {
      setLoading(false)
    }
  }, [token, refreshUser])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await avocatsApi.getDomaines()
        if (!cancelled) {
          setDomaines(list)
          if (list.length) {
            setCreateDomain((prev) => prev || list[0].code)
          }
        }
      } catch (e) {
        if (!cancelled) setDomainesError(e?.message || String(e))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!token || !isAuthenticated) return
    reloadProfile()
  }, [token, isAuthenticated, reloadProfile])

  useEffect(() => {
    if (!token || !canUseAvocatEndpoints) {
      setPhotoBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
      return
    }
    let revoked = false
    let url
    ;(async () => {
      try {
        const blob = await avocatsApi.downloadAvocatProfilePhotoBlob(token)
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
  }, [token, canUseAvocatEndpoints, profile?.profilePhotoPublicUrl])

  const isApproved = profile?.verificationStatus === 'APPROVED' && profile?.verifie === true
  const isPending = profile && profile.verificationStatus === 'PENDING'
  const isRejected = profile && profile.verificationStatus === 'REJECTED'

  const fmtDateTime = (v) => {
    if (!v) return '—'
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) return String(v)
    return d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const reloadAppointments = useCallback(async () => {
    if (!token || !canUseAvocatEndpoints || !isApproved) return
    setAppointmentsLoading(true)
    try {
      const page = await rdvApi.listLawyerAppointments(token, { page: 0, size: 60 })
      setAppointments(page?.content ?? [])
    } catch (e) {
      setLoadError(e?.message || String(e))
    } finally {
      setAppointmentsLoading(false)
    }
  }, [token, canUseAvocatEndpoints, isApproved])

  useEffect(() => {
    if (!token || !canUseAvocatEndpoints || !isApproved) return
    reloadAppointments()
  }, [token, canUseAvocatEndpoints, isApproved, reloadAppointments])

  useEffect(() => {
    if (!token || !canUseAvocatEndpoints || !isApproved) return
    ;(async () => {
      try {
        const a = await rdvApi.getAgenda(token)
        setAgendaSnapshot(a)
      } catch {
        setAgendaSnapshot(null)
      }
    })()
  }, [token, canUseAvocatEndpoints, isApproved])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!token) return
    setCreateBusy(true)
    setCreateMsg(null)
    try {
      const body = {
        domaine: createDomain,
        specialite: createSpec,
        anneesExperience: Number(createYears) || 0,
        ville: createVille.trim(),
        description: createDesc.trim() || undefined,
        numeroCarteProfessionnelle: createCarte.trim(),
        cin: createCin.trim(),
        barreau: createBarreau.trim(),
      }
      const dto = await avocatsApi.createMyAvocatProfile(token, body)
      setProfile(dto)
      setNoProfile(false)
      setEditSpec(dto.specialite ?? '')
      setEditYears(dto.anneesExperience ?? 0)
      setEditVille(dto.ville ?? '')
      setEditDesc(dto.description ?? '')
      setCreateMsg(null)
      await refreshUser()
    } catch (err) {
      setCreateMsg(err?.message || String(err))
    } finally {
      setCreateBusy(false)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    if (!token || !profile) return
    setEditBusy(true)
    setEditError(null)
    setEditSaved(false)
    try {
      const body = {
        specialite: editSpec || undefined,
        anneesExperience: editYears !== profile.anneesExperience ? Number(editYears) : undefined,
        ville: editVille.trim(),
        description: editDesc.trim(),
      }
      const dto = await avocatsApi.updateMyAvocatProfile(token, body)
      setProfile(dto)
      setEditSaved(true)
    } catch (err) {
      setEditError(err?.message || String(err))
    } finally {
      setEditBusy(false)
    }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    if (!token) return
    setPwdBusy(true)
    setPwdMsg(null)
    try {
      await avocatsApi.changeAvocatPassword(token, {
        motDePasseActuel: pwdCurrent,
        nouveauMotDePasse: pwdNew,
      })
      setPwdCurrent('')
      setPwdNew('')
      setPwdMsg(t('lawyer_space_password_saved'))
    } catch (err) {
      setPwdMsg(err?.message || String(err))
    } finally {
      setPwdBusy(false)
    }
  }

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !token) return
    setPhotoBusy(true)
    setPhotoMsg(null)
    try {
      const dto = await avocatsApi.uploadAvocatProfilePhoto(token, file)
      setProfile(dto)
      await refreshUser()
      setPhotoMsg(t('lawyer_space_photo_saved'))
      const blob = await avocatsApi.downloadAvocatProfilePhotoBlob(token)
      setPhotoBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return blob ? URL.createObjectURL(blob) : null
      })
    } catch (err) {
      setPhotoMsg(err?.message || String(err))
    } finally {
      setPhotoBusy(false)
    }
  }

  const handleDeactivate = async () => {
    if (!token) return
    if (!window.confirm(t('lawyer_space_deactivate_confirm'))) return
    setDeactivateBusy(true)
    try {
      await avocatsApi.deactivateMyAvocatProfile(token)
      await refreshUser()
      navigate('/', { replace: true })
    } catch (err) {
      window.alert(err?.message || String(err))
    } finally {
      setDeactivateBusy(false)
    }
  }

  if (!isAuthenticated || !token) {
    return <Navigate to="/" replace />
  }

  if (user?.roleUser === 'admin') {
    return <Navigate to="/" replace />
  }

  return (
    <motion.main
      className="platform-page lawyer-space-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <p className="platform-eyebrow">{t('lawyer_space_tag')}</p>
      <h1 className="platform-title">{t('lawyer_space_title')}</h1>
      <div className="platform-title-divider" />
      <p className="platform-subtitle">{t('lawyer_space_subtitle')}</p>

      {domainesError && (
        <p className="lawyer-space-banner lawyer-space-banner--error">{domainesError}</p>
      )}
      {loadError && <p className="lawyer-space-banner lawyer-space-banner--error">{loadError}</p>}

      {loading && (
        <div className="lawyer-space-loading">
          <Loader2 className="forsalaw-spin" size={28} />
        </div>
      )}

      {!loading && noProfile && !domaines.length && !domainesError && (
        <div className="lawyer-space-loading">
          <Loader2 className="forsalaw-spin" size={28} />
        </div>
      )}

      {!loading && noProfile && (domaines.length > 0 || domainesError) && (
        <section className="client-pro-card lawyer-space-section">
          <div className="client-pro-card__head">
            <div className="client-pro-card__icon">
              <Scale size={18} />
            </div>
            <div>
              <h2 className="client-pro-card__title">{t('lawyer_space_request_title')}</h2>
              <p className="client-pro-card__sub">{t('lawyer_space_request_sub')}</p>
            </div>
          </div>
          <div className="client-pro-card__body">
            <form className="client-pro-form" onSubmit={handleCreate}>
              <div className="client-pro-form__grid">
                <label className="lawyer-space-label">
                  <span>{t('lawyer_space_domain')}</span>
                  <select
                    value={createDomain}
                    onChange={(ev) => {
                      setCreateDomain(ev.target.value)
                      setCreateSpec('')
                    }}
                    required
                  >
                    {domaines.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.libelle}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="lawyer-space-label">
                  <span>{t('lawyer_space_specialty')}</span>
                  <select
                    value={createSpec}
                    onChange={(ev) => setCreateSpec(ev.target.value)}
                    required
                  >
                    <option value="">{t('lawyer_space_pick_specialty')}</option>
                    {(selectedDomainRow?.specialites ?? []).map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.libelle}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="lawyer-space-label">
                  <span>{t('lawyer_space_years')}</span>
                  <input
                    type="number"
                    min={0}
                    value={createYears}
                    onChange={(ev) => {
                      const v = parseInt(ev.target.value, 10)
                      setCreateYears(Number.isFinite(v) ? v : 0)
                    }}
                  />
                </label>
                <label className="lawyer-space-label">
                  <span>{t('lawyer_space_city')}</span>
                  <input
                    value={createVille}
                    onChange={(ev) => setCreateVille(ev.target.value)}
                    required
                    maxLength={100}
                  />
                </label>
              </div>
              <label className="lawyer-space-label">
                <span>{t('lawyer_space_description')}</span>
                <textarea
                  value={createDesc}
                  onChange={(ev) => setCreateDesc(ev.target.value)}
                  rows={4}
                  maxLength={2000}
                />
              </label>
              <div className="client-pro-form__grid">
                <label className="lawyer-space-label">
                  <span>{t('lawyer_space_bar_id')}</span>
                  <input
                    value={createCarte}
                    onChange={(ev) => setCreateCarte(ev.target.value)}
                    required
                    maxLength={100}
                  />
                </label>
                <label className="lawyer-space-label">
                  <span>{t('lawyer_space_cin')}</span>
                  <input
                    value={createCin}
                    onChange={(ev) => setCreateCin(ev.target.value)}
                    required
                    maxLength={50}
                  />
                </label>
                <label className="lawyer-space-label lawyer-space-label--span2">
                  <span>{t('lawyer_space_barreau')}</span>
                  <input
                    value={createBarreau}
                    onChange={(ev) => setCreateBarreau(ev.target.value)}
                    required
                    maxLength={100}
                  />
                </label>
              </div>
              {createMsg && <p className="lawyer-space-form-msg lawyer-space-form-msg--err">{createMsg}</p>}
              <button type="submit" className="lawyer-space-btn-primary" disabled={createBusy}>
                {createBusy ? <Loader2 className="forsalaw-spin" size={18} /> : t('lawyer_space_submit_request')}
              </button>
            </form>
          </div>
        </section>
      )}

      {!loading && profile && !isApproved && (
        <>
          <div className={`lawyer-space-status ${isRejected ? 'lawyer-space-status--bad' : ''}`}>
            <div className="lawyer-space-status__row">
              <span className={statusPillClass(profile.verificationStatus)}>
                {profile.verificationStatus}
              </span>
              <button type="button" className="lawyer-space-btn-ghost" onClick={() => reloadProfile()}>
                <RefreshCw size={16} />
                {t('lawyer_space_refresh')}
              </button>
            </div>
            <p className="lawyer-space-status__comment">{profile.verificationComment}</p>
            {isPending && <p className="lawyer-space-status__hint">{t('lawyer_space_pending_hint')}</p>}
            {isRejected && <p className="lawyer-space-status__hint">{t('lawyer_space_rejected_hint')}</p>}
          </div>

          {domaines.length === 0 && !domainesError && (
            <div className="lawyer-space-loading">
              <Loader2 className="forsalaw-spin" size={28} />
            </div>
          )}

          {(domaines.length > 0 || domainesError) && (
          <section className="client-pro-card lawyer-space-section">
            <div className="client-pro-card__head">
              <div className="client-pro-card__icon">
                <Award size={18} />
              </div>
              <div>
                <h2 className="client-pro-card__title">{t('lawyer_space_update_request')}</h2>
                <p className="client-pro-card__sub">{t('lawyer_space_update_request_sub')}</p>
              </div>
            </div>
            <div className="client-pro-card__body">
              <form className="client-pro-form" onSubmit={handleEdit}>
                <p className="lawyer-space-muted">
                  <strong>{t('lawyer_space_domain')}:</strong> {profile.domaineLibelle ?? profile.domaine}
                </p>
                <div className="client-pro-form__grid">
                  <label className="lawyer-space-label">
                    <span>{t('lawyer_space_specialty')}</span>
                    <select
                      value={editSpec}
                      onChange={(ev) => setEditSpec(ev.target.value)}
                      required
                    >
                      {(editDomainRow?.specialites ?? []).map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.libelle}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="lawyer-space-label">
                    <span>{t('lawyer_space_years')}</span>
                    <input
                      type="number"
                      min={0}
                      value={editYears}
                      onChange={(ev) => {
                        const v = parseInt(ev.target.value, 10)
                        setEditYears(Number.isFinite(v) ? v : 0)
                      }}
                    />
                  </label>
                  <label className="lawyer-space-label">
                    <span>{t('lawyer_space_city')}</span>
                    <input
                      value={editVille}
                      onChange={(ev) => setEditVille(ev.target.value)}
                      maxLength={100}
                    />
                  </label>
                </div>
                <label className="lawyer-space-label">
                  <span>{t('lawyer_space_description')}</span>
                  <textarea
                    value={editDesc}
                    onChange={(ev) => setEditDesc(ev.target.value)}
                    rows={4}
                    maxLength={2000}
                  />
                </label>
                <div className="lawyer-space-readonly-block">
                  <p>
                    <strong>{t('lawyer_space_bar_id')}:</strong> {profile.numeroCarteProfessionnelle}
                  </p>
                  <p>
                    <strong>{t('lawyer_space_cin')}:</strong> {profile.cin}
                  </p>
                  <p>
                    <strong>{t('lawyer_space_barreau')}:</strong> {profile.barreau}
                  </p>
                </div>
                {editSaved && <p className="lawyer-space-form-msg">{t('lawyer_space_saved')}</p>}
                {editError && <p className="lawyer-space-form-msg lawyer-space-form-msg--err">{editError}</p>}
                <button type="submit" className="lawyer-space-btn-primary" disabled={editBusy}>
                  {editBusy ? <Loader2 className="forsalaw-spin" size={18} /> : t('lawyer_space_save_changes')}
                </button>
              </form>
            </div>
          </section>
          )}
        </>
      )}

      {!loading && profile && isApproved && (
        <>
          {isApproved && !canUseAvocatEndpoints && (
            <div className="lawyer-space-banner lawyer-space-banner--warn">
              <p>{t('lawyer_space_relogin_hint')}</p>
              <button
                type="button"
                className="lawyer-space-btn-ghost"
                onClick={() => {
                  logout()
                  navigate('/', { replace: true })
                }}
              >
                {t('lawyer_space_relogin_btn')}
              </button>
            </div>
          )}

          <div className="client-pro-kpis lawyer-space-kpis">
            <div className="client-pro-kpi">
              <span className="client-pro-kpi__label">{t('lawyer_space_kpi_rating')}</span>
              <span className="client-pro-kpi__value">
                {profile.noteMoyenne != null ? profile.noteMoyenne.toFixed(1) : '—'}
              </span>
            </div>
            <div className="client-pro-kpi">
              <span className="client-pro-kpi__label">{t('lawyer_space_kpi_dossiers')}</span>
              <span className="client-pro-kpi__value">{profile.totalDossiers ?? 0}</span>
            </div>
          </div>

          <section className="client-pro-card lawyer-space-section">
            <div className="client-pro-card__head">
              <div className="client-pro-card__icon">
                <Award size={18} />
              </div>
              <div>
                <h2 className="client-pro-card__title">{t('lawyer_space_verified_title')}</h2>
                <p className="client-pro-card__sub">{t('lawyer_space_verified_sub')}</p>
              </div>
            </div>
            <div className="client-pro-card__body lawyer-space-verified-grid">
              <div>
                {profile.profilePhotoPublicUrl && !photoBlobUrl && (
                  <div className="lawyer-space-public-photo-wrap">
                    <img src={profile.profilePhotoPublicUrl} alt="" className="lawyer-space-public-photo" />
                  </div>
                )}
                <p className="lawyer-space-identity-line">
                  <strong>{profile.userPrenom} {profile.userNom}</strong>
                  <span className="lawyer-space-muted"> · {profile.userEmail}</span>
                </p>
                <p>
                  {profile.domaineLibelle} · {profile.specialiteLibelle ?? profile.specialite}
                </p>
                <p>
                  {profile.ville} · {profile.anneesExperience} {t('lawyer_space_years_short')}
                </p>
                {profile.description && <p className="lawyer-space-desc">{profile.description}</p>}
              </div>
              <div className="lawyer-space-readonly-block">
                <p>
                  <strong>{t('lawyer_space_bar_id')}:</strong> {profile.numeroCarteProfessionnelle}
                </p>
                <p>
                  <strong>{t('lawyer_space_cin')}:</strong> {profile.cin}
                </p>
                <p>
                  <strong>{t('lawyer_space_barreau')}:</strong> {profile.barreau}
                </p>
              </div>
            </div>
          </section>

          {canUseAvocatEndpoints && (
            <>
              <section className="client-pro-card lawyer-space-section">
                <div className="client-pro-card__head">
                  <div className="client-pro-card__icon">
                    <Award size={18} />
                  </div>
                  <div>
                    <h2 className="client-pro-card__title">Horaires de travail (agenda)</h2>
                    <p className="client-pro-card__sub">Configuration active visible dans votre espace avocat.</p>
                  </div>
                </div>
                <div className="client-pro-card__body">
                  {!agendaSnapshot && <p>Configurer via la page Calendrier.</p>}
                  {agendaSnapshot && (
                    <>
                      <p>Fuseau: {agendaSnapshot.zoneId} · Creneau: {agendaSnapshot.dureeCreneauMinutes} min · Marge: {agendaSnapshot.bufferMinutes} min · {agendaSnapshot.agendaActif ? 'Actif' : 'Inactif'}</p>
                      <p style={{ marginTop: '0.5rem' }}><strong>Plages:</strong></p>
                      {(agendaSnapshot.plages ?? []).map((p) => (
                        <p key={p.id}>Jour {p.dayOfWeek}: {String(p.heureDebut)} - {String(p.heureFin)}</p>
                      ))}
                      {(agendaSnapshot.exceptions ?? []).length > 0 && (
                        <>
                          <p style={{ marginTop: '0.5rem' }}><strong>Indisponibilites:</strong></p>
                          {agendaSnapshot.exceptions.map((x) => (
                            <p key={x.id}>{String(x.dateDebut)} → {String(x.dateFin)} · {x.libelle}</p>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </div>
              </section>

              <section className="client-pro-card lawyer-space-section">
                <div className="client-pro-card__head">
                  <div className="client-pro-card__icon">
                    <Award size={18} />
                  </div>
                  <div>
                    <h2 className="client-pro-card__title">Demandes et rendez-vous</h2>
                    <p className="client-pro-card__sub">Proposez un creneau depuis les demandes en attente et suivez les confirmations clients.</p>
                  </div>
                </div>
                <div className="client-pro-card__body">
                  {appointmentsLoading && <Loader2 className="forsalaw-spin" size={18} />}
                  {!appointmentsLoading && appointments.length === 0 && <p>Aucune demande recue.</p>}
                  {!appointmentsLoading && appointments.map((a) => (
                    <div key={a.idRendezVous} style={{ border: '2px solid var(--black)', padding: '0.75rem', marginBottom: '0.75rem', background: '#0f0f0f' }}>
                      <p><strong>{a.nomClient}</strong> - {a.motifConsultation || 'Demande de rendez-vous'}</p>
                      <p style={{ opacity: 0.8 }}>{a.statutRendezVous} · {a.typeRendezVous} · {fmtDateTime(a.dateHeureDebut)}</p>
                      {a.commentaireAvocat && <p style={{ opacity: 0.8 }}>Commentaire: {a.commentaireAvocat}</p>}
                      {a.statutRendezVous === 'EN_ATTENTE' && (
                        <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: '1fr 1fr 1fr' }}>
                            <input type="datetime-local" value={proposeStart} onChange={(e) => setProposeStart(e.target.value)} />
                            <input type="datetime-local" value={proposeEnd} onChange={(e) => setProposeEnd(e.target.value)} />
                            <select value={proposeType} onChange={(e) => setProposeType(e.target.value)}>
                              <option value="EN_LIGNE">En ligne</option>
                              <option value="CABINET">Cabinet</option>
                              <option value="TELEPHONE">Telephone</option>
                            </select>
                          </div>
                          <input placeholder="Commentaire avocat (optionnel)" value={proposeComment} onChange={(e) => setProposeComment(e.target.value)} />
                          <button
                            type="button"
                            className="lawyer-space-btn-primary"
                            onClick={async () => {
                              try {
                                await rdvApi.lawyerProposeSlot(token, a.idRendezVous, {
                                  dateHeureDebut: proposeStart,
                                  dateHeureFin: proposeEnd,
                                  typeRendezVous: proposeType,
                                  commentaireAvocat: proposeComment || undefined,
                                })
                                setProposeComment('')
                                await reloadAppointments()
                              } catch (e) {
                                window.alert(e?.message || String(e))
                              }
                            }}
                          >
                            Proposer ce creneau
                          </button>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                        {a.statutRendezVous !== 'ANNULE' && (
                          <button
                            type="button"
                            className="lawyer-space-btn-danger"
                            onClick={async () => {
                              const raison = window.prompt('Raison annulation ?') || ''
                              try {
                                await rdvApi.lawyerCancelAppointment(token, a.idRendezVous, raison)
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
                            className="lawyer-space-btn-secondary"
                            onClick={async () => {
                              try {
                                const x = await rdvApi.lawyerMeetingAccess(token, a.idRendezVous)
                                const url = x.joinPath?.startsWith('http') ? x.joinPath : `${window.location.origin}${x.joinPath}`
                                window.open(url, '_blank', 'noopener,noreferrer')
                              } catch (e) {
                                window.alert(e?.message || String(e))
                              }
                            }}
                          >
                            Ouvrir la salle
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="client-pro-card lawyer-space-section">
                <div className="client-pro-card__head">
                  <div className="client-pro-card__icon">
                    <Camera size={18} />
                  </div>
                  <div>
                    <h2 className="client-pro-card__title">{t('lawyer_space_photo_section')}</h2>
                    <p className="client-pro-card__sub">{t('lawyer_space_photo_hint')}</p>
                  </div>
                </div>
                <div className="client-pro-card__body">
                  <div className="client-pro-photo">
                    <div className="client-pro-photo__preview">
                      {photoBlobUrl ? (
                        <img src={photoBlobUrl} alt="" />
                      ) : (
                        <div className="client-pro-photo__placeholder">—</div>
                      )}
                      {photoBusy && (
                        <div className="lawyer-space-photo-overlay">
                          <Loader2 className="forsalaw-spin" size={22} />
                        </div>
                      )}
                    </div>
                    <div className="client-pro-photo__actions">
                      <label className="lawyer-space-btn-secondary">
                        {t('lawyer_space_photo_choose')}
                        <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" hidden onChange={handlePhoto} />
                      </label>
                      {photoMsg && <p className="lawyer-space-form-msg">{photoMsg}</p>}
                    </div>
                  </div>
                </div>
              </section>

              <section className="client-pro-card lawyer-space-section">
                <div className="client-pro-card__head">
                  <div className="client-pro-card__icon">
                    <Key size={18} />
                  </div>
                  <div>
                    <h2 className="client-pro-card__title">{t('lawyer_space_password_section')}</h2>
                    <p className="client-pro-card__sub">{t('lawyer_space_password_sub')}</p>
                  </div>
                </div>
                <div className="client-pro-card__body">
                  <form className="client-pro-form" onSubmit={handlePassword}>
                    <div className="client-pro-form__grid">
                      <label className="lawyer-space-label">
                        <span>{t('lawyer_space_password_current')}</span>
                        <input
                          type="password"
                          autoComplete="current-password"
                          value={pwdCurrent}
                          onChange={(ev) => setPwdCurrent(ev.target.value)}
                        />
                      </label>
                      <label className="lawyer-space-label">
                        <span>{t('lawyer_space_password_new')}</span>
                        <input
                          type="password"
                          autoComplete="new-password"
                          value={pwdNew}
                          onChange={(ev) => setPwdNew(ev.target.value)}
                        />
                      </label>
                    </div>
                    {pwdMsg && <p className="lawyer-space-form-msg">{pwdMsg}</p>}
                    <button type="submit" className="lawyer-space-btn-primary" disabled={pwdBusy}>
                      {pwdBusy ? <Loader2 className="forsalaw-spin" size={18} /> : t('lawyer_space_password_save')}
                    </button>
                  </form>
                </div>
              </section>

              <section className="client-pro-card client-pro-card--danger lawyer-space-section">
                <div className="client-pro-card__head">
                  <div className="client-pro-card__icon client-pro-card__icon--danger">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <h2 className="client-pro-card__title client-pro-card__title--danger">{t('lawyer_space_deactivate_section')}</h2>
                    <p className="client-pro-card__sub">{t('lawyer_space_deactivate_hint')}</p>
                  </div>
                </div>
                <div className="client-pro-card__body">
                  <button
                    type="button"
                    className="lawyer-space-btn-danger"
                    disabled={deactivateBusy}
                    onClick={handleDeactivate}
                  >
                    {deactivateBusy ? <Loader2 className="forsalaw-spin" size={18} /> : t('lawyer_space_deactivate')}
                  </button>
                </div>
              </section>
            </>
          )}
        </>
      )}
    </motion.main>
  )
}
