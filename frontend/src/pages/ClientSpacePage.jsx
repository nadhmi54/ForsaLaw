import { motion } from 'framer-motion'
import { FilePlus2, KeyRound, UserCheck, Mail, ShieldCheck, CalendarClock } from 'lucide-react'
import '../styles/PlatformSpaces.css'

const CLIENT_ACTIONS = [
  {
    title: 'Deposer un dossier',
    description: 'Prepare le flux de creation de reclamation et de suivi des statuts.',
    endpoint: 'POST /api/reclamations',
    icon: <FilePlus2 size={18} />,
  },
  {
    title: 'Postuler a l espace avocat',
    description: 'Formulaire de candidature avocat (CIN, barreau, carte professionnelle).',
    endpoint: 'POST /api/avocats/me',
    icon: <UserCheck size={18} />,
  },
  {
    title: 'Changer mot de passe',
    description: 'Depuis profil connecte avec verification du mot de passe actuel.',
    endpoint: 'PUT /api/users/me',
    icon: <KeyRound size={18} />,
  },
  {
    title: 'Mot de passe oublie',
    description: 'Demande de lien email puis reset avec token temporaire.',
    endpoint: 'POST /api/auth/forgot-password',
    icon: <Mail size={18} />,
  },
]

const ClientSpacePage = () => {
  return (
    <section className="space-page">
      <div className="space-header">
        <span className="space-tag">Espace client</span>
        <h1>Parcours client pret pour integration backend</h1>
        <p>
          Cette page garde le style actuel et prepare les ecrans relies a tes APIs
          d authentification, reclamation et candidature avocat.
        </p>
      </div>

      <div className="space-grid">
        {CLIENT_ACTIONS.map((action, idx) => (
          <motion.article
            key={action.title}
            className="space-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <div className="space-card-top">
              <div className="space-icon">{action.icon}</div>
              <span className="space-endpoint">{action.endpoint}</span>
            </div>
            <h3>{action.title}</h3>
            <p>{action.description}</p>
            <button className="space-btn">Ecran pret (mock)</button>
          </motion.article>
        ))}
      </div>

      <div className="space-roadmap">
        <div>
          <ShieldCheck size={18} />
          <span>Regles de securite prêtes: JWT, roles CLIENT/AVOCAT/ADMIN</span>
        </div>
        <div>
          <CalendarClock size={18} />
          <span>Etape suivante: brancher axios/fetch sur les endpoints existants</span>
        </div>
      </div>
    </section>
  )
}

export default ClientSpacePage
