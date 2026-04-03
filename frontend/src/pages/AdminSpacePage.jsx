import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserCog, BadgeCheck, ClipboardList, MessagesSquare, ShieldAlert, Activity, Search, LayoutGrid } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import '../styles/PlatformSpaces.css'

// ─── Mock data ─────────────────────────────────────────────
const MOCK_STATS = [
  { label: 'Utilisateurs', value: '1 284', delta: '+12 ce mois', cls: '' },
  { label: 'Avocats en attente', value: '7', delta: 'Approbation requise', cls: 'alert' },
  { label: 'Dossiers actifs', value: '342', delta: '28 mis à jour aujourd\'hui', cls: 'gold' },
  { label: 'Sujets forum', value: '89', delta: '4 signalés', cls: '' },
]

const MOCK_PENDING_LAWYERS = [
  { id: 'AV-00041', name: 'Karim Ouertani', barreau: 'Tunis', date: '2026-03-28', docs: 3 },
  { id: 'AV-00042', name: 'Sana Ben Amor', barreau: 'Sfax', date: '2026-03-29', docs: 2 },
  { id: 'AV-00043', name: 'Farès Chaabane', barreau: 'Gafsa', date: '2026-03-30', docs: 4 },
]

const MOCK_USERS = [
  { id: 'USR-0881', name: 'Ahmed Dridi', email: 'a.dridi@mail.com', role: 'client' },
  { id: 'USR-0882', name: 'Me. Youssef Mansour', email: 'y.mansour@barreau.tn', role: 'avocat' },
  { id: 'USR-0883', name: 'Rania Jouini', email: 'r.jouini@mail.com', role: 'client' },
  { id: 'USR-0001', name: 'Administrateur', email: 'admin@forsalaw.tn', role: 'admin' },
]

const MOCK_AUDIT = [
  { method: 'PUT', endpoint: '/api/admin/avocats/40/verify', actor: 'admin@forsalaw.tn', time: 'Il y a 5 min' },
  { method: 'POST', endpoint: '/api/reclamations', actor: 'a.dridi@mail.com', time: 'Il y a 12 min' },
  { method: 'GET', endpoint: '/api/admin/users?page=2', actor: 'admin@forsalaw.tn', time: 'Il y a 18 min' },
  { method: 'DELETE', endpoint: '/api/forum/posts/77', actor: 'admin@forsalaw.tn', time: 'Il y a 31 min' },
  { method: 'PUT', endpoint: '/api/users/me', actor: 'r.jouini@mail.com', time: 'Il y a 45 min' },
]

const MODULES = [
  { key: 'overview', label: 'Vue d’ensemble', icon: LayoutGrid },
  { key: 'avocats', label: 'Avocats', icon: BadgeCheck },
  { key: 'users', label: 'Utilisateurs', icon: UserCog },
  { key: 'reclamations', label: 'Réclamations', icon: ClipboardList },
  { key: 'messenger', label: 'Messagerie', icon: MessagesSquare },
  { key: 'security', label: 'Sécurité', icon: ShieldAlert },
  { key: 'audit', label: 'Audit', icon: Activity },
]

