import { motion } from 'framer-motion'
import { UserCog, BadgeCheck, ClipboardList, MessagesSquare, ShieldAlert } from 'lucide-react'
import '../styles/PlatformSpaces.css'

const ADMIN_MODULES = [
  {
    title: 'Gestion utilisateurs',
    subtitle: 'Roles et profils',
    endpoint: 'GET /api/admin/users',
    details: 'Lister, filtrer et administrer les comptes client/avocat/admin.',
    icon: <UserCog size={18} />,
  },
  {
    title: 'Verification avocats',
    subtitle: 'Workflow approval',
    endpoint: 'PUT /api/admin/avocats/{id}',
    details: 'Approuver/rejeter une candidature avocat et commentaire de verification.',
    icon: <BadgeCheck size={18} />,
  },
  {
    title: 'Audit logs',
    subtitle: 'Traçabilite',
    endpoint: 'GET /api/admin/audit-logs',
    details: 'Visualiser actions sensibles, modules, methode HTTP et acteur.',
    icon: <ClipboardList size={18} />,
  },
  {
    title: 'Moderation forum',
    subtitle: 'Qualite communautaire',
    endpoint: 'GET /api/admin/forum/*',
    details: 'Preparer ecrans de moderation des sujets et contenus publics.',
    icon: <MessagesSquare size={18} />,
  },
]

const AdminSpacePage = () => {
  return (
    <section className="space-page">
      <div className="space-header">
        <span className="space-tag">Chambre de controle</span>
        <h1>Console admin alignee avec la structure backend</h1>
        <p>
          Pages UI disponibles sans integration API pour accelerer le branchement
          backend/frontend ensuite.
        </p>
      </div>

      <div className="space-grid">
        {ADMIN_MODULES.map((module, idx) => (
          <motion.article
            key={module.title}
            className="space-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <div className="space-card-top">
              <div className="space-icon">{module.icon}</div>
              <span className="space-endpoint">{module.endpoint}</span>
            </div>
            <h3>{module.title}</h3>
            <p className="space-subtitle">{module.subtitle}</p>
            <p>{module.details}</p>
            <button className="space-btn">Ouvrir module (mock)</button>
          </motion.article>
        ))}
      </div>

      <div className="space-roadmap">
        <div>
          <ShieldAlert size={18} />
          <span>Controle d acces par role admin a connecter sur les routes</span>
        </div>
      </div>
    </section>
  )
}

export default AdminSpacePage
