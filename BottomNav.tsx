import BottomNav from '../BottomNav'
import { useState } from 'react'

export default function BottomNavExample() {
  const [activeTab, setActiveTab] = useState("home")
  
  return (
    <div className="relative h-20">
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
