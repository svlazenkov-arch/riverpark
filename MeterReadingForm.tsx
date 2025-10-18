import MeterReadingForm from '../MeterReadingForm'

export default function MeterReadingFormExample() {
  return (
    <div className="space-y-3">
      <MeterReadingForm 
        meter={{
          id: "1",
          name: "Холодная вода",
          icon: "water",
          lastReading: 123.45,
          unit: "м³"
        }}
        onSubmit={(val) => console.log('Water reading:', val)}
      />
      <MeterReadingForm 
        meter={{
          id: "2",
          name: "Электричество",
          icon: "electricity",
          lastReading: 5678.9,
          unit: "кВт·ч"
        }}
        onSubmit={(val) => console.log('Electricity reading:', val)}
      />
    </div>
  )
}
