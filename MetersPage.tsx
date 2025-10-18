import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import MeterReadingForm from "@/components/MeterReadingForm";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";
import type { MeterReading } from "@shared/schema";

type MeterType = "cold_water" | "hot_water" | "electricity" | "gas";

export default function MetersPage() {
  const { toast } = useToast();
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("ru-RU", { month: "long" });
  const currentYear = currentDate.getFullYear();

  const meterConfigs = [
    { id: "cold_water", name: "Холодная вода", icon: "water" as const, unit: "м³", type: "cold_water" as MeterType },
    { id: "hot_water", name: "Горячая вода", icon: "water" as const, unit: "м³", type: "hot_water" as MeterType },
    { id: "electricity", name: "Электричество", icon: "electricity" as const, unit: "кВт⋅ч", type: "electricity" as MeterType },
    { id: "gas", name: "Газ", icon: "gas" as const, unit: "м³", type: "gas" as MeterType },
  ];

  const { data: allReadings = [] } = useQuery<MeterReading[]>({
    queryKey: ["/api/meter-readings"],
  });

  const submitReadingMutation = useMutation({
    mutationFn: async ({ meterType, reading }: { meterType: MeterType; reading: number }) => {
      await apiRequest("POST", "/api/meter-readings", {
        meterType,
        reading: reading.toString(),
        month: currentMonth,
        year: currentYear,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meter-readings"] });
      toast({
        title: "Успешно",
        description: "Показания успешно отправлены",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось отправить показания",
        variant: "destructive",
      });
    },
  });

  const getLatestReading = (meterType: MeterType): number => {
    const readings = allReadings
      .filter(r => r.meterType === meterType)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    
    return readings.length > 0 ? parseFloat(readings[0].reading) : 0;
  };

  const getMeterHistory = (meterType: MeterType) => {
    return allReadings
      .filter(r => r.meterType === meterType)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 6);
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-medium mb-1">Следующая дата подачи</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Показания принимаются с 20 по 25 число каждого месяца
            </p>
            <p className="text-sm font-semibold text-primary">
              Текущий период: {currentMonth} {currentYear}
            </p>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="submit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submit" data-testid="tab-submit-readings">
            Подать показания
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-readings-history">
            История
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="space-y-3 mt-4">
          {meterConfigs.map((meter) => (
            <MeterReadingForm
              key={meter.id}
              meter={{
                id: meter.id,
                name: meter.name,
                icon: meter.icon,
                unit: meter.unit,
                lastReading: getLatestReading(meter.type),
              }}
              onSubmit={(value) => submitReadingMutation.mutate({ meterType: meter.type, reading: value })}
            />
          ))}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          {meterConfigs.map((meter) => {
            const history = getMeterHistory(meter.type);
            return (
              <Card key={meter.id} className="p-4" data-testid={`card-history-${meter.id}`}>
                <h3 className="font-medium mb-3">{meter.name}</h3>
                {history.length > 0 ? (
                  <div className="space-y-2">
                    {history.map((reading) => (
                      <div
                        key={reading.id}
                        className="flex justify-between items-center py-2 border-b last:border-0"
                        data-testid={`reading-${reading.id}`}
                      >
                        <span className="text-sm text-muted-foreground">
                          {reading.month} {reading.year}
                        </span>
                        <span className="font-medium">
                          {parseFloat(reading.reading).toFixed(2)} {meter.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Нет истории показаний
                  </p>
                )}
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
