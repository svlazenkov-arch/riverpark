import ServiceRequestCard from '../ServiceRequestCard'

export default function ServiceRequestCardExample() {
  return (
    <div className="space-y-3">
      <ServiceRequestCard 
        request={{
          id: "1",
          title: "Не работает домофон",
          category: "Техническая проблема",
          status: "in_progress",
          createdAt: "15.12.2024",
          description: "В подъезде 3 не работает домофон. Невозможно открыть дверь с помощью ключа."
        }}
        onClick={() => console.log('Request clicked')}
      />
      <ServiceRequestCard 
        request={{
          id: "2",
          title: "Протечка в подвале",
          category: "Аварийная ситуация",
          status: "pending",
          createdAt: "16.12.2024",
          description: "Обнаружена протечка воды в подвале здания. Требуется срочный ремонт."
        }}
        onClick={() => console.log('Request clicked')}
      />
    </div>
  )
}
