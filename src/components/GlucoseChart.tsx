
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
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-semibold">{`${data.date} às ${data.time}`}</p>
          <p className="text-blue-600">
            <span className="font-medium">Glicemia: </span>
            {`${payload[0].value} mg/dL`}
          </p>
          <p className="text-gray-600 text-sm">{data.period}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          📈 Tendência dos Últimos 7 Dias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                domain={['dataMin - 20', 'dataMax + 20']}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Linhas de referência */}
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" label="Baixa" />
              <ReferenceLine y={130} stroke="#f59e0b" strokeDasharray="5 5" label="Limite Normal" />
              <ReferenceLine y={180} stroke="#dc2626" strokeDasharray="5 5" label="Alta" />
              
              <Line 
                type="monotone" 
                dataKey="glucose" 
                stroke="#2563eb" 
                strokeWidth={3}
                dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#2563eb", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Baixa (&lt;70)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Normal (70-130)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded"></div>
            <span>Elevada (130-180)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span>Alta (&gt;180)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
