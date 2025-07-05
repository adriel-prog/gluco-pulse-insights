
import { GlucoseReading } from './dataService';
import { format, differenceInHours, startOfDay, getHours, getDay } from 'date-fns';

export interface GlucoseStats {
  average: number;
  median: number;
  standardDeviation: number;
  coefficientOfVariation: number;
  timeInRange: {
    low: number;
    target: number;
    high: number;
    veryHigh: number;
  };
  variabilityScore: number;
  controlScore: number;
}

export interface PatternAnalysis {
  peakHours: number[];
  lowHours: number[];
  weekdayPattern: { [key: number]: number };
  hourlyPattern: { [key: number]: number };
  trends: {
    overall: 'increasing' | 'decreasing' | 'stable';
    recentWeek: 'improving' | 'worsening' | 'stable';
  };
}

export interface SmartRecommendation {
  type: 'warning' | 'suggestion' | 'positive';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export const calculateAdvancedStats = (data: GlucoseReading[]): GlucoseStats => {
  if (data.length === 0) {
    return {
      average: 0,
      median: 0,
      standardDeviation: 0,
      coefficientOfVariation: 0,
      timeInRange: { low: 0, target: 0, high: 0, veryHigh: 0 },
      variabilityScore: 0,
      controlScore: 0,
    };
  }

  const values = data.map(r => r.glucose).sort((a, b) => a - b);
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  
  // Mediana
  const median = values.length % 2 === 0
    ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
    : values[Math.floor(values.length / 2)];

  // Desvio padrão
  const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);

  // Coeficiente de variação
  const coefficientOfVariation = (standardDeviation / average) * 100;

  // Tempo no alvo
  const timeInRange = {
    low: (values.filter(v => v < 70).length / values.length) * 100,
    target: (values.filter(v => v >= 70 && v <= 180).length / values.length) * 100,
    high: (values.filter(v => v > 180 && v <= 250).length / values.length) * 100,
    veryHigh: (values.filter(v => v > 250).length / values.length) * 100,
  };

  // Score de variabilidade (menor é melhor)
  const variabilityScore = Math.max(0, 100 - coefficientOfVariation);

  // Score de controle geral
  const controlScore = (timeInRange.target * 0.7) + (variabilityScore * 0.3);

  return {
    average,
    median,
    standardDeviation,
    coefficientOfVariation,
    timeInRange,
    variabilityScore,
    controlScore,
  };
};

