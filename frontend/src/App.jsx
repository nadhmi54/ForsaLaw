import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, FileText, Users, Sparkles, Shield, Menu, X, MessageCircle, Award, UserCog, ArrowRight, Mail, Lock, User, MessageSquare, Calendar as LucideCalendar } from 'lucide-react'
import ForumPage from './pages/ForumPage'
import LawyersPage from './pages/LawyersPage'
import DossierPage from './pages/DossierPage'
import AiSanctumPage from './pages/AiSanctumPage'
import LawyerDashboardPage from './pages/LawyerDashboardPage'
import ClientSpacePage from './pages/ClientSpacePage'
import AdminSpacePage from './pages/AdminSpacePage'
import SupportPage from './pages/SupportPage'
import CalendarPage from './pages/CalendarPage'
import InboxPage from './pages/InboxPage'
import ForsaLawLoadingScreen from './components/ForsaLawLoadingScreen'
import HomePage from './pages/HomePage'
import './styles/App.css'

const NAV_ITEMS = [
  { key: 'nav_home', page: 'home', icon: <LayoutGrid size={28} /> },
  { key: 'nav_cases', page: 'cases', icon: <FileText size={28} /> },
  { key: 'nav_support', page: 'support', icon: <MessageSquare size={28} /> },
  { key: 'nav_calendar', page: 'calendar', icon: <LucideCalendar size={28} /> },
  { key: 'nav_inbox', page: 'inbox', icon: <Mail size={28} /> },
  { key: 'nav_lawyers', page: 'lawyers', icon: <Users size={28} /> },
  { key: 'nav_client_space', page: 'client-space', icon: <UserCog size={28} /> },
  { key: 'nav_lawyer_space', page: 'lawyer-space', icon: <Award size={28} /> },
  { key: 'nav_forum', page: 'forum', icon: <MessageCircle size={28} /> },
  { key: 'nav_ai', page: 'ai', icon: <Sparkles size={28} /> },
  { key: 'nav_admin', page: 'admin-space', icon: <Shield size={28} /> },
]

// Whether user has seen the intro
const INTRO_TEXT = {
  fr: '"Bienvenue dans le Palais de la Justice. Je suis Fellawra — votre conseil légal. Choisissez votre chemin et je vous guiderai."',
  ar: '"مرحباً في قصر العدالة. أنا فيلورا — مستشارتك القانونية. اختر طريقك وسأرشدك."',
  en: '"Welcome to the Palace of Justice. I am Fellawra — your legal counsel. Choose your path and I shall guide you."',
}

