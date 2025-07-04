
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlucoseReading } from '@/utils/dataService';
import { 
  calculateAdvancedStats, 
  analyzePatterns, 
  generateSmartRecommendations 
} from '@/utils/analysisUtils';
import { 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb, 
  TrendingUp, 
  Clock, 
  Activity,
  Heart,
  BookOpen
} from 'lucide-react';

interface GlucoseRecommendationsProps {
  data: GlucoseReading[];
}

export const GlucoseRecommendations = ({ data }: GlucoseRecommendationsProps) => {
  const stats = calculateAdvancedStats(data);
  const patterns = analyzePatterns(data);
  const recommendations = generateSmartRecommendations(data, stats, patterns);

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="text-red-600" size={20} />;
      case 'positive': return <CheckCircle className="text-green-600" size={20} />;
      default: return <Lightbulb className="text-blue-600" size={20} />;
    }
  };

  const getRecommendationStyle = (type: string) => {
    switch (type) {
      case 'warning': return 'border-l-4 border-red-500 bg-red-50';
      case 'positive': return 'border-l-4 border-green-500 bg-green-50';
      default: return 'border-l-4 border-blue-500 bg-blue-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    
    const labels = {
      high: 'Alta',
      medium: 'Média',
      low: 'Baixa',
    };

    return (
      <Badge className={styles[priority as keyof typeof styles]}>
        {labels[priority as keyof typeof labels]}
      </Badge>
    );
  };

  // Dicas educativas baseadas nos padrões
  const educationalTips = [
    {
      icon: <Activity className="text-purple-600" size={20} />,
      title: 'Atividade Física',
      content: 'Exercícios regulares ajudam a melhorar a sensibilidade à insulina e controle glicêmico. Prefira atividades aeróbicas de intensidade moderada.',
    },
    {
      icon: <Clock className="text-indigo-600" size={20} />,
      title: 'Horários Regulares',
      content: 'Mantenha horários consistentes para refeições e medicações. Isso ajuda a estabilizar os níveis de glicose.',
    },
    {
      icon: <Heart className="text-pink-600" size={20} />,
      title: 'Gerenciamento do Estresse',
      content: 'O estresse pode elevar a glicemia. Pratique técnicas de relaxamento como meditação ou yoga.',
    },
    {
      icon: <BookOpen className="text-teal-600" size={20} />,
      title: 'Educação Continuada',
      content: 'Mantenha-se informado sobre diabetes. O conhecimento é uma ferramenta poderosa para o autocontrole.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Resumo Executivo */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            🎯 Resumo do Controle Glicêmico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.controlScore.toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">Score Geral</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.timeInRange.target.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Tempo no Alvo</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.coefficientOfVariation.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Variabilidade</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {data.length}
                </div>
                <div className="text-sm text-gray-600">Total Registros</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações Personalizadas */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            🧠 Recomendações Personalizadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Parabéns! Seu controle glicêmico está excelente. Continue com os bons hábitos!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <Alert key={index} className={getRecommendationStyle(rec.type)}>
                  <div className="flex items-start gap-3">
                    {getRecommendationIcon(rec.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {rec.title}
                        </h4>
                        {getPriorityBadge(rec.priority)}
                      </div>
                      <AlertDescription className="text-gray-700 mb-3">
                        {rec.description}
                      </AlertDescription>
                      {rec.actionable && (
                        <Button variant={rec.type === 'warning' ? 'destructive' : 'default'} size="sm">
                          {rec.type === 'warning' ? 'Agendar Consulta' : 'Saiba Mais'}
                        </Button>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análise de Padrões */}
      {patterns.peakHours.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              📊 Padrões Identificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="text-red-600" size={16} />
                  Horários de Pico
                </h4>
                <div className="flex flex-wrap gap-2">
                  {patterns.peakHours.map(hour => (
                    <Badge key={hour} className="bg-red-100 text-red-800">
                      {hour.toString().padStart(2, '0')}:00
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Horários com valores mais elevados. Monitore atividades e refeições nesses períodos.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="text-green-600" size={16} />
                  Horários Estáveis
                </h4>
                <div className="flex flex-wrap gap-2">
                  {patterns.lowHours.map(hour => (
                    <Badge key={hour} className="bg-green-100 text-green-800">
                      {hour.toString().padStart(2, '0')}:00
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Horários com melhor controle. Considere reproduzir as condições desses momentos.
                </p>
              </div>
            </div>

            {/* Tendências */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Tendências</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Tendência Geral:</span>
                  <Badge 
                    className={
                      patterns.trends.overall === 'increasing' ? 'bg-red-100 text-red-800 ml-2' :
                      patterns.trends.overall === 'decreasing' ? 'bg-green-100 text-green-800 ml-2' :
                      'bg-gray-100 text-gray-800 ml-2'
                    }
                  >
                    {patterns.trends.overall === 'increasing' ? 'Crescente' :
                     patterns.trends.overall === 'decreasing' ? 'Decrescente' : 'Estável'}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Última Semana:</span>
                  <Badge 
                    className={
                      patterns.trends.recentWeek === 'worsening' ? 'bg-red-100 text-red-800 ml-2' :
                      patterns.trends.recentWeek === 'improving' ? 'bg-green-100 text-green-800 ml-2' :
                      'bg-gray-100 text-gray-800 ml-2'
                    }
                  >
                    {patterns.trends.recentWeek === 'worsening' ? 'Piorando' :
                     patterns.trends.recentWeek === 'improving' ? 'Melhorando' : 'Estável'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dicas Educativas */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            💡 Dicas para Melhor Controle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {educationalTips.map((tip, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  {tip.icon}
                  <h4 className="font-semibold text-gray-900">{tip.title}</h4>
                </div>
                <p className="text-sm text-gray-700">{tip.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
