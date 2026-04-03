import { useState } from 'react'
import { motion } from 'framer-motion'
import { LayoutDashboard, FileText, MessageSquare, Award, Clock, Search, Filter, Hammer, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '../styles/LawyerDashboard.css'

const MOCK_DOCKET = [
  { id: "2026-REC-00142", title: "Litige Foncier Agence X", client: "Bassem Dridi", status: "EN_COURS", priority: "HAUTE" },
  { id: "2026-REC-00084", title: "Rupture Abusive Contrat", client: "Sami Mansour", status: "OUVERTE", priority: "MOYENNE" },
  { id: "2025-REC-00412", title: "Escroquerie E-commerce", client: "Amira Ben Ali", status: "TERMINEE", priority: "BASSE" },
  { id: "2026-REC-00201", title: "Divorce et Garde Enfant", client: "Fatma Zahra", status: "EN_COURS", priority: "CRITIQUE" }
]

const LawyerDashboardPage = () => {
  const { t } = useTranslation()
  const [activeView, setActiveView] = useState('docket')

  return (
    <div className="lawyer-dashboard">
      {/* Sidebar Navigation */}
      <aside className="lawyer-sidebar">
        <div className="lawyer-profile-card">
          <div className="lawyer-avatar">
            <Hammer size={32} />
          </div>
          <div className="lawyer-name">Me. Amine Mansour</div>
          <div className="lawyer-rank-badge">S-Tier Counselor</div>
        </div>

        <nav className="lawyer-nav">
          <button 
            className={`lawyer-nav-btn ${activeView === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveView('overview')}
          >
            <LayoutDashboard size={18} /> {t('dashboard_overview')}
          </button>
          <button 
            className={`lawyer-nav-btn ${activeView === 'docket' ? 'active' : ''}`}
            onClick={() => setActiveView('docket')}
          >
            <FileText size={18} /> {t('dashboard_docket')}
          </button>
          <button 
            className={`lawyer-nav-btn ${activeView === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveView('messages')}
          >
            <MessageSquare size={18} /> {t('dashboard_messages')}
          </button>
          <button 
            className={`lawyer-nav-btn ${activeView === 'awards' ? 'active' : ''}`}
            onClick={() => setActiveView('awards')}
          >
            <Award size={18} /> {t('dashboard_awards')}
          </button>
        </nav>
      </aside>

      {/* Main Administrative Content */}
      <main className="lawyer-content">
        <header className="lawyer-header-section">
          <div>
            <div className="lawyer-welcome-date">MARDI · 26 MARS · 2026</div>
            <h1 className="lawyer-welcome-title">Cabinet de Maître Mansour</h1>
          </div>
          <div className="lawyer-search">
            {/* Search Input Placeholder */}
            <div className="stat-card" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Search size={16} color="var(--gold)" />
              <input type="text" placeholder={t('dashboard_search')} style={{ background: 'transparent', border: 'none', color: '#ccc', width: '100%', outline: 'none', fontFamily: 'Lexend, sans-serif' }} />
            </div>
          </div>
        </header>

        {/* Justice Stats Grid */}
        <section className="justice-stats-grid">
          <div className="stat-card">
            <div className="stat-value">24</div>
            <div className="stat-label">{t('dashboard_active_pleas')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">98%</div>
            <div className="stat-label">{t('dashboard_win_rate')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">12.4k</div>
            <div className="stat-label">{t('dashboard_xp')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">#10</div>
            <div className="stat-label">{t('dashboard_rank')}</div>
          </div>
        </section>

        {/* The Judicial Docket (Case List) */}
        <section className="docket-section">
          <header className="docket-header">
            <div className="docket-title">{t('dashboard_docket_title')}</div>
            <button className="new-case-btn" style={{ background: 'var(--white)', color: 'var(--black)' }}>
              <Filter size={14} /> {t('dashboard_filter')}
            </button>
          </header>

          <table className="docket-table">
            <thead>
              <tr className="docket-row">
                <th>{t('docket_ref')}</th>
                <th>{t('docket_title')}</th>
                <th>{t('docket_client')}</th>
                <th>{t('docket_status')}</th>
                <th>{t('docket_priority')}</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DOCKET.map((item, idx) => (
                <motion.tr 
                  key={item.id} 
                  className="docket-row"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <td className="case-id">{item.id}</td>
                  <td style={{ fontWeight: 800 }}>{item.title}</td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={14} color="#888" /> {item.client}
                  </td>
                  <td>
                    <span className={`case-status-badge status-${item.status}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ color: item.priority === 'CRITIQUE' ? '#ff6b6b' : 'inherit', fontWeight: 900 }}>
                    {item.priority}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  )
}

export default LawyerDashboardPage
