
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlucoseReading } from '@/utils/dataService';
import { getDay, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from 'lucide-react';

interface GlucoseHeatmapProps {
  data: GlucoseReading[];
}

export const GlucoseHeatmap = ({ data }: GlucoseHeatmapProps) => {
  // Preparar dados do heatmap usando horário real dos dados
  const heatmapData: { [key: string]: { count: number; average: number; values: number[] } } = {};
  
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Inicializar grid
  weekdays.forEach((day, dayIndex) => {
    hours.forEach(hour => {
      const key = `${dayIndex}-${hour}`;
      heatmapData[key] = { count: 0, average: 0, values: [] };
    });
  });

  // Preencher com dados reais usando o horário do campo time
  data.forEach(reading => {
    const dayOfWeek = getDay(reading.date);
    // Extrair hora do campo time (formato "HH:MM")
    const [hourStr] = reading.time.split(':');
    const hour = parseInt(hourStr, 10);
    const key = `${dayOfWeek}-${hour}`;
    
    if (heatmapData[key]) {
      heatmapData[key].values.push(reading.glucose);
      heatmapData[key].count++;
    }
  });

  // Calcular médias
  Object.keys(heatmapData).forEach(key => {
    const cell = heatmapData[key];
    if (cell.values.length > 0) {
      cell.average = cell.values.reduce((sum, val) => sum + val, 0) / cell.values.length;
    }
  });

  // Cores melhoradas baseadas nas faixas de glicemia
  const getIntensityColor = (average: number, count: number) => {
    if (count === 0) return 'bg-muted/10 border border-border/20';
    
    // Usar intensidade baseada na quantidade de dados + cor da faixa
    const baseOpacity = Math.min(0.3 + (count * 0.1), 1);
    
    if (average < 70) return `bg-chart-danger text-white border border-chart-danger/50`;
    if (average <= 100) return `bg-chart-success text-white border border-chart-success/50`;
    if (average <= 140) return `bg-chart-success/70 text-white border border-chart-success/50`;
    if (average <= 180) return `bg-chart-warning text-black border border-chart-warning/50`;
    if (average <= 250) return `bg-chart-warning/80 text-white border border-chart-warning/50`;
    return `bg-chart-danger text-white border border-chart-danger/50`;
  };

  // Filtrar dados por período usando horário real
  const getHourFromTime = (time: string) => parseInt(time.split(':')[0], 10);
  
  const periodStats = {
    manhã: data.filter(r => {
      const hour = getHourFromTime(r.time);
      return hour >= 6 && hour < 12;
    }),
    tarde: data.filter(r => {
      const hour = getHourFromTime(r.time);
      return hour >= 12 && hour < 18;
    }),
    noite: data.filter(r => {
      const hour = getHourFromTime(r.time);
      return hour >= 18 || hour < 6;
    }),
  };

  const calculatePeriodAverage = (periodData: GlucoseReading[]) => {
    if (periodData.length === 0) return 0;
    return periodData.reduce((sum, r) => sum + r.glucose, 0) / periodData.length;
  };

  return (
    <div className="space-y-6">
      <Card className="card-modern hover-lift">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Mapa de Calor - Padrões Semanais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Heatmap Grid melhorado */}
            <div className="overflow-x-auto">
              <div className="min-w-[900px] space-y-2">
                {/* Header com horários mais claro */}
                <div className="grid grid-cols-25 gap-1 mb-3">
                  <div className="text-xs font-semibold text-muted-foreground p-2 text-center">Dia/Hora</div>
                  {hours.map(hour => (
                    <div key={hour} className="text-xs text-center text-muted-foreground font-medium p-2 bg-muted/20 rounded">
                      {hour.toString().padStart(2, '0')}h
                    </div>
                  ))}
                </div>
                
                {/* Grid principal com melhor alinhamento */}
                {weekdays.map((day, dayIndex) => (
                  <div key={day} className="grid grid-cols-25 gap-1">
                    <div className="text-xs font-semibold text-muted-foreground p-2 flex items-center justify-center bg-muted/20 rounded">
                      {day}
                    </div>
                    {hours.map(hour => {
                      const key = `${dayIndex}-${hour}`;
                      const cell = heatmapData[key];
                      const hasData = cell.count > 0;
                      
                      return (
                        <div
                          key={hour}
                          className={`
                            aspect-square rounded-lg text-xs flex items-center justify-center 
                            cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg
                            ${getIntensityColor(cell.average, cell.count)}
                            ${hasData ? 'font-bold' : 'font-normal'}
                          `}
                          title={hasData 
                            ? `${day} ${hour.toString().padStart(2, '0')}:00\n${cell.count} registro${cell.count !== 1 ? 's' : ''}\nMédia: ${cell.average.toFixed(1)} mg/dL` 
                            : `${day} ${hour.toString().padStart(2, '0')}:00\nNenhum registro`
                          }
                        >
                          {hasData ? (
                            <span className="text-[10px] leading-none">
                              {cell.average.toFixed(0)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/50 text-[8px]">-</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legenda melhorada */}
            <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <span className="font-semibold text-card-foreground">Faixas de Glicemia:</span>
                {[
                  { label: 'Baixa (<70)', color: 'bg-chart-danger', textColor: 'text-white' },
                  { label: 'Ideal (70-100)', color: 'bg-chart-success', textColor: 'text-white' },
                  { label: 'Normal (100-140)', color: 'bg-chart-success/70', textColor: 'text-white' },
                  { label: 'Elevada (140-180)', color: 'bg-chart-warning', textColor: 'text-black' },
                  { label: 'Alta (180-250)', color: 'bg-chart-warning/80', textColor: 'text-white' },
                  { label: 'Muito Alta (>250)', color: 'bg-chart-danger', textColor: 'text-white' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${item.color} ${item.textColor} text-[8px] flex items-center justify-center font-bold border border-border/30`}>
                      123
                    </div>
                    <span className="text-muted-foreground font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                💡 <strong>Dica:</strong> Passe o mouse sobre as células para ver detalhes. Números indicam a média de glicemia para aquele horário.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas por Período */}
      <Card className="bg-card/80 backdrop-blur-sm border-border shadow-[var(--shadow-elegant)]">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
            ⏰ Análise por Período do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(periodStats).map(([period, periodData]) => {
              const average = calculatePeriodAverage(periodData);
              const count = periodData.length;
              
              return (
                <div key={period} className="bg-muted/30 rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-card-foreground capitalize flex items-center gap-2">
                      {period === 'manhã' && '🌅'}
                      {period === 'tarde' && '☀️'}
                      {period === 'noite' && '🌙'}
                      {period}
                    </h3>
                    <Badge variant="outline" className="border-border">{count} registros</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Média:</span>
                      <span className="font-bold text-lg text-card-foreground">
                        {average > 0 ? `${average.toFixed(0)} mg/dL` : 'N/A'}
                      </span>
                    </div>
                    
                    {count > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Maior:</span>
                          <span className="font-medium text-card-foreground">
                            {Math.max(...periodData.map(r => r.glucose))} mg/dL
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Menor:</span>
                          <span className="font-medium text-card-foreground">
                            {Math.min(...periodData.map(r => r.glucose))} mg/dL
                          </span>
                        </div>
                      </>
                    )}

                    <div className="text-xs text-muted-foreground mt-2">
                      {period === 'manhã' && 'Horário: 06:00 - 11:59'}
                      {period === 'tarde' && 'Horário: 12:00 - 17:59'}
                      {period === 'noite' && 'Horário: 18:00 - 05:59'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
