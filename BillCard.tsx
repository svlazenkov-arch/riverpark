import BillCard from '../BillCard'

export default function BillCardExample() {
  return (
    <div className="space-y-3">
      <BillCard 
        bill={{
          id: "1",
          month: "Декабрь 2024",
          amount: 5420,
          status: "unpaid",
          dueDate: "10.01.2025"
        }}
        onPay={() => console.log('Pay clicked')}
        onView={() => console.log('View clicked')}
      />
      <BillCard 
        bill={{
          id: "2",
          month: "Ноябрь 2024",
          amount: 5180,
          status: "paid",
          dueDate: "10.12.2024"
        }}
        onView={() => console.log('View clicked')}
      />
    </div>
  )
}
