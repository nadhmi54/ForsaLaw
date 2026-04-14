import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserCog,
  BadgeCheck,
  ClipboardList,
  MessagesSquare,
  ShieldAlert,
  Activity,
  Search,
  LayoutGrid,
  Loader2,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  FileText,
  Calendar,
  Lock,
  Smartphone,
  Eye,
  Trash2,
  Send
} from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import PageHeader from '../components/PageHeader'
import * as adminApi from '../api/admin.js'
import '../styles/PlatformSpaces.css'

const MODULES = [
  { key: 'overview',     label: 'Vue d\'ensemble',    icon: LayoutGrid },
  { key: 'avocats',      label: 'Avocats',             icon: BadgeCheck },
  { key: 'users',        label: 'Utilisateurs',        icon: UserCog },
  { key: 'reclamations', label: 'Réclamations',        icon: ClipboardList },
  { key: 'affaires',     label: 'Affaires Juridiques', icon: FileText },
  { key: 'rendezvous',   label: 'Rendez-vous',         icon: Calendar },
  { key: 'documents',    label: 'Documents (Vault)',   icon: Lock },
  { key: 'messenger',    label: 'Messagerie Globale',  icon: MessagesSquare },
  { key: 'whatsapp',     label: 'Système WhatsApp',    icon: Smartphone },
  { key: 'audit',        label: 'Journal Sécurité',    icon: ShieldAlert },
]

const STATUT_RECLAMATION_OPTIONS = ['OUVERTE', 'EN_COURS', 'RESOLUE', 'FERMEE']

function fmtDate(v) {
  if (!v) return '—'
  try { return new Date(v).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return String(v) }
}

