import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Calendar, MessageSquare, FilePlus2, LogOut, User, ChevronRight } from 'lucide-react'
import '../styles/PlatformSpaces.css'

// ─── Mock data ─────────────────────────────────────────────
const MOCK_CLIENT = {
  prenom: 'Ahmed',
  nom: 'Dridi',
  email: 'a.dridi@forsalaw.tn',
  role: 'CLIENT',
  memberSince: 'MARS 2026',
}

const MOCK_CASES = [
  { id: 'DOS-2026-0142', subject: 'Litige Foncier — Terrain Ariana', avocat: 'Me. Y. Mansour', status: 'in-progress', statusLabel: 'EN COURS' },
  { id: 'DOS-2026-0089', subject: 'Harcèlement Professionnel', avocat: 'Me. K. Ouertani', status: 'open', statusLabel: 'OUVERTE' },
  { id: 'DOS-2025-0402', subject: 'Contestation Héritage', avocat: 'Me. S. Ben Amor', status: 'closed', statusLabel: 'CLOSE' },
]

const MOCK_APPOINTMENTS = [
  { day: '02', month: 'AVR', subject: 'Signature Requête · Stratégie Procédurale', avocat: 'Me. Y. Mansour', time: '14:30 → 15:30', type: 'Présentiel' },
  { day: '09', month: 'AVR', subject: 'Conseil Juridique · Phase II', avocat: 'Me. K. Ouertani', time: '10:00 → 11:00', type: 'Visioconférence' },
]

const CLIENT_NAV = [
  { key: 'cases',       label: 'Mes Dossiers',    icon: <FileText size={16} /> },
  { key: 'appointments', label: 'Mes Rendez-vous', icon: <Calendar size={16} /> },
  { key: 'messages',    label: 'Messagerie',      icon: <MessageSquare size={16} /> },
  { key: 'profile',     label: 'Mon Profil',      icon: <User size={16} /> },
]

export default function ClientSpacePage() {
  const [activeTab, setActiveTab] = useState('cases')

  const initials = (p, n) => ((p?.[0] ?? '') + (n?.[0] ?? '')).toUpperCase()

  return (
    <motion.main
      className="platform-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <p className="platform-eyebrow">Espace Personnel · Portail Client</p>
      <h1 className="platform-title">Mon Espace</h1>
      <div className="platform-title-divider" />
      <p className="platform-subtitle">
        Suivez l'évolution de vos dossiers, consultez vos audiences et correspondez avec vos conseillers.
      </p>

      <div className="client-layout">

        {/* LEFT — Profile sidebar */}
        <div className="client-profile-col">

          {/* Identity card */}
          <div className="client-profile-card">
            <div className="client-avatar-ring">
              {initials(MOCK_CLIENT.prenom, MOCK_CLIENT.nom)}
            </div>
            <div className="client-profile-name">
              {MOCK_CLIENT.prenom} {MOCK_CLIENT.nom}
            </div>
            <div className="client-profile-email">{MOCK_CLIENT.email}</div>
            <span className="role-badge client">{MOCK_CLIENT.role}</span>
            <div style={{ marginTop: 12, fontSize: '0.5rem', color: 'rgba(255,255,255,0.15)', fontFamily: 'monospace', letterSpacing: '0.2em' }}>
              MEMBRE DEPUIS {MOCK_CLIENT.memberSince}
            </div>
          </div>

          {/* Navigation */}
          <nav className="client-nav-list">
            {CLIENT_NAV.map(item => (
              <button
                key={item.key}
                className={`client-nav-item${activeTab === item.key ? ' active' : ''}`}
                onClick={() => setActiveTab(item.key)}
              >
                {item.icon}
                {item.label}
                <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.3 }} />
              </button>
            ))}
          </nav>

          {/* Quick actions */}
          <div className="platform-section-header" style={{ marginTop: 'auto', borderTop: '4px solid var(--black)' }}>
            <span className="platform-section-title">Actions Rapides</span>
          </div>
          <button className="quick-action-btn">
            <FilePlus2 size={16} />
            Déposer un dossier
          </button>
          <button className="quick-action-btn">
            <MessageSquare size={16} />
            Contacter mon avocat
          </button>
          <button className="quick-action-btn" style={{ color: 'rgba(255,107,107,0.5)' }}>
            <LogOut size={16} style={{ color: 'rgba(255,107,107,0.5)' }} />
            Se déconnecter
          </button>
        </div>

        {/* RIGHT — Main content */}
        <div className="client-main-col">

          {/* CASES TAB */}
          {activeTab === 'cases' && (
            <>
              <div className="platform-section-header">
                <span className="platform-section-title">
                  <FileText size={12} style={{ display: 'inline', marginRight: 6 }} />
                  Vos Dossiers Actifs
                </span>
                <span className="platform-section-badge">{MOCK_CASES.length} DOSSIERS</span>
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

          {/* APPOINTMENTS TAB */}
          {activeTab === 'appointments' && (
            <>
              <div className="platform-section-header">
                <span className="platform-section-title">
                  <Calendar size={12} style={{ display: 'inline', marginRight: 6 }} />
                  Vos Rendez-vous à Venir
                </span>
                <span className="platform-section-badge">{MOCK_APPOINTMENTS.length} PLANIFIÉS</span>
              </div>
              {MOCK_APPOINTMENTS.map((a, i) => (
                <motion.div
                  key={i}
                  className="appt-row"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="appt-date-block">
                    <span className="appt-day">{a.day}</span>
                    <span className="appt-month">{a.month}</span>
                  </div>
                  <div className="appt-info">
                    <div className="appt-subject">{a.subject}</div>
                    <div className="appt-meta">{a.avocat} · {a.time} · {a.type}</div>
                  </div>
                  <span className="status-badge-admin open">CONFIRMÉ</span>
                </motion.div>
              ))}
            </>
          )}

          {/* MESSAGES TAB */}
          {activeTab === 'messages' && (
            <>
              <div className="platform-section-header">
                <span className="platform-section-title">Messagerie</span>
              </div>
              <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: '0.65rem', letterSpacing: '0.3em', fontFamily: 'monospace', textTransform: 'uppercase' }}>
                Accédez à la Malle Postale Sécurisée via le menu principal
              </div>
            </>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <>
              <div className="platform-section-header">
                <span className="platform-section-title">Informations du Compte</span>
              </div>
              {[
                { label: 'Prénom', value: MOCK_CLIENT.prenom },
                { label: 'Nom', value: MOCK_CLIENT.nom },
                { label: 'Adresse Email', value: MOCK_CLIENT.email },
                { label: 'Rôle', value: MOCK_CLIENT.role },
                { label: 'Membre depuis', value: MOCK_CLIENT.memberSince },
              ].map(field => (
                <div key={field.label} className="case-row" style={{ gridTemplateColumns: '160px 1fr' }}>
                  <div style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    {field.label}
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--white)' }}>
                    {field.value}
                  </div>
                </div>
              ))}
              <div style={{ padding: '16px 22px' }}>
                <button className="brutal-btn" style={{ fontSize: '0.65rem', padding: '0.75rem 1.5rem' }}>
                  Modifier mon profil
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </motion.main>
  )
}
