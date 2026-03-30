import { motion } from 'framer-motion'
import { Shield, Send, History, FileText, ChevronRight } from 'lucide-react'
import '../styles/Support.css'

const MOCK_DOLÉANCES = [
  {
    id: "REC-2026-0042",
    subject: "Litige Foncier Régional",
    status: "EN_COURS",
    date: "24 MARS",
    lastUpdate: "Hier, 14:30"
  },
  {
    id: "REC-2026-0015",
    subject: "Harcèlement en Milieu de Travail",
    status: "OUVERT",
    date: "27 MARS",
    lastUpdate: "Aujourd'hui, 09:15"
  }
]

export default function SupportPage() {
  return (
    <motion.main 
      className="support-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="support-header">
        <div className="support-eyebrow">PALAIS DE LA JUSTICE · CHAMBRE VII</div>
        <h1 className="support-title">CHAMBRE DES DOLÉANCES</h1>
        <div className="support-title-divider" />
        <p className="support-subtitle">
          Dépôt scellé de vos griefs et demandes d'arbitrage. Chaque parole est enregistrée 
          dans le Grand Registre avec garantie de confidentialité absolue.
        </p>
      </header>

      <div className="support-grid">
        {/* LA DOLÉANCE FORM */}
        <div className="support-vault-form-container">
          <div className="support-section-header">
            <span className="support-section-title">
              <FileText size={14} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
              Nouveau Dépôt de Grief
            </span>
          </div>
            
          <form className="support-form-inner" onSubmit={(e) => e.preventDefault()}>
            <div className="support-form-group">
              <label>Titre de l'affaire</label>
              <input className="support-input" placeholder="Désignation courte de votre litige..." />
            </div>

            <div className="support-form-group">
              <label>Catégorie Juridique</label>
              <select className="support-select">
                <option>Sélectionnez une catégorie...</option>
                <option>Droit Civil</option>
                <option>Droit Pénal</option>
                <option>Droit du Travail</option>
                <option>Droit Immobilier</option>
                <option>Arbitrage Commercial</option>
              </select>
            </div>

            <div className="support-form-group">
              <label>Exposition des faits (Détaillée)</label>
              <textarea 
                className="support-textarea" 
                placeholder="Veuillez décrire les faits avec précision. Mentionnez les dates, les lieux et les parties impliquées..."
              ></textarea>
            </div>

            <button className="brutal-btn" style={{ width: '100%', padding: '1rem', fontSize: '0.8rem' }}>
              <Send size={16} style={{ marginRight: '0.75rem' }} />
              SCELLER ET TRANSMETTRE
            </button>
          </form>
        </div>

        {/* TRACKING LIST */}
        <aside className="support-sidebar">
          <div className="support-section-header">
            <span className="support-section-title">
              <History size={14} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
              Vos Scellés Actuels
            </span>
          </div>

          <div style={{ flex: 1 }}>
            {MOCK_DOLÉANCES.map((rec, idx) => (
              <motion.div 
                key={rec.id}
                className="tracking-card"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <div className="tracking-id">{rec.id}</div>
                <h4 className="tracking-subject">{rec.subject}</h4>
                <div className="tracking-meta">
                   <span>{rec.date}</span>
                   <span className={`tracking-status-badge ${rec.status === 'OUVERT' ? 'ouvert' : ''}`}>{rec.status}</span>
                </div>
                <ChevronRight size={16} style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.2 }} />
              </motion.div>
            ))}
          </div>

          <div className="support-security-notice">
            <Shield size={24} style={{ color: 'var(--gold)', marginBottom: 12, opacity: 0.5 }} />
            <p>
              Toute doléance est protégée par le sceau du secret professionnel.<br/>
              Votre adresse IP est enregistrée en tant que signature numérique.
            </p>
          </div>
        </aside>
      </div>
    </motion.main>
  )
}
