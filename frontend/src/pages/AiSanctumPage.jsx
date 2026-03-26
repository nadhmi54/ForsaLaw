import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SendIcon } from 'lucide-react'
import '../styles/AiSanctum.css'

// Custom hook for the typewriter effect
const useTypewriter = (text, startTyping, speed = 30) => {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Function to instantly show all text if clicked
  const skipTyping = () => {
    setDisplayedText(text)
    setIsTyping(false)
  }

  useEffect(() => {
    if (!startTyping || !text) return

    setDisplayedText('')
    setIsTyping(true)
    let i = 0

    const intervalId = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1))
      i++
      if (i >= text.length) {
        clearInterval(intervalId)
        setIsTyping(false)
      }
    }, speed)

    return () => clearInterval(intervalId)
  }, [text, startTyping, speed])

  return { displayedText, isTyping, skipTyping }
}

const INTRO_DIALOGUE = "Bienvenue dans le Sanctuaire, citoyen. Je suis Fellawra. L'injustice se cache souvent dans la complexité des lois. Quel problème juridique puis-je éclairer pour vous aujourd'hui ?"

const AiSanctumPage = () => {
  const [history, setHistory] = useState([])
  const [currentThought, setCurrentThought] = useState(INTRO_DIALOGUE)
  const [userInput, setUserInput] = useState('')
  const [waitingForResponse, setWaitingForResponse] = useState(false)
  const [dialogueTrigger, setDialogueTrigger] = useState(true)
  
  const historyEndRef = useRef(null)

  // Typewriter controls for the active dialogue box
  const { displayedText, isTyping, skipTyping } = useTypewriter(currentThought, dialogueTrigger, 25)

  // Auto-scroll history
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!userInput.trim() || isTyping) return

    // 1. Move current Fellawra thought to history (if she just spoke)
    if (currentThought) {
      setHistory(prev => [...prev, { sender: 'System', text: currentThought }])
    }

    // 2. Add user message to history
    const userMessage = userInput.trim()
    setHistory(prev => [...prev, { sender: 'User', text: userMessage }])
    
    // 3. Clear interfaces and wait
    setUserInput('')
    setCurrentThought('')
    setDialogueTrigger(false)
    setWaitingForResponse(true)

    // 4. Mock AI Delay & Response
    setTimeout(() => {
      setWaitingForResponse(false)
      const mockResponse = `Je comprends votre situation concernant "${userMessage.substring(0, 15)}...". Selon la jurisprudence tunisienne, vous avez plusieurs recours. Souhaitez-vous que je vous aide à constituer un dossier pour le Palais, ou cherchez-vous simplement l'avis d'un maître avocat ?`
      setCurrentThought(mockResponse)
      setDialogueTrigger(true) // restart typewriter
    }, 1500)
  }

  const handleBoxClick = () => {
    if (isTyping) {
      skipTyping()
    }
  }

  return (
    <div className="sanctum-page">
      {/* Background Sprite */}
      <div className="sanctum-sprite-container">
        <motion.img 
          src="/fellawra.png" 
          alt="Fellawra Oracle" 
          className="sanctum-sprite"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>

      {/* Main Interactive Interface (Bottom Anchored) */}
      <motion.div 
        className="dialogue-interface"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 50 }}
      >
        
        {/* Chat History */}
        {history.length > 0 && (
          <div className="dialogue-history">
            {history.map((msg, idx) => (
              <motion.div 
                key={idx} 
                className={`history-bubble ${msg.sender === 'System' ? 'ai' : 'user'}`}
                initial={{ opacity: 0, x: msg.sender === 'User' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="history-sender">{msg.sender === 'System' ? 'Fellawra' : 'Vous'}</div>
                {msg.text}
              </motion.div>
            ))}
            <div ref={historyEndRef} />
          </div>
        )}

        {/* The RPG Dialogue Box (Only shows if System is speaking or typing) */}
        <AnimatePresence>
          {(currentThought || waitingForResponse) && (
            <motion.div 
              className="dialogue-box"
              onClick={handleBoxClick}
              initial={{ opacity: 0, scaleY: 0.8 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="dialogue-name-tab">FELLAWRA</div>
              
              <div className="dialogue-text">
                {waitingForResponse ? (
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>L'Oracle consulte les anciens textes...</span>
                ) : (
                  <>
                    {displayedText}
                    {isTyping && <span className="dialogue-cursor" />}
                  </>
                )}
              </div>

              {/* Blinking indicator for continuation */}
              {!isTyping && !waitingForResponse && <div className="dialogue-continue" />}
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Input Area */}
        <form className="sanctum-input-container" onSubmit={handleSubmit}>
          <input 
            type="text" 
            className="sanctum-input" 
            placeholder="Posez votre question juridique..." 
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isTyping || waitingForResponse}
            autoFocus
          />
          <button 
            type="submit" 
            className="sanctum-submit"
            disabled={!userInput.trim() || isTyping || waitingForResponse}
          >
            <SendIcon size={20} />
          </button>
        </form>

      </motion.div>
    </div>
  )
}

export default AiSanctumPage
