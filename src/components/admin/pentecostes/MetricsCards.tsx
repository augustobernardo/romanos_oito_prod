import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, CalendarDays } from "lucide-react";
import type { PentecosteMetrics } from "@/types/pentecoste";

interface MetricsCardsProps {
  metrics: PentecosteMetrics | null;
  isLoading: boolean;
}

export const MetricsCards = ({ metrics, isLoading }: MetricsCardsProps) => {
  const cards = [
    {
      label: "Total de Inscrições",
      value: metrics?.total,
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Confirmados",
      value: metrics?.confirmed,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "Criadas Hoje",
      value: metrics?.created_today,
      icon: CalendarDays,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {card.label}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-7 w-12 animate-pulse rounded bg-muted" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {card.value ?? 0}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
