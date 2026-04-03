import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { MapPin, User, Shield, Briefcase, Star } from 'lucide-react'
import PageHeader from '../components/PageHeader'
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

// ─── Heavy Stone Tile Card Component ───────────────────────────────────────────
const TradingCard = ({ lawyer }) => {
  const { t } = useTranslation()
  return (
    <div className="lawyer-card-wrapper">
      <div className="lawyer-card">
        {/* Holographic Header */}
        <div className="card-header">
          <div className="card-header-bg" />
          <div className="card-rank">{lawyer.rank}</div>
          <div className="card-avatar">
            <User size={40} className="icon-heavy-shadow" />
          </div>
        </div>

        {/* Card Body */}
        <div className="card-body">
          <h3 className="card-name">{lawyer.name}</h3>
          <span className="card-specialty">{lawyer.specialty}</span>
          
          {/* RPG Stats */}
          <div className="card-stats">
            <div className="stat-box">
              <span className="stat-value">{lawyer.winRate}</span>
              <span className="stat-label">{t('lawyer_wins')}</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{lawyer.xp} {t('lawyer_years')}</span>
              <span className="stat-label">{t('lawyer_xp')}</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{lawyer.cases}</span>
              <span className="stat-label">{t('lawyer_cases')}</span>
            </div>
            <div className="stat-box">
              <span className="stat-value" style={{ color: 'var(--gold)' }}>
                {lawyer.rating} <Star size={10} className="icon-heavy-shadow" style={{ display: 'inline', fill: 'var(--gold)' }} />
              </span>
              <span className="stat-label">{t('lawyer_rating')}</span>
            </div>
          </div>

          <p className="card-location">
            <MapPin size={14} className="icon-heavy-shadow" /> {lawyer.location}
          </p>

          <button className="brutal-btn card-action">
            {t('lawyer_select')}
          </button>
        </div>
      </div>
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
      {/* Heavy Brutalist Header */}
      <PageHeader
        className="lawyers-header"
        tag={t('lawyers_tag')}
        tagClassName="lawyers-header-tag"
        title={t('lawyers_title')}
        titleClassName="lawyers-title"
      />

      <div className="lawyers-content">
        {/* Left Sidebar Filter (Brutalist style) */}
        <aside className="lawyers-sidebar">
          <div className="filter-group">
            <h3 className="filter-title">{t('lawyers_filter')}</h3>
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
