import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Mail, MapPin, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactsPage() {
  const managementContacts = [
    {
      title: "Управляющая компания",
      phone: "+7 (495) 123-45-67",
      email: "info@riverpark62.ru",
      address: "ул. Береговая, д. 62, офис 1",
      hours: "Пн-Пт: 9:00-18:00, Сб-Вс: выходной"
    },
    {
      title: "Диспетчерская служба",
      phone: "+7 (495) 123-45-68",
      email: "dispatcher@riverpark62.ru",
      hours: "Круглосуточно"
    },
    {
      title: "Бухгалтерия",
      phone: "+7 (495) 123-45-69",
      email: "accounting@riverpark62.ru",
      hours: "Пн-Пт: 9:00-17:00"
    }
  ];

  const emergencyServices = [
    {
      title: "Пожарная служба",
      phone: "101",
      description: "При пожаре или задымлении"
    },
    {
      title: "Полиция",
      phone: "102",
      description: "При чрезвычайных ситуациях"
    },
    {
      title: "Скорая помощь",
      phone: "103",
      description: "При необходимости медицинской помощи"
    },
    {
      title: "Газовая служба",
      phone: "104",
      description: "При утечке газа"
    },
    {
      title: "Единый номер экстренных служб",
      phone: "112",
      description: "Работает даже без SIM-карты"
    },
    {
      title: "Аварийная служба ЖКХ",
      phone: "+7 (495) 123-00-00",
      description: "Аварии водоснабжения, отопления, электричества"
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-semibold" data-testid="heading-contacts">
        Контакты
      </h2>

      <Tabs defaultValue="management" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="management" data-testid="tab-management">
            Управление
          </TabsTrigger>
          <TabsTrigger value="emergency" data-testid="tab-emergency">
            Экстренные службы
          </TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-3 mt-4">
          {managementContacts.map((contact, index) => (
            <Card key={index} className="p-4" data-testid={`card-contact-${index}`}>
              <h3 className="font-semibold mb-3">{contact.title}</h3>
              <div className="space-y-2">
                <a 
                  href={`tel:${contact.phone}`} 
                  className="flex items-center gap-2 text-sm hover:text-primary"
                  data-testid={`link-phone-${index}`}
                >
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{contact.phone}</span>
                </a>
                <a 
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-2 text-sm hover:text-primary"
                  data-testid={`link-email-${index}`}
                >
                  <Mail className="w-4 h-4 text-primary" />
                  <span>{contact.email}</span>
                </a>
                {contact.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{contact.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{contact.hours}</span>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="emergency" className="space-y-3 mt-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive mb-1">Важно!</p>
                <p className="text-muted-foreground">
                  При возникновении аварийных ситуаций немедленно звоните в соответствующую службу
                </p>
              </div>
            </div>
          </div>

          {emergencyServices.map((service, index) => (
            <Card key={index} className="p-4" data-testid={`card-emergency-${index}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {service.description}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  asChild
                  data-testid={`button-call-${index}`}
                >
                  <a href={`tel:${service.phone}`}>
                    <Phone className="w-4 h-4 mr-2" />
                    {service.phone}
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
