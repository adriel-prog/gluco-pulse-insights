
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { GlucoseChart } from '@/components/GlucoseChart';
import { GlucoseInsights } from '@/components/GlucoseInsights';
import { GlucoseDistribution } from '@/components/GlucoseDistribution';
import { GlucoseCalendar } from '@/components/GlucoseCalendar';
import { Activity, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados de glicemia...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Activity className="text-blue-600" size={36} />
            GlucoPulse Insights
          </h1>
          <p className="text-gray-600 text-lg">
            Monitoramento inteligente de glicemia
          </p>
          {lastUpdate && (
            <Badge variant="outline" className="mt-2">
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </Badge>
          )}
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Média Geral
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.average.toFixed(0)} mg/dL
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total de Registros
                </CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Valor Máximo
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.max} mg/dL
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Valor Mínimo
                </CardTitle>
                <Calendar className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.min} mg/dL
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="text-sm">Dashboard</TabsTrigger>
            <TabsTrigger value="calendar" className="text-sm">Calendário</TabsTrigger>
            <TabsTrigger value="insights" className="text-sm">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlucoseChart data={glucoseData} />
              <GlucoseDistribution data={glucoseData} />
            </div>
          </TabsContent>

          <TabsContent value="calendar">
            <GlucoseCalendar data={glucoseData} />
          </TabsContent>

          <TabsContent value="insights">
            <GlucoseInsights data={glucoseData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
