import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, Mail, ShieldCheck, ArrowRight, Fingerprint, KeyRound, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext.jsx'
import * as authApi from '../api/auth.js'
import '../styles/Auth.css'

const AuthPage = () => {
  const { t } = useTranslation()
  const { login, register } = useAuth()
  const [activeTab, setActiveTab] = useState('login')
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [unlockMessage, setUnlockMessage] = useState('')
  const [formError, setFormError] = useState(null)
  const [formSuccess, setFormSuccess] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const clearFeedback = () => {
    setFormError(null)
    setFormSuccess(null)
  }

  const switchTab = (tab) => {
    clearFeedback()
    setActiveTab(tab)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearFeedback()
    const em = email.trim()

    if (activeTab === 'forgot') {
      if (!em) {
        setFormError(t('auth_err_email'))
        return
      }
      setSubmitting(true)
      try {
        const msg = await authApi.forgotPassword({ email: em })
        setFormSuccess(typeof msg === 'string' ? msg : String(msg))
      } catch (err) {
        setFormError(err?.message || String(err))
      } finally {
        setSubmitting(false)
      }
      return
    }

    if (activeTab === 'reset') {
      if (!resetToken.trim() || !newPassword) {
        setFormError(t('auth_err_reset_fields'))
        return
      }
      setSubmitting(true)
      try {
        const msg = await authApi.resetPassword({
          token: resetToken.trim(),
          nouveauMotDePasse: newPassword,
        })
        setFormSuccess(typeof msg === 'string' ? msg : String(msg))
      } catch (err) {
        setFormError(err?.message || String(err))
      } finally {
        setSubmitting(false)
      }
      return
    }

    if (activeTab === 'locked') {
      if (!em) {
        setFormError(t('auth_err_email'))
        return
      }
      setSubmitting(true)
      try {
        const msg = await authApi.requestUnlock({ email: em, message: unlockMessage.trim() })
        setFormSuccess(typeof msg === 'string' ? msg : String(msg))
      } catch (err) {
        setFormError(err?.message || String(err))
      } finally {
        setSubmitting(false)
      }
      return
    }

    if (!em || !password) {
      setFormError(t('auth_err_login_fields'))
      return
    }

    setSubmitting(true)
    try {
      if (activeTab === 'login') {
        await login({ email: em, motDePasse: password })
      } else {
        const n = nom.trim()
        const p = prenom.trim()
        if (!n || !p) {
          setFormError(t('auth_err_name_fields'))
          setSubmitting(false)
          return
        }
        await register({ nom: n, prenom: p, email: em, motDePasse: password })
      }
    } catch (err) {
      setFormError(err?.message || String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <motion.div
        className="auth-gate"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <header className="auth-gate-header">
          <div className="auth-gate-title">{t('auth_title')}</div>
          <div className="auth-gate-subtitle">{t('auth_subtitle')}</div>

          <div style={{ position: 'absolute', top: '10px', left: '10px', opacity: 0.2 }}>
            <ShieldCheck size={24} />
          </div>
          <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.2 }}>
            <Fingerprint size={24} />
          </div>
        </header>

        <nav className="auth-tabs">
          <button type="button" className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} onClick={() => switchTab('login')}>
            {t('auth_login')}
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => switchTab('register')}
          >
            {t('auth_register')}
          </button>
          <button type="button" className={`auth-tab ${activeTab === 'forgot' ? 'active' : ''}`} onClick={() => switchTab('forgot')}>
            {t('auth_forgot')}
          </button>
          <button type="button" className={`auth-tab ${activeTab === 'reset' ? 'active' : ''}`} onClick={() => switchTab('reset')}>
            {t('auth_reset')}
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'locked' ? 'active' : ''}`}
            onClick={() => switchTab('locked')}
            style={{ color: activeTab === 'locked' ? '#ff6b6b' : 'inherit' }}
          >
            {t('auth_locked')}
          </button>
        </nav>

        <div className="auth-content">
          <AnimatePresence mode="wait">
            <motion.form
              key={activeTab}
              className="auth-form"
              initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === 'login' ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              noValidate
            >
              {activeTab === 'register' && (
                <>
                  <div className="input-group">
                    <label className="input-label" htmlFor="auth-page-nom">
                      <User size={14} /> {t('auth_nom')}
                    </label>
                    <input
                      id="auth-page-nom"
                      type="text"
                      className="ritual-input"
                      autoComplete="family-name"
                      placeholder={t('auth_nom_ph')}
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label" htmlFor="auth-page-prenom">
                      <User size={14} /> {t('auth_prenom')}
                    </label>
                    <input
                      id="auth-page-prenom"
                      type="text"
                      className="ritual-input"
                      autoComplete="given-name"
                      placeholder={t('auth_prenom_ph')}
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="input-group">
                <label className="input-label" htmlFor="auth-page-email">
                  <Mail size={14} /> {t('auth_email')}
                </label>
                <input
                  id="auth-page-email"
                  type="email"
                  className="ritual-input"
                  autoComplete="email"
                  placeholder={t('auth_email_ph')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {(activeTab === 'login' || activeTab === 'register') && (
                <div className="input-group">
                  <label className="input-label" htmlFor="auth-page-password">
                    <Lock size={14} /> {t('auth_pass')}
                  </label>
                  <input
                    id="auth-page-password"
                    type="password"
                    className="ritual-input"
                    autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}

              {activeTab === 'register' && (
                <div className="input-group">
                  <label className="input-label">
                    <ShieldCheck size={14} /> {t('auth_role')}
                  </label>
                  <input type="text" className="ritual-input" value={t('auth_role_client_hint')} readOnly />
                </div>
              )}

              {activeTab === 'reset' && (
                <>
                  <div className="input-group">
                    <label className="input-label" htmlFor="auth-page-reset-token">
                      <KeyRound size={14} /> {t('auth_token')}
                    </label>
                    <input
                      id="auth-page-reset-token"
                      type="text"
                      className="ritual-input"
                      placeholder={t('auth_token_ph')}
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label" htmlFor="auth-page-new-pass">
                      <Lock size={14} /> {t('auth_new_pass')}
                    </label>
                    <input
                      id="auth-page-new-pass"
                      type="password"
                      className="ritual-input"
                      autoComplete="new-password"
                      placeholder={t('auth_new_pass')}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </>
              )}

              {activeTab === 'locked' && (
                <div className="input-group">
                  <label className="input-label" htmlFor="auth-page-unlock-msg">
                    <AlertTriangle size={14} /> {t('auth_unlock_reason')}
                  </label>
                  <textarea
                    id="auth-page-unlock-msg"
                    className="ritual-input"
                    placeholder={t('auth_unlock_reason_ph')}
                    rows={3}
                    style={{ resize: 'none' }}
                    value={unlockMessage}
                    onChange={(e) => setUnlockMessage(e.target.value)}
                  />
                </div>
              )}

              {formError && (
                <p className="auth-page-message auth-page-message--error" role="alert">
                  {formError}
                </p>
              )}
              {formSuccess && (
                <p className="auth-page-message auth-page-message--ok" role="status">
                  {formSuccess}
                </p>
              )}

              <button type="submit" className="auth-submit-btn" disabled={submitting}>
                {activeTab === 'login'
                  ? t('auth_btn_login')
                  : activeTab === 'register'
                    ? t('auth_btn_register')
                    : activeTab === 'forgot'
                      ? t('auth_btn_forgot')
                      : activeTab === 'reset'
                        ? t('auth_btn_reset')
                        : t('auth_btn_unlock')}
                <ArrowRight size={20} />
              </button>

              {(activeTab === 'login' || activeTab === 'register') && (
                <a className="auth-google-btn-page" href="/api/auth/google">
                  {t('auth_google')}
                </a>
              )}
            </motion.form>
          </AnimatePresence>

          <footer className="auth-footer">
            <p>{t('auth_api_notice')}</p>
          </footer>
        </div>
      </motion.div>

      <div style={{ position: 'absolute', bottom: '50px', left: '50px', opacity: 0.05, color: 'var(--gold)' }}>
        <h2 style={{ fontSize: '10rem', fontWeight: 900, margin: 0 }}>JUSTICE</h2>
      </div>
    </div>
  )
}

export default AuthPage
