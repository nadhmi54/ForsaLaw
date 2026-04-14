import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Clock, Plus, X, Send, Loader2, Trash2,
  ThumbsUp, ThumbsDown, Heart, Laugh, Lightbulb, ChevronLeft,
  AlertTriangle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext.jsx'
import PageHeader from '../components/PageHeader'
import * as forumApi from '../api/forum.js'
import '../styles/Forum.css'

// ─── Reaction config ──────────────────────────────────────────────────────────
const REACTIONS = [
  { type: 'LIKE',        icon: ThumbsUp,   label: 'J\'aime',     color: '#4ade80' },
  { type: 'DISLIKE',     icon: ThumbsDown, label: 'Pas d\'accord',color: '#f87171' },
  { type: 'LOVE',        icon: Heart,      label: 'J\'adore',    color: '#f472b6' },
  { type: 'LAUGH',       icon: Laugh,      label: 'Drôle',       color: '#facc15' },
  { type: 'INSIGHTFUL',  icon: Lightbulb,  label: 'Instructif',  color: '#60a5fa' },
]

const REACTION_EMOJI = { LIKE: '👍', DISLIKE: '👎', LOVE: '❤️', LAUGH: '😂', INSIGHTFUL: '💡' }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtTime(v) {
  if (!v) return '—'
  try {
    const d = new Date(v)
    const diff = (Date.now() - d.getTime()) / 1000
    if (diff < 60) return 'À l\'instant'
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`
    if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} j`
    return d.toLocaleDateString('fr-FR')
  } catch { return String(v) }
}

function initials(nom) {
  if (!nom) return '?'
  return nom.split(' ').map(p => p[0] ?? '').join('').toUpperCase().slice(0, 2)
}

function roleBadge(role) {
  if (!role) return null
  if (role === 'AVOCAT') return <span className="forum-role-badge avocat">Avocat</span>
  if (role === 'ADMIN') return <span className="forum-role-badge admin">Admin</span>
  return null
}

