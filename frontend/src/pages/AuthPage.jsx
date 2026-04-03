import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, Mail, ShieldCheck, ArrowRight, Fingerprint, KeyRound, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '../styles/Auth.css'

const AuthPage = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('login')

  return (
    <div className="auth-page">
      {/* Heavy Gate Container */}
      <motion.div 
        className="auth-gate"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        {/* Header Ritual */}
        <header className="auth-gate-header">
          <div className="auth-gate-title">{t('auth_title')}</div>
          <div className="auth-gate-subtitle">{t('auth_subtitle')}</div>
          
          {/* Decorative Corner Elements */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', opacity: 0.2 }}><ShieldCheck size={24} /></div>
          <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.2 }}><Fingerprint size={24} /></div>
        </header>

        {/* Tab Switcher */}
        <nav className="auth-tabs">
          <button 
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            {t('auth_login')}
          </button>
          <button 
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            {t('auth_register')}
          </button>
          <button
            className={`auth-tab ${activeTab === 'forgot' ? 'active' : ''}`}
            onClick={() => setActiveTab('forgot')}
          >
            {t('auth_forgot')}
          </button>
          <button
            className={`auth-tab ${activeTab === 'reset' ? 'active' : ''}`}
            onClick={() => setActiveTab('reset')}
          >
            {t('auth_reset')}
          </button>
          <button
            className={`auth-tab ${activeTab === 'locked' ? 'active' : ''}`}
            onClick={() => setActiveTab('locked')}
            style={{ color: activeTab === 'locked' ? '#ff6b6b' : 'inherit' }}
          >
            {t('auth_locked')}
          </button>
        </nav>

        {/* Form Content */}
        <div className="auth-content">
          <AnimatePresence mode="wait">
            <motion.form 
              key={activeTab}
              className="auth-form"
              initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === 'login' ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={(e) => e.preventDefault()}
            >
              {activeTab === 'register' && (
                <div className="input-group">
                  <label className="input-label"><User size={14} /> {t('auth_fullname')}</label>
                  <input type="text" className="ritual-input" placeholder={t('auth_fullname_ph')} />
                </div>
              )}

              <div className="input-group">
                <label className="input-label"><Mail size={14} /> {t('auth_email')}</label>
                <input type="email" className="ritual-input" placeholder={t('auth_email_ph')} />
              </div>

              {(activeTab === 'login' || activeTab === 'register') && (
                <div className="input-group">
                  <label className="input-label"><Lock size={14} /> {t('auth_pass')}</label>
                  <input type="password" className="ritual-input" placeholder="••••••••" />
                </div>
              )}

              {activeTab === 'register' && (
                <div className="input-group">
                  <label className="input-label"><ShieldCheck size={14} /> {t('auth_role')}</label>
                  <input type="text" className="ritual-input" value="CLIENT (automatique)" readOnly />
                </div>
              )}

              {activeTab === 'forgot' && (
                <div className="input-group">
                  <label className="input-label"><Mail size={14} /> {t('auth_endpoint')}</label>
                  <input type="text" className="ritual-input" value="POST /api/auth/forgot-password" readOnly />
                </div>
              )}

              {activeTab === 'reset' && (
                <>
                  <div className="input-group">
                    <label className="input-label"><KeyRound size={14} /> {t('auth_token')}</label>
                    <input type="text" className="ritual-input" placeholder={t('auth_token_ph')} />
                  </div>
                  <div className="input-group">
                    <label className="input-label"><Lock size={14} /> {t('auth_new_pass')}</label>
                    <input type="password" className="ritual-input" placeholder={t('auth_new_pass')} />
                  </div>
                </>
              )}

              {activeTab === 'locked' && (
                <>
                  <div className="input-group">
                    <label className="input-label"><Mail size={14} /> {t('auth_email')}</label>
                    <input type="email" className="ritual-input" placeholder={t('auth_email_ph')} />
                  </div>
                  <div className="input-group">
                    <label className="input-label"><AlertTriangle size={14} /> {t('auth_unlock_reason')}</label>
                    <textarea className="ritual-input" placeholder={t('auth_unlock_reason_ph')} rows={3} style={{ resize: 'none' }} />
                  </div>
                </>
              )}

              <button type="submit" className="auth-submit-btn">
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
            </motion.form>
          </AnimatePresence>

          <footer className="auth-footer">
            <p>{t('auth_mock_notice')}</p>
          </footer>
        </div>
      </motion.div>

      {/* Decorative Atmosphere Elements */}
      <div style={{ position: 'absolute', bottom: '50px', left: '50px', opacity: 0.05, color: 'var(--gold)' }}>
        <h2 style={{ fontSize: '10rem', fontWeight: 900, margin: 0 }}>JUSTICE</h2>
      </div>
    </div>
  )
}

export default AuthPage
