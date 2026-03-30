import React, { useRef, useState, useEffect } from 'react'
import Lottie from 'lottie-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import scaleAnimation from '../assets/lottie/scale.json'
import '../styles/HeroScale.css'

/**
 * HERO SCALE — Lottie Integration
 * Uses the professional vector animation provided by the user.
 * 
 * Interaction:
 * - Hover Left: Play to Left-Tip frame
 * - Hover Right: Play to Right-Tip frame
 * - Idle: Settle to rest
 */
export default function HeroScale({ onNavigate }) {
  const { t } = useTranslation()
  const lottieRef = useRef()
  const [hovered, setHovered] = useState(null) // 'left' | 'right' | null

  // Frame segments based on the provided JSON:
  // 0 -> 30: Tip Right (17 deg)
  // 30 -> 74: Tip Left (-6 deg)
  // We use the segment 50 -> 74 for purely tipping Left, to avoid the right-swing at frame 30.
  // 30 -> 74: Tip Left (-6 deg)
  // We use setSpeed to make the reaction feel heavier and snappier.
  
  useEffect(() => {
    if (!lottieRef.current) return

    try {
      if (hovered === 'right') {
        // Tip right using native frames
        lottieRef.current.setSpeed(1.4)
        lottieRef.current.playSegments([0, 30], true)
      } else if (hovered === 'left') {
        // Tip left using native frames starting near center
        lottieRef.current.setSpeed(1.4)
        lottieRef.current.playSegments([50, 74], true)
      } else {
        // Return to balanced rest, smoothly fading to frame 0
        lottieRef.current.setSpeed(0.8)
        if (lottieRef.current.currentFrame > 35) {
          lottieRef.current.playSegments([lottieRef.current.currentFrame, 50], true)
        } else {
          lottieRef.current.playSegments([lottieRef.current.currentFrame, 0], true)
        }
      }
    } catch (e) {
      console.warn('Lottie frame seek error', e)
    }
  }, [hovered])

  return (
    <div className="scale-root lottie-version">
      {/* Monolithic Engraved Plaque */}
      <div className="scale-forsa-plaque">
        <span className="scale-plaque-title">F O R S A L A W</span>
      </div>

      <div className="scale-container">
        <Lottie
          lottieRef={lottieRef}
          animationData={scaleAnimation}
          loop={false}
          autoplay={true}
          initialSegment={[178, 179]}
          className="scale-lottie-asset"
        />

        {/* INVISIBLE HIT AREAS — Mapped to the pans in the animation */}
        <div className="scale-hit-overlay">
          <button
            className={`scale-hit-zone scale-hit-left ${hovered === 'left' ? 'is-active' : ''}`}
            onMouseEnter={() => setHovered('left')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onNavigate?.('cases')}
            aria-label={t('start_case')}
          >
            <div className={`scale-label-constant ${hovered === 'left' ? 'is-hovered' : ''}`}>
              <span className="scale-pan-label">CIVIL · PÉNAL</span>
              <span className="scale-pan-action">{t('start_case')}</span>
            </div>
          </button>

          <button
            className={`scale-hit-zone scale-hit-right ${hovered === 'right' ? 'is-active' : ''}`}
            onMouseEnter={() => setHovered('right')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onNavigate?.('lawyers')}
            aria-label={t('find_lawyer')}
          >
            <div className={`scale-label-constant ${hovered === 'right' ? 'is-hovered' : ''}`}>
              <span className="scale-pan-label">BARREAU TUNISIEN</span>
              <span className="scale-pan-action">{t('find_lawyer')}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