export const analyzePatterns = (data: GlucoseReading[]): PatternAnalysis => {
  if (data.length === 0) {
    return {
      peakHours: [],
      lowHours: [],
      weekdayPattern: {},
      hourlyPattern: {},
      trends: { overall: 'stable', recentWeek: 'stable' },
    };
  }

  // Análise por hora do dia
  const hourlyData: { [key: number]: number[] } = {};
  const weekdayData: { [key: number]: number[] } = {};

  // Inicializar estruturas de dados
  for (let i = 0; i < 24; i++) {
    hourlyData[i] = [];
  }
  for (let i = 0; i < 7; i++) {
    weekdayData[i] = [];
  }

  data.forEach(reading => {
    const hour = getHours(reading.date);
    const weekday = getDay(reading.date);

    hourlyData[hour].push(reading.glucose);
    weekdayData[weekday].push(reading.glucose);
  });

  // Calcular médias por hora e dia da semana
  const hourlyPattern: { [key: number]: number } = {};
  const weekdayPattern: { [key: number]: number } = {};

  // Médias horárias
  Object.entries(hourlyData).forEach(([hour, values]) => {
    if (values.length > 0) {
      hourlyPattern[parseInt(hour)] = values.reduce((sum, val) => sum + val, 0) / values.length;
    } else {
      hourlyPattern[parseInt(hour)] = 0;
    }
  });

  // Médias semanais
  Object.entries(weekdayData).forEach(([day, values]) => {
    if (values.length > 0) {
      weekdayPattern[parseInt(day)] = values.reduce((sum, val) => sum + val, 0) / values.length;
    } else {
      weekdayPattern[parseInt(day)] = 0;
    }
  });

  // Identificar horários de pico e baixa de forma mais robusta
  const validHours = Object.entries(hourlyPattern)
    .filter(([_, avg]) => avg > 0)
    .map(([hour, avg]) => ({ hour: parseInt(hour), avg }));

  if (validHours.length === 0) {
    return {
      peakHours: [],
      lowHours: [],
      weekdayPattern,
      hourlyPattern,
      trends: { overall: 'stable', recentWeek: 'stable' },
    };
  }

  // Ordenar por valores mais altos e mais baixos
  const sortedByHigh = [...validHours].sort((a, b) => b.avg - a.avg);
  const sortedByLow = [...validHours].sort((a, b) => a.avg - b.avg);

  // Pegar top 3 de cada, mas apenas se tiver diferença significativa
  const avgGlucose = validHours.reduce((sum, h) => sum + h.avg, 0) / validHours.length;
  const threshold = avgGlucose * 0.1; // 10% de diferença

  const peakHours = sortedByHigh
    .filter(h => h.avg > avgGlucose + threshold)
    .slice(0, 3)
    .map(h => h.hour);

  const lowHours = sortedByLow
    .filter(h => h.avg < avgGlucose - threshold)
    .slice(0, 3)
    .map(h => h.hour);

  // Análise de tendências melhorada
  const sortedData = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  let overallTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  let recentWeekTrend: 'improving' | 'worsening' | 'stable' = 'stable';

  if (sortedData.length >= 10) {
    // Dividir dados em partes para análise de tendência
    const firstQuarter = sortedData.slice(0, Math.floor(sortedData.length / 4));
    const lastQuarter = sortedData.slice(-Math.floor(sortedData.length / 4));

    if (firstQuarter.length > 0 && lastQuarter.length > 0) {
      const firstAvg = firstQuarter.reduce((sum, r) => sum + r.glucose, 0) / firstQuarter.length;
      const lastAvg = lastQuarter.reduce((sum, r) => sum + r.glucose, 0) / lastQuarter.length;

      const difference = lastAvg - firstAvg;
      if (Math.abs(difference) > 15) { // Diferença significativa
        overallTrend = difference > 0 ? 'increasing' : 'decreasing';
      }
    }
  }

  // Tendência da última semana
  if (sortedData.length >= 7) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentData = sortedData.filter(r => r.date >= oneWeekAgo);

    if (recentData.length >= 5) {
      const firstHalf = recentData.slice(0, Math.floor(recentData.length / 2));
      const secondHalf = recentData.slice(-Math.floor(recentData.length / 2));

      if (firstHalf.length > 0 && secondHalf.length > 0) {
        const firstAvg = firstHalf.reduce((sum, r) => sum + r.glucose, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, r) => sum + r.glucose, 0) / secondHalf.length;

        const weekDifference = secondAvg - firstAvg;
        if (Math.abs(weekDifference) > 10) {
          recentWeekTrend = weekDifference < 0 ? 'improving' : 'worsening';
        }
      }
    }
  }

  return {
    peakHours,
    lowHours,
    weekdayPattern,
    hourlyPattern,
    trends: {
      overall: overallTrend,
      recentWeek: recentWeekTrend,
    },
  };
};

export const generateSmartRecommendations = (
  data: GlucoseReading[], 
  stats: GlucoseStats, 
  patterns: PatternAnalysis
): SmartRecommendation[] => {
  const recommendations: SmartRecommendation[] = [];

  // Recomendações baseadas no tempo no alvo
  if (stats.timeInRange.low > 10) {
    recommendations.push({
      type: 'warning',
      title: 'Alto risco de hipoglicemia',
      description: `${stats.timeInRange.low.toFixed(1)}% do tempo abaixo de 70 mg/dL. Considere ajustar medicação ou horários das refeições.`,
      priority: 'high',
      actionable: true,
    });
  }

  if (stats.timeInRange.target < 70) {
    recommendations.push({
      type: 'suggestion',
      title: 'Melhore o tempo no alvo',
      description: `Apenas ${stats.timeInRange.target.toFixed(1)}% do tempo na faixa ideal. Meta: >70%.`,
      priority: 'medium',
      actionable: true,
    });
  }

  // Recomendações baseadas na variabilidade
  if (stats.coefficientOfVariation > 36) {
    recommendations.push({
      type: 'warning',
      title: 'Alta variabilidade glicêmica',
      description: `CV de ${stats.coefficientOfVariation.toFixed(1)}%. Busque maior consistência na rotina.`,
      priority: 'high',
      actionable: true,
    });
  }

  // Recomendações baseadas em padrões
  if (patterns.peakHours.length > 0) {
    recommendations.push({
      type: 'suggestion',
      title: 'Horários de pico identificados',
      description: `Valores mais altos às ${patterns.peakHours.join('h, ')}h. Monitore atividades nesses horários.`,
      priority: 'medium',
      actionable: true,
    });
  }

  // Recomendações positivas
  if (stats.controlScore > 80) {
    recommendations.push({
      type: 'positive',
      title: 'Excelente controle glicêmico!',
      description: `Score de ${stats.controlScore.toFixed(0)}/100. Continue com a rotina atual.`,
      priority: 'low',
      actionable: false,
    });
  }

  if (patterns.trends.recentWeek === 'improving') {
    recommendations.push({
      type: 'positive',
      title: 'Tendência de melhora',
      description: 'Seus valores estão melhorando na última semana. Parabéns!',
      priority: 'low',
      actionable: false,
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};
