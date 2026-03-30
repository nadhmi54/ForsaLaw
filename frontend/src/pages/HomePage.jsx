import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FileText, Users, MessageCircle, Sparkles, Shield, UserCog, ArrowRight } from 'lucide-react'
import HeroScale from '../components/HeroScale'
import '../styles/HomePage.css'
import '../styles/FooterRegistry.css'

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: [0.45, 0, 0.55, 1] },
}

const CHAMBERS = [
  {
    page: 'cases',
    icon: FileText,
    code: '01',
    titleFr: 'Archives de Vérité',
    subtitleFr: 'Vos dossiers juridiques, classifiés.',
  },
  {
    page: 'lawyers',
    icon: Users,
    code: '02',
    titleFr: 'Tableau du Barreau',
    subtitleFr: 'Trouvez votre avocat parmi l\'élite.',
  },
  {
    page: 'forum',
    icon: MessageCircle,
    code: '03',
    titleFr: 'La Place Publique',
    subtitleFr: 'La voix du peuple, en session ouverte.',
  },
  {
    page: 'ai',
    icon: Sparkles,
    code: '04',
    titleFr: 'Sanctuaire de Fellawra',
    subtitleFr: 'Intelligence légale à votre service.',
  },
  {
    page: 'client-space',
    icon: UserCog,
    code: '05',
    titleFr: 'Espace Citoyen',
    subtitleFr: 'Votre dossier personnel, sécurisé.',
  },
  {
    page: 'lawyer-space',
    icon: Shield,
    code: '06',
    titleFr: 'Cabinet de l\'Avocat',
    subtitleFr: 'Gérez vos causes avec autorité.',
  },
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

  return (
    <motion.main
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
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
          SECTION II — THE CHAMBERS OF LAW
          Monolithic door banners, no stock photos.
      ═══════════════════════════════════════════════════════ */}
      <section className="home-chambers">
        <motion.div className="home-section-header" {...fadeUp}>
          <p className="home-eyebrow">Navigation</p>
          <h2 className="home-section-title">Les Chambres du Palais</h2>
        </motion.div>

        <div className="home-chambers-list">
          {CHAMBERS.map((chamber, i) => {
            const Icon = chamber.icon
            return (
              <motion.button
                key={chamber.page}
                className="home-chamber-door"
                onClick={() => onNavigate?.(chamber.page)}
                initial={{ opacity: 0, x: i % 2 === 0 ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover="hovered"
              >
                <span className="home-chamber-code">{chamber.code}</span>
                <div className="home-chamber-icon-wrap">
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <div className="home-chamber-text">
                  <h3 className="home-chamber-title">{chamber.titleFr}</h3>
                  <p className="home-chamber-subtitle">{chamber.subtitleFr}</p>
                </div>
                <motion.span
                  className="home-chamber-arrow"
                  variants={{
                    hovered: { x: 6, opacity: 1 },
                    initial: { x: 0, opacity: 0.4 }
                  }}
                >
                  <ArrowRight size={20} />
                </motion.span>
              </motion.button>
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
              transition={{ duration: 0.55, delay: i * 0.1 }}
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
