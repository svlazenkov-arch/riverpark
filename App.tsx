import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import HomePage from "@/pages/HomePage";
import BillsPage from "@/pages/BillsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import ProfilePage from "@/pages/ProfilePage";
import NewsPage from "@/pages/NewsPage";
import ContactsPage from "@/pages/ContactsPage";
import AuthPage from "@/pages/AuthPage";
import AdminPage from "@/pages/AdminPage";

function Router() {
  const [location] = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();

  const getTitle = () => {
    switch (location) {
      case "/bills": return "Счета";
      case "/notifications": return "Уведомления";
      case "/profile": return "Профиль";
      case "/news": return "Новости";
      case "/contacts": return "Контакты";
      case "/admin": return "Админ панель";
      default: return "River Park";
    }
  };

  // Show landing page for unauthenticated users
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        title={getTitle()}
        notificationCount={3}
        isAdmin={user?.role === "admin"}
      />
      
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-lg mx-auto p-4">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/bills" component={BillsPage} />
            <Route path="/notifications" component={NotificationsPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/news" component={NewsPage} />
            <Route path="/contacts" component={ContactsPage} />
            <Route path="/admin">
              {user?.role === "admin" ? (
                <AdminPage />
              ) : (
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold mb-2">Доступ запрещён</h2>
                  <p className="text-muted-foreground">У вас нет прав для просмотра этой страницы</p>
                </div>
              )}
            </Route>
          </Switch>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
