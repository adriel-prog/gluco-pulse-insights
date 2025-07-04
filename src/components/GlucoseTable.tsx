
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GlucoseReading } from '@/utils/dataService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';

interface GlucoseTableProps {
  data: GlucoseReading[];
}

type SortField = 'date' | 'time' | 'glucose' | 'period';
type SortDirection = 'asc' | 'desc';

export const GlucoseTable = ({ data }: GlucoseTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  
  const itemsPerPage = 10;

  const getGlucoseStatus = (glucose: number) => {
    if (glucose < 70) return { label: 'Baixa', color: 'bg-red-100 text-red-800', emoji: '🔴' };
    if (glucose <= 130) return { label: 'Normal', color: 'bg-green-100 text-green-800', emoji: '🟢' };
    if (glucose <= 180) return { label: 'Elevada', color: 'bg-yellow-100 text-yellow-800', emoji: '🟡' };
    return { label: 'Alta', color: 'bg-red-100 text-red-800', emoji: '🔴' };
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(reading => {
      const matchesSearch = 
        format(reading.date, 'dd/MM/yyyy', { locale: ptBR }).includes(searchTerm) ||
        reading.time.includes(searchTerm) ||
        reading.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reading.glucose.toString().includes(searchTerm) ||
        (reading.notes && reading.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesPeriod = filterPeriod === 'all' || 
        reading.period.toLowerCase().includes(filterPeriod.toLowerCase());

      return matchesSearch && matchesPeriod;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'date':
          aValue = a.date.getTime();
          bValue = b.date.getTime();
          break;
        case 'time':
          aValue = a.time;
          bValue = b.time;
          break;
        case 'glucose':
          aValue = a.glucose;
          bValue = b.glucose;
          break;
        case 'period':
          aValue = a.period;
          bValue = b.period;
          break;
        default:
          return 0;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [data, searchTerm, filterPeriod, sortField, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  const periods = ['all', 'manhã', 'tarde', 'noite'];

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          📋 Registros Detalhados
        </CardTitle>
        
        {/* Filtros e Busca */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Buscar por data, horário, período..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            {periods.map(period => (
              <Button
                key={period}
                variant={filterPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterPeriod(period)}
                className="capitalize"
              >
                {period === 'all' ? 'Todos' : period}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1">
                    Data <SortIcon field="date" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('time')}
                >
                  <div className="flex items-center gap-1">
                    Horário <SortIcon field="time" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('period')}
                >
                  <div className="flex items-center gap-1">
                    Período <SortIcon field="period" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('glucose')}
                >
                  <div className="flex items-center gap-1">
                    Glicemia <SortIcon field="glucose" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((reading, index) => {
                const status = getGlucoseStatus(reading.glucose);
                return (
                  <TableRow key={index} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="font-medium">
                      {format(reading.date, 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>{reading.time}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {reading.period}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-lg">
                      {reading.glucose} mg/dL
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{status.emoji}</span>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-gray-600">
                      {reading.notes || '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} de {filteredAndSortedData.length} registros
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                Anterior
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
