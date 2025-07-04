
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { GlucoseReading } from '@/utils/dataService';

interface GlucoseDistributionProps {
  data: GlucoseReading[];
}

export const GlucoseDistribution = ({ data }: GlucoseDistributionProps) => {
  const categorizeGlucose = () => {
    const categories = {
      low: { count: 0, label: 'Baixa (<70)', color: '#ef4444' },
      normal: { count: 0, label: 'Normal (70-130)', color: '#22c55e' },
      elevated: { count: 0, label: 'Elevada (130-180)', color: '#f59e0b' },
      high: { count: 0, label: 'Alta (>180)', color: '#dc2626' },
    };

    data.forEach(reading => {
      if (reading.glucose < 70) categories.low.count++;
      else if (reading.glucose <= 130) categories.normal.count++;
      else if (reading.glucose <= 180) categories.elevated.count++;
      else categories.high.count++;
    });

    return Object.entries(categories)
      .filter(([_, category]) => category.count > 0)
      .map(([key, category]) => ({
        name: category.label,
        value: category.count,
        color: category.color,
        percentage: ((category.count / data.length) * 100).toFixed(1),
      }));
  };

  const distributionData = categorizeGlucose();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.payload.name}</p>
          <p className="text-blue-600">
            {data.value} registros ({data.payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          🎯 Distribuição por Faixas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percentage }) => `${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          {distributionData.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm font-medium">{item.name.split(' ')[0]}</span>
              </div>
              <span className="text-sm font-bold">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
