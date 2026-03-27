import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Shield, Scale, Users, ArrowRight, Lock, Compass } from 'lucide-react'
import HeroScale from '../components/HeroScale'
import '../styles/HomePage.css'

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.45, 0, 0.55, 1] },
}

export default function HomePage({ onNavigate }) {
  const { t } = useTranslation()

  const values = [
    { icon: Shield, key: 'home_v1' },
    { icon: Scale, key: 'home_v2' },
    { icon: Lock, key: 'home_v3' },
  ]

  const phases = [
    {
      img: '/home/home-phase-consultation.jpg',
      altKey: 'home_phase1_img_alt',
      titleKey: 'home_phase1_title',
      bodyKey: 'home_phase1_body',
      step: '01',
    },
    {
      img: '/home/home-phase-dossier.jpg',
      altKey: 'home_phase2_img_alt',
      titleKey: 'home_phase2_title',
      bodyKey: 'home_phase2_body',
      step: '02',
    },
    {
      img: '/home/home-phase-justice.jpg',
      altKey: 'home_phase3_img_alt',
      titleKey: 'home_phase3_title',
      bodyKey: 'home_phase3_body',
      step: '03',
    },
  ]

  const spaces = [
    {
      page: 'cases',
      img: '/home/home-phase-dossier.jpg',
      altKey: 'home_space_cases_alt',
      titleKey: 'nav_cases',
      descKey: 'home_space_cases_desc',
    },
    {
      page: 'lawyers',
      img: '/home/home-space-avocat.jpg',
      altKey: 'home_space_lawyers_alt',
      titleKey: 'nav_lawyers',
      descKey: 'home_space_lawyers_desc',
    },
    {
      page: 'client-space',
      img: '/home/home-phase-consultation.jpg',
      altKey: 'home_space_client_alt',
      titleKey: 'nav_client_space',
      descKey: 'home_space_client_desc',
    },
    {
      page: 'lawyer-space',
      img: '/home/home-phase-justice.jpg',
      altKey: 'home_space_lawyer_alt',
      titleKey: 'nav_lawyer_space',
      descKey: 'home_space_lawyer_desc',
    },
    {
      page: 'forum',
      img: '/home/home-space-forum.jpg',
      altKey: 'home_space_forum_alt',
      titleKey: 'nav_forum',
      descKey: 'home_space_forum_desc',
    },
    {
      page: 'ai',
      img: '/home/home-space-ai.jpg',
      altKey: 'home_space_ai_alt',
      titleKey: 'nav_ai',
      descKey: 'home_space_ai_desc',
    },
    {
      page: 'admin-space',
      img: '/home/home-space-admin.jpg',
      altKey: 'home_space_admin_alt',
      titleKey: 'nav_admin',
      descKey: 'home_space_admin_desc',
    },
  ]

  return (
    <motion.main
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Bandeau héro + image dédiée */}
      <section className="home-hero" aria-labelledby="home-hero-heading">
        <div className="home-hero-media">
          <img
            className="home-hero-img"
            src="/home/home-hero-palais.jpg"
            alt=""
            loading="eager"
            decoding="async"
          />
          <div className="home-hero-scrim" />
        </div>
        <div className="home-hero-inner">
          <p className="home-eyebrow">{t('home_eyebrow')}</p>
          <h1 id="home-hero-heading" className="home-hero-title">
            {t('home_hero_title')}
          </h1>
          <p className="home-hero-lead">{t('home_hero_lead')}</p>
          <div className="home-hero-actions">
            <button type="button" className="brutal-btn home-hero-btn" onClick={() => onNavigate?.('cases')}>
              {t('start_case')}
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="brutal-btn brutal-btn--ghost home-hero-btn"
              onClick={() => onNavigate?.('lawyers')}
            >
              {t('find_lawyer')}
              <Users size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Titre accueil + balance interactive (contenu existant) */}
      <section className="home-intro-block">
        <h2 className="home-section-title">{t('welcome')}</h2>
        <p className="home-section-sub">{t('subtitle')}</p>
        <HeroScale onNavigate={onNavigate} />
      </section>

      {/* Valeurs */}
      <section className="home-section home-values" aria-labelledby="home-values-heading">
        <motion.div className="home-section-head" {...fadeUp}>
          <h2 id="home-values-heading" className="home-section-title">
            {t('home_values_title')}
          </h2>
          <p className="home-section-sub home-section-sub--narrow">{t('home_values_sub')}</p>
        </motion.div>
        <ul className="home-values-grid">
          {values.map(({ icon: Icon, key }, i) => (
            <motion.li
              key={key}
              className="home-value-card"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <div className="home-value-icon">
                <Icon size={26} strokeWidth={1.75} />
              </div>
              <h3 className="home-value-title">{t(`${key}_title`)}</h3>
              <p className="home-value-text">{t(`${key}_text`)}</p>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* Parcours en 3 phases — image par phase */}
      <section className="home-section home-journey" aria-labelledby="home-journey-heading">
        <motion.div className="home-section-head" {...fadeUp}>
          <h2 id="home-journey-heading" className="home-section-title">
            {t('home_journey_title')}
          </h2>
          <p className="home-section-sub home-section-sub--narrow">{t('home_journey_sub')}</p>
        </motion.div>
        <ol className="home-journey-list">
          {phases.map((phase, i) => (
            <motion.li
              key={phase.step}
              className={`home-journey-row ${i % 2 === 1 ? 'home-journey-row--flip' : ''}`}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55 }}
            >
              <div className="home-journey-media">
                <span className="home-journey-step">{phase.step}</span>
                <img src={phase.img} alt={t(phase.altKey)} loading="lazy" decoding="async" />
              </div>
              <div className="home-journey-copy">
                <h3>{t(phase.titleKey)}</h3>
                <p>{t(phase.bodyKey)}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* Accès aux espaces — carte + image par espace */}
      <section className="home-section home-spaces" aria-labelledby="home-spaces-heading">
        <motion.div className="home-section-head" {...fadeUp}>
          <h2 id="home-spaces-heading" className="home-section-title">
            {t('home_spaces_title')}
          </h2>
          <p className="home-section-sub home-section-sub--narrow">{t('home_spaces_sub')}</p>
        </motion.div>
        <ul className="home-spaces-grid">
          {spaces.map((s, i) => (
            <motion.li
              key={s.page}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.06 }}
            >
              <button type="button" className="home-space-card" onClick={() => onNavigate?.(s.page)}>
                <div className="home-space-media">
                  <img src={s.img} alt={t(s.altKey)} loading="lazy" decoding="async" />
                  <div className="home-space-scrim" />
                </div>
                <div className="home-space-body">
                  <h3>{t(s.titleKey)}</h3>
                  <p>{t(s.descKey)}</p>
                  <span className="home-space-link">
                    {t('home_space_enter')} <ArrowRight size={16} />
                  </span>
                </div>
              </button>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* Bandeau confiance */}
      <section className="home-cta-band" aria-labelledby="home-cta-heading">
        <div className="home-cta-media">
          <img src="/home/home-trust-columns.jpg" alt="" loading="lazy" decoding="async" />
          <div className="home-cta-scrim" />
        </div>
        <div className="home-cta-inner">
          <Compass className="home-cta-icon" size={36} strokeWidth={1.25} aria-hidden />
          <h2 id="home-cta-heading">{t('home_cta_title')}</h2>
          <p>{t('home_cta_body')}</p>
          <button type="button" className="brutal-btn home-cta-btn" onClick={() => onNavigate?.('client-space')}>
            {t('home_cta_btn')}
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <footer className="home-footer">
        <p className="home-footer-brand">ForsaLaw</p>
        <p className="home-footer-tag">{t('home_footer_tag')}</p>
        <p className="home-footer-photo">{t('home_photo_credit')}</p>
      </footer>
    </motion.main>
  )
}
