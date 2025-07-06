
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GlucoseReading } from '@/utils/dataService';
import { getHours, getDay, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GlucoseHeatmapProps {
  data: GlucoseReading[];
}

export const GlucoseHeatmap = ({ data }: GlucoseHeatmapProps) => {
  // Preparar dados do heatmap
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

  // Preencher com dados reais
  data.forEach(reading => {
    const dayOfWeek = getDay(reading.date);
    const hour = getHours(reading.date);
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

  const getIntensityColor = (average: number, count: number) => {
    if (count === 0) return 'bg-muted/20';
    
    if (average < 70) return 'bg-chart-danger/80 text-white';
    if (average <= 100) return 'bg-chart-success/60 text-white';
    if (average <= 140) return 'bg-chart-success/40 text-card-foreground';
    if (average <= 180) return 'bg-chart-warning/60 text-card-foreground';
    if (average <= 250) return 'bg-chart-warning/80 text-white';
    return 'bg-chart-danger text-white';
  };

  const getTextColor = (average: number, count: number) => {
    if (count === 0) return 'text-muted-foreground';
    return ''; // Color is handled by getIntensityColor
  };

  // Estatísticas por período
  const periodStats = {
    manhã: data.filter(r => getHours(r.date) >= 6 && getHours(r.date) < 12),
    tarde: data.filter(r => getHours(r.date) >= 12 && getHours(r.date) < 18),
    noite: data.filter(r => getHours(r.date) >= 18 || getHours(r.date) < 6),
  };

  const calculatePeriodAverage = (periodData: GlucoseReading[]) => {
    if (periodData.length === 0) return 0;
    return periodData.reduce((sum, r) => sum + r.glucose, 0) / periodData.length;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm border-border shadow-[var(--shadow-elegant)]">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
            🔥 Mapa de Calor - Padrões Semanais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Heatmap Grid */}
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header com horários */}
                <div className="grid grid-cols-25 gap-1 mb-2">
                  <div className="text-xs font-medium text-muted-foreground p-1"></div>
                  {hours.map(hour => (
                    <div key={hour} className="text-xs text-center text-muted-foreground p-1">
                      {hour.toString().padStart(2, '0')}h
                    </div>
                  ))}
                </div>
                
                {/* Grid principal */}
                {weekdays.map((day, dayIndex) => (
                  <div key={day} className="grid grid-cols-25 gap-1 mb-1">
                    <div className="text-xs font-medium text-muted-foreground p-2 flex items-center">
                      {day}
                    </div>
                    {hours.map(hour => {
                      const key = `${dayIndex}-${hour}`;
                      const cell = heatmapData[key];
                      return (
                        <div
                          key={hour}
                          className={`aspect-square rounded text-xs flex items-center justify-center cursor-pointer transition-all hover:scale-110 hover:shadow-md ${getIntensityColor(cell.average, cell.count)} ${getTextColor(cell.average, cell.count)}`}
                          title={`${day} ${hour}:00 - ${cell.count} registros - Média: ${cell.average.toFixed(0)} mg/dL`}
                        >
                          {cell.count > 0 ? cell.average.toFixed(0) : ''}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="font-medium text-card-foreground">Legenda:</span>
              {[
                { label: 'Baixa (<70)', color: 'bg-chart-danger/80' },
                { label: 'Ideal (70-100)', color: 'bg-chart-success/60' },
                { label: 'Normal (100-140)', color: 'bg-chart-success/40' },
                { label: 'Elevada (140-180)', color: 'bg-chart-warning/60' },
                { label: 'Alta (180-250)', color: 'bg-chart-warning/80' },
                { label: 'Muito Alta (>250)', color: 'bg-chart-danger' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded ${item.color}`}></div>
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
              ))}
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
