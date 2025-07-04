
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
  
  const data: GlucoseReading[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    
    if (values.length < 4) continue;
    
    try {
      // Assumindo ordem: Data, Hora, Período, Glicemia, Observações
      const dateStr = values[0];
      const timeStr = values[1];
      const period = values[2];
      const glucoseStr = values[3];
      const notes = values[4] || '';
      
      // Parse da data (assumindo formato DD/MM/YYYY ou similar)
      const dateParts = dateStr.split('/');
      if (dateParts.length !== 3) continue;
      
      const date = new Date(
        parseInt(dateParts[2]), // ano
        parseInt(dateParts[1]) - 1, // mês (0-indexed)
        parseInt(dateParts[0]) // dia
      );
      
      const glucose = parseFloat(glucoseStr.replace(',', '.'));
      
      if (isNaN(glucose) || glucose <= 0) continue;
      
      data.push({
        date,
        time: timeStr,
        period,
        glucose,
        notes: notes || undefined,
      });
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
  
  console.log('Dados processados:', data.length, 'registros válidos');
  return data;
};
