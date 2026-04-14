import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Calendar, Paperclip, Loader2, X } from 'lucide-react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import * as messengerApi from '../api/messenger.js'
import * as rdvApi from '../api/rdv.js'
import '../styles/Inbox.css'

const initials = (prenom, nom) =>
  ((prenom?.[0] ?? '') + (nom?.[0] ?? '')).toUpperCase()

const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''

const fmtDateShort = (iso) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

const isSameDay = (a, b) =>
  a && b && new Date(a).toDateString() === new Date(b).toDateString()

function displayNameForConversation(c, roleUser) {
  if (roleUser === 'avocat') return `${c.clientPrenom ?? ''} ${c.clientNom ?? ''}`.trim() || 'Client'
  return `Me. ${c.avocatPrenom ?? ''} ${c.avocatNom ?? ''}`.trim() || 'Avocat'
}

export default function InboxPage() {
  const { token, user, isAuthenticated } = useAuth()
  const roleUser = user?.roleUser
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  // RDV Proposal panel (avocat only)
  const [showRdvPanel, setShowRdvPanel] = useState(false)
  const [proposeStart, setProposeStart] = useState('')
  const [proposeEnd, setProposeEnd] = useState('')
  const [proposeType, setProposeType] = useState('EN_LIGNE')
  const [proposeComment, setProposeComment] = useState('')
  const [rdvBusy, setRdvBusy] = useState(false)
  const [rdvMsg, setRdvMsg] = useState(null)

  const endRef = useRef(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  )
  const isClosed = activeConversation?.status === 'CLOSED'

  const loadConversations = useCallback(async () => {
    if (!token || !roleUser) return
    setLoadingConversations(true)
    setErrorMsg(null)
    try {
      const page = await messengerApi.listConversations(token, roleUser, { page: 0, size: 50 })
      const list = page?.content ?? []
      setConversations(list)
      setActiveId((prev) => (prev && list.some((c) => c.id === prev) ? prev : list[0]?.id ?? null))
    } catch (e) {
      setErrorMsg(e?.message || String(e))
    } finally {
      setLoadingConversations(false)
    }
  }, [token, roleUser])

  const loadMessages = useCallback(async () => {
    if (!token || !roleUser || !activeId) return
    setLoadingMessages(true)
    setErrorMsg(null)
    try {
      const page = await messengerApi.getConversationMessages(token, roleUser, activeId, { page: 0, size: 150 })
      setMessages(page?.content ?? [])
      await messengerApi.markConversationRead(token, roleUser, activeId)
      setConversations((prev) => prev.map((c) => (c.id === activeId ? { ...c, unreadCount: 0 } : c)))
    } catch (e) {
      setErrorMsg(e?.message || String(e))
    } finally {
      setLoadingMessages(false)
    }
  }, [token, roleUser, activeId])

  useEffect(() => {
    if (!token || !isAuthenticated) return
    loadConversations()
  }, [token, isAuthenticated, loadConversations])

  useEffect(() => {
    if (!token || !roleUser) return
    const avocatId = searchParams.get('avocatId')
    const clientUserId = searchParams.get('clientUserId')
    const targetId = roleUser === 'avocat' ? clientUserId : avocatId
    if (!targetId) return
    ;(async () => {
      try {
        const conv = await messengerApi.openOrGetConversation(token, roleUser, targetId)
        setConversations((prev) => (prev.some((c) => c.id === conv.id) ? prev : [conv, ...prev]))
        setActiveId(conv.id)
        setSearchParams({})
      } catch (e) {
        setErrorMsg(e?.message || String(e))
      }
    })()
  }, [token, roleUser, searchParams, setSearchParams])

  useEffect(() => {
    if (!activeId) {
      setMessages([])
      return
    }
    loadMessages()
    setInputText('')
    setSelectedFiles([])
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [activeId, loadMessages])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!isAuthenticated || !token) {
    return <Navigate to="/" replace />
  }
  if (roleUser !== 'client' && roleUser !== 'avocat') {
    return <Navigate to="/" replace />
  }

  const onInput = (e) => {
    setInputText(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  const onSelectFiles = (e) => {
    const files = Array.from(e.target.files ?? [])
    setSelectedFiles(files)
    e.target.value = ''
  }

  const removeFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  const sendMessage = async () => {
    if (!token || !roleUser || !activeConversation || sending || isClosed) return
    const text = inputText.trim()
    if (!text && selectedFiles.length === 0) return

    setSending(true)
    setErrorMsg(null)
    try {
      if (selectedFiles.length > 0) {
        const created = await messengerApi.sendMessageWithAttachments(token, roleUser, activeConversation.id, {
          content: text,
          files: selectedFiles,
        })
        setMessages((prev) => [...prev, created])
      } else {
        const targetId = roleUser === 'avocat' ? activeConversation.clientUserId : activeConversation.avocatId
        const result = await messengerApi.sendTextMessage(token, roleUser, targetId, text)
        setMessages((prev) => [...prev, result.message])
      }
      setInputText('')
      setSelectedFiles([])
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
      await loadConversations()
    } catch (e) {
      setErrorMsg(e?.message || String(e))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="inbox-page">
      <aside className="inbox-sidebar">
        <div className="inbox-sidebar-top">
          <span className="inbox-sidebar-label">Correspondences</span>
          <h1 className="inbox-sidebar-title">Messagerie</h1>
        </div>

        <div className="inbox-contact-list">
          {loadingConversations && (
            <div className="inbox-empty-state"><Loader2 className="forsalaw-spin" size={18} /></div>
          )}

          {!loadingConversations && conversations.length === 0 && (
            <div className="inbox-empty-state" style={{ flexDirection: 'column', gap: '0.75rem' }}>
              <p>Aucune conversation pour le moment.</p>
              {roleUser === 'client' && (
                <button className="inbox-tool-btn" type="button" onClick={() => navigate('/lawyers')}>
                  Ouvrir depuis la liste des avocats
                </button>
              )}
            </div>
          )}

          {conversations.map((c) => (
            <div
              key={c.id}
              className={`inbox-contact${activeId === c.id ? ' active' : ''}`}
              onClick={() => setActiveId(c.id)}
            >
              <div className="inbox-contact-avatar">
                {roleUser === 'avocat'
                  ? initials(c.clientPrenom, c.clientNom)
                  : initials(c.avocatPrenom, c.avocatNom)}
              </div>
              <div className="inbox-contact-info">
                <span className="inbox-contact-name">{displayNameForConversation(c, roleUser)}</span>
                <span className="inbox-contact-preview">
                  {c.status === 'CLOSED' ? 'Correspondance fermée' : (c.lastMessagePreview || '—')}
                </span>
              </div>
              <div className="inbox-contact-meta">
                <span className="inbox-contact-time">{fmtTime(c.lastMessageAt || c.updatedAt)}</span>
                {c.unreadCount > 0 && (
                  <span className="inbox-unread-badge">{c.unreadCount > 99 ? '99+' : c.unreadCount}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="inbox-chat-pane">
        <div className="inbox-chat-header">
          <div className="chat-header-avatar">
            {activeConversation
              ? roleUser === 'avocat'
                ? initials(activeConversation.clientPrenom, activeConversation.clientNom)
                : initials(activeConversation.avocatPrenom, activeConversation.avocatNom)
              : '--'}
          </div>
          <div className="chat-header-info">
            <h2 className="chat-header-name">
              {activeConversation ? displayNameForConversation(activeConversation, roleUser) : 'Aucune conversation'}
            </h2>
            <div className="chat-header-status">
              {isClosed ? 'Correspondance fermée' : 'Session active'}
            </div>
          </div>
          <span className="chat-header-id">{activeConversation?.id}</span>
        </div>

        {errorMsg && (
          <div style={{ color: '#ffb4a8', fontSize: '0.8rem', padding: '0.5rem 2rem', background: '#221010' }}>
            {errorMsg}
          </div>
        )}

        <div className="inbox-messages">
          {loadingMessages && (
            <div className="inbox-empty-state"><Loader2 className="forsalaw-spin" size={18} /></div>
          )}

          {!loadingMessages && activeConversation && (
            <AnimatePresence initial={false}>
              {messages.length === 0 ? (
                <motion.div className="inbox-empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p>Aucun message dans cette conversation.</p>
                </motion.div>
              ) : messages.map((item, idx) => {
                const prevCreatedAt = idx > 0 ? messages[idx - 1].createdAt : null
                const showDate = !isSameDay(item.createdAt, prevCreatedAt)
                const isMe = roleUser === 'avocat' ? item.senderRole === 'AVOCAT' : item.senderRole === 'CLIENT'
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {showDate && (
                      <div className="msg-date-separator">
                        <span>{fmtDateShort(item.createdAt)}</span>
                      </div>
                    )}
                    <div className={`msg-row ${isMe ? 'from-me' : 'from-them'}`}>
                      <div className="msg-row-inner">
                        {!isMe && (
                          <div className="msg-avatar">
                            {activeConversation && (roleUser === 'avocat'
                              ? initials(activeConversation.clientPrenom, activeConversation.clientNom)
                              : initials(activeConversation.avocatPrenom, activeConversation.avocatNom))}
                          </div>
                        )}
                        <div className="msg-bubble-col">
                          <div className={`msg-bubble ${isMe ? 'sent' : 'received'}`}>
                            {item.content}
                            {Array.isArray(item.attachments) && item.attachments.length > 0 && (
                              <div style={{ marginTop: '0.5rem' }}>
                                {item.attachments.map((a) => (
                                  <a
                                    key={a.id}
                                    href={a.downloadUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ display: 'block', color: 'inherit', textDecoration: 'underline', marginTop: '0.25rem' }}
                                  >
                                    {a.originalFilename}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="msg-time">{fmtTime(item.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
          <div ref={endRef} />
        </div>

        <div className="inbox-input-area">
          <div className="inbox-input-tools">
            {roleUser === 'avocat' && (
              <button
                className={`inbox-tool-btn${showRdvPanel ? ' active' : ''}`}
                type="button"
                onClick={() => { setShowRdvPanel((p) => !p); setRdvMsg(null) }}
                disabled={isClosed || !activeConversation}
              >
                <Calendar size={13} color="var(--gold)" />
                Proposer un RDV
              </button>
            )}
            <button
              className="inbox-tool-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isClosed || sending || !activeConversation}
            >
              <Paperclip size={13} color="var(--gold)" />
              Joindre une pièce
            </button>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.gif,.webp"
              onChange={onSelectFiles}
            />
          </div>

          {/* RDV Proposal panel — avocat only */}
          <AnimatePresence>
            {showRdvPanel && roleUser === 'avocat' && activeConversation && (
              <motion.div
                className="inbox-rdv-panel"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <div className="inbox-rdv-panel__header">
                  <span>Proposer un créneau</span>
                  <button type="button" className="inbox-rdv-panel__close" onClick={() => setShowRdvPanel(false)}>
                    <X size={14} />
                  </button>
                </div>
                <div className="inbox-rdv-panel__body">
                  <label className="inbox-rdv-label">
                    <span>Début</span>
                    <input type="datetime-local" value={proposeStart} onChange={(e) => setProposeStart(e.target.value)} />
                  </label>
                  <label className="inbox-rdv-label">
                    <span>Fin</span>
                    <input type="datetime-local" value={proposeEnd} onChange={(e) => setProposeEnd(e.target.value)} />
                  </label>
                  <label className="inbox-rdv-label">
                    <span>Type</span>
                    <select value={proposeType} onChange={(e) => setProposeType(e.target.value)}>
                      <option value="EN_LIGNE">En ligne</option>
                      <option value="CABINET">Cabinet</option>
                      <option value="TELEPHONE">Téléphone</option>
                    </select>
                  </label>
                  <label className="inbox-rdv-label inbox-rdv-label--full">
                    <span>Commentaire (optionnel)</span>
                    <input
                      type="text"
                      value={proposeComment}
                      onChange={(e) => setProposeComment(e.target.value)}
                      placeholder="ex: Préparez vos documents..."
                    />
                  </label>
                </div>
                {rdvMsg && <p className="inbox-rdv-msg">{rdvMsg}</p>}
                <button
                  className="inbox-rdv-submit"
                  type="button"
                  disabled={rdvBusy || !proposeStart || !proposeEnd}
                  onClick={async () => {
                    if (!token || !activeConversation) return
                    // Find the rdv matching this conversation's client
                    setRdvBusy(true)
                    setRdvMsg(null)
                    try {
                      // List received RDV requests and find one EN_ATTENTE for this client
                      const rdvPage = await rdvApi.listLawyerAppointments(token, { page: 0, size: 50 })
                      const pending = (rdvPage?.content ?? []).find(
                        (r) => r.statutRendezVous === 'EN_ATTENTE' &&
                          String(r.clientUserId ?? r.clientId) === String(activeConversation.clientUserId)
                      )
                      if (!pending) {
                        setRdvMsg('Aucune demande EN_ATTENTE pour ce client.')
                        return
                      }
                      await rdvApi.lawyerProposeSlot(token, pending.idRendezVous, {
                        dateHeureDebut: proposeStart,
                        dateHeureFin: proposeEnd,
                        typeRendezVous: proposeType,
                        commentaireAvocat: proposeComment.trim() || undefined,
                      })
                      setRdvMsg('✓ Créneau proposé avec succès.')
                      setProposeStart('')
                      setProposeEnd('')
                      setProposeComment('')
                    } catch (e) {
                      setRdvMsg(e?.message || String(e))
                    } finally {
                      setRdvBusy(false)
                    }
                  }}
                >
                  {rdvBusy ? <Loader2 className="forsalaw-spin" size={14} /> : <Calendar size={14} />}
                  Envoyer la proposition
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {selectedFiles.length > 0 && (
            <div style={{ marginBottom: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {selectedFiles.map((f, idx) => (
                <button
                  key={`${f.name}-${idx}`}
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="inbox-tool-btn"
                  style={{ borderColor: 'rgba(212,175,55,0.25)' }}
                >
                  {f.name} ×
                </button>
              ))}
            </div>
          )}

          <div className="inbox-input-row">
            <textarea
              ref={textareaRef}
              className="inbox-text-input"
              rows={1}
              placeholder={isClosed ? 'Correspondance fermée.' : 'Écrire un message…'}
              value={inputText}
              disabled={isClosed || sending || !activeConversation}
              onChange={onInput}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoCorrect="off"
              autoComplete="off"
              autoCapitalize="off"
            />
            <button
              className="inbox-send-btn"
              onClick={() => void sendMessage()}
              disabled={isClosed || sending || (!inputText.trim() && selectedFiles.length === 0)}
            >
              {sending ? <Loader2 className="forsalaw-spin" size={16} /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
