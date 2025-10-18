import QuickActionButton from '../QuickActionButton'
import { DollarSign, Droplets, Wrench, FileText } from "lucide-react"

export default function QuickActionButtonExample() {
  return (
    <div className="grid grid-cols-4 gap-3">
      <QuickActionButton 
        icon={DollarSign}
        label="Оплатить"
        onClick={() => console.log('Pay clicked')}
      />
      <QuickActionButton 
        icon={Droplets}
        label="Счетчики"
        onClick={() => console.log('Meters clicked')}
      />
      <QuickActionButton 
        icon={Wrench}
        label="Заявка"
        onClick={() => console.log('Request clicked')}
      />
      <QuickActionButton 
        icon={FileText}
        label="Документы"
        onClick={() => console.log('Documents clicked')}
      />
    </div>
  )
}
