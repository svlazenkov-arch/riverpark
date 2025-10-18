import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import BillCard from "@/components/BillCard";
import StatCard from "@/components/StatCard";
import { DollarSign, FileText, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { Bill } from "@shared/schema";

export default function BillsPage() {
  const { toast } = useToast();

  const { data: bills = [] } = useQuery<Bill[]>({
    queryKey: ["/api/bills"],
  });

  const payBillMutation = useMutation({
    mutationFn: async (billId: string) => {
      await apiRequest("POST", `/api/bills/${billId}/pay`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      toast({
        title: "Успешно оплачено",
        description: "Счет успешно оплачен",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось оплатить счет",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const unpaidBills = bills.filter(b => b.status === "unpaid");
  const paidBills = bills.filter(b => b.status === "paid");
  const totalUnpaid = unpaidBills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <StatCard 
          icon={DollarSign}
          label="К оплате"
          value={`${totalUnpaid.toLocaleString("ru-RU")} ₽`}
        />
        <StatCard 
          icon={FileText}
          label="Всего"
          value={bills.length}
        />
        <StatCard 
          icon={CheckCircle}
          label="Оплачено"
          value={paidBills.length}
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" data-testid="tab-all-bills">
            Все ({bills.length})
          </TabsTrigger>
          <TabsTrigger value="unpaid" data-testid="tab-unpaid-bills">
            Не оплачено ({unpaidBills.length})
          </TabsTrigger>
          <TabsTrigger value="paid" data-testid="tab-paid-bills">
            Оплачено ({paidBills.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-4">
          {bills.map((bill) => (
            <BillCard 
              key={bill.id}
              bill={{
                id: bill.id,
                month: `${bill.month} ${bill.year}`,
                amount: parseFloat(bill.amount),
                status: bill.status as "paid" | "unpaid" | "overdue",
                dueDate: formatDate(bill.dueDate)
              }}
              onPay={() => payBillMutation.mutate(bill.id)}
              onView={() => console.log('View bill:', bill.id)}
            />
          ))}
        </TabsContent>

        <TabsContent value="unpaid" className="space-y-3 mt-4">
          {unpaidBills.length > 0 ? (
            unpaidBills.map((bill) => (
              <BillCard 
                key={bill.id}
                bill={{
                  id: bill.id,
                  month: `${bill.month} ${bill.year}`,
                  amount: parseFloat(bill.amount),
                  status: bill.status as "paid" | "unpaid" | "overdue",
                  dueDate: formatDate(bill.dueDate)
                }}
                onPay={() => payBillMutation.mutate(bill.id)}
                onView={() => console.log('View bill:', bill.id)}
              />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Нет неоплаченных счетов
            </p>
          )}
        </TabsContent>

        <TabsContent value="paid" className="space-y-3 mt-4">
          {paidBills.map((bill) => (
            <BillCard 
              key={bill.id}
              bill={{
                id: bill.id,
                month: `${bill.month} ${bill.year}`,
                amount: parseFloat(bill.amount),
                status: bill.status as "paid" | "unpaid" | "overdue",
                dueDate: formatDate(bill.dueDate)
              }}
              onView={() => console.log('View bill:', bill.id)}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
