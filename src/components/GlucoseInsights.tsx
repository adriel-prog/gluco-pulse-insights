
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { GlucoseReading } from '@/utils/dataService';
import { format, subDays, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface GlucoseInsightsProps {
  data: GlucoseReading[];
}

export const GlucoseInsights = ({ data }: GlucoseInsightsProps) => {
  const generateInsights = () => {
    const insights = [];
    
    // Dados dos últimos 7 dias
    const sevenDaysAgo = subDays(new Date(), 7);
    const recentData = data.filter(reading => 
      isWithinInterval(reading.date, { start: sevenDaysAgo, end: new Date() })
    );

    // Contagem de hipoglicemias
    const hypoglycemiaCount = recentData.filter(r => r.glucose < 70).length;
    if (hypoglycemiaCount > 0) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: `${hypoglycemiaCount} episódio${hypoglycemiaCount > 1 ? 's' : ''} de hipoglicemia`,
        description: `Detectados nos últimos 7 dias. Considere ajustar a medicação ou alimentação.`,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      });
    }

    // Valores muito altos
    const highGlucoseCount = recentData.filter(r => r.glucose > 180).length;
    if (highGlucoseCount > 0) {
      insights.push({
        type: 'warning',
        icon: TrendingUp,
        title: `${highGlucoseCount} leitura${highGlucoseCount > 1 ? 's' : ''} acima de 180 mg/dL`,
        description: 'Monitore a alimentação e considere ajustes na medicação.',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
      });
    }

    // Maior valor do período
    if (recentData.length > 0) {
      const maxReading = recentData.reduce((max, reading) => 
        reading.glucose > max.glucose ? reading : max
      );
      insights.push({
        type: 'info',
        icon: TrendingUp,
        title: `Maior valor: ${maxReading.glucose} mg/dL`,
        description: `Registrado em ${format(maxReading.date, 'dd/MM/yyyy', { locale: ptBR })} às ${maxReading.time}`,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      });
    }

    // Análise por período do dia
    const periodAnalysis = analyzePeriods(recentData);
    if (periodAnalysis) {
      insights.push(periodAnalysis);
    }

    // Tendência geral
    const trend = analyzeTrend(recentData);
    if (trend) {
      insights.push(trend);
    }

    return insights;
  };

  const analyzePeriods = (recentData: GlucoseReading[]) => {
    const periods = ['Manhã', 'Tarde', 'Noite'];
    const periodAverages: { [key: string]: number[] } = {};

    periods.forEach(period => {
      periodAverages[period] = recentData
        .filter(r => r.period.toLowerCase().includes(period.toLowerCase()))
        .map(r => r.glucose);
    });

    const averages = Object.entries(periodAverages)
      .filter(([_, values]) => values.length > 0)
      .map(([period, values]) => ({
        period,
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
        count: values.length,
      }))
      .sort((a, b) => b.average - a.average);

    if (averages.length > 0) {
      const highest = averages[0];
      return {
        type: 'info',
        icon: Clock,
        title: `Período com maior média: ${highest.period}`,
        description: `Média de ${highest.average.toFixed(0)} mg/dL (${highest.count} leituras)`,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
      };
    }

    return null;
  };

  const analyzeTrend = (recentData: GlucoseReading[]) => {
    if (recentData.length < 3) return null;

    const sortedData = recentData.sort((a, b) => a.date.getTime() - b.date.getTime());
    const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
    const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));

    const firstAvg = firstHalf.reduce((sum, r) => sum + r.glucose, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, r) => sum + r.glucose, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;
    
    if (Math.abs(difference) > 10) {
      return {
        type: difference > 0 ? 'warning' : 'success',
        icon: difference > 0 ? TrendingUp : TrendingDown,
        title: `Tendência ${difference > 0 ? 'crescente' : 'decrescente'}`,
        description: `Variação de ${Math.abs(difference).toFixed(0)} mg/dL na média dos últimos dias`,
        color: difference > 0 ? 'text-orange-600' : 'text-green-600',
        bgColor: difference > 0 ? 'bg-orange-50' : 'bg-green-50',
      };
    }

    return null;
  };

  const insights = generateInsights();

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            🧠 Insights Automáticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.length === 0 ? (
              <Alert>
                <AlertDescription>
                  Não há insights suficientes para análise. Continue monitorando sua glicemia!
                </AlertDescription>
              </Alert>
            ) : (
              insights.map((insight, index) => (
                <Alert key={index} className={`border-l-4 ${insight.bgColor}`}>
                  <div className="flex items-start gap-3">
                    <insight.icon className={`${insight.color} mt-0.5`} size={20} />
                    <div className="flex-1">
                      <h4 className={`font-semibold ${insight.color} mb-1`}>
                        {insight.title}
                      </h4>
                      <AlertDescription className="text-gray-700">
                        {insight.description}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Detalhadas */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            📊 Estatísticas Detalhadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Por Faixa de Valor</h4>
              <div className="space-y-2">
                {[
                  { label: 'Hipoglicemia (<70)', filter: (val: number) => val < 70, color: 'bg-red-100 text-red-800' },
                  { label: 'Normal (70-130)', filter: (val: number) => val >= 70 && val <= 130, color: 'bg-green-100 text-green-800' },
                  { label: 'Elevada (130-180)', filter: (val: number) => val > 130 && val <= 180, color: 'bg-yellow-100 text-yellow-800' },
                  { label: 'Alta (>180)', filter: (val: number) => val > 180, color: 'bg-red-100 text-red-800' },
                ].map(({ label, filter, color }) => {
                  const count = data.filter(r => filter(r.glucose)).length;
                  const percentage = data.length > 0 ? ((count / data.length) * 100).toFixed(1) : '0';
                  return (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{label}</span>
                      <Badge className={color}>
                        {count} ({percentage}%)
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Resumo Geral</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total de registros</span>
                  <Badge variant="outline">{data.length}</Badge>
                </div>
                {data.length > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Média geral</span>
                      <Badge variant="outline">
                        {(data.reduce((sum, r) => sum + r.glucose, 0) / data.length).toFixed(0)} mg/dL
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Valor mais alto</span>
                      <Badge variant="outline">
                        {Math.max(...data.map(r => r.glucose))} mg/dL
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Valor mais baixo</span>
                      <Badge variant="outline">
                        {Math.min(...data.map(r => r.glucose))} mg/dL
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
