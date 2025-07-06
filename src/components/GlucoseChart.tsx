
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { GlucoseReading } from '@/utils/dataService';
import { format, subDays, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GlucoseChartProps {
  data: GlucoseReading[];
}

export const GlucoseChart = ({ data }: GlucoseChartProps) => {
  // Filtrar dados dos últimos 7 dias
  const sevenDaysAgo = subDays(new Date(), 7);
  const recentData = data.filter(reading => 
    isWithinInterval(reading.date, { start: sevenDaysAgo, end: new Date() })
  );

  // Preparar dados para o gráfico
  const chartData = recentData.map(reading => ({
    date: format(reading.date, 'dd/MM', { locale: ptBR }),
    time: reading.time,
    glucose: reading.glucose,
    period: reading.period,
    fullDate: reading.date,
    label: `${format(reading.date, 'dd/MM')} ${reading.time}`,
  }));

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
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
          📈 Tendência dos Últimos 7 Dias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                domain={['dataMin - 20', 'dataMax + 20']}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Linhas de referência com cores do design system */}
              <ReferenceLine y={70} stroke="hsl(var(--danger))" strokeDasharray="5 5" label="Baixa" />
              <ReferenceLine y={130} stroke="hsl(var(--warning))" strokeDasharray="5 5" label="Limite Normal" />
              <ReferenceLine y={180} stroke="hsl(var(--danger))" strokeDasharray="5 5" label="Alta" />
              
              <Line 
                type="monotone" 
                dataKey="glucose" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2, fill: "hsl(var(--primary-glow))" }}
              />
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
