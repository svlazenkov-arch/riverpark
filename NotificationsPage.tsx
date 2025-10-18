import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertCircle, Info, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Notification } from "@shared/schema";

export default function NotificationsPage() {
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PATCH", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const unreadNotifications = notifications.filter(n => !n.isRead);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "success": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error": return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const NotificationCard = ({ notification }: { notification: Notification }) => (
    <Card 
      className={`p-4 hover-elevate active-elevate-2 cursor-pointer ${
        !notification.isRead ? "bg-primary/5 border-primary/20" : ""
      }`}
      onClick={() => !notification.isRead && markAsReadMutation.mutate(notification.id)}
      data-testid={`card-notification-${notification.id}`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-medium" data-testid={`text-notification-title-${notification.id}`}>
              {notification.title}
            </h3>
            {!notification.isRead && (
              <Badge variant="default" className="flex-shrink-0">Новое</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground">{formatDate(notification.createdAt)}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all" data-testid="tab-all-notifications">
            Все ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread" data-testid="tab-unread-notifications">
            Непрочитанные ({unreadNotifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Нет уведомлений
            </p>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-3 mt-4">
          {unreadNotifications.length > 0 ? (
            unreadNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Нет непрочитанных уведомлений
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
