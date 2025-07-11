import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { GlucoseChart } from '@/components/GlucoseChart';
import { GlucoseInsights } from '@/components/GlucoseInsights';
import { GlucoseDistribution } from '@/components/GlucoseDistribution';
import { GlucoseCalendar } from '@/components/GlucoseCalendar';
import { GlucoseTable } from '@/components/GlucoseTable';
import { GlucoseMetrics } from '@/components/GlucoseMetrics';
import { GlucoseHeatmap } from '@/components/GlucoseHeatmap';
import { GlucoseRecommendations } from '@/components/GlucoseRecommendations';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { MobileNavigation } from '@/components/MobileNavigation';
import { MobileStatsCards } from '@/components/MobileStatsCards';
import { MobileHeader } from '@/components/MobileHeader';
import { Activity } from 'lucide-react';
import { fetchGlucoseData, type GlucoseReading } from '@/utils/dataService';
import { isAfter, isBefore } from 'date-fns';
import { GlucoseReport } from '@/components/GlucoseReport';
import { cn } from '@/lib/utils';

const Index = () => {
  const [glucoseData, setGlucoseData] = useState<GlucoseReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateFilter, setDateFilter] = useState<{start: Date | null, end: Date | null}>({
    start: null,
    end: null
  });
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
    <div className={cn(
      "min-h-screen bg-background relative",
      isMobile && "pb-20" // Add bottom padding for mobile navigation
    )}>      
      <div className={cn(
        "container mx-auto relative z-10",
        isMobile ? "mobile-container py-4" : "px-4 sm:px-6 lg:px-8 py-8"
      )}>
        {/* Mobile Header */}
        <MobileHeader 
          lastUpdate={lastUpdate}
          totalRecords={glucoseData.length}
        />

        {/* Date Range Filter */}
        <DateRangeFilter 
          onFilterChange={handleFilterChange}
          totalRecords={glucoseData.length}
          filteredRecords={filteredData.length}
        />

        {/* Stats Cards */}
        {stats && (
          <MobileStatsCards 
            stats={stats} 
            className="mb-6 animate-slide-up"
          />
        )}

        {/* Navigation and Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-scale-in">
          {/* Desktop Navigation */}
          {!isMobile && (
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-7 mb-8 glass-subtle h-14 p-1 rounded-2xl">
              <TabsTrigger value="overview" className="mobile-tab-trigger">
                📊 Overview
              </TabsTrigger>
              <TabsTrigger value="metrics" className="mobile-tab-trigger">
                🎯 Métricas
              </TabsTrigger>
              <TabsTrigger value="patterns" className="mobile-tab-trigger">
                🔥 Padrões
              </TabsTrigger>
              <TabsTrigger value="report" className="mobile-tab-trigger">
                📋 Relatório
              </TabsTrigger>
              <TabsTrigger value="table" className="mobile-tab-trigger">
                📋 Tabela
              </TabsTrigger>
              <TabsTrigger value="calendar" className="mobile-tab-trigger">
                📅 Calendário
              </TabsTrigger>
              <TabsTrigger value="insights" className="mobile-tab-trigger">
                🧠 Insights
              </TabsTrigger>
            </TabsList>
          )}

          {/* Mobile Horizontal Scrollable Navigation */}
          {isMobile && (
            <div className="mobile-tabs mb-4">
              <TabsList className="inline-flex h-12 items-center justify-start rounded-xl bg-muted p-1 text-muted-foreground w-max">
                <TabsTrigger value="overview" className="mobile-tab-trigger">
                  📊 Overview
                </TabsTrigger>
                <TabsTrigger value="metrics" className="mobile-tab-trigger">
                  🎯 Métricas
                </TabsTrigger>
                <TabsTrigger value="patterns" className="mobile-tab-trigger">
                  🔥 Padrões
                </TabsTrigger>
                <TabsTrigger value="report" className="mobile-tab-trigger">
                  📋 Relatório
                </TabsTrigger>
                <TabsTrigger value="table" className="mobile-tab-trigger">
                  📋 Tabela
                </TabsTrigger>
                <TabsTrigger value="calendar" className="mobile-tab-trigger">
                  📅 Calendário
                </TabsTrigger>
                <TabsTrigger value="insights" className="mobile-tab-trigger">
                  🧠 Insights
                </TabsTrigger>
              </TabsList>
            </div>
          )}

          <TabsContent value="overview" className="space-y-4 sm:space-y-6 animate-fade-in">
            <div className={cn(
              "grid gap-4 sm:gap-6",
              isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
            )}>
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

          <TabsContent value="report" className="animate-fade-in">
            <GlucoseReport data={filteredData} />
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

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
    </div>
  );
};

export default Index;
