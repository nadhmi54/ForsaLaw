import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, FileText, Users, Sparkles, Shield, Menu, X, MessageCircle, Award, UserCog, ArrowRight, Mail, Lock, User, MessageSquare, Calendar as LucideCalendar } from 'lucide-react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import AppErrorBoundary from './components/AppErrorBoundary'
import RouteLoadingScreen from './components/RouteLoadingScreen'
import ScrollToTop from './components/ScrollToTop'
import ScrollToTopButton from './components/ScrollToTopButton'
import SiteVideoBackground from './components/SiteVideoBackground'
import './styles/App.css'
import { lazyRoute } from './utils/lazyRoute'
import { useAuth } from './context/AuthContext.jsx'
import * as authApi from './api/auth.js'

const HomePage = lazyRoute(() => import('./pages/HomePage'))
const ForumPage = lazyRoute(() => import('./pages/ForumPage'))
const LawyersPage = lazyRoute(() => import('./pages/LawyersPage'))
const DossierPage = lazyRoute(() => import('./pages/DossierPage'))
const LawyerSpacePage = lazyRoute(() => import('./pages/LawyerSpacePage'))
const ClientSpacePage = lazyRoute(() => import('./pages/ClientSpacePage'))
const SupportPage = lazyRoute(() => import('./pages/SupportPage'))
const CalendarPage = lazyRoute(() => import('./pages/CalendarPage'))
const AiSanctumPage = lazyRoute(() => import('./pages/AiSanctumPage'))
const AdminSpacePage = lazyRoute(() => import('./pages/AdminSpacePage'))
const InboxPage = lazyRoute(() => import('./pages/InboxPage'))
const AuthPage = lazyRoute(() => import('./pages/AuthPage'))
const GoogleOAuthCallbackPage = lazyRoute(() => import('./pages/GoogleOAuthCallbackPage'))
const AppointmentBookingPage = lazyRoute(() => import('./pages/AppointmentBookingPage'))
const OnlineMeetingRoomPage = lazyRoute(() => import('./pages/OnlineMeetingRoomPage'))

