import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter, X } from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from '@/lib/utils';

interface DateRangeFilterProps {
  onFilterChange: (startDate: Date | null, endDate: Date | null) => void;
  totalRecords: number;
  filteredRecords: number;
}

export const DateRangeFilter = ({ onFilterChange, totalRecords, filteredRecords }: DateRangeFilterProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const isMobile = useIsMobile();

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const now = new Date();
    
    switch (period) {
      case 'last7days':
        onFilterChange(subDays(now, 7), now);
        break;
      case 'last30days':
        onFilterChange(subDays(now, 30), now);
        break;
      case 'thisMonth':
        onFilterChange(startOfMonth(now), endOfMonth(now));
        break;
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        onFilterChange(startOfMonth(lastMonth), endOfMonth(lastMonth));
        break;
      case 'last3months':
        onFilterChange(subMonths(now, 3), now);
        break;
      case 'all':
      default:
        onFilterChange(null, null);
        break;
    }
  };

  const clearFilter = () => {
    setSelectedPeriod('all');
    onFilterChange(null, null);
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'last7days': return 'Últimos 7 dias';
      case 'last30days': return 'Últimos 30 dias';
      case 'thisMonth': return 'Este mês';
      case 'lastMonth': return 'Mês passado';
      case 'last3months': return 'Últimos 3 meses';
      case 'all': return 'Todos os registros';
      default: return 'Período personalizado';
    }
  };

  return (
    <Card className={cn(
      "card-modern glass-effect border border-primary/20",
      isMobile ? "mb-4" : "mb-8"
    )}>
      <CardContent className={cn(isMobile ? "p-4" : "p-6")}>
        <div className={cn(
          "gap-4 items-start justify-between",
          isMobile ? "flex flex-col space-y-4" : "flex flex-col sm:flex-row gap-6 sm:items-center"
        )}>
          <div className={cn(
            "gap-3",
            isMobile ? "flex flex-col space-y-3" : "flex items-center gap-4"
          )}>
            <div className={cn(
              "flex items-center gap-3",
              isMobile && "justify-between"
            )}>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-primary/20 rounded-lg backdrop-blur-sm">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <span className={cn(
                  "font-semibold text-foreground",
                  isMobile ? "text-base" : "text-lg"
                )}>
                  {isMobile ? "Período:" : "Filtro de Período:"}
                </span>
              </div>
              
              {isMobile && selectedPeriod !== 'all' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilter}
                  className="border-border/50 hover:bg-accent/20 hover:border-accent/50 smooth-transition touch-target"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className={cn(
                "bg-background/80 backdrop-blur-sm border-border/50 hover:border-primary/50 smooth-transition touch-target",
                isMobile ? "w-full" : "w-52"
              )}>
                <SelectValue placeholder="Selecionar período" />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-md border-border/50">
                <SelectItem value="all">Todos os registros</SelectItem>
                <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                <SelectItem value="last30days">Últimos 30 dias</SelectItem>
                <SelectItem value="thisMonth">Este mês</SelectItem>
                <SelectItem value="lastMonth">Mês passado</SelectItem>
                <SelectItem value="last3months">Últimos 3 meses</SelectItem>
              </SelectContent>
            </Select>

            {!isMobile && selectedPeriod !== 'all' && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilter}
                className="border-border/50 hover:bg-accent/20 hover:border-accent/50 smooth-transition"
              >
                <X className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>

          <div className={cn(
            "gap-3",
            isMobile ? "flex flex-col space-y-2" : "flex items-center gap-4"
          )}>
            <Badge 
              variant="outline" 
              className={cn(
                "bg-primary/10 text-primary border-primary/30 backdrop-blur-sm",
                isMobile ? "px-3 py-2 justify-center" : "px-4 py-2"
              )}
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              <span className={cn(isMobile && "text-xs")}>
                {getPeriodLabel(selectedPeriod)}
              </span>
            </Badge>
            
            <Badge 
              className={cn(
                "bg-gradient-to-r from-secondary to-muted text-secondary-foreground font-medium",
                isMobile ? "px-3 py-2 justify-center text-xs" : "px-4 py-2"
              )}
            >
              {filteredRecords} de {totalRecords} registros
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};