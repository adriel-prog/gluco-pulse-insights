
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlucoseReading } from '@/utils/dataService';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface GlucoseCalendarProps {
  data: GlucoseReading[];
}

export const GlucoseCalendar = ({ data }: GlucoseCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDayData = (date: Date) => {
    const dayReadings = data.filter(reading => isSameDay(reading.date, date));
    
    if (dayReadings.length === 0) return null;

    const values = dayReadings.map(r => r.glucose);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    return {
      count: dayReadings.length,
      average: Math.round(average),
      max,
      min,
      readings: dayReadings,
    };
  };

  const getStatusEmoji = (average: number) => {
    if (average < 70) return '🔴'; // Baixa
    if (average <= 130) return '🟢'; // Normal
    if (average <= 180) return '🟡'; // Elevada
    return '🔴'; // Alta
  };

  const getStatusColor = (average: number) => {
    if (average < 70) return 'bg-red-100 border-red-300 text-red-800';
    if (average <= 130) return 'bg-green-100 border-green-300 text-green-800';
    if (average <= 180) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-red-100 border-red-300 text-red-800';
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">
            📅 Calendário de Glicemia
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-lg font-semibold min-w-[180px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendário */}
        <div className="grid grid-cols-7 gap-2">
          {/* Espaços vazios para o início do mês */}
          {Array.from({ length: monthStart.getDay() }, (_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {/* Dias do mês */}
          {daysInMonth.map(date => {
            const dayData = getDayData(date);
            const isToday = isSameDay(date, new Date());

            return (
              <div
                key={date.toISOString()}
                className={`aspect-square border-2 rounded-lg p-1 flex flex-col items-center justify-center text-center transition-all hover:shadow-md ${
                  isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="text-sm font-semibold text-gray-900">
                  {format(date, 'd')}
                </div>
                
                {dayData && (
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <div className="text-lg">
                      {getStatusEmoji(dayData.average)}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-1 py-0 ${getStatusColor(dayData.average)}`}
                    >
                      {dayData.average}
                    </Badge>
                    <div className="text-xs text-gray-500">
                      {dayData.count}x
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔴</span>
            <span className="text-gray-600">Baixa/Alta</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🟢</span>
            <span className="text-gray-600">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🟡</span>
            <span className="text-gray-600">Elevada</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">123</span>
            <span className="text-gray-600">Média do dia</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
