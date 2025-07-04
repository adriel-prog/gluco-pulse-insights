
export interface GlucoseReading {
  date: Date;
  time: string;
  period: string;
  glucose: number;
  notes?: string;
}

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQt_gtGMhokU2Az3Lp5Slby8m-NoV5UweAjC_hXBEay59V8y189KeoQ86iWK0G6g_4vVlMYMS4U8iJZ/pub?gid=0&single=true&output=csv';

export const fetchGlucoseData = async (): Promise<GlucoseReading[]> => {
  try {
    const response = await fetch(CSV_URL, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    console.log('CSV Text received:', csvText.substring(0, 200) + '...');
    return parseCSVData(csvText);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    throw error;
  }
};

const parseCSVData = (csvText: string): GlucoseReading[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  console.log('Headers encontrados:', headers);
  
  // Mapear índices dos campos pelos headers
  const dateIndex = headers.findIndex(h => h.toLowerCase().includes('data'));
  const timeIndex = headers.findIndex(h => h.toLowerCase().includes('hora'));
  const periodIndex = headers.findIndex(h => h.toLowerCase().includes('período') || h.toLowerCase().includes('periodo'));
  const glucoseIndex = headers.findIndex(h => h.toLowerCase().includes('glicemia') || h.toLowerCase().includes('valor'));
  const notesIndex = headers.findIndex(h => h.toLowerCase().includes('observ') || h.toLowerCase().includes('nota'));

  console.log('Índices dos campos:', { dateIndex, timeIndex, periodIndex, glucoseIndex, notesIndex });
  
  const data: GlucoseReading[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    
    if (values.length < 4) {
      console.warn('Linha com poucos campos:', lines[i]);
      continue;
    }
    
    try {
      const dateStr = values[dateIndex];
      const timeStr = values[timeIndex];
      const period = values[periodIndex];
      const glucoseStr = values[glucoseIndex];
      const notes = notesIndex >= 0 ? values[notesIndex] : '';
      
      console.log('Processando linha:', { dateStr, timeStr, period, glucoseStr, notes });
      
      if (!dateStr || !timeStr || !period || !glucoseStr) {
        console.warn('Campos obrigatórios faltando na linha:', lines[i]);
        continue;
      }
      
      // Parse da data - assumindo formato MM/DD/YYYY baseado nos dados observados
      const dateParts = dateStr.split('/');
      if (dateParts.length !== 3) {
        console.warn('Formato de data inválido:', dateStr);
        continue;
      }
      
      const date = new Date(
        parseInt(dateParts[2]), // ano
        parseInt(dateParts[0]) - 1, // mês (0-indexed) - assumindo MM/DD/YYYY
        parseInt(dateParts[1]) // dia
      );
      
      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        console.warn('Data inválida:', dateStr);
        continue;
      }
      
      const glucose = parseFloat(glucoseStr.replace(',', '.'));
      
      if (isNaN(glucose) || glucose <= 0) {
        console.warn('Valor de glicemia inválido:', glucoseStr);
        continue;
      }
      
      data.push({
        date,
        time: timeStr,
        period,
        glucose,
        notes: notes || undefined,
      });
      
      console.log('Registro adicionado:', { date: date.toISOString(), time: timeStr, period, glucose });
    } catch (error) {
      console.warn('Erro ao processar linha:', lines[i], error);
      continue;
    }
  }
  
  // Ordenar por data/hora
  data.sort((a, b) => {
    const dateCompare = a.date.getTime() - b.date.getTime();
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });
  
  console.log('Dados processados com sucesso:', data.length, 'registros válidos');
  console.log('Primeiros 3 registros:', data.slice(0, 3));
  return data;
};
