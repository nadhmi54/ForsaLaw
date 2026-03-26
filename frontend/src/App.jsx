import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, FileText, Users, Sparkles, Settings, Menu, X, MessageCircle, Award } from 'lucide-react'
import HeroScale from './components/HeroScale'
import ForumPage from './pages/ForumPage'
import LawyersPage from './pages/LawyersPage'
import DossierPage from './pages/DossierPage'
import AiSanctumPage from './pages/AiSanctumPage'
import AuthPage from './pages/AuthPage'
import LawyerDashboardPage from './pages/LawyerDashboardPage'
import './styles/App.css'

const NAV_ITEMS = [
  { key: 'nav_home',    page: 'home',    icon: <LayoutGrid size={28} /> },
  { key: 'nav_cases',  page: 'cases',   icon: <FileText   size={28} /> },
  { key: 'nav_counsel',page: 'lawyers', icon: <Users      size={28} /> },
  { key: 'nav_forum',  page: 'forum',   icon: <MessageCircle size={28} /> },
  { key: 'nav_ai',     page: 'ai',      icon: <Sparkles   size={28} /> },
  { key: 'nav_lawyer_space', page: 'lawyer-space', icon: <Award size={28} /> },
  { key: 'nav_settings',page:'settings', icon: <Settings   size={28} /> },
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

  const navigateTo = (page) => {
    setCurrentPage(page)
    setIsNavOpen(false)
  }

  useEffect(() => {
    document.body.dir = i18n.dir()
  }, [i18n.language])

  const toggleLanguage = () => {
    const cycle = { fr: 'ar', ar: 'en', en: 'fr' }
    i18n.changeLanguage(cycle[i18n.language] ?? 'fr')
  }

  const introText = INTRO_TEXT[i18n.language] ?? INTRO_TEXT.fr

  return (
    <div className="app-root">
      {/* Architectural background columns */}
      <div className="arch-bg">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="arch-column" />
        ))}
      </div>

      {/* Fellawra Introduction Overlay */}
      <AnimatePresence>
        {showIntro && (
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

      {/* Language Toggle */}
      <button className="lang-toggle-btn" onClick={toggleLanguage}>
        {i18n.language.toUpperCase()}
      </button>

      {/* Main content — switches based on currentPage */}
      <AnimatePresence mode="wait">
        {currentPage === 'home' ? (
          <motion.main
            key="home"
            className="hero-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <h1 className="hero-title">{t('welcome')}</h1>
              <p className="hero-subtitle">{t('subtitle')}</p>
              <HeroScale onNavigate={navigateTo} />
            </motion.div>
          </motion.main>
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
        ) : currentPage === 'login' ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AuthPage />
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
    </div>
  )
}

export default App
