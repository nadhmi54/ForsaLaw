import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Fingerprint, FileText, Anchor, History, AlertTriangle, MessageSquare, Send, Shield } from 'lucide-react'
import '../styles/Dossier.css'

// ─── Mock Data Mapping ReclamationDTO ─────────────────────────────────────────
// This strictly maps to DTOs in com.forsalaw.reclamationManagement.entity
const MOCK_RECLAMATIONS = [
  {
    id: "2026-REC-00142",
    titre: "Litige Foncier avec l'Agence Immobilière",
    description: "L'agence a pris l'acompte mais le transfert de propriété n'a pas été enregistré au registre du commerce depuis plus de 6 mois. Les appels sont ignorés.\n\nJe demande l'annulation du contrat et le remboursement immédiat, plus dommages et intérêts.",
    categorie: "CIVIL", // CIVIL, PENAL, FAMILLE, TRAVAIL, IMMOBILIER, ADMINISTRATIF, COMMERCIAL
    statut: "EN_COURS", // OUVERTE, EN_COURS, RESOLUE, FERMEE
    gravite: "HAUTE", // BASSE, MOYENNE, HAUTE, CRITIQUE
    dateCreation: "2026-03-20T08:30:00",
    dateModification: "2026-03-24T14:15:00",
    messages: [
      { id: 1, expediteur: "System", dateEnvoi: "2026-03-20T08:30:00", contenu: "Dossier ouvert et enregistré sous scellé." },
      { id: 2, expediteur: "Me. Dridi", dateEnvoi: "2026-03-21T10:00:00", contenu: "J'ai pris connaissance de votre dossier. Veuillez déposer les copies des chèques certifiés dans l'onglet Pièces Jointes." },
      { id: 3, expediteur: "Vous", dateEnvoi: "2026-03-21T11:45:00", contenu: "C'est fait, Maître. Je voulais aussi savoir si nous pouvons bloquer leurs comptes." }
    ]
  },
  {
    id: "2026-REC-00084",
    titre: "Rupture Abusive de Contrat de Travail",
    description: "J'ai été licencié sans préavis suite à un refus d'exécuter une tâche dangereuse non stipulée sur mon contrat. L'employeur refuse de payer mes indemnités de départ. J'ai des preuves par e-mail.",
    categorie: "TRAVAIL",
    statut: "OUVERTE",
    gravite: "MOYENNE",
    dateCreation: "2026-03-25T09:10:00",
    dateModification: "2026-03-25T09:10:00",
    messages: [
      { id: 1, expediteur: "System", dateEnvoi: "2026-03-25T09:10:00", contenu: "Dossier ouvert. En attente d'assignation d'un avocat ou greffier." }
    ]
  },
  {
    id: "2025-REC-00412",
    titre: "Escroquerie en Ligne (E-commerce)",
    description: "J'ai passé une commande via une page Facebook pour une valeur de 1500 TND. Le livreur m'a bloqué après le transfert bancaire. La banque refuse de collaborer sans dépôt de plainte.",
    categorie: "PENAL",
    statut: "FERMEE",
    gravite: "BASSE",
    dateCreation: "2025-11-12T14:00:00",
    dateModification: "2026-01-05T08:00:00",
    messages: [
      { id: 1, expediteur: "System", dateEnvoi: "2025-11-12T14:00:00", contenu: "Dossier ouvert." },
      { id: 2, expediteur: "Me. Mansour", dateEnvoi: "2025-11-15T09:00:00", contenu: "Nous avons identifié l'IP du vendeur. La plainte a été déposée auprès de la brigade criminelle de Gorjani." },
      { id: 3, expediteur: "System", dateEnvoi: "2026-01-05T08:00:00", contenu: "L'affaire a abouti au remboursement. Dossier classé." }
    ]
  }
]

// Icons for the Wax Seals
const getStatusIcon = (statut) => {
  switch(statut) {
    case 'OUVERTE': return <AlertTriangle size={16} />;
    case 'EN_COURS': return <Anchor size={16} />;
    case 'RESOLUE': return <Fingerprint size={16} />;
    case 'FERMEE': return <History size={16} />;
    default: return <FileText size={16} />;
  }
}

// ─── Main Page Component ──────────────────────────────────────────────────────
const DossierPage = () => {
  const [activeCase, setActiveCase] = useState(MOCK_RECLAMATIONS[0])

  return (
    <div className="dossier-page">
      {/* Header */}
      <div className="dossier-header">
        <div className="dossier-header-tag">ARCHIVES DE VÉRITÉ · CHR. III</div>
        <h1 className="dossier-title">VOS DOSSIERS JURIDIQUES</h1>
        <div style={{ marginTop: '1rem', height: '1px', background: 'var(--gold)', width: '200px', opacity: 0.3 }} />
      </div>

      <div className="dossier-content">
        {/* Left: The Archive Index */}
        <aside className="dossier-list">
          <div className="dossier-list-header">
            <span>INDEX DES AFFAIRES</span>
            <button className="new-case-btn">+ DÉPOSER UNE PLAINTE</button>
          </div>

          <div className="folders-container">
            {MOCK_RECLAMATIONS.map((reclamation, idx) => (
              <motion.div
                key={reclamation.id}
                className={`case-folder ${activeCase?.id === reclamation.id ? 'active' : ''}`}
                onClick={() => setActiveCase(reclamation)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className={`status-seal status-${reclamation.statut}`}>
                  {getStatusIcon(reclamation.statut)}
                </div>

                <div className="case-folder-id">{reclamation.id}</div>
                <div className="case-folder-title">{reclamation.titre.toUpperCase()}</div>
                <div style={{ marginTop: '1rem', fontSize: '0.6rem', color: 'rgba(212,175,55,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  STATUT: {reclamation.statut}
                </div>
              </motion.div>
            ))}
          </div>
        </aside>

        {/* Right: The Open Archive */}
        <main>
          <AnimatePresence mode="wait">
            {activeCase ? (
              <motion.div
                key={activeCase.id}
                className="dossier-record"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
              >
                <div className="dossier-paper">
                  <div className="dossier-paper-content">
                    
                    <div className="dossier-meta-stamp">
                      DOSSIER N° {activeCase.id} <br/>
                      ENREGISTRÉ LE: {new Date(activeCase.dateCreation).toLocaleDateString('fr-FR')}
                    </div>

                    <h2 className="dossier-record-title">{activeCase.titre}</h2>
                    
                    <p className="dossier-record-desc">
                      {activeCase.description}
                    </p>

                    <div className="dossier-timeline">
                      <span className="timeline-title">LE REGISTRE (MESSAGES)</span>
                      
                      {activeCase.messages.map(msg => (
                        <div key={msg.id} className="timeline-item">
                          <div className="timeline-avatar">
                            {msg.expediteur === 'System' ? <Shield size={18} /> : 
                             msg.expediteur === 'Vous' ? <Fingerprint size={18} /> : 
                             <UserIcon />}
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-meta">
                              <strong>{msg.expediteur}</strong>
                              <span>{new Date(msg.dateEnvoi).toLocaleString('fr-FR', {
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                              })}</span>
                            </div>
                            <div className="timeline-text">{msg.contenu}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="dossier-empty">
                <FileText size={48} />
                <h2>SÉLECTIONNEZ UN DOSSIER</h2>
                <p>Ouvrez un scellé pour consulter son contenu.</p>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

// Custom icon placeholder
function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}

export default DossierPage
