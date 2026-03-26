import { useState, useRef } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MapPin, User, Shield, Briefcase, Star } from 'lucide-react'
import '../styles/Lawyers.css'

// ─── Placeholder Lawyer Data (Trading Cards) ──────────────────────────────────
const LAWYERS = [
  {
    id: 1,
    name: "Me. Youssef Dridi",
    title: "Avocat à la Cour de Cassation",
    specialty: "Droit Pénal",
    xp: 24, // Years of experience
    winRate: "92%",
    cases: 340,
    rating: 4.9,
    location: "Tunis, Centre Ville",
    rank: "S-TIER",
  },
  {
    id: 2,
    name: "Me. Hela Ben Ali",
    title: "Avocate au Barreau",
    specialty: "Droit des Affaires",
    xp: 12,
    winRate: "88%",
    cases: 125,
    rating: 4.7,
    location: "Sfax",
    rank: "A-TIER",
  },
  {
    id: 3,
    name: "Me. Karim Zayani",
    title: "Avocat Spécialiste",
    specialty: "Droit Immobilier",
    xp: 18,
    winRate: "95%",
    cases: 210,
    rating: 4.8,
    location: "Sousse",
    rank: "S-TIER",
  },
  {
    id: 4,
    name: "Me. Asma Mansour",
    title: "Avocate au Barreau",
    specialty: "Droit de la Famille",
    xp: 8,
    winRate: "90%",
    cases: 85,
    rating: 4.5,
    location: "Ariana",
    rank: "B-TIER",
  },
  {
    id: 5,
    name: "Me. Sami Kallel",
    title: "Avocat Conseil",
    specialty: "Droit du Travail",
    xp: 15,
    winRate: "85%",
    cases: 190,
    rating: 4.6,
    location: "Nabeul",
    rank: "A-TIER",
  },
  {
    id: 6,
    name: "Me. Nawel Gharbi",
    title: "Avocate à la Cour d'Appel",
    specialty: "Droit Pénal",
    xp: 10,
    winRate: "80%",
    cases: 110,
    rating: 4.3,
    location: "Tunis, Lac 2",
    rank: "B-TIER",
  }
]

const SPECIALTIES = ["Droit Pénal", "Droit des Affaires", "Droit Immobilier", "Droit de la Famille", "Droit du Travail"]
const REGIONS = ["Tunis", "Sfax", "Sousse", "Ariana", "Nabeul"]

// ─── 3D Tilt Trading Card Component ───────────────────────────────────────────
const TradingCard = ({ lawyer }) => {
  const ref = useRef(null)
  
  // Mouse position values for the 3D tilt
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Spring physics for smooth movement
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

  // Transform raw mouse coords into rotation degrees (-10deg to 10deg)
  const rotateX = useMotionTemplate`${mouseYSpring}deg`
  const rotateY = useMotionTemplate`${mouseXSpring}deg`

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    
    // Normalized coordinates from -1 to 1 based on mouse position within the card
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5

    // Multiplier determines the intensity of the tilt
    x.set(normalizedX * 20)
    y.set(normalizedY * -20) // inverted for correct axis tilt
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <div className="lawyer-card-wrapper" style={{ perspective: 1200 }}>
      <motion.div
        ref={ref}
        className="lawyer-card"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
      >
        {/* Holographic Header */}
        <div className="card-header">
          <div className="card-header-bg" />
          <div className="card-rank">{lawyer.rank}</div>
          <div className="card-avatar" style={{ transform: 'translateZ(30px)' }}>
            <User size={40} />
          </div>
        </div>

        {/* Card Body */}
        <div className="card-body">
          <h3 className="card-name" style={{ transform: 'translateZ(20px)' }}>{lawyer.name}</h3>
          <span className="card-specialty">{lawyer.specialty}</span>
          
          {/* RPG Stats */}
          <div className="card-stats" style={{ transform: 'translateZ(10px)' }}>
            <div className="stat-box">
              <span className="stat-value">{lawyer.winRate}</span>
              <span className="stat-label">Victoires</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{lawyer.xp} ans</span>
              <span className="stat-label">Expérience</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{lawyer.cases}</span>
              <span className="stat-label">Dossiers</span>
            </div>
            <div className="stat-box">
              <span className="stat-value" style={{ color: 'var(--gold)' }}>
                {lawyer.rating} <Star size={10} style={{ display: 'inline', fill: 'var(--gold)' }} />
              </span>
              <span className="stat-label">Évaluation</span>
            </div>
          </div>

          <p className="card-location">
            <MapPin size={14} /> {lawyer.location}
          </p>

          <button 
            className="card-action"
            style={{ transform: 'translateZ(25px)' }}
          >
            Sélectionner ce Maître ⚖
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main Page Component ──────────────────────────────────────────────────────
const LawyersPage = () => {
  const { t } = useTranslation()
  const [selectedSpecs, setSelectedSpecs] = useState([])

  const toggleSpec = (spec) => {
    setSelectedSpecs(prev => 
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    )
  }

  const filteredLawyers = selectedSpecs.length === 0 
    ? LAWYERS 
    : LAWYERS.filter(l => selectedSpecs.includes(l.specialty))

  return (
    <div className="lawyers-page">
      {/* Header */}
      <div className="lawyers-header">
        <div className="lawyers-header-tag">⚖ Salle des Avocats · غرفة المحامين</div>
        <h1 className="lawyers-title">Barreau Tunisien</h1>
        <p className="lawyers-subtitle">
          Consultez les profils de nos maîtres, vérifiez leurs statistiques judiciaires et choisissez le meilleur représentant pour votre cause.
        </p>
      </div>

      <div className="lawyers-content">
        {/* Left Sidebar Filters */}
        <aside className="lawyers-sidebar">
          <div className="filter-group">
            <h3 className="filter-title">Spécialité</h3>
            {SPECIALTIES.map(spec => (
              <label key={spec} className="filter-checkbox">
                <input 
                  type="checkbox" 
                  checked={selectedSpecs.includes(spec)}
                  onChange={() => toggleSpec(spec)}
                />
                {spec}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h3 className="filter-title">Région</h3>
            {REGIONS.map(reg => (
              <label key={reg} className="filter-checkbox">
                <input type="checkbox" />
                {reg}
              </label>
            ))}
          </div>
          
          <div className="filter-group" style={{ marginTop: '1rem' }}>
            <h3 className="filter-title">Rang (Tier List)</h3>
            <label className="filter-checkbox"><input type="checkbox" /> S-Tier (Expert)</label>
            <label className="filter-checkbox"><input type="checkbox" /> A-Tier (Sénior)</label>
            <label className="filter-checkbox"><input type="checkbox" /> B-Tier (Confirmé)</label>
          </div>
        </aside>

        {/* Right Grid (Trading Cards) */}
        <main className="cards-grid">
          {filteredLawyers.map((lawyer, idx) => (
            <motion.div
              key={lawyer.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
            >
              <TradingCard lawyer={lawyer} />
            </motion.div>
          ))}
        </main>
      </div>
    </div>
  )
}

export default LawyersPage
