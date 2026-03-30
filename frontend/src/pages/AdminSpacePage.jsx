import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserCog, BadgeCheck, ClipboardList, MessagesSquare, ShieldAlert, Activity } from 'lucide-react'
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

export default function AdminSpacePage() {
  const [pendingList, setPendingList] = useState(MOCK_PENDING_LAWYERS)

  const handleApprove = (id) => setPendingList(prev => prev.filter(l => l.id !== id))
  const handleReject  = (id) => setPendingList(prev => prev.filter(l => l.id !== id))

  return (
    <motion.main
      className="platform-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <p className="platform-eyebrow">Chambre de Contrôle · Accès Restreint</p>
      <h1 className="platform-title">Console d'Administration</h1>
      <div className="platform-title-divider" />
      <p className="platform-subtitle">
        Supervision des utilisateurs, vérification des avocats et traçabilité des actions sensibles du système.
      </p>

      {/* Stats */}
      <div className="admin-stats-row">
        {MOCK_STATS.map((s, i) => (
          <motion.div
            key={s.label}
            className="admin-stat-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <span className="admin-stat-label">{s.label}</span>
            <span className={`admin-stat-value ${s.cls}`}>{s.value}</span>
            <span className="admin-stat-delta">{s.delta}</span>
          </motion.div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="admin-columns">

        {/* LEFT — Main col */}
        <div className="admin-main-col">

          {/* Lawyer verification queue */}
          <div className="platform-section-header">
            <span className="platform-section-title">
              <BadgeCheck size={12} style={{ display: 'inline', marginRight: 6 }} />
              File de vérification avocats
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
              {pendingList.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', letterSpacing: '0.2em' }}>
                    FILE VIDE — AUCUNE VÉRIFICATION EN ATTENTE
                  </td>
                </tr>
              ) : pendingList.map(l => (
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
                    <button className="tbl-btn reject"  onClick={() => handleReject(l.id)}>Rejeter</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Users table */}
          <div className="platform-section-header" style={{ borderTop: '4px solid var(--black)' }}>
            <span className="platform-section-title">
              <UserCog size={12} style={{ display: 'inline', marginRight: 6 }} />
              Gestion des utilisateurs
            </span>
            <span className="platform-section-badge">{MOCK_USERS.length} COMPTES</span>
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
              {MOCK_USERS.map(u => (
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
        </div>

        {/* RIGHT — Audit log */}
        <div className="admin-side-col">
          <div className="platform-section-header">
            <span className="platform-section-title">
              <Activity size={12} style={{ display: 'inline', marginRight: 6 }} />
              Journal d'audit
            </span>
          </div>
          <div className="admin-audit-list">
            {MOCK_AUDIT.map((entry, i) => (
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
      </div>
    </motion.main>
  )
}
