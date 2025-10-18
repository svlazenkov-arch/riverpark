import ServiceRequestCard from "@/components/ServiceRequestCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertServiceRequestSchema, type ServiceRequest } from "@shared/schema";
import { useState } from "react";
import { z } from "zod";

const formSchema = insertServiceRequestSchema.omit({ 
  apartmentId: true, 
  userId: true,
  photos: true,
}).extend({
  title: z.string().min(5, "Заголовок должен содержать минимум 5 символов"),
  description: z.string().min(10, "Описание должно содержать минимум 10 символов"),
  category: z.string().min(1, "Выберите категорию"),
  priority: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function RequestsPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: requests = [] } = useQuery<ServiceRequest[]>({
    queryKey: ["/api/service-requests"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "normal",
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: FormData) => {
      await apiRequest("POST", "/api/service-requests", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-requests"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Успешно",
        description: "Заявка успешно создана",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать заявку",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createRequestMutation.mutate(data);
  };

  const activeRequests = requests.filter(r => r.status === "pending" || r.status === "in_progress");
  const completedRequests = requests.filter(r => r.status === "completed");

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-4">
      <Button 
        className="w-full"
        onClick={() => setDialogOpen(true)}
        data-testid="button-create-request"
      >
        <Plus className="w-4 h-4 mr-2" />
        Создать заявку
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-testid="dialog-create-request">
          <DialogHeader>
            <DialogTitle>Создать заявку</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Заголовок</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Краткое описание проблемы" 
                        {...field} 
                        data-testid="input-request-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Категория</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-request-category">
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Сантехника">Сантехника</SelectItem>
                        <SelectItem value="Электрика">Электрика</SelectItem>
                        <SelectItem value="Отопление">Отопление</SelectItem>
                        <SelectItem value="Освещение">Освещение</SelectItem>
                        <SelectItem value="Домофон">Домофон</SelectItem>
                        <SelectItem value="Лифт">Лифт</SelectItem>
                        <SelectItem value="Аварийная ситуация">Аварийная ситуация</SelectItem>
                        <SelectItem value="Другое">Другое</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Приоритет</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-request-priority">
                          <SelectValue placeholder="Выберите приоритет" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Низкий</SelectItem>
                        <SelectItem value="normal">Обычный</SelectItem>
                        <SelectItem value="high">Высокий</SelectItem>
                        <SelectItem value="urgent">Срочный</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Подробное описание проблемы" 
                        rows={4}
                        {...field} 
                        data-testid="textarea-request-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={createRequestMutation.isPending}
                data-testid="button-submit-request"
              >
                {createRequestMutation.isPending ? "Создание..." : "Создать заявку"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" data-testid="tab-active-requests">
            Активные ({activeRequests.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed-requests">
            Завершенные ({completedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3 mt-4">
          {activeRequests.length > 0 ? (
            activeRequests.map((request) => (
              <ServiceRequestCard 
                key={request.id}
                request={{
                  ...request,
                  status: request.status as "pending" | "in_progress" | "completed" | "rejected",
                  createdAt: formatDate(request.createdAt),
                }}
                onClick={() => console.log('Request clicked:', request.id)}
              />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Нет активных заявок
            </p>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 mt-4">
          {completedRequests.map((request) => (
            <ServiceRequestCard 
              key={request.id}
              request={{
                ...request,
                status: request.status as "pending" | "in_progress" | "completed" | "rejected",
                createdAt: formatDate(request.createdAt),
              }}
              onClick={() => console.log('Request clicked:', request.id)}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
