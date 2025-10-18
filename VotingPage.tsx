import VotingCard from "@/components/VotingCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VotingPage() {
  const votings = [
    {
      id: "1",
      title: "Благоустройство детской площадки",
      description: "Выберите вариант оборудования для новой детской площадки",
      deadline: "25.12.2024",
      totalVotes: 45,
      hasVoted: false,
      status: "active" as const,
      options: [
        { id: "1", text: "Качели и горка", votes: 25 },
        { id: "2", text: "Спортивный комплекс", votes: 15 },
        { id: "3", text: "Песочница и домик", votes: 5 }
      ]
    },
    {
      id: "2",
      title: "Установка камер видеонаблюдения",
      description: "Согласны ли вы с установкой дополнительных камер на территории?",
      deadline: "30.12.2024",
      totalVotes: 78,
      hasVoted: false,
      status: "active" as const,
      options: [
        { id: "1", text: "Да, поддерживаю", votes: 62 },
        { id: "2", text: "Нет, против", votes: 16 }
      ]
    },
    {
      id: "3",
      title: "Выбор управляющей компании",
      description: "Проголосуйте за новую управляющую компанию",
      deadline: "15.11.2024",
      totalVotes: 120,
      hasVoted: true,
      status: "completed" as const,
      options: [
        { id: "1", text: "ООО \"Комфорт\"", votes: 75 },
        { id: "2", text: "ООО \"Сервис Плюс\"", votes: 45 }
      ]
    }
  ];

  const activeVotings = votings.filter(v => v.status === "active");
  const completedVotings = votings.filter(v => v.status === "completed");

  return (
    <div className="space-y-4">
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" data-testid="tab-active-votings">
            Активные ({activeVotings.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed-votings">
            Завершенные ({completedVotings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3 mt-4">
          {activeVotings.length > 0 ? (
            activeVotings.map((voting) => (
              <VotingCard 
                key={voting.id}
                voting={voting}
                onVote={(optionId) => console.log('Voted for:', optionId)}
              />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Нет активных голосований
            </p>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 mt-4">
          {completedVotings.map((voting) => (
            <VotingCard 
              key={voting.id}
              voting={voting}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
