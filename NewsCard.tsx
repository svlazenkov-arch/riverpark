import NewsCard from '../NewsCard'

export default function NewsCardExample() {
  return (
    <div className="space-y-3">
      <NewsCard 
        news={{
          id: "1",
          title: "Новогоднее украшение двора",
          excerpt: "Уважаемые жители! С 20 декабря начнется установка новогодних украшений на территории комплекса.",
          date: "15.12.2024",
          views: 234
        }}
        onClick={() => console.log('News clicked')}
      />
      <NewsCard 
        news={{
          id: "2",
          title: "Плановое отключение воды",
          excerpt: "18 декабря с 9:00 до 14:00 будет произведено плановое отключение холодной воды.",
          date: "14.12.2024",
          views: 567
        }}
        onClick={() => console.log('News clicked')}
      />
    </div>
  )
}
