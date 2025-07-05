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
    <Card className="bg-background/80 backdrop-blur-md border-0 shadow-lg mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Period Filter:</span>
            </div>
            
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-48 bg-background border-border">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="all">All records</SelectItem>
                <SelectItem value="last7days">Last 7 days</SelectItem>
                <SelectItem value="last30days">Last 30 days</SelectItem>
                <SelectItem value="thisMonth">This month</SelectItem>
                <SelectItem value="lastMonth">Last month</SelectItem>
                <SelectItem value="last3months">Last 3 months</SelectItem>
              </SelectContent>
            </Select>

            {selectedPeriod !== 'all' && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilter}
                className="border-border hover:bg-accent"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Calendar className="h-3 w-3 mr-1" />
              {getPeriodLabel(selectedPeriod)}
            </Badge>
            
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
              {filteredRecords} of {totalRecords} records
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};