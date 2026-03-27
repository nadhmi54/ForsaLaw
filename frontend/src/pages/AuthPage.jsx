import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, Mail, ShieldCheck, ArrowRight, Fingerprint, KeyRound } from 'lucide-react'
import '../styles/Auth.css'

const AuthPage = () => {
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
          <div className="auth-gate-title">Authentification ForsaLaw</div>
          <div className="auth-gate-subtitle">Maquettes pretes pour integration API</div>
          
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
            Connexion
          </button>
          <button 
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Inscription
          </button>
          <button
            className={`auth-tab ${activeTab === 'forgot' ? 'active' : ''}`}
            onClick={() => setActiveTab('forgot')}
          >
            Mot de passe oublie
          </button>
          <button
            className={`auth-tab ${activeTab === 'reset' ? 'active' : ''}`}
            onClick={() => setActiveTab('reset')}
          >
            Reset token
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
                  <label className="input-label"><User size={14} /> Nom Complet</label>
                  <input type="text" className="ritual-input" placeholder="Nom et prenom" />
                </div>
              )}

              <div className="input-group">
                <label className="input-label"><Mail size={14} /> Email</label>
                <input type="email" className="ritual-input" placeholder="vous@domaine.com" />
              </div>

              {(activeTab === 'login' || activeTab === 'register') && (
                <div className="input-group">
                  <label className="input-label"><Lock size={14} /> Mot de passe</label>
                  <input type="password" className="ritual-input" placeholder="••••••••" />
                </div>
              )}

              {activeTab === 'register' && (
                <div className="input-group">
                  <label className="input-label"><ShieldCheck size={14} /> Role initial</label>
                  <input type="text" className="ritual-input" value="CLIENT (automatique)" readOnly />
                </div>
              )}

              {activeTab === 'forgot' && (
                <div className="input-group">
                  <label className="input-label"><Mail size={14} /> Endpoint</label>
                  <input type="text" className="ritual-input" value="POST /api/auth/forgot-password" readOnly />
                </div>
              )}

              {activeTab === 'reset' && (
                <>
                  <div className="input-group">
                    <label className="input-label"><KeyRound size={14} /> Token</label>
                    <input type="text" className="ritual-input" placeholder="Token recu par email" />
                  </div>
                  <div className="input-group">
                    <label className="input-label"><Lock size={14} /> Nouveau mot de passe</label>
                    <input type="password" className="ritual-input" placeholder="Nouveau mot de passe" />
                  </div>
                </>
              )}

              <button type="submit" className="auth-submit-btn">
                {activeTab === 'login'
                  ? 'POST /api/auth/login'
                  : activeTab === 'register'
                    ? 'POST /api/auth/register'
                    : activeTab === 'forgot'
                      ? 'Envoyer email reset'
                      : 'POST /api/auth/reset-password'}
                <ArrowRight size={20} />
              </button>
            </motion.form>
          </AnimatePresence>

          <footer className="auth-footer">
            <p>UI mock uniquement. Integration API backend a brancher ensuite.</p>
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
