import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, MessageSquare, Clock, Pin, Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import PageHeader from '../components/PageHeader'
import '../styles/Forum.css'

// ─── Placeholder data ─────────────────────────────────────────────────────────
const THREADS = [
  {
    id: 1,
    pinned: true,
    tags: ['pinned', 'civil'],
    title: "Guide officiel : comment soumettre une réclamation en ligne via ForsaLaw",
    excerpt: "Ce fil récapitule toutes les étapes pour déposer votre dossier de réclamation, les délais légaux à respecter et les pièces justificatives obligatoires.",
    author: "Équipe ForsaLaw",
    authorInitial: "F",
    time: "Épinglé",
    replies: 42,
    votes: 118,
  },
  {
    id: 2,
    pinned: false,
    tags: ['penal'],
    title: "Mon voisin construit sans permis — que peuvent faire les autorités ?",
    excerpt: "Il a commencé les travaux il y a trois semaines. J'ai déjà contacté la mairie. Qui est compétent pour intervenir ?",
    author: "Citoyen_Tunis",
    authorInitial: "C",
    time: "Il y a 2 h",
    replies: 14,
    votes: 37,
  },
  {
    id: 3,
    pinned: false,
    tags: ['travail'],
    title: "Licenciement sans préavis : quels sont mes droits selon le Code du travail tunisien ?",
    excerpt: "Mon employeur m'a remis une lettre de rupture immédiate sans respecter le préavis de deux mois. Puis-je saisir le tribunal ?",
    author: "MedAli2024",
    authorInitial: "M",
    time: "Il y a 5 h",
    replies: 28,
    votes: 64,
  },
  {
    id: 4,
    pinned: false,
    tags: ['famille'],
    title: "Divorce par consentement mutuel : déroulement et durée de la procédure",
    excerpt: "Nous sommes d'accord pour divorcer mais nous avons des enfants. Comment se déroule la procédure et combien de temps cela prend-il ?",
    author: "AnonymeTN",
    authorInitial: "A",
    time: "Il y a 1 j",
    replies: 61,
    votes: 92,
  },
  {
    id: 5,
    pinned: false,
    tags: ['civil'],
    title: "Transaction immobilière bloquée : recours contre l'agence défaillante",
    excerpt: "L'agence a encaissé la commission mais n'a pas finalisé l'acte notarié. Quels sont les recours possibles ?",
    author: "Hamza_Sfax",
    authorInitial: "H",
    time: "Il y a 2 j",
    replies: 9,
    votes: 20,
  },
]

const FILTERS = ['Tous', 'Civil', 'Pénal', 'Famille', 'Travail']

const TOP_CONTRIBUTORS = [
  { rank: 1, name: "Maître Dridi",   initials: "MD", posts: 247 },
  { rank: 2, name: "Citoyen_Tunis",  initials: "CT", posts: 183 },
  { rank: 3, name: "JuristeTN",      initials: "JT", posts: 141 },
  { rank: 4, name: "MedAli2024",     initials: "MA", posts: 98  },
]

const TRENDING_TAGS = ['#Réclamation', '#Divorce', '#Travail', '#Immobilier', '#Pénal', '#Tutelle', '#Succession', '#CNSS']

