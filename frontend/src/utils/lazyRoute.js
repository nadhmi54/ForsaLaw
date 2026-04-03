import { lazy } from 'react'

function effectiveMinMs(minMs) {
  if (typeof window === 'undefined') return minMs
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return 0
  } catch {
    // ignore
  }
  return minMs
}

/** Durée minimale d’affichage du loader (vidéo dans le panneau) avant d’afficher la page. */
const DEFAULT_MIN_LOADING_MS = 2400

/**
 * lazy() avec attente minimale pour que le fallback Suspense reste visible assez longtemps
 * (sinon le chunk en cache disparaît en ~1 s ou moins).
 */
export function lazyRoute(importFn, minMs = DEFAULT_MIN_LOADING_MS) {
  return lazy(() => {
    const ms = effectiveMinMs(minMs)
    return Promise.all([
      importFn(),
      new Promise((resolve) => setTimeout(resolve, ms)),
    ]).then(([mod]) => mod)
  })
}