function App() {
  const { t, i18n } = useTranslation()
  const { user, isAuthenticated, login, register, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isNavOpen,   setIsNavOpen]   = useState(false)
  const [authMode, setAuthMode] = useState(null) // 'login' | 'register' | 'forgot' | null
  const [formNom, setFormNom] = useState('')
  const [formPrenom, setFormPrenom] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [authFormError, setAuthFormError] = useState(null)
  const [authFormSuccess, setAuthFormSuccess] = useState(null)
  const [authSubmitting, setAuthSubmitting] = useState(false)
  const authCardRef = useRef(null)
  const lastActiveElRef = useRef(null)

  useEffect(() => {
    document.body.dir = i18n.dir()
  }, [i18n.language])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return

      if (authMode) {
        e.preventDefault()
        setAuthMode(null)
        return
      }

      if (isNavOpen) {
        e.preventDefault()
        setIsNavOpen(false)
        return
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [authMode, isNavOpen])

  useEffect(() => {
    if (!authMode) return

    lastActiveElRef.current = document.activeElement

    const root = authCardRef.current
    const focusable = root?.querySelector(
      'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable) {
      focusable.focus()
    }

    const onTrap = (e) => {
      if (e.key !== 'Tab') return
      const container = authCardRef.current
      if (!container) return

      const els = Array.from(
        container.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])')
      ).filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'))

      if (els.length === 0) return

      const first = els[0]
      const last = els[els.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first || !container.contains(document.activeElement)) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', onTrap)
    return () => {
      window.removeEventListener('keydown', onTrap)
      const lastActive = lastActiveElRef.current
      if (lastActive && typeof lastActive.focus === 'function') {
        lastActive.focus()
      }
    }
  }, [authMode])

  const NAV_ITEMS = useMemo(() => ([
    { key: 'nav_home', path: '/', icon: <LayoutGrid size={28} /> },
    { key: 'nav_cases', path: '/cases', icon: <FileText size={28} /> },
    { key: 'nav_support', path: '/support', icon: <MessageSquare size={28} /> },
    { key: 'nav_calendar', path: '/calendar', icon: <LucideCalendar size={28} /> },
    { key: 'nav_inbox', path: '/inbox', icon: <Mail size={28} /> },
    { key: 'nav_lawyers', path: '/lawyers', icon: <Users size={28} /> },
    { key: 'nav_client_space', path: '/client-space', icon: <UserCog size={28} /> },
    { key: 'nav_lawyer_space', path: '/lawyer-space', icon: <Award size={28} /> },
    { key: 'nav_forum', path: '/forum', icon: <MessageCircle size={28} /> },
    { key: 'nav_ai', path: '/ai', icon: <Sparkles size={28} /> },
    { key: 'nav_admin', path: '/admin-space', icon: <Shield size={28} /> },
  ]), [])

  const toggleLanguage = () => {
    const cycle = { fr: 'ar', ar: 'en', en: 'fr' }
    i18n.changeLanguage(cycle[i18n.language] ?? 'fr')
  }

  const isInboxRoute = location.pathname === '/inbox'

  const openAuth = (mode) => {
    setAuthFormError(null)
    setAuthFormSuccess(null)
    setAuthMode(mode)
  }

  const handleAuthSubmit = async (e) => {
    e.preventDefault()
    setAuthFormError(null)
    setAuthFormSuccess(null)
    const email = formEmail.trim()
    if (authMode === 'forgot') {
      setAuthSubmitting(true)
      try {
        const msg = await authApi.forgotPassword({ email })
        setAuthFormSuccess(typeof msg === 'string' ? msg : String(msg))
      } catch (err) {
        setAuthFormError(err?.message || String(err))
      } finally {
        setAuthSubmitting(false)
      }
      return
    }
    if (!email) {
      setAuthFormError("L'email est requis.")
      return
    }
    if (!formPassword) {
      setAuthFormError('Le mot de passe est requis.')
      return
    }
    setAuthSubmitting(true)
    try {
      if (authMode === 'login') {
        await login({ email, motDePasse: formPassword })
        setAuthMode(null)
      } else if (authMode === 'register') {
        const nom = formNom.trim()
        const prenom = formPrenom.trim()
        if (!nom || !prenom) {
          setAuthFormError('Le nom et le prénom sont requis.')
          setAuthSubmitting(false)
          return
        }
        await register({ nom, prenom, email, motDePasse: formPassword })
        setAuthMode(null)
      }
    } catch (err) {
      setAuthFormError(err?.message || String(err))
    } finally {
      setAuthSubmitting(false)
    }
  }

  const navigateToPageKey = (pageKey) => {
    const map = {
      home: '/',
      cases: '/cases',
      support: '/support',
      calendar: '/calendar',
      inbox: '/inbox',
      lawyers: '/lawyers',
      'client-space': '/client-space',
      'lawyer-space': '/lawyer-space',
      forum: '/forum',
      ai: '/ai',
      'admin-space': '/admin-space',
    }
    const path = map[pageKey] ?? '/'
    setIsNavOpen(false)
    navigate(path)
  }

  return (
    <div className={`app-root${isInboxRoute ? ' app-root--inbox' : ''}`}>
      <ScrollToTop />
      <ScrollToTopButton />
      {location.pathname === '/' && <SiteVideoBackground />}
      {/* Architectural background columns */}
      <div className="arch-bg">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="arch-column" />
        ))}
      </div>

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
      {!isInboxRoute && (
        <div className="top-right-controls">
          {isAuthenticated ? (
            <>
              {user?.roleUser === 'client' ? (
                <>
                  <button
                    type="button"
                    className="auth-top-btn"
                    onClick={() => navigate('/client-space?tab=profile')}
                    title={user?.email ?? ''}
                  >
                    {t('nav_client_space')}
                  </button>
                  <button
                    type="button"
                    className="auth-top-btn"
                    onClick={() => navigate('/lawyer-space')}
                    title={user?.email ?? ''}
                  >
                    {t('nav_lawyer_space')}
                  </button>
                </>
              ) : user?.roleUser === 'avocat' ? (
                <button
                  type="button"
                  className="auth-top-btn"
                  onClick={() => navigate('/lawyer-space')}
                  title={user?.email ?? ''}
                >
                  {t('nav_lawyer_space')}
                </button>
              ) : (
                <span className="auth-user-label" title={user?.email}>
                  {user?.prenom} {user?.nom}
                </span>
              )}
              <button
                type="button"
                className="auth-top-btn"
                onClick={() => {
                  logout()
                  setAuthMode(null)
                }}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <button type="button" className="auth-top-btn" onClick={() => openAuth('login')}>
              {t('top_login')}
            </button>
          )}
          <button type="button" className="lang-toggle-btn" onClick={toggleLanguage}>
            {i18n.language.toUpperCase()}
          </button>
        </div>
      )}

      <div className="app-main-shell">
        <AppErrorBoundary>
          <Suspense fallback={<RouteLoadingScreen />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Routes location={location}>
                  <Route path="/" element={<HomePage onNavigate={navigateToPageKey} />} />
                  <Route path="/forum" element={<ForumPage />} />
                  <Route path="/lawyers" element={<LawyersPage />} />
                  <Route path="/cases" element={<DossierPage />} />
                  <Route path="/ai" element={<AiSanctumPage />} />
                  <Route path="/lawyer-space" element={<LawyerSpacePage />} />
                  <Route path="/client-space" element={<ClientSpacePage />} />
                  <Route path="/admin-space" element={<AdminSpacePage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/inbox" element={<InboxPage />} />
                  <Route path="/appointments/new/:avocatId" element={<AppointmentBookingPage />} />
                  <Route path="/rendezvous/:idRendezVous/online-room" element={<OnlineMeetingRoomPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/auth/google/callback" element={<GoogleOAuthCallbackPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </AppErrorBoundary>
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
            <p className="nav-gallery-title">{t('nav_gallery_title')}</p>
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
                  onClick={() => {
                    setIsNavOpen(false)
                    navigate(item.path)
                  }}
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
            role="presentation"
          >
            <motion.div
              className="auth-modal-card"
              initial={{ y: 22, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 22, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              ref={authCardRef}
            >
              <div className="auth-modal-tabs">
                <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => openAuth('login')}>
                  Connexion
                </button>
                <button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => openAuth('register')}>
                  Inscription
                </button>
                <button type="button" className={authMode === 'forgot' ? 'active' : ''} onClick={() => openAuth('forgot')}>
                  Mdp oublie
                </button>
              </div>

              <form className="auth-modal-form" onSubmit={handleAuthSubmit} noValidate>
                {authMode === 'register' && (
                  <>
                    <label htmlFor="auth-modal-nom">
                      <User size={14} /> Nom
                    </label>
                    <input
                      id="auth-modal-nom"
                      type="text"
                      autoComplete="family-name"
                      placeholder="Nom"
                      value={formNom}
                      onChange={(e) => setFormNom(e.target.value)}
                    />
                    <label htmlFor="auth-modal-prenom">
                      <User size={14} /> Prenom
                    </label>
                    <input
                      id="auth-modal-prenom"
                      type="text"
                      autoComplete="given-name"
                      placeholder="Prenom"
                      value={formPrenom}
                      onChange={(e) => setFormPrenom(e.target.value)}
                    />
                  </>
                )}

                <label htmlFor="auth-modal-email">
                  <Mail size={14} /> Email
                </label>
                <input
                  id="auth-modal-email"
                  type="email"
                  autoComplete="email"
                  placeholder="vous@domaine.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />

                {authMode !== 'forgot' && (
                  <>
                    <label htmlFor="auth-modal-password">
                      <Lock size={14} /> Mot de passe
                    </label>
                    <input
                      id="auth-modal-password"
                      type="password"
                      autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                      placeholder="••••••••"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                    />
                  </>
                )}

                {authMode === 'login' && (
                  <button type="button" className="auth-link-btn" onClick={() => openAuth('forgot')}>
                    Mot de passe oublie ?
                  </button>
                )}

                {authFormError && (
                  <p className="auth-form-message auth-form-message--error" role="alert">
                    {authFormError}
                  </p>
                )}
                {authFormSuccess && (
                  <p className="auth-form-message auth-form-message--success" role="status">
                    {authFormSuccess}
                  </p>
                )}

                <button className="auth-submit-main" type="submit" disabled={authSubmitting}>
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
