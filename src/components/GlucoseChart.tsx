
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { GlucoseReading } from '@/utils/dataService';
import { format, subDays, isWithinInterval, parse, compareAsc } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from '@/lib/utils';

interface GlucoseChartProps {
  data: GlucoseReading[];
}

export const GlucoseChart = ({ data }: GlucoseChartProps) => {
  const isMobile = useIsMobile();
  // Filtrar dados dos últimos 7 dias
  const sevenDaysAgo = subDays(new Date(), 7);
  const recentData = data.filter(reading => 
    isWithinInterval(reading.date, { start: sevenDaysAgo, end: new Date() })
  );

  // Preparar e ordenar dados cronologicamente
  const chartData = recentData
    .map(reading => {
      // Criar datetime combinando data e hora para ordenação precisa
      const [hours, minutes] = reading.time.split(':').map(Number);
      const datetime = new Date(reading.date);
      datetime.setHours(hours, minutes, 0, 0);
      
      return {
        date: format(reading.date, 'dd/MM', { locale: ptBR }),
        time: reading.time,
        glucose: reading.glucose,
        period: reading.period,
        fullDate: reading.date,
        datetime,
        label: `${format(reading.date, 'dd/MM')} ${reading.time}`,
        sortKey: datetime.getTime()
      };
    })
    .sort((a, b) => a.sortKey - b.sortKey); // Ordenar cronologicamente

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-lg shadow-[var(--shadow-floating)] p-4">
          <p className="font-semibold text-card-foreground">{`${data.date} às ${data.time}`}</p>
          <p className="text-primary">
            <span className="font-medium">Glicemia: </span>
            {`${payload[0].value} mg/dL`}
          </p>
          <p className="text-muted-foreground text-sm">{data.period}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="card-modern hover-lift">
      <CardHeader className={cn(isMobile && "pb-3")}>
        <CardTitle className={cn(
          "font-semibold text-card-foreground flex items-center gap-2",
          isMobile ? "text-lg" : "text-xl"
        )}>
          <TrendingUp className={cn(isMobile ? "w-4 h-4" : "w-5 h-5", "text-primary")} />
          {isMobile ? "Últimos 7 Dias" : "Tendência dos Últimos 7 Dias"}
        </CardTitle>
      </CardHeader>
      <CardContent className={cn(isMobile && "p-4")}>
        <div className={cn(isMobile ? "h-64" : "h-80")}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData}
              margin={isMobile 
                ? { top: 5, right: 10, left: 10, bottom: 60 }
                : { top: 5, right: 30, left: 20, bottom: 80 }
              }
            >
              {/* Grid mais sutil e elegante */}
              <CartesianGrid 
                strokeDasharray="2 4" 
                stroke="hsl(var(--border))" 
                strokeOpacity={0.3}
                strokeWidth={1}
              />
              
              {/* Eixos com melhor formatação */}
              <XAxis 
                dataKey="label" 
                tick={{ 
                  fontSize: 11, 
                  fill: 'hsl(var(--muted-foreground))',
                  fontWeight: 500
                }}
                angle={-45}
                textAnchor="end"
                height={80}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ 
                  fontSize: 11, 
                  fill: 'hsl(var(--muted-foreground))',
                  fontWeight: 500
                }}
                domain={['dataMin - 20', 'dataMax + 20']}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                label={{ 
                  value: 'mg/dL', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))' }
                }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Linhas de referência mais elegantes */}
              <ReferenceLine 
                y={70} 
                stroke="hsl(var(--danger))" 
                strokeDasharray="4 4" 
                strokeOpacity={0.8}
                label={{ value: "Baixa", fill: "hsl(var(--danger))" }}
              />
              <ReferenceLine 
                y={130} 
                stroke="hsl(var(--warning))" 
                strokeDasharray="4 4" 
                strokeOpacity={0.8}
                label={{ value: "Limite", fill: "hsl(var(--warning))" }}
              />
              <ReferenceLine 
                y={180} 
                stroke="hsl(var(--danger))" 
                strokeDasharray="4 4" 
                strokeOpacity={0.8}
                label={{ value: "Alta", fill: "hsl(var(--danger))" }}
              />
              
              {/* Linha principal com gradiente e animação */}
              <Line 
                type="monotone" 
                dataKey="glucose" 
                stroke="url(#primaryGradient)" 
                strokeWidth={3}
                dot={{ 
                  fill: "hsl(var(--primary))", 
                  strokeWidth: 2, 
                  r: 4,
                  stroke: "hsl(var(--card))"
                }}
                activeDot={{ 
                  r: 7, 
                  stroke: "hsl(var(--primary))", 
                  strokeWidth: 3, 
                  fill: "hsl(var(--primary-glow))",
                  filter: "drop-shadow(0 0 6px hsl(var(--primary-glow)))"
                }}
                connectNulls={false}
              />
              
              {/* Definição do gradiente */}
              <defs>
                <linearGradient id="primaryGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="50%" stopColor="hsl(var(--primary-glow))" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-chart-danger rounded"></div>
            <span>Baixa (&lt;70)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-chart-success rounded"></div>
            <span>Normal (70-130)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-chart-warning rounded"></div>
            <span>Elevada (130-180)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-chart-danger rounded"></div>
            <span>Alta (&gt;180)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
