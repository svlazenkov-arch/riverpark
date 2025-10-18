import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users } from "lucide-react";
import { useState } from "react";

export interface VotingOption {
  id: string;
  text: string;
  votes: number;
}

export interface Voting {
  id: string;
  title: string;
  description: string;
  deadline: string;
  totalVotes: number;
  options: VotingOption[];
  hasVoted: boolean;
  status: "active" | "completed";
}

interface VotingCardProps {
  voting: Voting;
  onVote?: (optionId: string) => void;
}

export default function VotingCard({ voting, onVote }: VotingCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(voting.hasVoted);

  const handleVote = () => {
    if (selectedOption && onVote) {
      onVote(selectedOption);
      setHasVoted(true);
    }
  };

  return (
    <Card className="p-4" data-testid={`card-voting-${voting.id}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-medium" data-testid={`text-voting-title-${voting.id}`}>
          {voting.title}
        </h3>
        <Badge variant={voting.status === "active" ? "default" : "secondary"}>
          {voting.status === "active" ? "Активно" : "Завершено"}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {voting.description}
      </p>

      <div className="space-y-2 mb-4">
        {voting.options.map((option) => {
          const percentage = voting.totalVotes > 0 
            ? Math.round((option.votes / voting.totalVotes) * 100) 
            : 0;

          return (
            <div
              key={option.id}
              className={`p-3 border rounded-md cursor-pointer transition-colors ${
                selectedOption === option.id && !hasVoted
                  ? "border-primary bg-primary/5"
                  : "hover-elevate"
              }`}
              onClick={() => !hasVoted && setSelectedOption(option.id)}
              data-testid={`option-voting-${voting.id}-${option.id}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{option.text}</span>
                {hasVoted && <span className="text-sm text-muted-foreground">{percentage}%</span>}
              </div>
              {hasVoted && (
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>До {voting.deadline}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{voting.totalVotes} голосов</span>
        </div>
      </div>

      {!hasVoted && voting.status === "active" && (
        <Button 
          className="w-full"
          disabled={!selectedOption}
          onClick={handleVote}
          data-testid={`button-vote-${voting.id}`}
        >
          Проголосовать
        </Button>
      )}
      
      {hasVoted && (
        <p className="text-sm text-center text-muted-foreground">
          Вы уже проголосовали
        </p>
      )}
    </Card>
  );
}
