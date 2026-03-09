export interface GDDBModel<TFields extends readonly string[] = readonly string[]> {
  sheetName: string;
  fields: TFields;
  // W przyszłości schemat (np. z Zod) do walidacji danych
  schema?: any;
}

export type GDDBModels = Record<string, GDDBModel<any>>;

export interface GDDBConfig<Models extends GDDBModels> {
  sheetId: string;
  models: Models;
}

export interface GDDBFetchConfig {
  /** Numer wiersza, od którego zaczynają się dane (domyślnie: 2) */
  dataRowStart?: number;
  /** Max numer wiersza który czytamy do danych (domyślnie: 100) */
  dataRowEnd?: number;
  /** Kolumna od której zaczynamy pobierać dane (domyślnie: 1) */
  dataColumnStart?: number;
  /** Kolumna do której pobieramy dane (domyślnie: 5) */
  dataColumnEnd?: number;
}

/**
 * Typ pomocniczy pozwalający wywnioskować kształt wiersza 
 * na podstawie zdefiniowanych pól modelu.
 * Zakładamy domyślnie, że dane z Google Sheets mogą być 
 * formatu string, number, boolean lub null.
 */
export type InferModelRow<M extends GDDBModel<any>> = Record<
  M['fields'][number],
  string | number | boolean | null
>;
