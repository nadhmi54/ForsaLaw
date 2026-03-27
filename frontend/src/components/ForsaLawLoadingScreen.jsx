import { motion } from 'framer-motion'

const EASE_SOFT = [0.45, 0, 0.55, 1]

/**
 * Écran de chargement ForsaLaw — overlay transparent (fond du site visible), logo Lady Justice.
 */
export default function ForsaLawLoadingScreen({ showBrandText }) {
  return (
    <motion.div
      className="forsalaw-loading-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2, ease: EASE_SOFT } }}
    >
      <div className="forsalaw-loading-inner">
        {/* Flottement vertical lent (logo entier) */}
        <motion.div
          className="forsalaw-loading-float"
          animate={{ y: [0, -7, 0] }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Balancement léger gauche / droite */}
          <motion.div
            className="forsalaw-loading-swing"
            animate={{ rotate: [-2.5, 2.5, -2.5] }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <motion.div
              className="forsalaw-loading-logo-wrap"
              initial={{ opacity: 0, scale: 0.9, filter: 'blur(12px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{
                duration: 0.85,
                ease: EASE_SOFT,
              }}
            >
              <img
                src="/fellawra.png"
                alt="ForsaLaw"
                className="forsalaw-loading-logo-img"
                draggable={false}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Nom + sous-titre après 1,5 s (contrôlé par le parent) */}
        <motion.div
          className="forsalaw-loading-brand"
          initial={false}
          animate={{
            opacity: showBrandText ? 1 : 0,
            y: showBrandText ? 0 : 12,
          }}
          transition={{ duration: 0.55, ease: EASE_SOFT }}
        >
          <h1 className="forsalaw-loading-title">ForsaLaw</h1>
          <p className="forsalaw-loading-tagline">Legal intelligence · confiance · clarté</p>
        </motion.div>

        {/* Points animés + barre de progression fine */}
        <div className="forsalaw-loading-indicators">
          <div className="forsalaw-loading-dots" aria-hidden>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="forsalaw-loading-dot"
                animate={{ opacity: [0.35, 1, 0.35] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.22,
                }}
              />
            ))}
          </div>
          <div className="forsalaw-loading-bar-track">
            <motion.div
              className="forsalaw-loading-bar-fill"
              initial={{ x: '-35%' }}
              animate={{ x: '200%' }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
