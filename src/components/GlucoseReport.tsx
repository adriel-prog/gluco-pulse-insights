
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlucoseReading } from '@/utils/dataService';
import { format, getHours, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Download, TrendingUp, Clock, Calendar, Utensils } from 'lucide-react';
import * as XLSX from 'xlsx';

interface GlucoseReportProps {
  data: GlucoseReading[];
}

interface PatternReport {
  peakHours: { hour: number; average: number; count: number }[];
  peakDays: { day: number; dayName: string; average: number; count: number }[];
  mealPatterns: {
    beforeMeals: { average: number; count: number };
    afterMeals: { average: number; count: number };
  };
  highestReadings: GlucoseReading[];
  lowestReadings: GlucoseReading[];
  weeklyTrends: { week: string; average: number; count: number }[];
}

export const GlucoseReport = ({ data }: GlucoseReportProps) => {
  const generateReport = (): PatternReport => {
    if (data.length === 0) {
      return {
        peakHours: [],
        peakDays: [],
        mealPatterns: { beforeMeals: { average: 0, count: 0 }, afterMeals: { average: 0, count: 0 } },
        highestReadings: [],
        lowestReadings: [],
        weeklyTrends: [],
      };
    }

    // Análise por horário - usar time string se disponível, senão usar date
    const hourlyData: { [key: number]: number[] } = {};
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = [];
    }

    // Análise por dia da semana
    const dailyData: { [key: number]: number[] } = {};
    for (let i = 0; i < 7; i++) {
      dailyData[i] = [];
    }

    data.forEach(reading => {
      let hour: number;
      
      // Tentar extrair hora do campo time primeiro, depois da data
      if (reading.time) {
        const timeMatch = reading.time.match(/(\d{1,2}):?\d{0,2}/);
        hour = timeMatch ? parseInt(timeMatch[1]) : getHours(reading.date);
      } else {
        hour = getHours(reading.date);
      }
      
      const day = getDay(reading.date);
      
      hourlyData[hour].push(reading.glucose);
      dailyData[day].push(reading.glucose);
    });

    // Calcular médias por horário e ordenar por maior quantidade de registros primeiro, depois por média
    const peakHours = Object.entries(hourlyData)
      .map(([hour, values]) => ({
        hour: parseInt(hour),
        average: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
        count: values.length,
      }))
      .filter(item => item.count > 0)
      .sort((a, b) => {
        // Primeiro ordenar por quantidade de registros, depois por média
        if (a.count !== b.count) return b.count - a.count;
        return b.average - a.average;
      })
      .slice(0, 8); // Mostrar mais horários relevantes

    // Calcular médias por dia da semana
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const peakDays = Object.entries(dailyData)
      .map(([day, values]) => ({
        day: parseInt(day),
        dayName: dayNames[parseInt(day)],
        average: values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0,
        count: values.length,
      }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.average - a.average);

    // Padrões de refeição melhorados - análise por período e horário
    const classifyMealPeriod = (reading: GlucoseReading) => {
      const period = reading.period?.toLowerCase() || '';
      let hour: number;
      
      if (reading.time) {
        const timeMatch = reading.time.match(/(\d{1,2}):?\d{0,2}/);
        hour = timeMatch ? parseInt(timeMatch[1]) : getHours(reading.date);
      } else {
        hour = getHours(reading.date);
      }

      // Classificação por período explícito
      if (period.includes('jejum') || period.includes('antes')) return 'beforeMeals';
      if (period.includes('após') || period.includes('depois') || period.includes('pós')) return 'afterMeals';
      
      // Classificação por horário (se não há período definido)
      if (hour >= 6 && hour <= 8) return 'morningFasting'; // Manhã em jejum
      if (hour >= 8 && hour <= 10) return 'afterBreakfast'; // Após café
      if (hour >= 11 && hour <= 12) return 'beforeLunch'; // Antes almoço
      if (hour >= 13 && hour <= 15) return 'afterLunch'; // Após almoço
      if (hour >= 17 && hour <= 19) return 'beforeDinner'; // Antes jantar
      if (hour >= 19 && hour <= 21) return 'afterDinner'; // Após jantar
      if (hour >= 22 || hour <= 5) return 'nightTime'; // Madrugada
      
      return 'other';
    };

    const mealCategories = {
      beforeMeals: [] as number[],
      afterMeals: [] as number[],
      morningFasting: [] as number[],
      afterBreakfast: [] as number[],
      beforeLunch: [] as number[],
      afterLunch: [] as number[],
      beforeDinner: [] as number[],
      afterDinner: [] as number[],
      nightTime: [] as number[],
      other: [] as number[]
    };

    data.forEach(reading => {
      const category = classifyMealPeriod(reading);
      mealCategories[category].push(reading.glucose);
    });

    const mealPatterns = {
      beforeMeals: {
        average: mealCategories.beforeMeals.length > 0 ? 
          mealCategories.beforeMeals.reduce((sum, val) => sum + val, 0) / mealCategories.beforeMeals.length : 
          (mealCategories.morningFasting.length > 0 ? 
            mealCategories.morningFasting.reduce((sum, val) => sum + val, 0) / mealCategories.morningFasting.length : 0),
        count: mealCategories.beforeMeals.length || mealCategories.morningFasting.length,
      },
      afterMeals: {
        average: mealCategories.afterMeals.length > 0 ? 
          mealCategories.afterMeals.reduce((sum, val) => sum + val, 0) / mealCategories.afterMeals.length :
          ([...mealCategories.afterBreakfast, ...mealCategories.afterLunch, ...mealCategories.afterDinner].length > 0 ?
            [...mealCategories.afterBreakfast, ...mealCategories.afterLunch, ...mealCategories.afterDinner]
              .reduce((sum, val) => sum + val, 0) / 
            [...mealCategories.afterBreakfast, ...mealCategories.afterLunch, ...mealCategories.afterDinner].length : 0),
        count: mealCategories.afterMeals.length || 
          (mealCategories.afterBreakfast.length + mealCategories.afterLunch.length + mealCategories.afterDinner.length),
      },
    };

    // Maiores e menores leituras
    const sortedData = [...data].sort((a, b) => b.glucose - a.glucose);
    const highestReadings = sortedData.slice(0, 10);
    const lowestReadings = sortedData.slice(-10).reverse();

    // Tendências semanais (últimas 4 semanas)
    const weeklyTrends: { week: string; average: number; count: number }[] = [];
    const now = new Date();
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekData = data.filter(r => r.date >= weekStart && r.date <= weekEnd);
      if (weekData.length > 0) {
        weeklyTrends.push({
          week: `${format(weekStart, 'dd/MM', { locale: ptBR })} - ${format(weekEnd, 'dd/MM', { locale: ptBR })}`,
          average: weekData.reduce((sum, r) => sum + r.glucose, 0) / weekData.length,
          count: weekData.length,
        });
      }
    }

    return {
      peakHours,
      peakDays,
      mealPatterns,
      highestReadings,
      lowestReadings,
      weeklyTrends,
    };
  };

  const exportReport = () => {
    const report = generateReport();
    
    // Criar planilhas
    const workbook = XLSX.utils.book_new();

    // Planilha 1: Resumo dos Padrões
    const summaryData = [
      ['RELATÓRIO DE PADRÕES GLICÊMICOS'],
      ['Gerado em:', format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })],
      ['Total de registros:', data.length],
      [''],
      ['HORÁRIOS DE PICO'],
      ['Horário', 'Média (mg/dL)', 'Quantidade'],
      ...report.peakHours.map(h => [`${h.hour.toString().padStart(2, '0')}:00`, h.average.toFixed(1), h.count]),
      [''],
      ['DIAS DA SEMANA - MAIORES MÉDIAS'],
      ['Dia', 'Média (mg/dL)', 'Quantidade'],
      ...report.peakDays.map(d => [d.dayName, d.average.toFixed(1), d.count]),
      [''],
      ['PADRÕES DE REFEIÇÃO'],
      ['Período', 'Média (mg/dL)', 'Quantidade'],
      ['Antes das refeições', report.mealPatterns.beforeMeals.average.toFixed(1), report.mealPatterns.beforeMeals.count],
      ['Após as refeições', report.mealPatterns.afterMeals.average.toFixed(1), report.mealPatterns.afterMeals.count],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

    // Planilha 2: Maiores Leituras
    const highestData = [
      ['MAIORES LEITURAS'],
      ['Data', 'Hora', 'Glicemia (mg/dL)', 'Período'],
      ...report.highestReadings.map(r => [
        format(r.date, 'dd/MM/yyyy', { locale: ptBR }),
        r.time,
        r.glucose,
        r.period || 'N/A'
      ]),
    ];

    const highestSheet = XLSX.utils.aoa_to_sheet(highestData);
    XLSX.utils.book_append_sheet(workbook, highestSheet, 'Maiores Leituras');

    // Planilha 3: Menores Leituras
    const lowestData = [
      ['MENORES LEITURAS'],
      ['Data', 'Hora', 'Glicemia (mg/dL)', 'Período'],
      ...report.lowestReadings.map(r => [
        format(r.date, 'dd/MM/yyyy', { locale: ptBR }),
        r.time,
        r.glucose,
        r.period || 'N/A'
      ]),
    ];

    const lowestSheet = XLSX.utils.aoa_to_sheet(lowestData);
    XLSX.utils.book_append_sheet(workbook, lowestSheet, 'Menores Leituras');

    // Salvar arquivo
    const fileName = `relatorio-padroes-glicemia-${format(new Date(), 'yyyy-MM-dd-HHmm')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const report = generateReport();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="card-modern hover-lift">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Relatório de Padrões
            </CardTitle>
            <Button onClick={exportReport} className="gap-2">
              <Download className="w-4 h-4" />
              Baixar Relatório
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{data.length}</div>
              <div className="text-sm text-muted-foreground">Total de Registros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{report.peakHours.length}</div>
              <div className="text-sm text-muted-foreground">Horários Analisados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{report.peakDays.length}</div>
              <div className="text-sm text-muted-foreground">Dias da Semana</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horários de Pico */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Horários de Pico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.peakHours.map((hour, index) => (
              <div key={hour.hour} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={index === 0 ? "default" : "outline"} className="min-w-[24px] h-6 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <div className="font-semibold">{hour.hour.toString().padStart(2, '0')}:00</div>
                    <div className="text-sm text-muted-foreground">{hour.count} registros</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{hour.average.toFixed(0)} mg/dL</div>
                  <div className="text-xs text-muted-foreground">média</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dias da Semana */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Padrões por Dia da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.peakDays.map((day, index) => (
              <div key={day.day} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={index === 0 ? "default" : "outline"} className="min-w-[24px] h-6 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <div className="font-semibold">{day.dayName}</div>
                    <div className="text-sm text-muted-foreground">{day.count} registros</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{day.average.toFixed(0)} mg/dL</div>
                  <div className="text-xs text-muted-foreground">média</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Padrões de Refeição */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <Utensils className="w-5 h-5 text-primary" />
            Padrões de Refeição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div className="font-semibold">Antes das Refeições</div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {report.mealPatterns.beforeMeals.average.toFixed(0)} mg/dL
              </div>
              <div className="text-sm text-muted-foreground">
                {report.mealPatterns.beforeMeals.count} registros
              </div>
            </div>
            
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <div className="font-semibold">Após as Refeições</div>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {report.mealPatterns.afterMeals.average.toFixed(0)} mg/dL
              </div>
              <div className="text-sm text-muted-foreground">
                {report.mealPatterns.afterMeals.count} registros
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extremos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maiores Leituras */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-500" />
              Maiores Leituras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {report.highestReadings.slice(0, 5).map((reading, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div>
                    <div className="font-semibold text-red-700 dark:text-red-300">
                      {reading.glucose} mg/dL
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(reading.date, 'dd/MM/yyyy', { locale: ptBR })} às {reading.time}
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {reading.period || 'N/A'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Menores Leituras */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500 rotate-180" />
              Menores Leituras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {report.lowestReadings.slice(0, 5).map((reading, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <div className="font-semibold text-blue-700 dark:text-blue-300">
                      {reading.glucose} mg/dL
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(reading.date, 'dd/MM/yyyy', { locale: ptBR })} às {reading.time}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {reading.period || 'N/A'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
