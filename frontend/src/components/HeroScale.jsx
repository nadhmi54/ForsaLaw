import { motion, useSpring } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import JusticeSilhouette from './JusticeSilhouette'
import '../styles/HeroScale.css'

// ─── Balance unique : silhouette + plateaux intégrés, même animation ───────────
const HeroScale = ({ onNavigate }) => {
  const { t } = useTranslation()
  const [hoverSide, setHoverSide] = useState(null)

  const rotation = useSpring(0, { stiffness: 35, damping: 8, mass: 3 })

  const handleHoverSide = (side) => {
    setHoverSide(side)
    if (side === 'left') rotation.set(-12)
    else if (side === 'right') rotation.set(12)
    else rotation.set(0)
  }

  return (
    <div className="scale-wrapper">
      <div className="fellawra-placeholder">
        <img
          src="/fellawra.png"
          alt="Fellawra — Gardienne de la Justice"
          className="fellawra-figure"
        />
        <span className="fellawra-name-tag">Fellawra · فيلورا</span>
      </div>

      <motion.div
        className="scale-arm-container"
        style={{ rotate: rotation }}
      >
        <JusticeSilhouette
          className="justice-silhouette-root"
          onHoverSide={handleHoverSide}
          activeSide={hoverSide}
          onLeftClick={() => onNavigate?.('cases')}
          onRightClick={() => onNavigate?.('lawyers')}
          leftSlot={
            <>
              <span className="justice-pan-label">Civil / Pénal</span>
              <span className="justice-pan-text">{t('start_case')}</span>
              <span className="justice-pan-arrow">→</span>
            </>
          }
          rightSlot={
            <>
              <span className="justice-pan-label">Barreau Tunisien</span>
              <span className="justice-pan-text">{t('find_lawyer')}</span>
              <span className="justice-pan-arrow">→</span>
            </>
          }
        />
      </motion.div>

      <div className="scale-base" />
    </div>
  )
}

export default HeroScale
