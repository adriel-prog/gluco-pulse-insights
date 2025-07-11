import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Activity, AlertTriangle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsData {
  average: number;
  total: number;
  max: number;
  min: number;
  low: number;
  normal: number;
  elevated: number;
  high: number;
}

interface MobileStatsCardsProps {
  stats: StatsData;
  className?: string;
}

export function MobileStatsCards({ stats, className }: MobileStatsCardsProps) {
  const cards = [
    {
      title: "Média Geral",
      value: `${stats.average.toFixed(0)}`,
      unit: "mg/dL",
      icon: TrendingUp,
      color: "primary",
      status: stats.average < 140 ? '✓ Dentro da meta' : '⚠ Acima da meta'
    },
    {
      title: "Total de Registros", 
      value: stats.total.toString(),
      unit: "",
      icon: Activity,
      color: "success",
      status: "Dados para análise"
    },
    {
      title: "Pico Máximo",
      value: `${stats.max}`,
      unit: "mg/dL", 
      icon: AlertTriangle,
      color: "danger",
      status: "Valor mais alto"
    },
    {
      title: "Menor Valor",
      value: `${stats.min}`,
      unit: "mg/dL",
      icon: Calendar,
      color: "accent", 
      status: "Registro mínimo"
    }
  ];

  return (
    <div className={cn("mobile-grid", className)}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <Card key={index} className="mobile-stat-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="mobile-text font-semibold text-card-foreground">
                {card.title}
              </CardTitle>
              <div className={cn(
                "p-2 rounded-xl transition-colors duration-200",
                `bg-${card.color}/10 text-${card.color}`
              )}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className={cn(
                "mobile-metric mb-1 transition-all duration-200",
                `text-${card.color}`
              )}>
                {card.value} 
                {card.unit && (
                  <span className="text-sm sm:text-lg text-muted-foreground ml-1">
                    {card.unit}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {card.status}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}