export default function AdminSpacePage() {
  const [pendingList, setPendingList] = useState(MOCK_PENDING_LAWYERS)
  const [activeModule, setActiveModule] = useState('overview')
  const [query, setQuery] = useState('')

  const handleApprove = (id) => setPendingList(prev => prev.filter(l => l.id !== id))
  const handleReject  = (id) => setPendingList(prev => prev.filter(l => l.id !== id))

  const filteredUsers = MOCK_USERS.filter((u) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      u.id.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    )
  })

  const filteredPendingLawyers = pendingList.filter((l) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      l.id.toLowerCase().includes(q) ||
      l.name.toLowerCase().includes(q) ||
      l.barreau.toLowerCase().includes(q) ||
      l.date.toLowerCase().includes(q)
    )
  })

  return (
    <motion.main
      className="platform-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <PageHeader
        className="admin-console-header"
        tag="Chambre de Contrôle · Accès Restreint"
        tagClassName="platform-eyebrow"
        title="Console d'Administration"
        titleClassName="platform-title"
      >
        <p className="platform-subtitle">
          Supervision des utilisateurs, vérification des avocats et traçabilité des actions sensibles du système.
        </p>
      </PageHeader>

      <div className="admin-console">
        {/* Left nav */}
        <aside className="admin-console-nav">
          <div className="platform-section-header">
            <span className="platform-section-title">Modules</span>
            <span className="platform-section-badge">ADMIN</span>
          </div>
          <div className="admin-nav-list">
            {MODULES.map((m) => {
              const Icon = m.icon
              const active = m.key === activeModule
              return (
                <button
                  key={m.key}
                  className={`admin-nav-item${active ? ' active' : ''}`}
                  onClick={() => {
                    setActiveModule(m.key)
                    setQuery('')
                  }}
                  type="button"
                >
                  <Icon size={16} />
                  <span>{m.label}</span>
                  {m.key === 'avocats' && pendingList.length > 0 ? (
                    <span className="admin-nav-pill">{pendingList.length}</span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </aside>

        {/* Main panel */}
        <section className="admin-console-main">
          <div className="admin-console-toolbar">
            <div className="admin-console-toolbar-title">
              {MODULES.find((m) => m.key === activeModule)?.label ?? 'Console'}
            </div>
            {(activeModule === 'users' || activeModule === 'avocats' || activeModule === 'audit') && (
              <label className="admin-search">
                <Search size={14} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher…"
                />
              </label>
            )}
          </div>

          {activeModule === 'overview' && (
            <>
              <div className="admin-stats-row">
                {MOCK_STATS.map((s, i) => (
                  <motion.div
                    key={s.label}
                    className="admin-stat-card"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <span className="admin-stat-label">{s.label}</span>
                    <span className={`admin-stat-value ${s.cls}`}>{s.value}</span>
                    <span className="admin-stat-delta">{s.delta}</span>
                  </motion.div>
                ))}
              </div>

              <div className="admin-overview-panels">
                <div className="admin-panel">
                  <div className="platform-section-header">
                    <span className="platform-section-title">
                      <BadgeCheck size={12} style={{ display: 'inline', marginRight: 6 }} />
                      Avocats en attente
                    </span>
                    <span className={`platform-section-badge ${pendingList.length > 0 ? 'alert' : ''}`}>
                      {pendingList.length} EN ATTENTE
                    </span>
                  </div>
                  <div className="admin-compact-list">
                    {(pendingList.slice(0, 5)).map((l) => (
                      <div key={l.id} className="admin-compact-row">
                        <span className="admin-mono">{l.id}</span>
                        <span className="admin-compact-main">{l.name}</span>
                        <span className="admin-compact-sub">{l.barreau}</span>
                      </div>
                    ))}
                    {pendingList.length === 0 && (
                      <div className="admin-empty">
                        File vide — aucune vérification.
                      </div>
                    )}
                    {pendingList.length > 5 && (
                      <button className="admin-link-btn" type="button" onClick={() => setActiveModule('avocats')}>
                        Voir toute la file →
                      </button>
                    )}
                  </div>
                </div>

                <div className="admin-panel">
                  <div className="platform-section-header">
                    <span className="platform-section-title">
                      <Activity size={12} style={{ display: 'inline', marginRight: 6 }} />
                      Audit (récent)
                    </span>
                  </div>
                  <div className="admin-audit-list">
                    {MOCK_AUDIT.slice(0, 6).map((entry, i) => (
                      <div key={i} className="audit-entry">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className={`audit-method ${entry.method}`}>{entry.method}</span>
                          <span className="audit-endpoint">{entry.endpoint}</span>
                        </div>
                        <span className="audit-meta">{entry.actor} · {entry.time}</span>
                      </div>
                    ))}
                    <button className="admin-link-btn" type="button" onClick={() => setActiveModule('audit')}>
                      Ouvrir le journal →
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeModule === 'avocats' && (
            <>
              <div className="platform-section-header">
                <span className="platform-section-title">
                  <BadgeCheck size={12} style={{ display: 'inline', marginRight: 6 }} />
                  Vérification des avocats
                </span>
                <span className={`platform-section-badge ${pendingList.length > 0 ? 'alert' : ''}`}>
                  {pendingList.length} EN ATTENTE
                </span>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Barreau</th>
                    <th>Déposé le</th>
                    <th>Pièces</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPendingLawyers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', letterSpacing: '0.2em' }}>
                        AUCUN RÉSULTAT
                      </td>
                    </tr>
                  ) : filteredPendingLawyers.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--gold)', opacity: 0.7 }}>{l.id}</td>
                      <td style={{ fontWeight: 700 }}>{l.name}</td>
                      <td>{l.barreau}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.65rem' }}>{l.date}</td>
                      <td>
                        <span className="platform-section-badge">{l.docs} docs</span>
                      </td>
                      <td>
                        <button className="tbl-btn approve" onClick={() => handleApprove(l.id)}>Approuver</button>
                        <button className="tbl-btn reject" onClick={() => handleReject(l.id)}>Rejeter</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {activeModule === 'users' && (
            <>
              <div className="platform-section-header">
                <span className="platform-section-title">
                  <UserCog size={12} style={{ display: 'inline', marginRight: 6 }} />
                  Gestion des utilisateurs
                </span>
                <span className="platform-section-badge">{filteredUsers.length} COMPTES</span>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', letterSpacing: '0.2em' }}>
                        AUCUN RÉSULTAT
                      </td>
                    </tr>
                  ) : filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--gold)', opacity: 0.7 }}>{u.id}</td>
                      <td style={{ fontWeight: 700 }}>{u.name}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.65rem' }}>{u.email}</td>
                      <td><span className={`role-badge ${u.role}`}>{u.role.toUpperCase()}</span></td>
                      <td>
                        <button className="tbl-btn reject">Suspendre</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {activeModule === 'audit' && (
            <div className="admin-panel">
              <div className="platform-section-header">
                <span className="platform-section-title">
                  <Activity size={12} style={{ display: 'inline', marginRight: 6 }} />
                  Journal d'audit
                </span>
                <span className="platform-section-badge">{MOCK_AUDIT.length} ENTRÉES</span>
              </div>
              <div className="admin-audit-list">
                {MOCK_AUDIT
                  .filter((entry) => {
                    const q = query.trim().toLowerCase()
                    if (!q) return true
                    return (
                      entry.method.toLowerCase().includes(q) ||
                      entry.endpoint.toLowerCase().includes(q) ||
                      entry.actor.toLowerCase().includes(q) ||
                      entry.time.toLowerCase().includes(q)
                    )
                  })
                  .map((entry, i) => (
                    <div key={i} className="audit-entry">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`audit-method ${entry.method}`}>{entry.method}</span>
                        <span className="audit-endpoint">{entry.endpoint}</span>
                      </div>
                      <span className="audit-meta">{entry.actor} · {entry.time}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {['reclamations', 'messenger', 'security'].includes(activeModule) && (
            <div className="admin-panel">
              <div className="platform-section-header">
                <span className="platform-section-title">Module en préparation</span>
              </div>
              <div className="admin-empty">
                Cette chambre sera branchée lorsque les écrans de gestion seront finalisés.
              </div>
            </div>
          )}
        </section>

        {/* Right rail */}
        <aside className="admin-console-rail">
          <div className="admin-panel">
            <div className="platform-section-header">
              <span className="platform-section-title">Raccourcis</span>
            </div>
            <div className="admin-rail-actions">
              <button className="tbl-btn approve" type="button" onClick={() => setActiveModule('avocats')}>
                Vérifications
              </button>
              <button className="tbl-btn reject" type="button" onClick={() => setActiveModule('users')}>
                Comptes
              </button>
              <button className="tbl-btn reject" type="button" onClick={() => setActiveModule('audit')}>
                Audit
              </button>
            </div>
          </div>

          <div className="admin-panel">
            <div className="platform-section-header">
              <span className="platform-section-title">État</span>
              <span className={`platform-section-badge ${pendingList.length > 0 ? 'alert' : ''}`}>
                {pendingList.length > 0 ? 'ATTENTION' : 'OK'}
              </span>
            </div>
            <div className="admin-rail-metrics">
              <div className="admin-rail-metric">
                <span className="admin-rail-label">Avocats en attente</span>
                <span className="admin-rail-value">{pendingList.length}</span>
              </div>
              <div className="admin-rail-metric">
                <span className="admin-rail-label">Dernière action</span>
                <span className="admin-rail-value admin-mono">{MOCK_AUDIT[0]?.time ?? '-'}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </motion.main>
  )
}
