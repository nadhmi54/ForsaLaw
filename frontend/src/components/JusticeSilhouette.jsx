/**
 * Balance + deux zones cliquables intégrées dans la même composition (overlay aligné sur les coupelles).
 * Les plateaux du SVG sont en contour uniquement ; le remplissage vient des boutons.
 */
const JusticeSilhouette = ({
  className = '',
  leftSlot,
  rightSlot,
  onLeftClick,
  onRightClick,
  onHoverSide,
  activeSide = null,
}) => {
  const handleEnter = (side) => () => onHoverSide?.(side)
  const handleLeave = () => onHoverSide?.(null)

  return (
    <div className={`justice-unified ${className}`}>
      <svg
        className="justice-unified-svg"
        viewBox="0 0 260 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        role="img"
      >
        {/* Axe central */}
        <line x1="130" y1="24" x2="130" y2="170" stroke="#0B0B0B" strokeWidth="5" strokeLinecap="round" />
        <circle cx="130" cy="22" r="4" fill="#0B0B0B" />

        {/* Traverse */}
        <line x1="62" y1="32" x2="198" y2="32" stroke="#0B0B0B" strokeWidth="4" strokeLinecap="round" />
        <circle cx="62" cy="32" r="3.2" fill="#0B0B0B" />
        <circle cx="198" cy="32" r="3.2" fill="#0B0B0B" />
        <circle cx="130" cy="32" r="3.2" fill="#0B0B0B" />

        {/* Cordes gauche */}
        <line x1="62" y1="32" x2="42" y2="78" stroke="#1A1A1A" strokeWidth="1.2" />
        <line x1="62" y1="32" x2="82" y2="78" stroke="#1A1A1A" strokeWidth="1.2" />
        <line x1="62" y1="32" x2="62" y2="78" stroke="#1A1A1A" strokeWidth="1.2" />

        {/* Cordes droite */}
        <line x1="198" y1="32" x2="178" y2="78" stroke="#1A1A1A" strokeWidth="1.2" />
        <line x1="198" y1="32" x2="218" y2="78" stroke="#1A1A1A" strokeWidth="1.2" />
        <line x1="198" y1="32" x2="198" y2="78" stroke="#1A1A1A" strokeWidth="1.2" />

        {/* Contours des coupelles uniquement (pas de remplissage séparé) */}
        <path
          d="M34 78H90C86 94 74 104 62 104C50 104 38 94 34 78Z"
          fill="none"
          stroke="rgba(212,175,55,0.45)"
          strokeWidth="1.2"
        />
        <path
          d="M170 78H226C222 94 210 104 198 104C186 104 174 94 170 78Z"
          fill="none"
          stroke="rgba(212,175,55,0.45)"
          strokeWidth="1.2"
        />

        {/* Pied */}
        <rect x="124" y="170" width="12" height="20" rx="3" fill="#0B0B0B" />
        <rect x="108" y="190" width="44" height="8" rx="4" fill="#0B0B0B" />
        <rect x="98" y="200" width="64" height="8" rx="4" fill="#0B0B0B" />
      </svg>

      <div className="justice-pan-overlay" aria-hidden={false}>
        <button
          type="button"
          className={`justice-pan-btn justice-pan-btn--left ${activeSide === 'left' ? 'is-active' : ''}`}
          onClick={onLeftClick}
          onMouseEnter={handleEnter('left')}
          onMouseLeave={handleLeave}
        >
          {leftSlot}
        </button>
        <button
          type="button"
          className={`justice-pan-btn justice-pan-btn--right ${activeSide === 'right' ? 'is-active' : ''}`}
          onClick={onRightClick}
          onMouseEnter={handleEnter('right')}
          onMouseLeave={handleLeave}
        >
          {rightSlot}
        </button>
      </div>
    </div>
  )
}

export default JusticeSilhouette