function App() {
  const { t, i18n } = useTranslation()
  const [isNavOpen,   setIsNavOpen]   = useState(false)
  const [showIntro,   setShowIntro]   = useState(true)
  const [currentPage, setCurrentPage] = useState('home')
  const [isPageLoading, setIsPageLoading] = useState(true)
  /** D’abord logo seul, puis texte (timing juridique premium) */
  const [loadingShowMessage, setLoadingShowMessage] = useState(false)
  const [authMode, setAuthMode] = useState(null) // 'login' | 'register' | 'forgot' | null
  const loadTimerRef = useRef(null)
  const loadMsgTimerRef = useRef(null)

  const navigateTo = (page) => {
    setIsNavOpen(false)
    if (page === currentPage) return

    if (loadTimerRef.current) clearTimeout(loadTimerRef.current)
    if (loadMsgTimerRef.current) clearTimeout(loadMsgTimerRef.current)

    setIsPageLoading(true)
    setLoadingShowMessage(false)

    loadMsgTimerRef.current = window.setTimeout(() => {
      setLoadingShowMessage(true)
    }, 1500)

    loadTimerRef.current = window.setTimeout(() => {
      setCurrentPage(page)
      setIsPageLoading(false)
      setLoadingShowMessage(false)
    }, 3000)
  }

  useEffect(() => {
    document.body.dir = i18n.dir()
  }, [i18n.language])

  useEffect(() => {
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current)
    if (loadMsgTimerRef.current) clearTimeout(loadMsgTimerRef.current)

    const tLogoOnly = setTimeout(() => setLoadingShowMessage(true), 1500)
    const tEnd = setTimeout(() => {
      setIsPageLoading(false)
      setLoadingShowMessage(false)
    }, 3200)

    return () => {
      clearTimeout(tLogoOnly)
      clearTimeout(tEnd)
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current)
      if (loadMsgTimerRef.current) clearTimeout(loadMsgTimerRef.current)
    }
  }, [])

  const toggleLanguage = () => {
    const cycle = { fr: 'ar', ar: 'en', en: 'fr' }
    i18n.changeLanguage(cycle[i18n.language] ?? 'fr')
  }

  const introText = INTRO_TEXT[i18n.language] ?? INTRO_TEXT.fr

  return (
    <div className={`app-root${currentPage === 'inbox' ? ' app-root--inbox' : ''}`}>
      {/* Architectural background columns */}
      <div className="arch-bg">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="arch-column" />
        ))}
      </div>

      {/* Fellawra Introduction Overlay — après le loading initial */}
      <AnimatePresence>
        {showIntro && !isPageLoading && (
          <motion.div
            className="intro-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
          >
            {/* Fellawra glow circle for atmosphere */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{
                width: 120, height: 120, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%)',
                marginBottom: '1rem'
              }}
            />
            <motion.div
              className="intro-dialogue"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              <p>{introText}</p>
              <span className="intro-name">— Fellawra, Gardienne de la Justice</span>
            </motion.div>
            <motion.button
              className="brutal-btn intro-continue-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              onClick={() => setShowIntro(false)}
            >
              {i18n.language === 'ar' ? 'أدخل القصر' : 'Entrer dans le Palais →'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global loading — LegalTech premium (voir ForsaLawLoadingScreen) */}
      <AnimatePresence mode="wait">
        {isPageLoading && (
          <ForsaLawLoadingScreen key="loading" showBrandText={loadingShowMessage} />
        )}
      </AnimatePresence>

      {/* Nav Toggle Button */}
      <motion.button
        className="nav-toggle-btn"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsNavOpen(o => !o)}
        aria-label="Toggle navigation"
      >
        {isNavOpen ? <X size={22} /> : <Menu size={22} />}
      </motion.button>

      {/* Auth and language controls — hidden on inbox (app owns the full screen there) */}
      {currentPage !== 'inbox' && (
        <div className="top-right-controls">
          <button className="auth-top-btn" onClick={() => setAuthMode('login')}>
            Connexion
          </button>
          <button className="lang-toggle-btn" onClick={toggleLanguage}>
            {i18n.language.toUpperCase()}
          </button>
        </div>
      )}

      {/* Pendant le loading : aucune page montée (sinon l’ancienne page joue son exit et flash) */}
      <div className="app-main-shell">
      {!isPageLoading && (
      <AnimatePresence mode="wait">
        {currentPage === 'home' ? (
          <HomePage key="home" onNavigate={navigateTo} />
        ) : currentPage === 'forum' ? (
          <motion.div
            key="forum"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ForumPage />
          </motion.div>
        ) : currentPage === 'client-space' ? (
          <motion.div
            key="client-space"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ClientSpacePage />
          </motion.div>
        ) : currentPage === 'lawyer-space' ? (
          <motion.div
            key="lawyer-space"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <LawyerDashboardPage />
          </motion.div>
        ) : currentPage === 'support' ? (
          <motion.div
            key="support"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <SupportPage />
          </motion.div>
        ) : currentPage === 'calendar' ? (
          <motion.div
            key="calendar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CalendarPage />
          </motion.div>
        ) : currentPage === 'inbox' ? (
          <motion.div
            key="inbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <InboxPage />
          </motion.div>
        ) : currentPage === 'ai' ? (
          <motion.div
            key="ai"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AiSanctumPage />
          </motion.div>
        ) : currentPage === 'cases' ? (
          <motion.div
            key="cases"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <DossierPage />
          </motion.div>
        ) : currentPage === 'lawyers' ? (
          <motion.div
            key="lawyers"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <LawyersPage />
          </motion.div>
        ) : currentPage === 'admin-space' ? (
          <motion.div
            key="admin-space"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AdminSpacePage />
          </motion.div>
        ) : (
          <motion.main
            key="placeholder"
            className="hero-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
          >
            <p style={{ color: 'var(--gold)', fontSize: '0.75rem', letterSpacing: '0.25em', marginBottom: '1rem' }}>CHAMBRE EN CONSTRUCTION</p>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>{currentPage.toUpperCase()}</h2>
            <button className="brutal-btn" onClick={() => navigateTo('home')}>← Retour au Grand Palais</button>
          </motion.main>
        )}
      </AnimatePresence>
      )}
      </div>

      {/* Full-screen Navigation Gallery */}
      <AnimatePresence>
        {isNavOpen && (
          <motion.div
            className="nav-gallery-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsNavOpen(false)}
          >
            <p className="nav-gallery-title">— Choisissez votre Destination —</p>
            <motion.div
              className="nav-gallery-grid"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              onClick={e => e.stopPropagation()}
            >
              {NAV_ITEMS.map((item, idx) => (
                <motion.button
                  key={item.key}
                  className="nav-gallery-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigateTo(item.page)}
                >
                  {item.icon}
                  <span>{t(item.key)}</span>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Authentication modal without dedicated page */}
      <AnimatePresence>
        {authMode && (
          <motion.div
            className="auth-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAuthMode(null)}
          >
            <motion.div
              className="auth-modal-card"
              initial={{ y: 22, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 22, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="auth-modal-tabs">
                <button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>Connexion</button>
                <button className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>Inscription</button>
                <button className={authMode === 'forgot' ? 'active' : ''} onClick={() => setAuthMode('forgot')}>Mdp oublie</button>
              </div>

              <form className="auth-modal-form" onSubmit={(e) => e.preventDefault()}>
                {authMode === 'register' && (
                  <>
                    <label><User size={14} /> Nom</label>
                    <input type="text" placeholder="Nom" />
                    <label><User size={14} /> Prenom</label>
                    <input type="text" placeholder="Prenom" />
                  </>
                )}

                <label><Mail size={14} /> Email</label>
                <input type="email" placeholder="vous@domaine.com" />

                {authMode !== 'forgot' && (
                  <>
                    <label><Lock size={14} /> Mot de passe</label>
                    <input type="password" placeholder="••••••••" />
                  </>
                )}

                {authMode === 'login' && (
                  <button type="button" className="auth-link-btn" onClick={() => setAuthMode('forgot')}>
                    Mot de passe oublie ?
                  </button>
                )}

                <button className="auth-submit-main" type="submit">
                  {authMode === 'login'
                    ? 'Se connecter'
                    : authMode === 'register'
                      ? 'S inscrire'
                      : 'Envoyer lien reset'}
                  <ArrowRight size={17} />
                </button>

                {(authMode === 'login' || authMode === 'register') && (
                  <a className="auth-google-btn" href="/api/auth/google">
                    Continuer avec Google
                  </a>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
