
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GlucoseReading } from '@/utils/dataService';
import { calculateAdvancedStats, GlucoseStats } from '@/utils/analysisUtils';
import { TrendingUp, TrendingDown, Target, Activity, AlertCircle, CheckCircle } from 'lucide-react';

interface GlucoseMetricsProps {
  data: GlucoseReading[];
}

export const GlucoseMetrics = ({ data }: GlucoseMetricsProps) => {
  const stats = calculateAdvancedStats(data);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="text-green-600" size={20} />;
    if (score >= 60) return <AlertCircle className="text-yellow-600" size={20} />;
    return <AlertCircle className="text-red-600" size={20} />;
  };

  const MetricCard = ({ 
    title, 
    value, 
    unit, 
    description, 
    icon: Icon, 
    color = "text-primary",
    progress,
    target
  }: {
    title: string;
    value: number;
    unit: string;
    description: string;
    icon: any;
    color?: string;
    progress?: number;
    target?: number;
  }) => (
    <Card className="card-modern hover:shadow-[var(--shadow-floating)] smooth-transition">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon className={color} size={20} />
            <h3 className="font-medium text-card-foreground">{title}</h3>
          </div>
          {target && (
            <Badge variant="outline" className="text-xs border-border/50">
              Meta: {target}{unit}
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-card-foreground">
              {value.toFixed(value < 10 ? 1 : 0)}
            </span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
          
          {progress !== undefined && (
            <Progress value={progress} className="h-2" />
          )}
          
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Score Geral */}
      <Card className={`border-0 shadow-xl ${getScoreColor(stats.controlScore)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              {getScoreIcon(stats.controlScore)}
              Score de Controle Glicêmico
            </CardTitle>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {stats.controlScore.toFixed(0)}
              </div>
              <div className="text-sm opacity-75">/ 100</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={stats.controlScore} className="h-3 mb-2" />
          <p className="text-sm opacity-90">
            {stats.controlScore >= 80 ? 'Excelente controle! Continue assim.' :
             stats.controlScore >= 60 ? 'Bom controle, mas há espaço para melhorias.' :
             'Controle precisa de atenção. Busque orientação médica.'}
          </p>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Média Glicêmica"
          value={stats.average}
          unit=" mg/dL"
          description="Valor médio de todos os registros"
          icon={Activity}
          color="text-primary"
          target={120}
        />

        <MetricCard
          title="Mediana"
          value={stats.median}
          unit=" mg/dL"
          description="Valor central dos registros"
          icon={Target}
          color="text-chart-success"
        />

        <MetricCard
          title="Desvio Padrão"
          value={stats.standardDeviation}
          unit=" mg/dL"
          description="Medida de variabilidade dos valores"
          icon={TrendingUp}
          color="text-accent"
        />

        <MetricCard
          title="Coeficiente de Variação"
          value={stats.coefficientOfVariation}
          unit="%"
          description="Variabilidade relativa (ideal: <36%)"
          icon={TrendingDown}
          color={stats.coefficientOfVariation < 36 ? "text-chart-success" : "text-chart-danger"}
          progress={Math.min(100, (36 / stats.coefficientOfVariation) * 100)}
          target={36}
        />

        <MetricCard
          title="Score de Variabilidade"
          value={stats.variabilityScore}
          unit="/100"
          description="Qualidade da estabilidade glicêmica"
          icon={CheckCircle}
          color={stats.variabilityScore >= 70 ? "text-chart-success" : "text-chart-warning"}
          progress={stats.variabilityScore}
        />
      </div>

      {/* Tempo no Alvo */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
            🎯 Tempo no Alvo (TIR - Time in Range)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { 
                  label: 'Hipoglicemia', 
                  range: '<70 mg/dL', 
                  value: stats.timeInRange.low, 
                  color: 'bg-red-500',
                  target: '<4%',
                  status: stats.timeInRange.low < 4 ? 'good' : 'attention'
                },
                { 
                  label: 'Alvo', 
                  range: '70-180 mg/dL', 
                  value: stats.timeInRange.target, 
                  color: 'bg-green-500',
                  target: '>70%',
                  status: stats.timeInRange.target > 70 ? 'good' : 'attention'
                },
                { 
                  label: 'Elevada', 
                  range: '180-250 mg/dL', 
                  value: stats.timeInRange.high, 
                  color: 'bg-yellow-500',
                  target: '<25%',
                  status: stats.timeInRange.high < 25 ? 'good' : 'attention'
                },
                { 
                  label: 'Muito Alta', 
                  range: '>250 mg/dL', 
                  value: stats.timeInRange.veryHigh, 
                  color: 'bg-red-600',
                  target: '<5%',
                  status: stats.timeInRange.veryHigh < 5 ? 'good' : 'attention'
                },
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{item.label}</span>
                    <Badge 
                      variant="outline" 
                      className={item.status === 'good' ? 'text-green-700 border-green-200' : 'text-yellow-700 border-yellow-200'}
                    >
                      {item.target}
                    </Badge>
                  </div>
                  <div className="mb-2">
                    <div className={`h-2 rounded-full ${item.color} opacity-20`}>
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${Math.min(100, item.value)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      {item.value.toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-600">{item.range}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="text-blue-600" size={16} />
                <span className="text-sm font-medium text-blue-900">Meta Internacional</span>
              </div>
              <p className="text-xs text-blue-800">
                Tempo no Alvo {'>'} 70% | Hipoglicemia {'<'} 4% | Hiperglicemia {'<'} 25%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
