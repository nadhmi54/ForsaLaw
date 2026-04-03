import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  FileText,
  Users,
  Sparkles,
  Shield,
  UserCog,
  Landmark,
  Calendar,
  ChevronDown,
  Lock,
  UserCheck,
  MapPin,
} from 'lucide-react'
import HeroScale from '../components/HeroScale'
import '../styles/HomePage.css'
import '../styles/FooterRegistry.css'

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: [0.45, 0, 0.55, 1] },
}

const FAQ_ITEMS = [
  { code: '01', icon: Users, qKey: 'home_faq_q1', aKey: 'home_faq_a1' },
  { code: '02', icon: Calendar, qKey: 'home_faq_q2', aKey: 'home_faq_a2' },
  { code: '03', icon: FileText, qKey: 'home_faq_q3', aKey: 'home_faq_a3' },
  { code: '04', icon: Shield, qKey: 'home_faq_q4', aKey: 'home_faq_a4' },
  { code: '05', icon: Sparkles, qKey: 'home_faq_q5', aKey: 'home_faq_a5' },
  { code: '06', icon: UserCog, qKey: 'home_faq_q6', aKey: 'home_faq_a6' },
]

const TRUST_PILLARS = [
  { icon: Lock, titleKey: 'home_trust_p1_title', bodyKey: 'home_trust_p1_body' },
  { icon: UserCheck, titleKey: 'home_trust_p2_title', bodyKey: 'home_trust_p2_body' },
  { icon: Shield, titleKey: 'home_trust_p3_title', bodyKey: 'home_trust_p3_body' },
  { icon: MapPin, titleKey: 'home_trust_p4_title', bodyKey: 'home_trust_p4_body' },
]

const ABOUT_BLOCKS = [
  { icon: Landmark, titleKey: 'home_about_card1_title', bodyKey: 'home_about_card1_body' },
  { icon: Shield, titleKey: 'home_about_card2_title', bodyKey: 'home_about_card2_body' },
  { icon: Calendar, titleKey: 'home_about_card3_title', bodyKey: 'home_about_card3_body' },
]

const CODEX_ARTICLES = [
  {
    roman: 'I',
    title: 'CONSULTATION',
    body: 'Exposez votre situation à Fellawra ou à un avocat certifié. Le dialogue précède le dossier.',
  },
  {
    roman: 'II',
    title: 'DOSSIER',
    body: 'Chaque affaire est formalisée, archivée, et suivie dans nos registres numériques immuables.',
  },
  {
    roman: 'III',
    title: 'VERDICT',
    body: 'La Justice est rendue. Le système trace, préserve, et protège chaque étape de votre parcours.',
  },
]

