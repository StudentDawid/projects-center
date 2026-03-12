/**
 * Inicjuje pobieranie pliku w przeglądarce pod zadaną nazwą
 */
export function downloadAsJson(data: any, rootFilename: string) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${rootFilename}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}

/**
 * Parsuje wyciagniety z input[type="file"] obiekt jsowego File na generyczny obiekt obietnicy
 */
export function importFromJson<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text) as T;
        resolve(parsed);
      } catch (err) {
        reject(new Error('Nieprawidłowy plik JSON. Upewnij się, że struktura to poprawny eksport.'));
      }
    };
    reader.onerror = () => reject(new Error('Błąd odczytu pliku.'));
    reader.readAsText(file);
  });
}
