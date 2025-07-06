import { useState, useEffect, useMemo } from 'react';
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
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { Activity, TrendingUp, AlertTriangle, Calendar, BarChart3, Brain } from 'lucide-react';
import { fetchGlucoseData, type GlucoseReading } from '@/utils/dataService';
import { isAfter, isBefore } from 'date-fns';

const Index = () => {
  const [glucoseData, setGlucoseData] = useState<GlucoseReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [dateFilter, setDateFilter] = useState<{start: Date | null, end: Date | null}>({
    start: null,
    end: null
  });
  const { toast } = useToast();

  // Filter data based on date range
  const filteredData = useMemo(() => {
    if (!dateFilter.start || !dateFilter.end) {
      return glucoseData;
    }
    
    return glucoseData.filter(reading => {
      const readingDate = reading.date;
      return (!dateFilter.start || isAfter(readingDate, dateFilter.start) || readingDate.getTime() === dateFilter.start.getTime()) &&
             (!dateFilter.end || isBefore(readingDate, dateFilter.end) || readingDate.getTime() === dateFilter.end.getTime());
    });
  }, [glucoseData, dateFilter]);

  const handleFilterChange = (startDate: Date | null, endDate: Date | null) => {
    setDateFilter({ start: startDate, end: endDate });
  };

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
    if (filteredData.length === 0) return null;
    
    const values = filteredData.map(reading => reading.glucose);
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
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-accent/10 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-float"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary/30 border-t-primary mx-auto mb-8 glow-primary"></div>
          <p className="text-foreground text-2xl font-semibold mb-2">Carregando dados de glicemia...</p>
          <p className="text-muted-foreground text-lg">Preparando análises inteligentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 animate-float"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/20 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      
      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Header Modernizado */}
        <div className="mb-12 text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold gradient-text mb-6 flex items-center justify-center gap-4 animate-float">
            <Activity className="text-primary glow-primary" size={56} />
            GlucoPulse Insights
          </h1>
          <p className="text-muted-foreground text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-8">
            Plataforma inteligente para monitoramento e análise avançada de glicemia
          </p>
          {lastUpdate && (
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Badge variant="outline" className="glass-effect text-foreground border-primary/30 px-4 py-2">
                <Calendar className="w-4 h-4 mr-2" />
                Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
              </Badge>
              <Badge className="bg-gradient-to-r from-success to-success-glow text-white border-0 px-4 py-2 shadow-lg">
                <Activity className="w-4 h-4 mr-2" />
                {glucoseData.length} registros carregados
              </Badge>
            </div>
          )}
        </div>

        {/* Date Range Filter */}
        <DateRangeFilter 
          onFilterChange={handleFilterChange}
          totalRecords={glucoseData.length}
          filteredRecords={filteredData.length}
        />

        {/* Quick Stats Modernizados */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
            <Card className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground border-0 glow-primary group hover:scale-105 smooth-transition animate-float">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-lg font-bold opacity-95">
                  Média Geral
                </CardTitle>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black mb-2">
                  {stats.average.toFixed(0)} <span className="text-2xl opacity-80">mg/dL</span>
                </div>
                <p className="text-sm opacity-90 bg-white/10 px-3 py-1 rounded-full inline-block">
                  {stats.average < 140 ? '✓ Dentro da meta' : '⚠ Acima da meta'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-success to-success-glow text-white border-0 shadow-[0_0_30px_hsl(var(--success)/0.3)] group hover:scale-105 smooth-transition animate-float [animation-delay:0.2s]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-lg font-bold opacity-95">
                  Registros Ativos
                </CardTitle>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Activity className="h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black mb-2">
                  {stats.total}
                </div>
                <p className="text-sm opacity-90 bg-white/10 px-3 py-1 rounded-full inline-block">
                  📊 Dados para análise
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-danger to-danger-glow text-white border-0 shadow-[0_0_30px_hsl(var(--danger)/0.3)] group hover:scale-105 smooth-transition animate-float [animation-delay:0.4s]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-lg font-bold opacity-95">
                  Pico Máximo
                </CardTitle>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black mb-2">
                  {stats.max} <span className="text-2xl opacity-80">mg/dL</span>
                </div>
                <p className="text-sm opacity-90 bg-white/10 px-3 py-1 rounded-full inline-block">
                  🔥 Valor mais alto
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent to-accent-glow text-white border-0 shadow-[0_0_30px_hsl(var(--accent)/0.3)] group hover:scale-105 smooth-transition animate-float [animation-delay:0.6s]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-lg font-bold opacity-95">
                  Menor Valor
                </CardTitle>
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Calendar className="h-6 w-6" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black mb-2">
                  {stats.min} <span className="text-2xl opacity-80">mg/dL</span>
                </div>
                <p className="text-sm opacity-90 bg-white/10 px-3 py-1 rounded-full inline-block">
                  💧 Registro mínimo
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navegação Principal */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-10 glass-effect shadow-[var(--shadow-floating)] border border-primary/20 h-16 p-2 rounded-2xl">
            <TabsTrigger value="overview" className="text-sm font-semibold rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground smooth-transition">
              📊 Overview
            </TabsTrigger>
            <TabsTrigger value="metrics" className="text-sm font-semibold rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground smooth-transition">
              🎯 Métricas
            </TabsTrigger>
            <TabsTrigger value="patterns" className="text-sm font-semibold rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground smooth-transition">
              🔥 Padrões
            </TabsTrigger>
            <TabsTrigger value="table" className="text-sm font-semibold rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground smooth-transition">
              📋 Tabela
            </TabsTrigger>
            <TabsTrigger value="calendar" className="text-sm font-semibold rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground smooth-transition">
              📅 Calendário
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-sm font-semibold rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground smooth-transition">
              🧠 Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <GlucoseChart data={filteredData} />
              <GlucoseDistribution data={filteredData} />
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            <GlucoseMetrics data={filteredData} />
          </TabsContent>

          <TabsContent value="patterns">
            <GlucoseHeatmap data={filteredData} />
          </TabsContent>

          <TabsContent value="table">
            <GlucoseTable data={filteredData} />
          </TabsContent>

          <TabsContent value="calendar">
            <GlucoseCalendar data={filteredData} />
          </TabsContent>

          <TabsContent value="insights">
            <GlucoseRecommendations data={filteredData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;