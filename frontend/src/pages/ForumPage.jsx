import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, MessageSquare, Clock, Pin, Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
const NewPostModal = ({ onClose }) => (
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
        <h2 style={{ fontSize: '1rem', color: '#fff' }}>Nouveau Fil</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>
      <input
        placeholder="Titre de votre question..."
        style={{
          background: '#111', border: '2px solid rgba(255,255,255,0.1)',
          padding: '0.85rem 1rem', color: '#fff',
          fontFamily: 'Lexend, sans-serif', fontSize: '0.9rem',
          outline: 'none'
        }}
      />
      <select
        style={{
          background: '#111', border: '2px solid rgba(255,255,255,0.1)',
          padding: '0.75rem 1rem', color: 'rgba(255,255,255,0.6)',
          fontFamily: 'Lexend, sans-serif', fontSize: '0.8rem',
          outline: 'none'
        }}
      >
        <option value="">— Catégorie —</option>
        <option value="civil">Droit Civil</option>
        <option value="penal">Droit Pénal</option>
        <option value="famille">Droit de la Famille</option>
        <option value="travail">Droit du Travail</option>
      </select>
      <textarea
        rows={5}
        placeholder="Décrivez votre situation juridique..."
        style={{
          background: '#111', border: '2px solid rgba(255,255,255,0.1)',
          padding: '0.85rem 1rem', color: '#fff',
          fontFamily: 'Lexend, sans-serif', fontSize: '0.85rem',
          resize: 'vertical', outline: 'none', lineHeight: 1.6
        }}
      />
      <button
        style={{
          background: '#D4AF37', color: '#000',
          border: '4px solid #000',
          boxShadow: '4px 4px 0 #000',
          padding: '0.85rem',
          fontFamily: 'Lexend, sans-serif',
          fontWeight: 800, fontSize: '0.85rem',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          cursor: 'pointer'
        }}
      >
        Soumettre au Tribunal Public ⚖
      </button>
    </motion.div>
  </motion.div>
)

// ─── Thread Card Component ────────────────────────────────────────────────────
const ThreadCard = ({ thread }) => {
  const [votes, setVotes] = useState(thread.votes)
  const [voted, setVoted] = useState(null)

  const vote = (dir) => {
    if (voted === dir) { setVoted(null); setVotes(thread.votes) }
    else { setVoted(dir); setVotes(thread.votes + (dir === 'up' ? 1 : -1)) }
  }

  return (
    <motion.div
      className={`thread-card ${thread.pinned ? 'pinned' : ''}`}
      whileHover={{ x: 2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Vote column */}
      <div className="thread-votes">
        <button className={`vote-btn ${voted === 'up' ? 'upvoted' : ''}`} onClick={() => vote('up')}>
          <ChevronUp size={16} />
        </button>
        <span className="vote-count">{votes}</span>
        <button className={`vote-btn`} onClick={() => vote('down')}>
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Main content */}
      <div className="thread-body">
        <div className="thread-tags">
          {thread.pinned && <span className="thread-tag pinned">📌 Épinglé</span>}
          {thread.tags.filter(t => t !== 'pinned').map(tag => (
            <span key={tag} className={`thread-tag ${tag}`}>{tag}</span>
          ))}
        </div>
        <p className="thread-title">{thread.title}</p>
        <p className="thread-excerpt">{thread.excerpt}</p>
        <div className="thread-meta">
          <span>Par <span className="thread-meta-author">{thread.author}</span></span>
          <span className="thread-reply-count">
            <MessageSquare size={11} /> {thread.replies} réponses
          </span>
          <span>
            <Clock size={11} style={{ display: 'inline', marginRight: 3 }} />{thread.time}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="thread-stats">
        <span className="thread-stat-replies">{thread.replies}</span>
        <span className="thread-stat-label">réponses</span>
        <span className="thread-stat-time">{thread.time}</span>
      </div>
    </motion.div>
  )
}

// ─── Forum Page ───────────────────────────────────────────────────────────────
const ForumPage = () => {
  const { i18n } = useTranslation()
  const [activeFilter, setActiveFilter] = useState('Tous')
  const [showNewPost, setShowNewPost] = useState(false)

  const filtered = activeFilter === 'Tous'
    ? THREADS
    : THREADS.filter(t => t.tags.some(tag =>
        tag.toLowerCase() === activeFilter.toLowerCase()
      ))

  return (
    <div className="forum-page">
      {/* Header */}
      <div className="forum-header">
        <div className="bg-texture" />
        <div className="forum-header-tag">⚖ La Place Publique · ساحة العامة</div>
        <h1 className="forum-title">Le Forum de la Justice</h1>
        <p className="forum-subtitle">
          Posez vos questions juridiques. La communauté vous répond — avocats et citoyens confondus.
        </p>
      </div>

      {/* Toolbar */}
      <div className="forum-toolbar">
        <div className="forum-filters">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`forum-filter-btn ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="forum-new-btn" onClick={() => setShowNewPost(true)}>
          <Plus size={14} style={{ display: 'inline', marginRight: 6 }} />
          Nouveau Fil
        </button>
      </div>

      {/* Main content */}
      <div className="forum-content">
        {/* Thread list */}
        <div>
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
        </div>

        {/* Sidebar */}
        <aside className="forum-sidebar">
          {/* Fellawra widget */}
          <div className="sidebar-widget fellawra-widget">
            <img src="/fellawra.png" alt="Fellawra" className="fellawra-widget-img" />
            <p className="fellawra-widget-text">
              "Posez votre question — je vous guiderai à travers les méandres de la loi tunisienne."
            </p>
            <button className="fellawra-ask-btn">Demander à Fellawra ⚖</button>
          </div>

          {/* Top contributors */}
          <div className="sidebar-widget">
            <p className="sidebar-widget-title">Contributeurs du Palais</p>
            {TOP_CONTRIBUTORS.map(c => (
              <div className="contributor-item" key={c.rank}>
                <span className="contributor-rank">#{c.rank}</span>
                <div className="contributor-avatar">{c.initials}</div>
                <span className="contributor-name">{c.name}</span>
                <span className="contributor-posts">{c.posts} fils</span>
              </div>
            ))}
          </div>

          {/* Trending tags */}
          <div className="sidebar-widget">
            <p className="sidebar-widget-title">Sujets en Vogue</p>
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
