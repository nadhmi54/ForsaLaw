import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Calendar, Paperclip } from 'lucide-react'
import '../styles/Inbox.css'

// ─── Mock data per conversation ID ─────────────────────────────
const MOCK_CONVERSATIONS = [
  {
    id: 'CNV-001',
    avocatNom: 'Dridi',
    avocatPrenom: 'Youssef',
    status: 'OPEN',
    lastMessagePreview: 'Avez-vous des disponibilités pour une signature ?',
    lastMessageAt: '2026-03-29T10:05:00',
    unreadCount: 0,
  },
  {
    id: 'CNV-002',
    avocatNom: 'Mansour',
    avocatPrenom: 'Sami',
    status: 'OPEN',
    lastMessagePreview: 'Vos documents ont été transmis au greffe.',
    lastMessageAt: '2026-03-28T14:20:00',
    unreadCount: 2,
  },
  {
    id: 'CNV-SYS',
    avocatNom: 'Greffe',
    avocatPrenom: 'Système',
    status: 'CLOSED',
    lastMessagePreview: 'Notification de clôture de dossier.',
    lastMessageAt: '2026-03-24T09:00:00',
    unreadCount: 0,
  },
]

const MOCK_TIMELINES = {
  'CNV-001': [
    {
      type: 'MESSAGE',
      id: 'MSM-1',
      senderRole: 'AVOCAT',
      content: "Bonjour, j'ai bien reçu les pièces du dossier 2026-REC-00142. Il manque cependant le reçu de dépôt.",
      createdAt: '2026-03-29T09:45:00',
    },
    {
      type: 'MESSAGE',
      id: 'MSM-2',
      senderRole: 'CLIENT',
      content: "Bonjour Maître. Je vous transfère le reçu via le portail des pièces jointes immédiatement.",
      createdAt: '2026-03-29T09:52:00',
    },
    {
      type: 'MESSAGE',
      id: 'MSM-3',
      senderRole: 'AVOCAT',
      content: "Parfait. Dès réception, j'introduis la requête auprès du tribunal. Avez-vous des disponibilités pour une signature formelle ?",
      createdAt: '2026-03-29T10:05:00',
    },
    {
      type: 'MEETING',
      id: 'RDV-1',
      idRendezVous: 'RDV-1',
      statutRendezVous: 'PROPOSE',
      motifConsultation: 'Signature requête & stratégie procédurale',
      dateHeureDebut: '2026-04-02T14:30:00',
      dateHeureFin: '2026-04-02T15:30:00',
      typeRendezVous: 'EN_PRESENTIEL',
      creePar: 'AVOCAT',
      createdAt: '2026-03-29T10:10:00',
    },
    {
      type: 'MESSAGE',
      id: 'MSM-4',
      senderRole: 'CLIENT',
      content: "Je confirme ma disponibilité pour le mercredi 2 avril à 14h30. À bientôt, Maître.",
      createdAt: '2026-03-29T10:18:00',
    },
  ],
  'CNV-002': [
    {
      type: 'MESSAGE',
      id: 'MSM-M1',
      senderRole: 'AVOCAT',
      content: "Maître Mansour à votre service. Vos documents ont été transmis au greffe.",
      createdAt: '2026-03-28T14:20:00',
    }
  ],
  'CNV-SYS': [
    {
      type: 'MESSAGE',
      id: 'MSM-S1',
      senderRole: 'AVOCAT',
      content: "Notification de clôture de dossier pour l'affaire #2025-A-99.",
      createdAt: '2026-03-24T09:00:00',
    }
  ]
}

const initials = (prenom, nom) =>
  ((prenom?.[0] ?? '') + (nom?.[0] ?? '')).toUpperCase()

const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''

const fmtDateShort = (iso) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

const fmtDateFull = (iso) =>
  iso ? new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
  }) : ''

const isSameDay = (a, b) =>
  a && b && new Date(a).toDateString() === new Date(b).toDateString()

