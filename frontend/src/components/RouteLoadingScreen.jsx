import { useEffect, useState } from 'react'
import ForsaLawLoadingScreen from './ForsaLawLoadingScreen'

export default function RouteLoadingScreen() {
  const [showBrandText, setShowBrandText] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setShowBrandText(true), 1500)
    return () => window.clearTimeout(t)
  }, [])

  return <ForsaLawLoadingScreen showBrandText={showBrandText} />
}

