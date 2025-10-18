import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import QuickActionButton from "@/components/QuickActionButton";
import BillCard from "@/components/BillCard";
import NewsCard from "@/components/NewsCard";
import { DollarSign, Droplets, Wrench, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import MetersPage from "./MetersPage";
import RequestsPage from "./RequestsPage";
import DocumentsPage from "./DocumentsPage";
import type { Bill, News } from "@shared/schema";

export default function HomePage() {
  const { user } = useAuth();
  const [metersDialogOpen, setMetersDialogOpen] = useState(false);
  const [requestsDialogOpen, setRequestsDialogOpen] = useState(false);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);

  const { data: bills = [] } = useQuery<Bill[]>({
    queryKey: ["/api/bills"],
  });

  const { data: newsList = [] } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });

  const unpaidBills = bills.filter(b => b.status === "unpaid");
  const latestNews = newsList.slice(0, 2);
  const totalUnpaid = unpaidBills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 rounded-lg">
        <h2 className="text-xl font-heading font-semibold mb-1">Добро пожаловать!</h2>
        <p className="text-sm text-primary-foreground/90 mb-4">
          {user?.firstName} {user?.lastName}
        </p>
        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-md p-4">
          <p className="text-xs text-primary-foreground/80 mb-1">К оплате</p>
          <p className="text-3xl font-bold">
            {totalUnpaid.toLocaleString("ru-RU")} ₽
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Быстрые действия</h3>
        <div className="grid grid-cols-4 gap-3">
          <QuickActionButton 
            icon={DollarSign}
            label="Оплатить"
            onClick={() => console.log('Pay clicked')}
          />
          <QuickActionButton 
            icon={Droplets}
            label="Счетчики"
            onClick={() => setMetersDialogOpen(true)}
          />
          <QuickActionButton 
            icon={Wrench}
            label="Заявка"
            onClick={() => setRequestsDialogOpen(true)}
          />
          <QuickActionButton 
            icon={FileText}
            label="Документы"
            onClick={() => setDocumentsDialogOpen(true)}
          />
        </div>
      </div>

      <Dialog open={metersDialogOpen} onOpenChange={setMetersDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto" data-testid="dialog-meters">
          <DialogHeader>
            <DialogTitle>Показания счетчиков</DialogTitle>
          </DialogHeader>
          <MetersPage />
        </DialogContent>
      </Dialog>

      <Dialog open={requestsDialogOpen} onOpenChange={setRequestsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto" data-testid="dialog-requests">
          <DialogHeader>
            <DialogTitle>Заявки на обслуживание</DialogTitle>
          </DialogHeader>
          <RequestsPage />
        </DialogContent>
      </Dialog>

      <Dialog open={documentsDialogOpen} onOpenChange={setDocumentsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto" data-testid="dialog-documents">
          <DialogHeader>
            <DialogTitle>Документы</DialogTitle>
          </DialogHeader>
          <DocumentsPage />
        </DialogContent>
      </Dialog>

      {unpaidBills.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Неоплаченные счета</h3>
          <div className="space-y-3">
            {unpaidBills.map((bill) => (
              <BillCard 
                key={bill.id}
                bill={{
                  id: bill.id,
                  month: `${bill.month} ${bill.year}`,
                  amount: parseFloat(bill.amount),
                  status: bill.status as "paid" | "unpaid" | "overdue",
                  dueDate: formatDate(bill.dueDate)
                }}
                onPay={() => console.log('Pay bill:', bill.id)}
                onView={() => console.log('View bill:', bill.id)}
              />
            ))}
          </div>
        </div>
      )}

      {latestNews.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Новости</h3>
            <Button variant="ghost" size="sm" data-testid="button-all-news">
              Все новости
            </Button>
          </div>
          <div className="space-y-3">
            {latestNews.map((newsItem) => (
              <NewsCard 
                key={newsItem.id}
                news={{
                  id: newsItem.id,
                  title: newsItem.title,
                  excerpt: newsItem.excerpt,
                  date: formatDate(newsItem.publishedAt),
                  views: newsItem.views,
                  imageUrl: newsItem.imageUrl || undefined
                }}
                onClick={() => console.log('News clicked:', newsItem.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
