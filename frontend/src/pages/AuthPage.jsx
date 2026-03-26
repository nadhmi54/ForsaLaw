import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Lock, Mail, ShieldCheck, ArrowRight, Fingerprint } from 'lucide-react'
import '../styles/Auth.css'

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'CLIENT' // Default role
  })

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
          <div className="auth-gate-title">Le Palais de Justice</div>
          <div className="auth-gate-subtitle">Entrez dans votre Sanctuaire</div>
          
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
            S'Identifier
          </button>
          <button 
            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            S'Inscrire
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
                  <input type="text" className="ritual-input" placeholder="Maître ou Citoyen..." />
                </div>
              )}

              <div className="input-group">
                <label className="input-label"><Mail size={14} /> Email Official</label>
                <input type="email" className="ritual-input" placeholder="votre@justice.tn" />
              </div>

              <div className="input-group">
                <label className="input-label"><Lock size={14} /> Sceau Secret</label>
                <input type="password" className="ritual-input" placeholder="••••••••" />
              </div>

              {activeTab === 'register' && (
                <div className="input-group">
                  <label className="input-label"><ShieldCheck size={14} /> Votre Rôle</label>
                  <select className="ritual-input" style={{ appearance: 'none' }}>
                    <option value="CLIENT">CITOYEN (RECLAIMANT)</option>
                    <option value="LAWYER">AVOCAT (CONSEILLER)</option>
                  </select>
                </div>
              )}

              <button type="submit" className="auth-submit-btn">
                {activeTab === 'login' ? 'SCELLER L\'IDENTITÉ' : 'SIGNER LE REGISTRE'}
                <ArrowRight size={20} />
              </button>
            </motion.form>
          </AnimatePresence>

          <footer className="auth-footer">
            {activeTab === 'login' ? (
              <p>Oublié votre sceau ? <a href="#">Restaurer l'accès</a></p>
            ) : (
              <p>En signant, vous jurez de respecter la <a href="#">Charte du Palais</a></p>
            )}
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
