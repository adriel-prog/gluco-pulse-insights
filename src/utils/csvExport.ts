import { GlucoseReading } from './dataService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const exportToCSV = (data: GlucoseReading[], filename: string = 'registros_glicemia') => {
  if (data.length === 0) {
    throw new Error('Nenhum dado para exportar');
  }

  // Cabeçalhos em português
  const headers = [
    'Data',
    'Horário',
    'Período',
    'Glicemia (mg/dL)',
    'Status',
    'Observações'
  ];

  // Função para determinar status da glicemia
  const getGlucoseStatus = (glucose: number): string => {
    if (glucose < 70) return 'Baixa';
    if (glucose <= 130) return 'Normal';
    if (glucose <= 180) return 'Elevada';
    return 'Alta';
  };

  // Converter dados para CSV
  const csvContent = [
    headers.join(','),
    ...data.map(reading => [
      format(reading.date, 'dd/MM/yyyy', { locale: ptBR }),
      reading.time,
      reading.period,
      reading.glucose.toString(),
      getGlucoseStatus(reading.glucose),
      `"${reading.notes || ''}"`
    ].join(','))
  ].join('\n');

  // Criar e baixar o arquivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};