export default function AdminSpacePage() {
  const { token, user, isAuthenticated } = useAuth()
  const [activeModule, setActiveModule] = useState('overview')
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState({})
  const [err, setErr] = useState(null)

  // System states
  const [avocats, setAvocats] = useState([])
  const [avocatsPending, setAvocatsPending] = useState([])
  const [avocatsLoading, setAvocatsLoading] = useState(false)

  const [users, setUsers] = useState([])
  const [usersTotal, setUsersTotal] = useState(0)
  const [usersLoading, setUsersLoading] = useState(false)

  const [reclamations, setReclamations] = useState([])
  const [reclamationsTotal, setReclamationsTotal] = useState(0)
  const [reclamationsLoading, setReclamationsLoading] = useState(false)

  const [affaires, setAffaires] = useState([])
  const [affairesTotal, setAffairesTotal] = useState(0)
  const [affairesLoading, setAffairesLoading] = useState(false)

  const [rdvs, setRdvs] = useState([])
  const [rdvsTotal, setRdvsTotal] = useState(0)
  const [rdvsLoading, setRdvsLoading] = useState(false)

  const [docs, setDocs] = useState([])
  const [docsTotal, setDocsTotal] = useState(0)
  const [docsLoading, setDocsLoading] = useState(false)

  const [conversations, setConversations] = useState([])
  const [conversationsTotal, setConversationsTotal] = useState(0)
  const [conversationsLoading, setConversationsLoading] = useState(false)

  const [auditLogs, setAuditLogs] = useState([])
  const [auditTotal, setAuditTotal] = useState(0)
  const [auditLoading, setAuditLoading] = useState(false)

  const [waStatus, setWaStatus] = useState(null)
  const [waQr, setWaQr] = useState(null)
  const [waLoading, setWaLoading] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [testMsg, setTestMsg] = useState('')

  // Selected sub-items
  const [selectedAuditLog, setSelectedAuditLog] = useState(null)

  // ─── Data Loaders ─────────────────────────────────────────────────────────

  const loadAvocats = useCallback(async () => {
    if (!token) return
    setAvocatsLoading(true)
    setErr(null)
    try {
      const page = await adminApi.listAvocatsAdmin(token, { size: 50 })
      const list = page?.content ?? []
      setAvocats(list)
      setAvocatsPending(list.filter(a => !a.verifie && a.actif))
    } catch (e) { setErr(e?.message) } finally { setAvocatsLoading(false) }
  }, [token])

  const loadUsers = useCallback(async (search = '') => {
    if (!token) return
    setUsersLoading(true)
    try {
      const page = await adminApi.listUsers(token, { size: 50, search: search || undefined })
      setUsers(page?.content ?? [])
      setUsersTotal(page?.totalElements ?? 0)
    } catch (e) { setErr(e?.message) } finally { setUsersLoading(false) }
  }, [token])

  const loadReclamations = useCallback(async () => {
    if (!token) return
    setReclamationsLoading(true)
    try {
      const page = await adminApi.listAllReclamations(token, { size: 50 })
      setReclamations(page?.content ?? [])
      setReclamationsTotal(page?.totalElements ?? 0)
    } catch (e) { setErr(e?.message) } finally { setReclamationsLoading(false) }
  }, [token])

  const loadAffaires = useCallback(async () => {
    if (!token) return
    setAffairesLoading(true)
    try {
      const page = await adminApi.listAllAffaires(token, { size: 50 })
      setAffaires(page?.content ?? [])
      setAffairesTotal(page?.totalElements ?? 0)
    } catch (e) { setErr(e?.message) } finally { setAffairesLoading(false) }
  }, [token])

  const loadRdvs = useCallback(async () => {
    if (!token) return
    setRdvsLoading(true)
    try {
      const page = await adminApi.listAllRendezVous(token, { size: 50 })
      setRdvs(page?.content ?? [])
      setRdvsTotal(page?.totalElements ?? 0)
    } catch (e) { setErr(e?.message) } finally { setRdvsLoading(false) }
  }, [token])

  const loadDocs = useCallback(async () => {
    if (!token) return
    setDocsLoading(true)
    try {
      const page = await adminApi.listAllSystemDocuments(token, { size: 50 })
      setDocs(page?.content ?? [])
      setDocsTotal(page?.totalElements ?? 0)
    } catch (e) { setErr(e?.message) } finally { setDocsLoading(false) }
  }, [token])

  const loadConversations = useCallback(async () => {
    if (!token) return
    setConversationsLoading(true)
    try {
      const page = await adminApi.listAllConversations(token, { size: 50 })
      setConversations(page?.content ?? [])
      setConversationsTotal(page?.totalElements ?? 0)
    } catch (e) { setErr(e?.message) } finally { setConversationsLoading(false) }
  }, [token])

  const loadAudit = useCallback(async () => {
    if (!token) return
    setAuditLoading(true)
    try {
      const page = await adminApi.listAuditLogs(token, { size: 50 })
      setAuditLogs(page?.content ?? [])
      setAuditTotal(page?.totalElements ?? 0)
    } catch (e) { setErr(e?.message) } finally { setAuditLoading(false) }
  }, [token])

  const loadWhatsApp = useCallback(async () => {
    if (!token) return
    setWaLoading(true)
    try {
      const stat = await adminApi.getWhatsAppStatus(token)
      setWaStatus(stat)
    } catch (e) { setErr(e?.message) } finally { setWaLoading(false) }
  }, [token])

  // ─── Module Switch Triggers ────────────────────────────────────────────────

  useEffect(() => {
    if (!token) return
    if (['overview', 'avocats'].includes(activeModule)) loadAvocats()
    if (['overview', 'users'].includes(activeModule)) loadUsers()
    if (['overview', 'reclamations'].includes(activeModule)) loadReclamations()
    if (['overview', 'affaires'].includes(activeModule)) loadAffaires()
    if (['overview', 'audit'].includes(activeModule)) loadAudit()
    if (activeModule === 'rendezvous') loadRdvs()
    if (activeModule === 'documents') loadDocs()
    if (activeModule === 'messenger') loadConversations()
    if (activeModule === 'whatsapp') loadWhatsApp()
  }, [activeModule, token])


  if (!isAuthenticated || !token) return <Navigate to="/" replace />
  if (user?.roleUser !== 'admin') return <Navigate to="/" replace />

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleVerifyAvocat = async (avocatId, status) => {
    setBusy(b => ({ ...b, [avocatId]: true })); setErr(null)
    try { await adminApi.updateAvocatVerification(token, avocatId, { verificationStatus: status }); await loadAvocats() }
    catch (e) { setErr(e?.message) } finally { setBusy(b => ({ ...b, [avocatId]: false })) }
  }

  const handleToggleUser = async (userId, isActive) => {
    setBusy(b => ({ ...b, [userId]: true })); setErr(null)
    try { 
      isActive ? await adminApi.deactivateUser(token, userId) : await adminApi.reactivateUser(token, userId)
      await loadUsers(query) 
    }
    catch (e) { setErr(e?.message) } finally { setBusy(b => ({ ...b, [userId]: false })) }
  }

  const handleUpdateReclamation = async (id, statut) => {
    setBusy(b => ({ ...b, [id]: true })); setErr(null)
    try { await adminApi.updateReclamationStatus(token, id, statut); await loadReclamations() }
    catch (e) { setErr(e?.message) } finally { setBusy(b => ({ ...b, [id]: false })) }
  }

  const handleTriggerReminders = async () => {
    if (!window.confirm('Forcer l\'envoi global des rappels WhatsApp ?')) return
    setBusy(b => ({ ...b, trigger: true })); setErr(null)
    try { await adminApi.triggerRdvReminders(token); alert('Rappels déclenchés avec succès.') }
    catch (e) { setErr(e?.message) } finally { setBusy(b => ({ ...b, trigger: false })) }
  }

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('La suppression du coffre-fort va détruire physiquement le fichier. Continuer ?')) return
    setBusy(b => ({ ...b, [id]: true })); setErr(null)
    try { await adminApi.deleteSystemDocument(token, id); await loadDocs() }
    catch (e) { setErr(e?.message) } finally { setBusy(b => ({ ...b, [id]: false })) }
  }

  const handleCloseConversation = async (id) => {
    if (!window.confirm('Clôturer cette ligne de messagerie d\'urgence ?')) return
    setBusy(b => ({ ...b, [id]: true })); setErr(null)
    try { await adminApi.closeConversationGlobal(token, id); await loadConversations() }
    catch (e) { setErr(e?.message) } finally { setBusy(b => ({ ...b, [id]: false })) }
  }

  const handleGenerateWaQr = async () => {
    setWaLoading(true); setErr(null)
    try { const res = await adminApi.getWhatsAppQr(token); setWaQr(res.qrCode) } 
    catch (e) { setErr(e?.message) } finally { setWaLoading(false) }
  }

  const handleSendWaTest = async (e) => {
    e.preventDefault()
    if (!testPhone) return
    setBusy(b => ({ ...b, testWa: true })); setErr(null)
    try { await adminApi.sendWhatsAppTest(token, testPhone, testMsg); alert('Test expédié.') } 
    catch (e) { setErr(e?.message) } finally { setBusy(b => ({ ...b, testWa: false })) }
  }

  // ─── RENDER HELPERS ────────────────────────────────────────────────────────
  const Spinner = () => <Loader2 className="forsalaw-spin" size={18} style={{ color: 'var(--gold)' }} />
  const q = query.trim().toLowerCase()

  return (
    <motion.main className="platform-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <PageHeader
        className="admin-console-header"
        tag="Chambre de Contrôle · OMNISCIENCE"
        tagClassName="platform-eyebrow"
        title="Console d'Administration Unifiée"
        titleClassName="platform-title"
      >
        <p className="platform-subtitle">
          Supervision absolue des utilisateurs, du coffre-fort légal, du réseau messagerie et du bridge WhatsApp.
        </p>
      </PageHeader>

      {err && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(180,30,30,0.15)', border: '2px solid #b42020', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#ff8a80' }}>
          <AlertTriangle size={14} /> {err}
        </div>
      )}

      <div className="dossier-layout">
        {/* NAV: HORIZONTAL COMMAND ARRAY */}
        <div className="command-array-grid">
          {MODULES.map((m) => {
            const Icon = m.icon
            const active = m.key === activeModule
            return (
              <button
                key={m.key}
                className={`command-button${active ? ' active' : ''}`}
                onClick={() => { setActiveModule(m.key); setQuery('') }}
                type="button"
              >
                <Icon size={18} />
                <span>{m.label}</span>
                {m.key === 'avocats' && avocatsPending.length > 0 && (
                  <span className="status-badge-admin alert">{avocatsPending.length} PENDING</span>
                )}
              </button>
            )
          })}
        </div>

        {/* MAIN PANEL */}
        <section className="dossier-main-realm" style={{ marginTop: '2rem' }}>
          {['users', 'avocats', 'reclamations', 'affaires', 'documents'].includes(activeModule) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
              <label className="admin-search-brutal" style={{ display: 'flex', alignItems: 'center', border: '3px solid var(--black)', padding: '0.5rem 1rem', background: '#0a0a0a', width: '300px' }}>
                <Search size={14} style={{ color: 'var(--gold)' }} />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    if (activeModule === 'users') loadUsers(e.target.value)
                  }}
                  placeholder="ID / NOM / EMAIL..."
                  style={{ background: 'transparent', border: 'none', color: 'var(--white)', outline: 'none', marginLeft: '1rem', width: '100%', fontFamily: 'monospace', fontSize: '0.7rem' }}
                />
              </label>
            </div>
          )}

          {/* ── OVERVIEW (CLEAN LEDGER) ── */}
          {activeModule === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* PRIMARY KPI ROW */}
              <div className="command-kpi-row" style={{ marginBottom: 0 }}>
                {[
                  { label: 'Utilisateurs du Système', value: usersLoading ? '…' : usersTotal, delta: 'Total OMEGA inscrits' },
                  { label: 'Avocats Pendents', value: avocatsLoading ? '…' : avocatsPending.length, delta: 'Approbation manuelle' },
                  { label: 'Pétitions Soumises', value: reclamationsLoading ? '…' : reclamationsTotal, delta: 'Réclamations non traitées' },
                  { label: 'Dossiers Légal', value: affairesLoading ? '…' : affairesTotal, delta: 'Base de données affaires' },
                ].map((s, i) => (
                  <motion.div key={s.label} className="command-kpi-block" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="command-kpi-lbl">{s.label}</div>
                    <div className="command-kpi-val" style={{ color: s.label.includes('Pendents') && s.value > 0 ? '#ff8a80' : '' }}>{s.value}</div>
                    <div className="ledger-row-mono" style={{ marginTop: '0.5rem', opacity: 0.6 }}>{s.delta}</div>
                  </motion.div>
                ))}
              </div>

              {/* DUAL LEDGER ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                <div className="ledger-feed" style={{ marginTop: 0 }}>
                  <div className="ledger-feed-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>LIVE SECURITY INTERCEPT</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>AUDIT LOGS</span>
                  </div>
                  <div style={{ padding: '1.5rem', background: '#0a0a0a', height: '300px', overflowY: 'hidden', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {auditLoading && <Spinner />}
                    {!auditLoading && auditLogs.slice(0, 10).map((log, i) => (
                      <div key={log.id} style={{ display: 'flex', gap: '1rem', borderBottom: '1px dotted #222', paddingBottom: '0.75rem', fontSize: '0.65rem', fontFamily: 'monospace' }}>
                        <span style={{ color: 'var(--gold)', minWidth: '120px' }}>[{fmtDate(log.createdAt)}]</span>
                        <span style={{ color: log.actionName.includes('DELETE') ? '#ff6b6b' : '#7ca4ff', flex: 1 }}>{log.actionName}</span>
                        <span style={{ opacity: 0.4 }}>{log.userEmail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ledger-feed" style={{ marginTop: 0 }}>
                  <div className="ledger-feed-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>JURIDICAL REGISTER</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>AFFAIRES</span>
                  </div>
                  <div style={{ padding: '1.5rem', background: '#0a0a0a', height: '300px', overflowY: 'hidden' }}>
                    {affairesLoading && <Spinner />}
                    {!affairesLoading && affaires.slice(0, 5).map((a, i) => (
                      <div key={a.idAffaire} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderBottom: '2px solid var(--black)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span className="ledger-row-mono" style={{ color: 'var(--gold)' }}>{a.idAffaire}</span>
                          <span className="status-badge-admin">{a.statut || 'ORDINAIRE'}</span>
                        </div>
                        <div className="ledger-row-subject" style={{ fontSize: '0.7rem' }}>{a.titre}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── AVOCATS ── */}
          {activeModule === 'avocats' && (
            <div className="ledger-feed">
              <div className="ledger-feed-header">PENDING AVOCATS VERIFICATION — {avocatsPending.length} ENTRIES</div>
              {avocatsLoading && <div style={{ padding: '2rem' }}><Spinner /></div>}
              {!avocatsLoading && avocatsPending.length === 0 && (
                <div style={{ padding: '2rem', fontFamily: 'monospace', color: 'var(--gold)', letterSpacing: '0.1em' }}>FILE D'ATTENTE VIDE</div>
              )}
              {!avocatsLoading && avocatsPending.map(a => (
                <div key={a.id} className="ledger-row">
                  <div className="ledger-row-mono" style={{ width: '80px' }}>{a.id}</div>
                  <div>
                    <div className="ledger-row-subject">{a.nomComplet || `${a.prenom || ''} ${a.nom || ''}`.trim() || '—'}</div>
                    <div className="ledger-row-mono" style={{ marginTop: '4px' }}>{a.ville} · {a.specialite}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="status-badge-admin alert">{a.verificationStatus || 'EN_ATTENTE'}</span>
                    <button className="tbl-btn approve" disabled={busy[a.id]} onClick={() => handleVerifyAvocat(a.id, 'APPROVED')}>APP. [Y]</button>
                    <button className="tbl-btn reject" disabled={busy[a.id]} onClick={() => handleVerifyAvocat(a.id, 'REJECTED')}>REJ. [N]</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── USERS ── */}
          {activeModule === 'users' && (
            <div className="ledger-feed">
              <div className="ledger-feed-header">MATRICE DES UTILISATEURS — {users.length} LOADED</div>
              {usersLoading && <div style={{ padding: '2rem' }}><Spinner /></div>}
              {!usersLoading && users.map(u => (
                <div key={u.id} className="ledger-row">
                  <div className="ledger-row-mono" style={{ width: '80px' }}>{u.id}</div>
                  <div>
                    <div className="ledger-row-subject">{`${u.prenom || ''} ${u.nom || ''}`.trim() || '—'}</div>
                    <div className="ledger-row-mono" style={{ marginTop: '4px' }}>{u.email}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span className={`role-badge ${u.roleUser}`}>{(u.roleUser || '').toUpperCase()}</span>
                    <span className={`status-badge-admin ${u.actif ? 'open' : 'alert'}`}>{u.actif ? 'ACTIF' : 'SUSPENDU'}</span>
                    <button className={`tbl-btn ${u.actif ? 'reject' : 'approve'}`} disabled={busy[u.id]} onClick={() => handleToggleUser(u.id, u.actif)}>
                      {busy[u.id] ? <Spinner /> : u.actif ? 'SUSPENDRE' : 'REACTIVER'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── AFFAIRES ── */}
          {activeModule === 'affaires' && (
            <div className="ledger-feed">
              <div className="ledger-feed-header">BASE DE DONNÉES AFFAIRES — {affairesTotal} TOTAL</div>
              {affairesLoading && <div style={{ padding: '2rem' }}><Spinner /></div>}
              {!affairesLoading && affaires.map(a => (
                <div key={a.idAffaire} className="ledger-row">
                  <div className="ledger-row-mono" style={{ width: '80px' }}>{a.idAffaire}</div>
                  <div>
                    <div className="ledger-row-subject">{a.titre || 'Dossier Systematique'}</div>
                    <div className="ledger-row-mono" style={{ marginTop: '4px' }}>CRÉATION: {fmtDate(a.dateCreation)} · MAJ: {fmtDate(a.dateMiseAJour)}</div>
                  </div>
                  <div>
                    <span className="status-badge-admin open">{a.statut || 'INSTRUCTION'}</span>
                  </div>
                </div>
              ))}
              {!affairesLoading && affaires.length === 0 && (
                <div style={{ padding: '2rem', fontFamily: 'monospace', color: 'var(--gold)', letterSpacing: '0.1em' }}>AUCUNE AFFAIRE ENREGISTRÉE</div>
              )}
            </div>
          )}

          {/* ── RENDEZ-VOUS ── */}
          {activeModule === 'rendezvous' && (
            <div className="ledger-feed">
              <div className="ledger-feed-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>MATRICE RENDEZ-VOUS — {rdvsTotal} TOTAL</span>
                <button className="tbl-btn approve" disabled={busy['trigger']} onClick={handleTriggerReminders} style={{ padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {busy['trigger'] ? <Spinner /> : <Activity size={12} />} DAEMON RAPPELS
                </button>
              </div>
              {rdvsLoading && <div style={{ padding: '2rem' }}><Spinner /></div>}
              {!rdvsLoading && rdvs.map(r => (
                <div key={r.idRendezVous} className="ledger-row">
                  <div className="ledger-row-mono" style={{ width: '80px' }}>{r.idRendezVous}</div>
                  <div>
                    <div className="ledger-row-subject">{r.typeRendezVous}</div>
                    <div className="ledger-row-mono" style={{ marginTop: '4px' }}>DÉBUT: {fmtDate(r.dateHeureDebut)} · FIN: {fmtDate(r.dateHeureFin)}</div>
                  </div>
                  <div>
                    <span className={`status-badge-admin ${r.statutRendezVous === 'CONFIRME' ? 'open' : 'alert'}`}>{r.statutRendezVous}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── DOCUMENTS (VAULT) ── */}
          {activeModule === 'documents' && (
            <div className="ledger-feed">
              <div className="ledger-feed-header">COFFRE-FORT VAULT — {docsTotal} SCELLÉS</div>
              {docsLoading && <div style={{ padding: '2rem' }}><Spinner /></div>}
              {!docsLoading && docs.map(d => (
                <div key={d.id} className="ledger-row">
                  <div className="ledger-row-mono" style={{ width: '80px' }}>{(d.id || '').split('-')[1] || d.id}</div>
                  <div>
                    <div className="ledger-row-subject">{d.nomDeposeur || d.deposeurId}</div>
                    <div className="ledger-row-mono" style={{ marginTop: '0.4rem', color: 'var(--gold)' }}>SHA-256: {d.hashSha256}</div>
                  </div>
                  <div>
                    <span className="status-badge-admin" style={{ marginRight: '1rem' }}>{d.typeContenu}</span>
                    <button className="tbl-btn reject" disabled={busy[d.id]} onClick={() => handleDeleteDocument(d.id)}>
                      {busy[d.id] ? <Spinner /> : <Trash2 size={12} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── MESSENGER ── */}
          {activeModule === 'messenger' && (
            <div className="ledger-feed">
              <div className="ledger-feed-header">RÉSEAU MESSAGERIE — {conversationsTotal} ACTIVES</div>
              {conversationsLoading && <div style={{ padding: '2rem' }}><Spinner /></div>}
              {!conversationsLoading && conversations.map(c => (
                <div key={c.id} className="ledger-row">
                  <div className="ledger-row-mono" style={{ width: '80px' }}>{c.id}</div>
                  <div>
                    <div className="ledger-row-subject">AVOCAT: {c.avocatPrenom} {c.avocatNom}</div>
                    <div className="ledger-row-mono" style={{ marginTop: '0.4rem' }}>CLIENT: {c.clientPrenom} {c.clientNom} · MAJ: {fmtDate(c.updatedAt)}</div>
                  </div>
                  <div>
                    {c.status === 'CLOSED' ? <span className="status-badge-admin alert">CLÔTURÉE</span> : (
                      <button className="tbl-btn reject" disabled={busy[c.id]} onClick={() => handleCloseConversation(c.id)}>
                        {busy[c.id] ? <Spinner /> : "VERROUILLER LIGNE"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── WHATSAPP ── */}
          {activeModule === 'whatsapp' && (
            <div className="admin-module-pane">
              <div className="admin-stats-row" style={{ marginBottom: '2rem' }}>
                <motion.div className="admin-stat-card" style={{ border: waStatus?.connected ? '2px solid #558b2f' : '2px solid #b71c1c' }}>
                  <span className="admin-stat-label">Statut du Bridge</span>
                  <span className={`admin-stat-value ${waStatus?.connected ? 'gold' : 'alert'}`}>
                    {waLoading ? 'SONDAGE...' : (waStatus?.connected ? 'EN LIGNE' : 'HORS LIGNE')}
                  </span>
                  <span className="admin-stat-delta">{waStatus?.message || 'Etat du réseau local'}</span>
                </motion.div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                  {!waStatus?.connected && (
                     <button className="brutal-btn" onClick={handleGenerateWaQr} disabled={waLoading}>
                       {waLoading ? <Spinner /> : 'Générer un QR Code de session'}
                     </button>
                  )}
                  {waQr && (
                    <div style={{ padding: '1rem', background: '#fff', alignSelf: 'flex-start' }}>
                      <img src={waQr} alt="WhatsApp QR Code" style={{ width: 200, height: 200 }} />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="admin-panel" style={{ padding: '2rem' }}>
                <div className="platform-section-header">
                  <span className="platform-section-title">Essai de Notification WhatsApp</span>
                </div>
                <form onSubmit={handleSendWaTest} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <input className="sanctum-input" style={{ width: '200px' }} placeholder="+216XXYYYZZZ" value={testPhone} onChange={e => setTestPhone(e.target.value)} required />
                  <input className="sanctum-input" style={{ flex: 1 }} placeholder="Message de test" value={testMsg} onChange={e => setTestMsg(e.target.value)} />
                  <button className="new-case-btn" type="submit" disabled={busy['testWa'] || !testPhone}>
                     {busy['testWa'] ? <Spinner /> : <Send size={16} style={{ display: 'inline' }} />} 
                     Faire Sonner WhatsApp
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── AUDIT ── */}
          {activeModule === 'audit' && (
            <div className="ledger-feed">
              <div className="ledger-feed-header">JOURNAL SÉCURITÉ AUDIT — {auditTotal} LOGS</div>
              <div style={{ display: 'flex' }}>
                <div style={{ width: '30%', borderRight: '4px solid var(--black)', overflowY: 'auto', maxHeight: '60vh', background: 'var(--charcoal)' }}>
                  {auditLoading && <div style={{ padding: '2rem' }}><Spinner /></div>}
                  {!auditLoading && auditLogs.map(log => (
                    <div key={log.id} onClick={() => setSelectedAuditLog(log)} style={{ padding: '1rem', borderBottom: '2px solid var(--black)', cursor: 'pointer', background: selectedAuditLog?.id === log.id ? 'var(--black)' : 'transparent', borderLeft: selectedAuditLog?.id === log.id ? '4px solid var(--gold)' : '4px solid transparent' }}>
                      <div className="ledger-row-subject" style={{ fontSize: '0.7rem' }}>{log.actionName}</div>
                      <div className="ledger-row-mono" style={{ marginTop: '0.2rem' }}>{fmtDate(log.createdAt)}</div>
                    </div>
                  ))}
                </div>
                {selectedAuditLog ? (
                  <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                    <div className="ledger-feed-header" style={{ marginBottom: '1.5rem', background: 'transparent', padding: 0 }}>DÉTAILS D'AUDIT [{selectedAuditLog.id}]</div>
                    <div className="ledger-row-mono" style={{ marginBottom: '1rem' }}>
                      <div style={{ marginBottom: '0.5rem' }}>UTILISATEUR: {selectedAuditLog.userEmail} ({selectedAuditLog.userId})</div>
                      <div style={{ marginBottom: '0.5rem' }}>IP SOURCE: {selectedAuditLog.ipAddress}</div>
                      <div style={{ marginBottom: '0.5rem' }}>RÔLE OBSERVE: {selectedAuditLog.userRole}</div>
                    </div>
                    <div style={{ flex: 1, background: '#050505', border: '2px solid var(--black)', padding: '1.5rem', fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', whiteSpace: 'pre-wrap' }}>
                      {selectedAuditLog.details}
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>SÉLECTIONNER UN LOG</div>
                )}
              </div>
            </div>
          )}
          
        </section>
      </div>
    </motion.main>
  )
}