export default function HomePage({ onNavigate }) {
  const { t } = useTranslation()
  const [openFaq, setOpenFaq] = useState(null)
  const faqBaseId = useId()

  return (
    <motion.main
      className="home-page"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* ═══════════════════════════════════════════════════════
          SECTION I — THE GRAND ATRIUM
          Full viewport. The Scale of Fate is the only gateway.
      ═══════════════════════════════════════════════════════ */}
      <section className="home-atrium">
        <div className="home-atrium-inner">
          <motion.div
            className="home-atrium-headline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <h1 className="home-atrium-title">{t('welcome')}</h1>
            <div className="home-atrium-divider" />
            <p className="home-atrium-sub">{t('subtitle')}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="home-atrium-scale"
          >
            <HeroScale onNavigate={onNavigate} />
          </motion.div>
        </div>

        {/* ── THE GREAT LEDGER (Live Activity Ticker) ── */}
        <div className="great-ledger">
          <div className="great-ledger-track">
            {/* Doubled for seamless scrolling */}
            <span className="great-ledger-text">
              <span className="gl-hilite">⚖ DOSSIER #4022 SCELLÉ SOUS L'AUTORITÉ DE FELLAWRA</span> · 4 NOUVEAUX AVOCATS HABILITÉS · <span className="gl-hilite">PLAIDOIRIE PÉNALE ARCHIVÉE</span> · AUDIENCE EN DIRECT DANS LA PLACE PUBLIQUE · <span className="gl-hilite">RÉSOLUTION DU DOSSIER #3991</span> · 
            </span>
            <span className="great-ledger-text">
              <span className="gl-hilite">⚖ DOSSIER #4022 SCELLÉ SOUS L'AUTORITÉ DE FELLAWRA</span> · 4 NOUVEAUX AVOCATS HABILITÉS · <span className="gl-hilite">PLAIDOIRIE PÉNALE ARCHIVÉE</span> · AUDIENCE EN DIRECT DANS LA PLACE PUBLIQUE · <span className="gl-hilite">RÉSOLUTION DU DOSSIER #3991</span> · 
            </span>
          </div>
        </div>
      </section>

      {/* ── THE LOWER REALM: Framed by Side Pillars starting from here ── */}
      <div className="home-lower-realm">

      {/* ═══════════════════════════════════════════════════════
          TRUST — Pourquoi nous (sans chiffres ni logos tant qu’absents)
      ═══════════════════════════════════════════════════════ */}
      <section className="home-trust" aria-labelledby="home-trust-heading">
        <motion.div className="home-section-header" {...fadeUp}>
          <p className="home-eyebrow">{t('home_trust_eyebrow')}</p>
          <h2 id="home-trust-heading" className="home-section-title">
            {t('home_trust_title')}
          </h2>
        </motion.div>
        <ul className="home-trust-grid">
          {TRUST_PILLARS.map((pillar, i) => {
            const Icon = pillar.icon
            return (
              <motion.li
                key={pillar.titleKey}
                className="home-trust-item"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.07, ease: [0.45, 0, 0.55, 1] }}
              >
                <div className="home-trust-icon" aria-hidden>
                  <Icon size={22} strokeWidth={1.4} />
                </div>
                <h3 className="home-trust-item-title">{t(pillar.titleKey)}</h3>
                <p className="home-trust-item-body">{t(pillar.bodyKey)}</p>
              </motion.li>
            )
          })}
        </ul>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION — WHO WE ARE (before Chambers)
      ═══════════════════════════════════════════════════════ */}
      <section className="home-about" aria-labelledby="home-about-heading">
        <motion.div className="home-section-header" {...fadeUp}>
          <p className="home-eyebrow">{t('home_about_eyebrow')}</p>
          <h2 id="home-about-heading" className="home-section-title">
            {t('home_about_title')}
          </h2>
        </motion.div>

        <motion.p
          className="home-about-lead"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.65, ease: [0.45, 0, 0.55, 1], delay: 0.06 }}
        >
          {t('home_about_lead')}
        </motion.p>

        <motion.div
          className="home-about-seal"
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.5, delay: 0.12 }}
        >
          <span className="home-about-seal-line" />
          <span className="home-about-seal-icon">⚖</span>
          <span className="home-about-seal-line" />
        </motion.div>

        <div className="home-about-grid">
          {ABOUT_BLOCKS.map((block, i) => {
            const Icon = block.icon
            return (
              <motion.article
                key={block.titleKey}
                className="home-about-card"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-45px' }}
                transition={{
                  type: 'spring',
                  stiffness: 110,
                  damping: 15,
                  delay: i * 0.1,
                }}
              >
                <div className="home-about-card-icon">
                  <Icon size={26} strokeWidth={1.35} aria-hidden />
                </div>
                <h3 className="home-about-card-title">{t(block.titleKey)}</h3>
                <p className="home-about-card-body">{t(block.bodyKey)}</p>
              </motion.article>
            )
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION II — FAQ (toggle answers, no navigation)
      ═══════════════════════════════════════════════════════ */}
      <section className="home-faq" aria-labelledby="home-faq-heading">
        <motion.div className="home-section-header" {...fadeUp}>
          <p className="home-eyebrow">{t('home_faq_eyebrow')}</p>
          <h2 id="home-faq-heading" className="home-section-title">
            {t('home_faq_title')}
          </h2>
          <p className="home-faq-subtitle">{t('home_faq_subtitle')}</p>
        </motion.div>

        <div className="home-faq-list" role="list">
          {FAQ_ITEMS.map((item, i) => {
            const Icon = item.icon
            const isOpen = openFaq === i
            const panelId = `${faqBaseId}-panel-${i}`
            const triggerId = `${faqBaseId}-trigger-${i}`
            return (
              <motion.div
                key={item.qKey}
                className={`home-faq-row${isOpen ? ' home-faq-row--open' : ''}`}
                role="listitem"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ type: 'spring', stiffness: 120, damping: 16, delay: i * 0.06 }}
              >
                <div
                  className={`home-faq-question-cell${isOpen ? ' home-faq-question-cell--open' : ''}`}
                >
                  <button
                    type="button"
                    id={triggerId}
                    className={`home-faq-trigger${isOpen ? ' home-faq-trigger--open' : ''}`}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                  >
                    <span className="home-faq-code">{item.code}</span>
                    <div className="home-faq-icon-wrap">
                      <Icon size={22} strokeWidth={1.5} aria-hidden />
                    </div>
                    <span className="home-faq-question">{t(item.qKey)}</span>
                    <ChevronDown
                      className={`home-faq-chevron${isOpen ? ' home-faq-chevron--open' : ''}`}
                      size={22}
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </button>
                </div>

                <div className="home-faq-answer-slot" aria-hidden={!isOpen}>
                  <AnimatePresence initial={false} mode="wait">
                    {isOpen && (
                      <motion.div
                        key={panelId}
                        id={panelId}
                        role="region"
                        aria-labelledby={triggerId}
                        className="home-faq-pixel-wrap"
                        initial={{ opacity: 0, scale: 0.96, x: 8 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.98, x: 6 }}
                        transition={{ duration: 0.24, ease: [0.45, 0, 0.55, 1] }}
                      >
                        <div className="home-faq-bubble-cluster">
                          <div className="home-faq-pixel-bridge" aria-hidden>
                            {/* Queue « BD » : 3 pixels + 5 marches vers la bulle (comme la capture) */}
                            <div className="home-faq-pixel-tail-stack">
                              <div className="home-faq-pixel-dots-row">
                                <span className="home-faq-pixel-dot" />
                                <span className="home-faq-pixel-dot" />
                                <span className="home-faq-pixel-dot" />
                              </div>
                              <span className="home-faq-pixel-seg home-faq-pixel-seg--5" />
                              <span className="home-faq-pixel-seg home-faq-pixel-seg--4" />
                              <span className="home-faq-pixel-seg home-faq-pixel-seg--3" />
                              <span className="home-faq-pixel-seg home-faq-pixel-seg--2" />
                              <span className="home-faq-pixel-seg home-faq-pixel-seg--1" />
                            </div>
                          </div>
                          <div className="home-faq-pixel-bubble">
                            <p className="home-faq-pixel-text" dir="auto">
                              {t(item.aKey)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION III — THE SACRED CODEX
          Three articles. Typography-driven. No photos.
      ═══════════════════════════════════════════════════════ */}
      <section className="home-codex">
        <motion.div className="home-section-header" {...fadeUp}>
          <p className="home-eyebrow">Procédure</p>
          <h2 className="home-section-title">Le Codex de la Procédure</h2>
        </motion.div>

        <div className="home-codex-scroll">
          {CODEX_ARTICLES.map((article, i) => (
            <motion.article
              key={article.roman}
              className="home-codex-article"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8, delay: i * 0.1 }}
            >
              <span className="home-codex-roman">{article.roman}</span>
              <div className="home-codex-content">
                <h3 className="home-codex-title">{article.title}</h3>
                <p className="home-codex-body">{article.body}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      </div> {/* End of home-lower-realm (Pillars stop here) */}

      {/* ── THE WITNESS REGISTRY (The Interactive Footer) ── */}
      <footer className="witness-registry">

        {/* ── Registry Header — fills the space above the folder tabs ── */}
        <div className="registry-header">
          <div className="registry-header-inner">
            <span className="registry-header-rule" />
            <span className="registry-header-label">REGISTRE DES TÉMOINS</span>
            <span className="registry-header-rule" />
          </div>
          <div className="registry-header-ticker">
            <div className="registry-ticker-track">
              <span>JURIDICTION NUMÉRIQUE</span>
              <span className="rtick-sep">·</span>
              <span>LEX EST REX</span>
              <span className="rtick-sep">·</span>
              <span>AUDI ALTERAM PARTEM</span>
              <span className="rtick-sep">·</span>
              <span>FIAT JUSTITIA</span>
              <span className="rtick-sep">·</span>
              <span>IN NOMINE LEGIS</span>
              <span className="rtick-sep">·</span>
              <span>FORSALAW © 2026</span>
              <span className="rtick-sep">·</span>
              {/* Duplicate for seamless loop */}
              <span>JURIDICTION NUMÉRIQUE</span>
              <span className="rtick-sep">·</span>
              <span>LEX EST REX</span>
              <span className="rtick-sep">·</span>
              <span>AUDI ALTERAM PARTEM</span>
              <span className="rtick-sep">·</span>
              <span>FIAT JUSTITIA</span>
              <span className="rtick-sep">·</span>
              <span>IN NOMINE LEGIS</span>
              <span className="rtick-sep">·</span>
              <span>FORSALAW © 2026</span>
              <span className="rtick-sep">·</span>
            </div>
          </div>
        </div>

        <div className="registry-container">
          {/* Folder 1: AUDIENCE (Contact) */}
          <div className="registry-folder">
            <div className="registry-tab">
              <span className="tab-code">DOC. 01</span>
              <h4 className="tab-title">AUDIENCE</h4>
            </div>
            <div className="registry-content">
              <div className="registry-content-inner">
                <p className="registry-desc">Sollicitez une audience avec le Palais.</p>
                <a href="mailto:contact@forsalaw.tn" className="registry-link">contact@forsalaw.tn</a>
                <span className="registry-detail">+216 71 000 000</span>
              </div>
            </div>
          </div>

          {/* Folder 2: PRÉCÉDENTS (Links) */}
          <div className="registry-folder">
            <div className="registry-tab">
              <span className="tab-code">DOC. 02</span>
              <h4 className="tab-title">PRÉCÉDENTS</h4>
            </div>
            <div className="registry-content">
              <div className="registry-content-inner">
                <ul className="registry-grid">
                  <li><button onClick={() => onNavigate?.('about')}>Le Projet</button></li>
                  <li><button onClick={() => onNavigate?.('faq')}>Protocole</button></li>
                  <li><button onClick={() => onNavigate?.('privacy')}>Confidentialité</button></li>
                  <li><button onClick={() => onNavigate?.('terms')}>Législation</button></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Folder 3: SCEAUX (Socials) */}
          <div className="registry-folder">
            <div className="registry-tab">
              <span className="tab-code">DOC. 03</span>
              <h4 className="tab-title">SCEAUX</h4>
            </div>
            <div className="registry-content">
              <div className="registry-content-inner">
                <div className="registry-socials">
                  <a href="#" className="social-pill">LINKEDIN</a>
                  <a href="#" className="social-pill">TWITTER</a>
                  <a href="#" className="social-pill">FACEBOOK</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="registry-bottom-bar">
          <p className="registry-copyright">F O R S A L A W · ⚖ · LA JUSTICE EST DIGITALE · © 2026</p>
        </div>
      </footer>
    </motion.main>
  )
}
