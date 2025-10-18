import { useQuery } from "@tanstack/react-query";
import NewsCard from "@/components/NewsCard";
import type { News as NewsType } from "@shared/schema";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function NewsPage() {
  const { data: newsData = [], isLoading } = useQuery<NewsType[]>({
    queryKey: ["/api/news"],
  });

  const news = newsData.map(item => ({
    id: item.id,
    title: item.title,
    excerpt: item.excerpt,
    date: format(new Date(item.publishedAt), "d MMMM yyyy", { locale: ru }),
    views: item.views,
    imageUrl: item.imageUrl || undefined,
  }));

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-card-border rounded-md p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Новостей пока нет</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-heading font-semibold mb-4" data-testid="heading-news">
        Новости и объявления
      </h2>
      {news.map((item) => (
        <NewsCard 
          key={item.id} 
          news={item}
          onClick={() => console.log('News clicked:', item.id)}
        />
      ))}
    </div>
  );
}