export default function InboxPage() {
  const [activeId, setActiveId] = useState('CNV-001')
  const [inputText, setInputText] = useState('')
  const [timeline, setTimeline] = useState([])
  const endRef = useRef(null)
  const textareaRef = useRef(null)

  const contact = MOCK_CONVERSATIONS.find((c) => c.id === activeId)
  const isClosed = contact?.status === 'CLOSED'

  useEffect(() => {
    setTimeline(MOCK_TIMELINES[activeId] || [])
    setInputText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [activeId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [timeline])

  const sendMessage = () => {
    const text = inputText.trim()
    if (!text || isClosed) return
    setTimeline((prev) => [
      ...prev,
      {
        type: 'MESSAGE',
        id: `LOCAL-${Date.now()}`,
        senderRole: 'CLIENT',
        content: text,
        createdAt: new Date().toISOString(),
      },
    ])
    setInputText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const onInput = (e) => {
    setInputText(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  return (
    <div className="inbox-page">

      {/* SIDEBAR */}
      <aside className="inbox-sidebar">
        <div className="inbox-sidebar-top">
          <span className="inbox-sidebar-label">Correspondences</span>
          <h1 className="inbox-sidebar-title">Messagerie</h1>
        </div>

        <div className="inbox-contact-list">
          {MOCK_CONVERSATIONS.map((c) => (
            <div
              key={c.id}
              className={`inbox-contact${activeId === c.id ? ' active' : ''}`}
              onClick={() => setActiveId(c.id)}
            >
              <div className="inbox-contact-avatar">
                {initials(c.avocatPrenom, c.avocatNom)}
              </div>
              <div className="inbox-contact-info">
                <span className="inbox-contact-name">
                  {c.avocatNom === 'Greffe' ? 'Greffe — Système' : `Me. ${c.avocatPrenom} ${c.avocatNom}`}
                </span>
                <span className="inbox-contact-preview">
                  {c.status === 'CLOSED' ? 'Dossier clos' : c.lastMessagePreview}
                </span>
              </div>
              <div className="inbox-contact-meta">
                <span className="inbox-contact-time">{fmtTime(c.lastMessageAt)}</span>
                {c.unreadCount > 0 && (
                  <span className="inbox-unread-badge">{c.unreadCount}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* CHAT PANE */}
      <div className="inbox-chat-pane">

        {/* Header */}
        <div className="inbox-chat-header">
          <div className="chat-header-avatar">
            {initials(contact?.avocatPrenom, contact?.avocatNom)}
          </div>
          <div className="chat-header-info">
            <h2 className="chat-header-name">
              {contact?.avocatNom === 'Greffe'
                ? 'Greffe — Système'
                : `Maître ${contact?.avocatPrenom} ${contact?.avocatNom}`}
            </h2>
            <div className="chat-header-status">
              {isClosed ? 'Correspondance fermée' : 'Session active'}
            </div>
          </div>
          <span className="chat-header-id">{contact?.id}</span>
        </div>

        {/* Messages */}
        <div className="inbox-messages">
          <AnimatePresence initial={false}>
            {timeline.length === 0 ? (
               <motion.div 
                 className="inbox-empty-state"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
               >
                 <p>Aucun message dans cette correspondance.</p>
               </motion.div>
            ) : timeline.map((item, idx) => {

              const prevCreatedAt = idx > 0 ? (timeline[idx - 1].createdAt) : null
              const showDate = !isSameDay(item.createdAt, prevCreatedAt)

              if (item.type === 'MESSAGE') {
                const isMe = item.senderRole === 'CLIENT'
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
                            {initials(contact?.avocatPrenom, contact?.avocatNom)}
                          </div>
                        )}
                        <div className="msg-bubble-col">
                          <div className={`msg-bubble ${isMe ? 'sent' : 'received'}`}>
                            {item.content}
                          </div>
                          <div className="msg-time">{fmtTime(item.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              }

              if (item.type === 'MEETING') {
                return (
                  <motion.div
                    key={item.id}
                    className="meeting-card-row"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="meeting-card">
                      <div className="meeting-card-header">
                        <span className="meeting-card-tag">Rendez-vous proposé</span>
                        <span className="meeting-card-id">{item.idRendezVous}</span>
                      </div>

                      <div className="meeting-card-body">
                        <div className="meeting-field full">
                          <span className="meeting-field-label">Date & heure</span>
                          <span className="meeting-field-value">{fmtDateFull(item.dateHeureDebut)}</span>
                        </div>
                        <div className="meeting-field">
                          <span className="meeting-field-label">Modalité</span>
                          <span className="meeting-field-value">
                            {item.typeRendezVous === 'EN_PRESENTIEL' ? '🏛 Présentiel' : '💻 Visioconférence'}
                          </span>
                        </div>
                        <div className="meeting-field">
                          <span className="meeting-field-label">Durée</span>
                          <span className="meeting-field-value">60 minutes</span>
                        </div>
                        <div className="meeting-field full">
                          <span className="meeting-field-label">Motif</span>
                          <span className="meeting-field-value">{item.motifConsultation}</span>
                        </div>
                      </div>

                      {item.statutRendezVous === 'PROPOSE' && item.creePar === 'AVOCAT' && (
                        <div className="meeting-card-actions">
                          <button
                            className="meeting-btn-accept"
                            onClick={() => alert(`RDV ${item.idRendezVous} accepté`)}
                          >
                            Accepter
                          </button>
                          <button
                            className="meeting-btn-refuse"
                            onClick={() => alert(`RDV ${item.idRendezVous} refusé`)}
                          >
                            Décliner
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              }

              return null
            })}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="inbox-input-area">
          <div className="inbox-input-tools">
            <button className="inbox-tool-btn">
              <Calendar size={13} color="var(--gold)" />
              Proposer un RDV
            </button>
            <button className="inbox-tool-btn">
              <Paperclip size={13} color="var(--gold)" />
              Joindre une pièce
            </button>
          </div>

          <div className="inbox-input-row">
            <textarea
              ref={textareaRef}
              className="inbox-text-input"
              rows={1}
              placeholder={isClosed ? 'Correspondance fermée.' : 'Écrire un message…'}
              value={inputText}
              disabled={isClosed}
              onChange={onInput}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoCorrect="off"
              autoComplete="off"
              autoCapitalize="off"
            />
            <button
              className="inbox-send-btn"
              onClick={sendMessage}
              disabled={isClosed || !inputText.trim()}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