// ─── New Topic Modal ───────────────────────────────────────────────────────────
function NewTopicModal({ token, onCreated, onClose }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setErr('Le titre et le contenu sont requis.')
      return
    }
    setBusy(true)
    setErr(null)
    try {
      const topic = await forumApi.createTopic(token, { title: title.trim(), content: content.trim() })
      onCreated(topic)
    } catch (e) {
      setErr(e?.message || String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div
      className="forum-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="forum-modal"
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="forum-modal__header">
          <span>Nouveau sujet</span>
          <button type="button" className="forum-modal__close" onClick={onClose}><X size={14} /></button>
        </div>
        <form className="forum-modal__form" onSubmit={handleSubmit}>
          <label className="forum-modal__label">
            Titre
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex : Mon employeur m'a licencié sans préavis…"
              autoFocus
              maxLength={200}
            />
          </label>
          <label className="forum-modal__label">
            Contenu
            <textarea
              rows={6}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Décrivez votre situation en détail…"
            />
          </label>
          {err && (
            <p className="forum-modal__error">
              <AlertTriangle size={13} /> {err}
            </p>
          )}
          <button type="submit" className="forum-modal__submit" disabled={busy}>
            {busy ? <Loader2 className="forsalaw-spin" size={14} /> : <Plus size={14} />}
            Publier le sujet
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Thread Detail View ───────────────────────────────────────────────────────
function ThreadDetail({ topic, token, user, onBack, onTopicDeleted, onMessagesCountChange }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState(null)
  const [reactionMenu, setReactionMenu] = useState(null) // messageId
  const bottomRef = useRef(null)

  const canInteract = user && (user.roleUser === 'client' || user.roleUser === 'avocat' || user.roleUser === 'admin')
  const canDelete = (msg) => user && (user.email === msg.authorEmail || user.id === msg.authorUserId || user.roleUser === 'admin')
  const canDeleteTopic = user && (user.id === topic.authorUserId || user.roleUser === 'admin')

  const loadMessages = useCallback(async () => {
    setLoading(true)
    try {
      const page = await forumApi.listMessages(token, topic.id, { size: 100 })
      setMessages(page?.content ?? [])
    } catch (e) {
      setErr(e?.message || String(e))
    } finally {
      setLoading(false)
    }
  }, [token, topic.id])

  useEffect(() => { loadMessages() }, [loadMessages])
  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async () => {
    if (!reply.trim() || !token) return
    setSending(true)
    setErr(null)
    try {
      const msg = await forumApi.createMessage(token, topic.id, { content: reply.trim() })
      setMessages(prev => [...prev, msg])
      setReply('')
      if (onMessagesCountChange) onMessagesCountChange(1)
    } catch (e) {
      setErr(e?.message || String(e))
    } finally {
      setSending(false)
    }
  }

  const handleDeleteMsg = async (msgId) => {
    if (!token || !window.confirm('Supprimer ce message ?')) return
    try {
      await forumApi.deleteMessage(token, msgId)
      setMessages(prev => prev.filter(m => m.id !== msgId))
      if (onMessagesCountChange) onMessagesCountChange(-1)
    } catch (e) {
      setErr(e?.message || String(e))
    }
  }

  const handleDeleteTopic = async () => {
    if (!token || !window.confirm('Supprimer ce sujet et tous ses messages ?')) return
    try {
      await forumApi.deleteTopic(token, topic.id)
      onTopicDeleted(topic.id)
    } catch (e) {
      setErr(e?.message || String(e))
    }
  }

  const handleReaction = async (msgId, type) => {
    if (!token) return
    setReactionMenu(null)
    const msgIndex = messages.findIndex(m => m.id === msgId)
    if (msgIndex === -1) return
    const msg = messages[msgIndex]
    try {
      let updated
      if (msg.myReaction === type) {
        updated = await forumApi.removeReaction(token, msgId)
      } else {
        updated = await forumApi.setReaction(token, msgId, type)
      }
      setMessages(prev => prev.map(m => m.id === msgId ? updated : m))
    } catch (e) {
      setErr(e?.message || String(e))
    }
  }

  return (
    <motion.div
      className="thread-detail"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.22 }}
    >
      {/* Header */}
      <div className="thread-detail__header">
        <button type="button" className="thread-detail__back" onClick={onBack}>
          <ChevronLeft size={16} /> Retour au forum
        </button>
        {canDeleteTopic && (
          <button type="button" className="thread-detail__del-topic" onClick={handleDeleteTopic}>
            <Trash2 size={13} /> Supprimer le sujet
          </button>
        )}
      </div>

      <div className="thread-detail__title">
        <h2>{topic.title}</h2>
        <div className="thread-detail__meta">
          <div className="author-avatar sm">{initials(topic.authorNomComplet)}</div>
          <span>{topic.authorNomComplet}</span>
          {roleBadge(topic.authorRole)}
          <Clock size={11} style={{ opacity: 0.4 }} />
          <span style={{ opacity: 0.4, fontSize: '0.7rem' }}>{fmtTime(topic.createdAt)}</span>
        </div>
      </div>

      {/* OP content */}
      <div className="thread-detail__op">
        <p>{topic.content}</p>
      </div>

      {/* Messages */}
      <div className="thread-detail__messages">
        {err && (
          <div className="forum-err"><AlertTriangle size={14} /> {err}</div>
        )}
        {loading && (
          <div className="thread-detail__loading"><Loader2 className="forsalaw-spin" size={22} style={{ color: 'var(--gold)' }} /></div>
        )}
        {!loading && messages.length === 0 && (
          <div className="thread-detail__empty">Aucune réponse pour le moment. Soyez le premier à répondre.</div>
        )}
        {!loading && messages.map((msg, i) => {
          const totalReactions = Object.values(msg.reactionCounts ?? {}).reduce((s, v) => s + v, 0)
          return (
            <motion.div
              key={msg.id}
              className="forum-msg"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="forum-msg__avatar">{initials(msg.authorNomComplet)}</div>
              <div className="forum-msg__body">
                <div className="forum-msg__meta">
                  <span className="forum-msg__author">{msg.authorNomComplet}</span>
                  {roleBadge(msg.authorRole)}
                  <span className="forum-msg__time"><Clock size={10} /> {fmtTime(msg.createdAt)}</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
                    {canInteract && (
                      <button
                        type="button"
                        className="forum-msg__react-btn"
                        onClick={() => setReactionMenu(reactionMenu === msg.id ? null : msg.id)}
                        title="Réagir"
                      >
                        {msg.myReaction ? REACTION_EMOJI[msg.myReaction] : '😶'}
                      </button>
                    )}
                    {canDelete(msg) && (
                      <button type="button" className="forum-msg__del" onClick={() => handleDeleteMsg(msg.id)}>
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="forum-msg__content">{msg.content}</p>
                {/* Reaction counts */}
                {totalReactions > 0 && (
                  <div className="forum-msg__reactions">
                    {Object.entries(msg.reactionCounts ?? {}).filter(([, v]) => v > 0).map(([type, count]) => (
                      <span
                        key={type}
                        className={`forum-msg__reaction-pill${msg.myReaction === type ? ' mine' : ''}`}
                        onClick={() => canInteract && handleReaction(msg.id, type)}
                        style={{ cursor: canInteract ? 'pointer' : 'default' }}
                      >
                        {REACTION_EMOJI[type]} {count}
                      </span>
                    ))}
                  </div>
                )}
                {/* Reaction picker */}
                <AnimatePresence>
                  {reactionMenu === msg.id && (
                    <motion.div
                      className="forum-reaction-picker"
                      initial={{ opacity: 0, scale: 0.85, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.85, y: 4 }}
                      transition={{ duration: 0.15 }}
                    >
                      {REACTIONS.map(r => {
                        const Icon = r.icon
                        const active = msg.myReaction === r.type
                        return (
                          <button
                            key={r.type}
                            type="button"
                            className={`forum-reaction-btn${active ? ' active' : ''}`}
                            title={r.label}
                            style={{ '--rc': r.color }}
                            onClick={() => handleReaction(msg.id, r.type)}
                          >
                            <Icon size={16} />
                          </button>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      {canInteract ? (
        <div className="thread-detail__reply">
          <textarea
            className="thread-detail__textarea"
            rows={3}
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder="Votre réponse…"
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSend() }}
          />
          <button
            type="button"
            className="thread-detail__send"
            disabled={sending || !reply.trim()}
            onClick={handleSend}
          >
            {sending ? <Loader2 className="forsalaw-spin" size={14} /> : <Send size={14} />}
            Publier
          </button>
        </div>
      ) : (
        <div className="thread-detail__login-prompt">
          Connectez-vous pour participer à la discussion.
        </div>
      )}
    </motion.div>
  )
}

// ─── Thread Card Component ────────────────────────────────────────────────────
function ThreadCard({ topic, onClick }) {
  return (
    <motion.div
      className="thread-card"
      whileHover={{ x: 3 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="thread-body">
        <p className="thread-title">{topic.title}</p>
        <p className="thread-excerpt">{topic.content?.slice(0, 160)}{(topic.content?.length ?? 0) > 160 ? '…' : ''}</p>
        <div className="thread-meta">
          <span className="thread-author">
            <div className="author-avatar">{initials(topic.authorNomComplet)}</div>
            {topic.authorNomComplet}
            {roleBadge(topic.authorRole)}
          </span>
          <span className="thread-time">
            <Clock size={12} />
            {fmtTime(topic.updatedAt)}
          </span>
        </div>
      </div>
      <div className="thread-stats">
        <div className="stat-item tooltip-container">
          <MessageSquare size={16} />
          <span>{topic.messagesCount ?? 0}</span>
          <span className="tooltip">Réponses</span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── TRENDING TAGS (static visual fallback) ───────────────────────────────────
const TRENDING_TAGS = ['#Réclamation', '#Divorce', '#Travail', '#Immobilier', '#Pénal', '#Tutelle', '#Succession', '#CNSS']

// ─── Forum Page ───────────────────────────────────────────────────────────────
export default function ForumPage() {
  const { t } = useTranslation()
  const { token, user, isAuthenticated } = useAuth()

  const [topics,      setTopics]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [err,         setErr]         = useState(null)
  const [showNewPost, setShowNewPost] = useState(false)
  const [activeTopic, setActiveTopic] = useState(null) // ForumTopicDTO

  const canPost = isAuthenticated && user && (user.roleUser === 'client' || user.roleUser === 'avocat')

  const loadTopics = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const page = await forumApi.listTopics(token, { size: 50 })
      setTopics(page?.content ?? [])
    } catch (e) {
      setErr(e?.message || String(e))
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadTopics() }, [loadTopics])

  const handleTopicCreated = (topic) => {
    setTopics(prev => [topic, ...prev])
    setShowNewPost(false)
    setActiveTopic(topic)
  }

  const handleTopicDeleted = (topicId) => {
    setTopics(prev => prev.filter(t => t.id !== topicId))
    setActiveTopic(null)
  }

  const handleMessagesCountChange = (delta) => {
    setActiveTopic(prev => prev ? { ...prev, messagesCount: (prev.messagesCount ?? 0) + delta } : null)
    setTopics(prev => prev.map(t => t.id === activeTopic?.id ? { ...t, messagesCount: (t.messagesCount ?? 0) + delta } : t))
  }

  // If a topic is selected, show detail view
  if (activeTopic) {
    return (
      <div className="forum-page">
        <PageHeader
          className="forum-header"
          tag={t('forum_tag')}
          tagClassName="forum-header-tag"
          title={t('forum_title')}
          titleClassName="forum-title"
        />
        <div className="forum-content">
          <AnimatePresence mode="wait">
            <ThreadDetail
              key={activeTopic.id}
              topic={activeTopic}
              token={token}
              user={user}
              onBack={() => setActiveTopic(null)}
              onTopicDeleted={handleTopicDeleted}
              onMessagesCountChange={handleMessagesCountChange}
            />
          </AnimatePresence>
          <aside className="forum-sidebar">
            <SidebarWidgets t={t} topics={topics} onSelectTopic={setActiveTopic} />
          </aside>
        </div>
      </div>
    )
  }

  return (
    <div className="forum-page">
      <PageHeader
        className="forum-header"
        tag={t('forum_tag')}
        tagClassName="forum-header-tag"
        title={t('forum_title')}
        titleClassName="forum-title"
      />

      {/* Toolbar */}
      <section className="forum-toolbar">
        <div className="forum-filters">
          <span className="forum-count-label">
            {loading ? <Loader2 className="forsalaw-spin" size={14} style={{ color: 'var(--gold)' }} /> : `${topics.length} sujets`}
          </span>
        </div>
        <div className="forum-actions">
          {canPost ? (
            <button className="forum-new-btn" onClick={() => setShowNewPost(true)}>
              <Plus size={14} style={{ display: 'inline', marginRight: 5 }} />
              {t('forum_new_post')}
            </button>
          ) : (
            <span className="forum-login-hint">Connectez-vous pour poster</span>
          )}
        </div>
      </section>

      {/* Main content */}
      <div className="forum-content">
        <div className="forum-threads">
          {err && <div className="forum-err"><AlertTriangle size={14} /> {err}</div>}
          {loading && (
            <div className="forum-loading">
              {[0,1,2,3].map(i => (
                <div key={i} className="forum-skeleton" style={{ animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
          )}
          <AnimatePresence mode="popLayout">
            {!loading && topics.map((topic, i) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.18, delay: i * 0.04 }}
              >
                <ThreadCard topic={topic} onClick={() => setActiveTopic(topic)} />
              </motion.div>
            ))}
          </AnimatePresence>
          {!loading && topics.length === 0 && !err && (
            <div className="forum-empty">
              <p>Aucun sujet pour le moment.</p>
              {canPost && (
                <button className="forum-new-btn" style={{ marginTop: '1rem' }} onClick={() => setShowNewPost(true)}>
                  Créer le premier sujet
                </button>
              )}
            </div>
          )}
        </div>

        <aside className="forum-sidebar">
          <SidebarWidgets t={t} topics={topics} onSelectTopic={setActiveTopic} />
        </aside>
      </div>

      {/* New Topic Modal */}
      <AnimatePresence>
        {showNewPost && isAuthenticated && (
          <NewTopicModal
            key="new-topic-modal"
            token={token}
            onCreated={handleTopicCreated}
            onClose={() => setShowNewPost(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Sidebar Widgets ──────────────────────────────────────────────────────────
function SidebarWidgets({ t, topics, onSelectTopic }) {
  const recent = [...topics]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)

  const topReplied = [...topics]
    .sort((a, b) => (b.messagesCount ?? 0) - (a.messagesCount ?? 0))
    .slice(0, 4)

  return (
    <>
      <div className="sidebar-widget fellawra-widget">
        <img src="/fellawra.png" alt="Fellawra" className="fellawra-widget-img" />
        <p className="fellawra-widget-text">{t('forum_fellawra_text')}</p>
        <button className="fellawra-ask-btn">{t('forum_ask_fellawra')}</button>
      </div>

      {topReplied.length > 0 && (
        <div className="sidebar-widget">
          <p className="sidebar-widget-title">Plus actifs</p>
          {topReplied.map((topic, i) => (
            <div key={topic.id} className="contributor-item" style={{ cursor: 'pointer' }} onClick={() => onSelectTopic(topic)}>
              <span className="contributor-rank">#{i + 1}</span>
              <div className="contributor-avatar sm">{initials(topic.authorNomComplet)}</div>
              <span className="contributor-name" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.72rem' }}>
                {topic.title}
              </span>
              <span className="contributor-posts">{topic.messagesCount ?? 0} rép.</span>
            </div>
          ))}
        </div>
      )}

      <div className="sidebar-widget">
        <p className="sidebar-widget-title">{t('forum_trending')}</p>
        <div className="trending-tags">
          {TRENDING_TAGS.map(tag => (
            <button key={tag} className="trending-tag">{tag}</button>
          ))}
        </div>
      </div>
    </>
  )
}
