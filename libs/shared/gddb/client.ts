import Papa from 'papaparse';
import type { GDDBFetchConfig } from './types';

export async function fetchSheetData(sheetId: string, sheetName: string): Promise<string> {
  // UWAGA: Aby to zadziałało bez API Key, Arkusz musi być opublikowany w internecie!
  // Plik -> Udostępnij -> Opublikuj w internecie -> Cały dokument (lub konkretny arkusz) jako pożądane CSV
  
  // W formacie Google Visualization API to działa tylko dla starszych arkuszy lub z opublikowanymi
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
    sheetName
  )}`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch data for sheet: ${sheetName}. Status: ${response.status}`);
  }

  const text = await response.text();
  
  // Jeśli Google zażąda logowania (gdy arkusz nie jest publiczny/opublikowany), 
  // zwróci HTML z panelem logowania, a nie CSV.
  if (text.trim().toLowerCase().startsWith('<!doctype html>') || text.trim().toLowerCase().startsWith('<html')) {
     throw new Error(`Otrzymano stronę HTML zamiast danych z arkusza "${sheetName}". Upewnij się, że:
1. Arkusz ma ustawienie "Każdy mający link może przeglądać".
2. **KRYTYCZNE**: Wybierz w menu Google Sheets: Plik -> Udostępnij -> Opublikuj w internecie -> Opublikuj.`);
  }

  return text;
}

export function parseCsvToObjects(csvString: string, fields: readonly string[], config?: GDDBFetchConfig): any[] {
  const result = Papa.parse(csvString, {
    header: false,
    skipEmptyLines: true,
    dynamicTyping: true
  });
  
  if (result.errors.length > 0) {
    console.warn('Errors while parsing CSV:', result.errors);
  }
  
  const rows = result.data as any[][];
  
  // Defaults
  const dataRowStart = config?.dataRowStart ?? 2;
  const dataRowEnd = config?.dataRowEnd ?? 100;
  const dataColumnStart = config?.dataColumnStart ?? 1;
  const dataColumnEnd = config?.dataColumnEnd ?? (dataColumnStart + fields.length - 1);
  
  // 1-based to 0-based indices
  const rowStartIdx = dataRowStart - 1;
  const rowEndIdx = dataRowEnd; // array.slice is non-inclusive end
  const colStartIdx = dataColumnStart - 1;
  const colEndIdx = dataColumnEnd; // array.slice is non-inclusive end
  
  const dataSlice = rows.slice(rowStartIdx, rowEndIdx);
  
  return dataSlice.map(rowArray => {
    // Upewniamy się, że to tablica i wycinamy odpowiedni zakres kolumn
    const actualRowArray = rowArray || [];
    const slicedRowArray = actualRowArray.slice(colStartIdx, colEndIdx);
    const obj: any = {};
    
    // Mapujemy wartości do kluczy podanych w definicji pola w modelu
    fields.forEach((field, index) => {
      obj[String(field)] = slicedRowArray[index] ?? null;
    });
    
    return obj;
  });
}
