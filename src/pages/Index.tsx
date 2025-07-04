
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { GlucoseChart } from '@/components/GlucoseChart';
import { GlucoseInsights } from '@/components/GlucoseInsights';
import { GlucoseDistribution } from '@/components/GlucoseDistribution';
import { GlucoseCalendar } from '@/components/GlucoseCalendar';
import { GlucoseTable } from '@/components/GlucoseTable';
import { GlucoseMetrics } from '@/components/GlucoseMetrics';
import { GlucoseHeatmap } from '@/components/GlucoseHeatmap';
import { GlucoseRecommendations } from '@/components/GlucoseRecommendations';
import { Activity, TrendingUp, AlertTriangle, Calendar, BarChart3, Brain } from 'lucide-react';
import { fetchGlucoseData, type GlucoseReading } from '@/utils/dataService';

const Index = () => {
  const [glucoseData, setGlucoseData] = useState<GlucoseReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchGlucoseData();
        setGlucoseData(data);
        setLastUpdate(new Date());
        console.log('Dados carregados:', data.length, 'registros');
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível conectar com a fonte de dados.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Atualizar dados a cada 5 minutos
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [toast]);

  const calculateStats = () => {
    if (glucoseData.length === 0) return null;
    
    const values = glucoseData.map(reading => reading.glucose);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    // Classificação por faixas
    const low = values.filter(val => val < 70).length;
    const normal = values.filter(val => val >= 70 && val <= 130).length;
    const elevated = values.filter(val => val > 130 && val <= 180).length;
    const high = values.filter(val => val > 180).length;
    
    return { average, max, min, low, normal, elevated, high, total: values.length };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Carregando dados de glicemia...</p>
          <p className="text-gray-500 text-sm mt-2">Preparando análises inteligentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Modernizado */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent mb-4 flex items-center justify-center gap-3">
            <Activity className="text-blue-600" size={48} />
            GlucoPulse Insights
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">
            Plataforma inteligente para monitoramento e análise avançada de glicemia
          </p>
          {lastUpdate && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                {glucoseData.length} registros carregados
              </Badge>
            </div>
          )}
        </div>

        {/* Quick Stats Modernizados */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-100">
                  Média Geral
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-blue-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.average.toFixed(0)} mg/dL
                </div>
                <p className="text-xs text-blue-100 mt-1">
                  {stats.average < 140 ? 'Dentro da meta' : 'Acima da meta'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-100">
                  Registros Ativos
                </CardTitle>
                <Activity className="h-5 w-5 text-green-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.total}
                </div>
                <p className="text-xs text-green-100 mt-1">
                  Dados para análise
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-100">
                  Pico Máximo
                </CardTitle>
                <AlertTriangle className="h-5 w-5 text-red-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.max} mg/dL
                </div>
                <p className="text-xs text-red-100 mt-1">
                  Valor mais alto registrado
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-100">
                  Menor Valor
                </CardTitle>
                <Calendar className="h-5 w-5 text-purple-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.min} mg/dL
                </div>
                <p className="text-xs text-purple-100 mt-1">
                  Registro mínimo
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navegação Principal */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8 bg-white/90 backdrop-blur-lg shadow-lg border-0 h-12">
            <TabsTrigger value="overview" className="text-sm font-medium">
              📊 Overview
            </TabsTrigger>
            <TabsTrigger value="metrics" className="text-sm font-medium">
              🎯 Métricas
            </TabsTrigger>
            <TabsTrigger value="patterns" className="text-sm font-medium">
              🔥 Padrões
            </TabsTrigger>
            <TabsTrigger value="table" className="text-sm font-medium">
              📋 Tabela
            </TabsTrigger>
            <TabsTrigger value="calendar" className="text-sm font-medium">
              📅 Calendário
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-sm font-medium">
              🧠 Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlucoseChart data={glucoseData} />
              <GlucoseDistribution data={glucoseData} />
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            <GlucoseMetrics data={glucoseData} />
          </TabsContent>

          <TabsContent value="patterns">
            <GlucoseHeatmap data={glucoseData} />
          </TabsContent>

          <TabsContent value="table">
            <GlucoseTable data={glucoseData} />
          </TabsContent>

          <TabsContent value="calendar">
            <GlucoseCalendar data={glucoseData} />
          </TabsContent>

          <TabsContent value="insights">
            <GlucoseRecommendations data={glucoseData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
