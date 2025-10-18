import DocumentCard from '../DocumentCard'

export default function DocumentCardExample() {
  return (
    <div className="space-y-3">
      <DocumentCard 
        document={{
          id: "1",
          title: "Протокол общего собрания от 15.11.2024",
          type: "PDF",
          date: "15.11.2024",
          size: "2.4 МБ"
        }}
        onDownload={() => console.log('Download clicked')}
      />
      <DocumentCard 
        document={{
          id: "2",
          title: "Правила внутреннего распорядка ЖК River Park",
          type: "PDF",
          date: "01.09.2024",
          size: "1.8 МБ"
        }}
        onDownload={() => console.log('Download clicked')}
      />
    </div>
  )
}