// ─── New Post Modal ───────────────────────────────────────────────────────────
const NewPostModal = ({ onClose }) => {
  const { t } = useTranslation()
  return (
    <motion.div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        style={{
          background: '#1a1a1a',
          border: '4px solid #000',
          boxShadow: '8px 8px 0 #000',
          padding: '2rem',
          width: '100%',
          maxWidth: 620,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: 'var(--gold)' }}>{t('forum_new_post_title')}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>
        
        <div style={{ marginTop: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>{t('forum_post_subject')}</label>
          <input 
            type="text" 
            className="ritual-input"
            style={{ width: '100%', marginBottom: '1.5rem', background: '#111', border: '2px solid #333' }}
          />

          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#888' }}>{t('forum_post_body')}</label>
          <textarea 
            rows={5}
            className="ritual-input"
            style={{ width: '100%', background: '#111', border: '2px solid #333', resize: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
          <button className="brutal-btn" style={{ background: 'transparent', color: 'var(--white)' }} onClick={onClose}>
            {t('forum_btn_cancel')}
          </button>
          <button className="brutal-btn" onClick={onClose}>
            {t('forum_btn_publish')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}


// ─── Thread Card Component ────────────────────────────────────────────────────
const ThreadCard = ({ thread }) => {
  const { t } = useTranslation()
  return (
    <motion.div
      className={`thread-card ${thread.pinned ? 'pinned' : ''}`}
      whileHover={{ x: 2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="thread-body">
        <div className="thread-tags">
          {thread.pinned && <span className="thread-tag pinned">📌 {t('forum_pinned')}</span>}
          {thread.tags.filter(t => t !== 'pinned').map(tag => (
            <span key={tag} className={`thread-tag ${tag}`}>{tag}</span>
          ))}
        </div>
        <p className="thread-title">{thread.title}</p>
        <p className="thread-excerpt">{thread.excerpt}</p>
        <div className="thread-meta">
          <span className="thread-author">
            <div className="author-avatar">{thread.authorInitial}</div>
            {thread.author}
          </span>
          <span className="thread-time">
            <Clock size={12} />
            {thread.pinned ? t('forum_pinned') : `${thread.time} ${t('forum_ago')}`}
          </span>
        </div>
      </div>

      {/* Right: Stats */}
      <div className="thread-stats">
        <div className="stat-item tooltip-container">
          <MessageSquare size={16} />
          <span>{thread.replies}</span>
          <span className="tooltip">{t('forum_replies')}</span>
        </div>
        <div className="stat-item tooltip-container" style={{ color: 'var(--gold)' }}>
          <ChevronUp size={18} />
          <span>{thread.votes}</span>
          <span className="tooltip">{t('forum_votes')}</span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Forum Page ───────────────────────────────────────────────────────────────
const ForumPage = () => {
  const { t } = useTranslation()
  const [activeFilter, setActiveFilter] = useState(t('forum_filter_all'))
  const [showNewPost, setShowNewPost] = useState(false)

  const filtered = activeFilter === t('forum_filter_all')
    ? THREADS
    : THREADS.filter(t => t.tags.some(tag =>
        tag.toLowerCase() === activeFilter.toLowerCase()
      ))

  const filters = [t('forum_filter_all'), t('forum_filter_civil'), t('forum_filter_penal'), t('forum_filter_family'), t('forum_filter_work')]

  return (
    <div className="forum-page">
      {/* Heavy Brutalist Header */}
      <PageHeader
        className="forum-header"
        tag={t('forum_tag')}
        tagClassName="forum-header-tag"
        title={t('forum_title')}
        titleClassName="forum-title"
      />

      {/* Control Bar (Filters & Search & Action) */}
      <section className="forum-toolbar">
        <div className="forum-filters">
          {filters.map(filter => (
            <button 
              key={filter}
              className={`forum-filter-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="forum-actions">
          <button className="forum-new-btn" onClick={() => setShowNewPost(true)}>
            {t('forum_new_post')}
          </button>
        </div>
      </section>

      {/* Main content */}
      <div className="forum-content">
        <div className="forum-threads">
          <AnimatePresence mode="popLayout">
            {filtered.map(thread => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ThreadCard thread={thread} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <aside className="forum-sidebar">
          <div className="sidebar-widget fellawra-widget">
            <img src="/fellawra.png" alt="Fellawra" className="fellawra-widget-img" />
            <p className="fellawra-widget-text">
              {t('forum_fellawra_text')}
            </p>
            <button className="fellawra-ask-btn">{t('forum_ask_fellawra')}</button>
          </div>

          <div className="sidebar-widget">
            <p className="sidebar-widget-title">{t('forum_contributors')}</p>
            {TOP_CONTRIBUTORS.map(c => (
              <div className="contributor-item" key={c.rank}>
                <span className="contributor-rank">#{c.rank}</span>
                <div className="contributor-avatar">{c.initials}</div>
                <span className="contributor-name">{c.name}</span>
                <span className="contributor-posts">{c.posts} {t('forum_posts')}</span>
              </div>
            ))}
          </div>

          <div className="sidebar-widget">
            <p className="sidebar-widget-title">{t('forum_trending')}</p>
            <div className="trending-tags">
              {TRENDING_TAGS.map(tag => (
                <button key={tag} className="trending-tag">{tag}</button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* New Post Modal */}
      <AnimatePresence>
        {showNewPost && <NewPostModal onClose={() => setShowNewPost(false)} />}
      </AnimatePresence>
    </div>
  )
}

export default ForumPage
