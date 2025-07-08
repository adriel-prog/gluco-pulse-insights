import { GlucoseReading } from './dataService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as XLSX from 'xlsx';

export const exportToExcel = (data: GlucoseReading[], filename: string = 'registros_glicemia') => {
  if (data.length === 0) {
    throw new Error('Nenhum dado para exportar');
  }

  // Função para determinar status da glicemia
  const getGlucoseStatus = (glucose: number): string => {
    if (glucose < 70) return 'Baixa';
    if (glucose <= 130) return 'Normal';
    if (glucose <= 180) return 'Elevada';
    return 'Alta';
  };

  // Ordenar dados por data e hora - mais recentes primeiro
  const sortedData = [...data].sort((a, b) => {
    // Criar datetime combinando data e hora
    const [hoursA, minutesA] = a.time.split(':').map(Number);
    const [hoursB, minutesB] = b.time.split(':').map(Number);
    
    const datetimeA = new Date(a.date);
    datetimeA.setHours(hoursA, minutesA, 0, 0);
    
    const datetimeB = new Date(b.date);
    datetimeB.setHours(hoursB, minutesB, 0, 0);
    
    // Mais recentes primeiro (ordem decrescente)
    return datetimeB.getTime() - datetimeA.getTime();
  });

  // Converter dados para formato Excel
  const excelData = sortedData.map(reading => ({
    'Data': format(reading.date, 'dd/MM/yyyy', { locale: ptBR }),
    'Horário': reading.time,
    'Período': reading.period,
    'Glicemia (mg/dL)': reading.glucose,
    'Status': getGlucoseStatus(reading.glucose),
    'Observações': reading.notes || ''
  }));

  // Criar workbook e worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Configurar largura das colunas
  const columnWidths = [
    { wch: 12 }, // Data
    { wch: 10 }, // Horário
    { wch: 10 }, // Período
    { wch: 15 }, // Glicemia
    { wch: 10 }, // Status
    { wch: 30 }  // Observações
  ];
  worksheet['!cols'] = columnWidths;

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros de Glicemia');

  // Gerar e baixar o arquivo
  const fileName = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// Manter compatibilidade com CSV para casos específicos
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