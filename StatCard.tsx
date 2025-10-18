import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 bg-primary/10 rounded-md">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trend && (
          <span 
            className={`text-xs ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.isPositive ? "+" : ""}{trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-semibold mb-1" data-testid={`text-stat-value-${label}`}>
          {value}
        </p>
        <p className="text-sm text-muted-foreground" data-testid={`text-stat-label-${label}`}>
          {label}
        </p>
      </div>
    </Card>
  );
}
