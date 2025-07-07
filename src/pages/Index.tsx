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
import { ThemeToggle } from '@/components/ThemeToggle';
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
      <div className="min-h-screen bg-background flex items-center justify-center relative">
        <div className="text-center relative z-10 animate-fade-in">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Carregando GlucoPulse</h2>
          <p className="text-muted-foreground">Preparando seus dados de saúde...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Modern Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg hover-lift">
                <Activity className="text-white h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold gradient-health">
                  GlucoPulse Insights
                </h1>
                <p className="text-muted-foreground text-lg">
                  Monitoramento inteligente de glicemia
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
          
          {lastUpdate && (
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant="outline" className="glass-subtle border-primary/30 px-3 py-1.5">
                <Calendar className="w-3 h-3 mr-2" />
                {lastUpdate.toLocaleTimeString('pt-BR')}
              </Badge>
              <Badge className="bg-gradient-to-r from-success to-success/80 text-white border-0 px-3 py-1.5">
                <Activity className="w-3 h-3 mr-2" />
                {glucoseData.length} registros
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

        {/* Modern Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 animate-slide-up">
            <Card className="card-floating hover-lift group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-card-foreground">
                  Média Geral
                </CardTitle>
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-1">
                  {stats.average.toFixed(0)} <span className="text-lg text-muted-foreground">mg/dL</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.average < 140 ? '✓ Dentro da meta' : '⚠ Acima da meta'}
                </p>
              </CardContent>
            </Card>

            <Card className="card-floating hover-lift group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-card-foreground">
                  Total de Registros
                </CardTitle>
                <div className="p-2 bg-success/10 text-success rounded-xl">
                  <Activity className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success mb-1">
                  {stats.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  Dados para análise
                </p>
              </CardContent>
            </Card>

            <Card className="card-floating hover-lift group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-card-foreground">
                  Pico Máximo
                </CardTitle>
                <div className="p-2 bg-danger/10 text-danger rounded-xl">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-danger mb-1">
                  {stats.max} <span className="text-lg text-muted-foreground">mg/dL</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Valor mais alto
                </p>
              </CardContent>
            </Card>

            <Card className="card-floating hover-lift group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-base font-semibold text-card-foreground">
                  Menor Valor
                </CardTitle>
                <div className="p-2 bg-accent/10 text-accent rounded-xl">
                  <Calendar className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent mb-1">
                  {stats.min} <span className="text-lg text-muted-foreground">mg/dL</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Registro mínimo
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modern Navigation */}
        <Tabs defaultValue="overview" className="w-full animate-scale-in">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 mb-8 glass-subtle h-14 p-1 rounded-2xl">
            <TabsTrigger value="overview" className="text-sm font-medium rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground smooth-transition">
              📊 Overview
            </TabsTrigger>
            <TabsTrigger value="metrics" className="text-sm font-medium rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground smooth-transition">
              🎯 Métricas
            </TabsTrigger>
            <TabsTrigger value="patterns" className="text-sm font-medium rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground smooth-transition">
              🔥 Padrões
            </TabsTrigger>
            <TabsTrigger value="table" className="text-sm font-medium rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground smooth-transition">
              📋 Tabela
            </TabsTrigger>
            <TabsTrigger value="calendar" className="text-sm font-medium rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground smooth-transition">
              📅 Calendário
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-sm font-medium rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground smooth-transition">
              🧠 Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlucoseChart data={filteredData} />
              <GlucoseDistribution data={filteredData} />
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="animate-fade-in">
            <GlucoseMetrics data={filteredData} />
          </TabsContent>

          <TabsContent value="patterns" className="animate-fade-in">
            <GlucoseHeatmap data={filteredData} />
          </TabsContent>

          <TabsContent value="table" className="animate-fade-in">
            <GlucoseTable data={filteredData} />
          </TabsContent>

          <TabsContent value="calendar" className="animate-fade-in">
            <GlucoseCalendar data={filteredData} />
          </TabsContent>

          <TabsContent value="insights" className="animate-fade-in">
            <GlucoseRecommendations data={filteredData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;