import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

const EASE_SOFT = [0.45, 0, 0.55, 1]
const SRC_LOADING = '/video/forsalaw-loading.mp4'
const SRC_FALLBACK = '/video/forsalaw-hero-bg.mp4'

/** Pixels avec R,G,B ≥ ce seuil → transparents (fond blanc de la vidéo). */
const WHITE_KEY_THRESHOLD = 248

const MAX_CANVAS_SIDE = 640

/**
 * Chargement route (Suspense) — cercle + vidéo/canvas (keying blanc), léger balancement.
 */
export default function ForsaLawLoadingScreen() {
  const { t } = useTranslation()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const errorStepRef = useRef(0)
  const aliveRef = useRef(true)
  const [src, setSrc] = useState(SRC_LOADING)
  const [textOnly, setTextOnly] = useState(false)

  useEffect(() => {
    if (textOnly) return
    const el = videoRef.current
    if (!el) return
    const p = el.play()
    if (p && typeof p.catch === 'function') p.catch(() => {})
  }, [src, textOnly])

  useEffect(() => {
    if (textOnly) return
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    aliveRef.current = true
    let rafId = 0
    let lastFrameAt = 0

    const keyWhite = src === SRC_LOADING

    const loop = (t) => {
      if (!aliveRef.current) return
      rafId = requestAnimationFrame(loop)
      if (video.readyState < 2) return
      const now = typeof t === 'number' ? t : performance.now()
      if (now - lastFrameAt < 32) return
      lastFrameAt = now
      const vw = video.videoWidth
      const vh = video.videoHeight
      if (vw < 2 || vh < 2) return

      let cw = vw
      let ch = vh
      const maxDim = Math.max(vw, vh)
      if (maxDim > MAX_CANVAS_SIDE) {
        const s = MAX_CANVAS_SIDE / maxDim
        cw = Math.floor(vw * s)
        ch = Math.floor(vh * s)
      }

      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw
        canvas.height = ch
      }

      ctx.drawImage(video, 0, 0, cw, ch)

      if (!keyWhite) return

      try {
        const img = ctx.getImageData(0, 0, cw, ch)
        const d = img.data
        const T = WHITE_KEY_THRESHOLD
        for (let i = 0; i < d.length; i += 4) {
          if (d[i] >= T && d[i + 1] >= T && d[i + 2] >= T) {
            d[i + 3] = 0
          }
        }
        ctx.putImageData(img, 0, 0)
      } catch {
        // canvas taint / sécurité — on garde l’image brute
      }
    }

    rafId = requestAnimationFrame(loop)
    return () => {
      aliveRef.current = false
      cancelAnimationFrame(rafId)
    }
  }, [src, textOnly])

  const onVideoError = () => {
    if (errorStepRef.current === 0) {
      errorStepRef.current = 1
      setSrc(SRC_FALLBACK)
      return
    }
    if (errorStepRef.current === 1) {
      errorStepRef.current = 2
      setTextOnly(true)
    }
  }

  const shell = (
    <motion.div
      className="forsalaw-loading-root forsalaw-loading-root--video"
      role="status"
      aria-live="polite"
      aria-label={t('route_loading_aria')}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25, ease: EASE_SOFT } }}
    >
      <div className="forsalaw-loading-orbit">
        <motion.div
          className="forsalaw-loading-circle-frame"
          animate={{ rotate: [-2.5, 2.5, -2.5] }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {textOnly ? (
            <p className="forsalaw-loading-fallback-text forsalaw-loading-fallback-text--circle">
              {t('route_loading_aria')}
            </p>
          ) : (
            <div className="forsalaw-loading-video-wrap">
              <video
                key={src}
                ref={videoRef}
                className="forsalaw-loading-video-source"
                src={src}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden
                onError={onVideoError}
              />
              <canvas ref={canvasRef} className="forsalaw-loading-video-canvas" aria-hidden />
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )

  return createPortal(shell, document.body)
}
