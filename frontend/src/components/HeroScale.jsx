import { motion, useSpring } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import '../styles/HeroScale.css'

// ─── Scale of Fate Component ──────────────────────────────────────────────────
const HeroScale = ({ onNavigate }) => {
  const { t } = useTranslation()
  const [hoverSide, setHoverSide] = useState(null) // 'left' | 'right' | null

  // Spring rotation for the beam — heavy, weighted feel
  const rotation = useSpring(0, { stiffness: 35, damping: 8, mass: 3 })

  const handleHover = (side) => {
    setHoverSide(side)
    if (side === 'left')  rotation.set(-14)
    else if (side === 'right') rotation.set(14)
    else rotation.set(0)
  }

  return (
    <div className="scale-wrapper">
      {/* Fellawra PNG — centered above the beam */}
      <div className="fellawra-placeholder">
        <img
          src="/fellawra.png"
          alt="Fellawra — Gardienne de la Justice"
          className="fellawra-figure"
        />
        <span className="fellawra-name-tag">Fellawra · فيلورا</span>
      </div>

      {/* ── The Scale Beam (rotates as a whole) ── */}
      <motion.div
        className="scale-arm-container"
        style={{ rotate: rotation }}
      >
        {/* Center pivot pin */}
        <div className="scale-pivot-dot" />
        <div className="scale-beam" />

        {/* Chains + Pans hanging below beam */}
        <div className="scale-sides">
          {/* LEFT: Start a Case */}
          <motion.div
            className="scale-side"
            onMouseEnter={() => handleHover('left')}
            onMouseLeave={() => handleHover(null)}
            animate={{ y: hoverSide === 'left' ? 18 : 0 }}
            transition={{ type: 'spring', stiffness: 45, damping: 10 }}
          >
            <div className="scale-chain" />
            <button
              className={`scale-pan ${hoverSide === 'left' ? 'active' : ''}`}
              onClick={() => onNavigate?.('forum')}
            >
              <span className="scale-pan-label">Civil / Pénal</span>
              <span className="scale-pan-text">{t('start_case')}</span>
              <span className="scale-pan-arrow">→</span>
            </button>
          </motion.div>

          {/* RIGHT: Find a Lawyer */}
          <motion.div
            className="scale-side"
            onMouseEnter={() => handleHover('right')}
            onMouseLeave={() => handleHover(null)}
            animate={{ y: hoverSide === 'right' ? 18 : 0 }}
            transition={{ type: 'spring', stiffness: 45, damping: 10 }}
          >
            <div className="scale-chain" />
            <button
              className={`scale-pan ${hoverSide === 'right' ? 'active' : ''}`}
              onClick={() => onNavigate?.('lawyers')}
            >
              <span className="scale-pan-label">Barreau Tunisien</span>
              <span className="scale-pan-text">{t('find_lawyer')}</span>
              <span className="scale-pan-arrow">→</span>
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Pedestal base */}
      <div className="scale-base" />
    </div>
  )
}

export default HeroScale
