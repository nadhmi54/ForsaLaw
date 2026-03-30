import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import '../styles/Calendar.css'

const DAYS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM']

// Mock data mapping perfectly to the 35-day grid for Avril 2026
// Avril 2026 starts on Wed (MER). LUN=30, MAR=31.
const generateMockAvril2026 = () => {
  const days = [];
  
  // Previous month padding (Mars 30, 31)
  days.push({ id: 'pad-1', day: 30, inactive: true });
  days.push({ id: 'pad-2', day: 31, inactive: true });
  
  // Avril 1 - 30
  for (let i = 1; i <= 30; i++) {
    let type = null;
    let subject = null;
    let time = null;
    
    // Some mock data
    if (i === 2) { type = 'booked'; subject = 'Signature Requête'; time = '14:30'; }
    else if (i === 9) { type = 'booked'; subject = 'Conseil Juridique'; time = '10:00'; }
    else if (i === 15) { type = 'available'; }
    else if (i === 16) { type = 'available'; }
    else if (i === 23) { type = 'available'; }
    else if (i === 28) { type = 'booked'; subject = 'Audience Tribunal'; time = '09:00'; }
    
    days.push({ id: `avr-${i}`, day: i, type, subject, time, inactive: false });
  }
  
  // Next month padding (Mai 1 - 3)
  days.push({ id: 'pad-3', day: 1, inactive: true });
  days.push({ id: 'pad-4', day: 2, inactive: true });
  days.push({ id: 'pad-5', day: 3, inactive: true });
  
  return days;
};

const MOCK_CALENDAR_DAYS = generateMockAvril2026();

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState("AVRIL 2026")
  
  return (
    <motion.main 
      className="calendar-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="calendar-top">
        <div>
          <div className="calendar-eyebrow">CHAMBRE IV · PLANIFICATION JURIDIQUE</div>
          <h1 className="calendar-title">CALENDRIER DE JUSTICE</h1>
          <div className="calendar-title-divider" />
          <p className="platform-subtitle" style={{ marginBottom: 0 }}>
            Réservez une séance solennelle avec vos conseillers légaux ou consultez vos audiences prévues.
          </p>
        </div>

        <div className="calendar-nav-controls">
          <button className="brutal-btn" style={{ padding: '0.75rem' }}><ChevronLeft size={20} /></button>
          <span className="calendar-month-label">{currentMonth}</span>
          <button className="brutal-btn" style={{ padding: '0.75rem' }}><ChevronRight size={20} /></button>
        </div>
      </header>

      <div className="calendar-grid-wrapper">
        {/* DAYS HEADER */}
        <div className="calendar-days-header">
          {DAYS.map(day => (
            <div key={day} className="calendar-day-name">{day}</div>
          ))}
        </div>

        {/* CALENDAR DAYS */}
        <div className="calendar-grid">
          {MOCK_CALENDAR_DAYS.map((dayObj) => (
            <div key={dayObj.id} className={`calendar-day-cell ${dayObj.inactive ? 'inactive' : ''}`}>
              <span className="calendar-day-number">{dayObj.day}</span>
              
              {!dayObj.inactive && dayObj.type === 'booked' && (
                <div className="calendar-appt">
                  <Clock size={10} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{dayObj.subject}</span>
                </div>
              )}

              {!dayObj.inactive && dayObj.type === 'available' && (
                <div className="calendar-available">
                  <Plus size={12} /> CRÉNEAU
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="calendar-legend">
         <div className="legend-item">
            <span className="legend-swatch booked" />
            AUDIENCE RÉSERVÉE
         </div>
         <div className="legend-item">
            <span className="legend-swatch available" />
            CRENEAU VACANT
         </div>
      </div>
    </motion.main>
  )
}
