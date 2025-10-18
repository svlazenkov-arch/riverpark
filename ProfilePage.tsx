import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, 
  Home, 
  Phone, 
  Mail, 
  Bell, 
  Moon, 
  LogOut,
  ChevronRight,
  FileText
} from "lucide-react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Apartment } from "@shared/schema";
import DocumentsPage from "./DocumentsPage";

const editProfileSchema = z.object({
  firstName: z.string().min(1, "Введите имя"),
  lastName: z.string().min(1, "Введите фамилию"),
  phone: z.string().optional(),
  email: z.string().email("Неверный формат email").optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [apartmentDialogOpen, setApartmentDialogOpen] = useState(false);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [editProfileDialogOpen, setEditProfileDialogOpen] = useState(false);

  const { data: apartments = [], isLoading: apartmentsLoading } = useQuery<Apartment[]>({
    queryKey: ["/api/apartments"],
    enabled: !!user, // Загружаем только когда пользователь авторизован
  });

  const updateApartmentMutation = useMutation({
    mutationFn: async (apartmentId: string) => {
      await apiRequest("PATCH", "/api/user/apartment", { apartmentId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setApartmentDialogOpen(false);
      toast({
        title: "Успешно",
        description: "Квартира успешно привязана",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось привязать квартиру",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из системы",
        variant: "destructive",
      });
    },
  });

  const editProfileForm = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
      email: user?.email || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: EditProfileFormData) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setEditProfileDialogOpen(false);
      toast({
        title: "Успешно",
        description: "Профиль обновлен",
      });
    },
    onError: (error: Error) => {
      // apiRequest throws error in format: "400: {\"message\":\"...\"}"
      // Extract the JSON message if possible
      let errorMessage = "Не удалось обновить профиль";
      try {
        const match = error.message.match(/\d+:\s*(\{.*\})/);
        if (match && match[1]) {
          const errorData = JSON.parse(match[1]);
          errorMessage = errorData.message || errorMessage;
        } else {
          errorMessage = error.message;
        }
      } catch {
        errorMessage = error.message;
      }
      
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onEditProfile = (data: EditProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const MenuItem = ({ 
    icon: Icon, 
    label, 
    onClick, 
    rightElement 
  }: { 
    icon: any; 
    label: string; 
    onClick?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-card border border-card-border rounded-md hover-elevate active-elevate-2"
      data-testid={`button-menu-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-muted-foreground" />
        <span>{label}</span>
      </div>
      {rightElement || <ChevronRight className="w-5 h-5 text-muted-foreground" />}
    </button>
  );

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return "JU";
  };

  const getUserApartment = () => {
    if (!user?.apartmentId) return null;
    return apartments.find(apt => apt.id === user.apartmentId);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user?.profileImageUrl || ""} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-semibold text-lg" data-testid="text-user-name">
              {user?.firstName} {user?.lastName}
            </h2>
            <Dialog open={apartmentDialogOpen} onOpenChange={setApartmentDialogOpen}>
              <DialogTrigger asChild>
                <button 
                  className="text-sm text-primary hover:underline text-left"
                  data-testid="button-link-apartment"
                >
                  {getUserApartment() 
                    ? `Квартира ${getUserApartment()?.number}, Подъезд ${getUserApartment()?.entrance}` 
                    : "Привязать квартиру"}
                </button>
              </DialogTrigger>
              <DialogContent data-testid="dialog-apartment">
                <DialogHeader>
                  <DialogTitle>Выберите квартиру</DialogTitle>
                </DialogHeader>
                <div className="grid gap-2 py-4">
                  {apartmentsLoading ? (
                    <p className="text-center text-muted-foreground py-4">Загрузка...</p>
                  ) : apartments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Список квартир пуст. Обратитесь к администратору.
                    </p>
                  ) : (
                    apartments.map((apartment) => (
                      <Button
                        key={apartment.id}
                        variant={user?.apartmentId === apartment.id ? "default" : "outline"}
                        className="justify-start"
                        onClick={() => updateApartmentMutation.mutate(apartment.id)}
                        disabled={updateApartmentMutation.isPending}
                        data-testid={`button-select-apartment-${apartment.number}`}
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Квартира {apartment.number}, Подъезд {apartment.entrance}
                      </Button>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-3">
          {user?.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span data-testid="text-user-phone">{user.phone}</span>
            </div>
          )}
          {user?.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span data-testid="text-user-email">{user.email}</span>
            </div>
          )}
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="font-semibold px-1">Настройки</h3>
        
        <MenuItem 
          icon={Bell}
          label="Уведомления"
          rightElement={
            <Switch 
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
              data-testid="switch-notifications"
            />
          }
        />

        <MenuItem 
          icon={Moon}
          label="Темная тема"
          rightElement={
            <Switch 
              checked={darkMode}
              onCheckedChange={setDarkMode}
              data-testid="switch-dark-mode"
            />
          }
        />

        <MenuItem 
          icon={FileText}
          label="Документы"
          onClick={() => setDocumentsDialogOpen(true)}
        />

        <MenuItem 
          icon={User}
          label="Редактировать профиль"
          onClick={() => setEditProfileDialogOpen(true)}
        />
      </div>

      <Button 
        variant="destructive" 
        className="w-full"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
        data-testid="button-logout"
      >
        <LogOut className="w-4 h-4 mr-2" />
        {logoutMutation.isPending ? "Выход..." : "Выйти"}
      </Button>

      <Dialog open={editProfileDialogOpen} onOpenChange={setEditProfileDialogOpen}>
        <DialogContent data-testid="dialog-edit-profile">
          <DialogHeader>
            <DialogTitle>Редактировать профиль</DialogTitle>
            <DialogDescription>
              Обновите информацию о себе
            </DialogDescription>
          </DialogHeader>
          <Form {...editProfileForm}>
            <form onSubmit={editProfileForm.handleSubmit(onEditProfile)} className="space-y-4">
              <FormField
                control={editProfileForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Введите имя"
                        data-testid="input-first-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editProfileForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Фамилия</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Введите фамилию"
                        data-testid="input-last-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editProfileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Телефон</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+7 (999) 123-45-67"
                        data-testid="input-phone"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editProfileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        data-testid="input-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={updateProfileMutation.isPending}
                data-testid="button-save-profile"
              >
                {updateProfileMutation.isPending ? "Сохранение..." : "Сохранить"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={documentsDialogOpen} onOpenChange={setDocumentsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto" data-testid="dialog-documents-profile">
          <DialogHeader>
            <DialogTitle>Документы</DialogTitle>
          </DialogHeader>
          <DocumentsPage />
        </DialogContent>
      </Dialog>
    </div>
  );
}
