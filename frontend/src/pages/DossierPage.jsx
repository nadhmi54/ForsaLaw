import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Fingerprint,
  FileText,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UploadCloud,
  Plus,
  Loader2,
  X,
  AlertTriangle,
  Download,
  History,
  Lock,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import * as documentsApi from '../api/documents.js'
import '../styles/Dossier.css'

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// ─── Upload Document Modal ───────────────────────────────────────────────────
function UploadDocumentModal({ token, onUploaded, onClose }) {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setErr('Veuillez sélectionner un fichier.')
      return
    }
    setBusy(true)
    setErr(null)
    try {
      const dto = await documentsApi.uploadDocument(token, file)
      onUploaded(dto)
    } catch (error) {
      setErr(error?.message || String(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div
      className="dossier-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="dossier-modal"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dossier-modal__header">
          <h2>Dépôt Sécurisé</h2>
          <button type="button" className="dossier-modal__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <form className="dossier-modal__form" onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem', color: 'var(--gold)', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(212,175,55,0.1)', padding: '1rem', border: '1px solid var(--gold)' }}>
             <Shield size={24} style={{ flexShrink: 0 }} />
             <p>Tout fichier déposé dans le coffre-fort sera horodaté et son intégrité scellée via une empreinte cryptographique SHA-256 inviolable.</p>
          </div>
          <label className="dossier-modal__label">
            <span>Fichier à sceller</span>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              disabled={busy}
              style={{ border: '2px solid var(--black)', padding: '0.5rem' }}
            />
          </label>
          
          {err && (
            <p className="dossier-modal__error">
              <AlertTriangle size={14} /> {err}
            </p>
          )}
          <button type="submit" className="dossier-modal__submit" disabled={busy || !file}>
            {busy ? <Loader2 className="forsalaw-spin" size={16} /> : <UploadCloud size={16} />}
            Sceller et Uploader
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Page Component ──────────────────────────────────────────────────────
const DossierPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { token, isAuthenticated, user } = useAuth()

  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [activeDoc, setActiveDoc] = useState(null)
  
  // History timeline
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Integrity Check
  const [verificationResult, setVerificationResult] = useState(null)
  const [verifying, setVerifying] = useState(false)

  const [showUploadModal, setShowUploadModal] = useState(false)

  const loadDocuments = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setLoadError(null)
    try {
      const page = await documentsApi.listMyDocuments(token, { page: 0, size: 50 })
      const list = page?.content ?? []
      setDocuments(list)
      if (list.length > 0 && !activeDoc) {
        setActiveDoc(list[0])
      }
    } catch (e) {
      setLoadError(e?.message || String(e))
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!token || !isAuthenticated) return
    loadDocuments()
  }, [token, isAuthenticated, loadDocuments])

  // Load History when activeDoc changes
  useEffect(() => {
    if (!activeDoc || !token) {
      setHistory([])
      setVerificationResult(null)
      return
    }
    let cancelled = false
    setVerificationResult(null)
    setHistoryLoading(true)
    documentsApi.getDocumentHistory(token, activeDoc.id, { size: 50 })
      .then((page) => { if (!cancelled) setHistory(page?.content ?? []) })
      .catch(() => { if (!cancelled) setHistory([]) })
      .finally(() => { if (!cancelled) setHistoryLoading(false) })
    return () => { cancelled = true }
  }, [activeDoc?.id, token])

  const handleDocumentUploaded = (dto) => {
    setDocuments((prev) => [dto, ...prev])
    setActiveDoc(dto)
    setShowUploadModal(false)
  }

  const handleDownload = async () => {
    if (!token || !activeDoc) return
    try {
      const blob = await documentsApi.downloadDocument(token, activeDoc.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = activeDoc.nomOriginal || 'document.pdf'
      a.click()
      URL.revokeObjectURL(url)
      
      // Auto-refresh history to show DOWNLOAD action
      const page = await documentsApi.getDocumentHistory(token, activeDoc.id, { size: 50 })
      setHistory(page?.content ?? [])
    } catch (err) {
      window.alert('Erreur lors du téléchargement : ' + err.message)
    }
  }

  const handleVerifyIntegrity = async () => {
    if (!token || !activeDoc) return
    setVerifying(true)
    setVerificationResult(null)
    try {
      const res = await documentsApi.verifyIntegrity(token, activeDoc.id)
      setVerificationResult(res)
      
      // Auto-refresh history to show VERIFY_INTEGRITY action
      const page = await documentsApi.getDocumentHistory(token, activeDoc.id, { size: 50 })
      setHistory(page?.content ?? [])
    } catch (err) {
      window.alert('Échec de la vérification : ' + err.message)
    } finally {
      setVerifying(false)
    }
  }

  // ─── Redirect if not authenticated ────────────────────────────────────────
  if (!isAuthenticated || !token) {
    return (
      <div className="dossier-page">
        <div className="dossier-header">
          <div className="dossier-header-tag">SÉCURITÉ</div>
          <h1 className="dossier-title">COFFRE-FORT NUMÉRIQUE</h1>
        </div>
        <div style={{ padding: '3rem 2rem', textAlign: 'center', opacity: 0.6 }}>
          <p>Veuillez vous <button className="dossier-inline-link" onClick={() => navigate('/auth')}>connecter</button> pour accéder à votre coffre-fort.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dossier-page">
      {/* Header */}
      <div className="dossier-header">
        <div className="dossier-header-tag">SÉCURITÉ & AUDIT</div>
        <h1 className="dossier-title">COFFRE-FORT NUMÉRIQUE</h1>
        <div style={{ marginTop: '1rem', height: '1px', background: 'var(--gold)', width: '200px', opacity: 0.3 }} />
      </div>

      <div className="dossier-content">
        {/* Left: The Vault Index */}
        <aside className="dossier-list">
          <div className="dossier-list-header">
            <span>MES FICHIERS SCELLÉS</span>
            <button className="new-case-btn" onClick={() => setShowUploadModal(true)}>
              <Plus size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Dépôt
            </button>
          </div>

          {loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gold)' }}>
              <Loader2 className="forsalaw-spin" size={22} />
            </div>
          )}

          {loadError && (
            <div style={{ padding: '1rem', color: '#ff8a80', fontSize: '0.8rem' }}>
              <AlertTriangle size={14} style={{ display: 'inline', marginRight: '0.35rem' }} />
              {loadError}
            </div>
          )}

          {!loading && documents.length === 0 && !loadError && (
            <div style={{ padding: '2rem 1rem', opacity: 0.6, fontSize: '0.8rem', textAlign: 'center' }}>
              Le coffre-fort est vide.
              <br />
              <button className="new-case-btn" style={{ marginTop: '1rem' }} onClick={() => setShowUploadModal(true)}>
                Sécuriser un document
              </button>
            </div>
          )}

          <div className="folders-container">
            {documents.map((doc, idx) => (
              <motion.div
                key={doc.id}
                className={`case-folder ${activeDoc?.id === doc.id ? 'active' : ''}`}
                onClick={() => setActiveDoc(doc)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="case-folder-id" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Lock size={10} /> {(doc.id && typeof doc.id === 'string' && doc.id.includes('-')) ? doc.id.split('-')[1] : doc.id}
                </div>
                <div className="case-folder-title" style={{ wordBreak: 'break-all' }}>
                  {(doc.nomOriginal || 'Document').toUpperCase()}
                </div>
                <div style={{ marginTop: '0.5rem', opacity: 0.7, fontSize: '0.65rem' }}>
                   {fmtDate(doc.dateCreation)}
                </div>
              </motion.div>
            ))}
          </div>
        </aside>

        {/* Right: The Open Record */}
        <main>
          <AnimatePresence mode="wait">
            {activeDoc ? (
              <motion.div
                key={activeDoc.id}
                className="dossier-record"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.35 }}
              >
                <div className="dossier-paper">
                  {/* Status Stamp */}
                  <div className={`status-seal status-FERMEE`} style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>
                     SCELLÉ CRYPTO
                  </div>
                  <div className="dossier-paper-content">
                    <div className="record-content">
                      <div className="record-meta">
                        <span className="meta-tag">MIME: {activeDoc.typeContenu || 'application/octet-stream'}</span>
                        <span className="meta-tag">TAILLE: {((activeDoc.tailleFichier || 0) / 1024).toFixed(2)} KB</span>
                        {activeDoc.contexteType && <span className="meta-tag">CTX: {activeDoc.contexteType}</span>}
                      </div>

                      <h2 className="dossier-record-title" style={{ wordBreak: 'break-all' }}>{activeDoc.nomOriginal}</h2>

                      <div className="record-desc" style={{ padding: '1rem', background: '#1c1c1c', border: '1px solid #333' }}>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontFamily: 'monospace', color: 'var(--gold)', wordBreak: 'break-all', fontSize: '0.8rem' }}>
                            <Fingerprint size={16} style={{ flexShrink: 0 }} /> 
                            {activeDoc.hashSha256}
                        </p>
                        <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '0.5rem', marginBottom: 0 }}>
                            Empreinte cryptographique immuable stockée lors du dépôt.
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                          <button className="new-case-btn" style={{ padding: '0.5rem 1rem' }} onClick={handleDownload}>
                              <Download size={14} style={{ display: 'inline', marginRight: '0.5rem' }} /> Télécharger l'original
                          </button>
                          <button className="brutal-btn" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleVerifyIntegrity} disabled={verifying}>
                              {verifying ? <Loader2 size={14} className="forsalaw-spin" /> : <Shield size={14} />} 
                              Vérifier l'intégrité
                          </button>
                      </div>
                      
                      {verificationResult && (
                          <motion.div 
                             initial={{ opacity: 0, height: 0 }} 
                             animate={{ opacity: 1, height: 'auto' }} 
                             style={{ 
                                marginTop: '1rem', 
                                padding: '1rem', 
                                border: verificationResult.integreite ? '2px solid #558b2f' : '2px solid #b71c1c',
                                background: verificationResult.integreite ? 'rgba(85,139,47,0.1)' : 'rgba(183,28,28,0.1)'
                             }}>
                              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.5rem 0', color: verificationResult.integreite ? '#8bc34a' : '#ff5252' }}>
                                  {verificationResult.integreite ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                                  {verificationResult.integreite ? "INTÉGRITÉ CONFIRMÉE" : "VIOLATION D'INTÉGRITÉ DÉTECTÉE"}
                              </h4>
                              <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: 0 }}>
                                {verificationResult.integreite 
                                    ? "Le fichier stocké correspond physiquement bit pour bit à son empreinte d'origine. Aucune altération n'a été subie depuis le premier scellé."
                                    : "ALERTE ! Le fichier physique a été modifié, supprimé ou altéré depuis sa création. Son intégrité légale est compromise."}
                              </p>
                          </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Access History Action Panel */}
                  <div className="dossier-actions-panel" style={{ marginTop: '2rem' }}>
                    <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <History size={16} /> JOURNAL D'AUDIT
                    </h3>

                    <div className="dossier-timeline">
                      {historyLoading && (
                        <div style={{ padding: '1rem', color: 'var(--gold)' }}>
                          <Loader2 className="forsalaw-spin" size={18} />
                        </div>
                      )}
                      {!historyLoading && history.length === 0 && (
                        <p style={{ opacity: 0.5, fontSize: '0.8rem', padding: '0.5rem 0' }}>
                          Aucun historique disponible.
                        </p>
                      )}
                      {history.map((log) => (
                        <div key={log.idLog} className="timeline-item">
                          <div className="timeline-avatar" style={{ border: '1px solid var(--black)' }}>
                             <Shield size={14} />
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-meta" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                              <strong>{log.action}</strong>
                              <span>{fmtDate(log.dateAction)}</span>
                            </div>
                            <div className="timeline-text" style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                                Parateur: {log.utilisateurEmail} — IP: {log.adresseIp || 'Locale/Interne'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              !loading && (
                <div className="dossier-empty">
                  <Shield size={48} />
                  <h2>COFFRE VERROUILLÉ</h2>
                  <p>Sélectionnez un sceau pour en inspecter le contenu et l'intégrité.</p>
                </div>
              )
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <UploadDocumentModal
            token={token}
            onUploaded={handleDocumentUploaded}
            onClose={() => setShowUploadModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default DossierPage
