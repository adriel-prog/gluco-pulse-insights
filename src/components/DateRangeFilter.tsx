import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter, X } from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DateRangeFilterProps {
  onFilterChange: (startDate: Date | null, endDate: Date | null) => void;
  totalRecords: number;
  filteredRecords: number;
}

export const DateRangeFilter = ({ onFilterChange, totalRecords, filteredRecords }: DateRangeFilterProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

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
    <Card className="card-modern glass-effect mb-8 border border-primary/20">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg backdrop-blur-sm">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground text-lg">Filtro de Período:</span>
            </div>
            
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-52 bg-background/80 backdrop-blur-sm border-border/50 hover:border-primary/50 smooth-transition">
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

            {selectedPeriod !== 'all' && (
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

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 px-4 py-2 backdrop-blur-sm">
              <Calendar className="h-4 w-4 mr-2" />
              {getPeriodLabel(selectedPeriod)}
            </Badge>
            
            <Badge className="bg-gradient-to-r from-secondary to-muted text-secondary-foreground px-4 py-2 font-medium">
              {filteredRecords} de {totalRecords} registros
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};