import { fetchSheetData, parseCsvToObjects } from './client';
import type { GDDBConfig, GDDBModels, InferModelRow, GDDBFetchConfig } from './types';

export class GDDB<Models extends GDDBModels> {
  constructor(private config: GDDBConfig<Models>) {}

  get sheetId(): string {
    return this.config.sheetId;
  }

  get models(): Models {
    return this.config.models;
  }
  
  async fetch<ModelName extends keyof Models>(
    modelName: ModelName,
    config?: GDDBFetchConfig
  ): Promise<InferModelRow<typeof this.models[ModelName]>[]> {
    const model = this.models[modelName];
    if (!model) {
      throw new Error(`Model ${String(modelName)} not found in configuration.`);
    }
    
    const rawData = await fetchSheetData(this.sheetId, model.sheetName);
    const parsedData = parseCsvToObjects(rawData, model.fields, config);
    
    // W rzutowaniu ufamy, że zdefiniowane w "fields" kolumny znajdują się w pobranym CSV
    return parsedData as InferModelRow<typeof model>[];
  }
}

/**
 * Inicjalizuje instancję GDDB z podanym ID arkusza oraz zdefiniowanymi modelami.
 * 
 * @example
 * const db = createGDDB({
 *   sheetId: '1-NljsZBwJbOZTolIwni4UvYbv-IqkxRS810hEUcbMNc',
 *   models: {
 *     users: { sheetName: 'Users', fields: ['id', 'name'] as const },
 *     translations: { sheetName: 'Translations', fields: ['key', 'pl', 'en'] as const }
 *   }
 * });
 */
export function createGDDB<
  const Models extends GDDBModels
>(
  config: GDDBConfig<Models>
): GDDB<Models> {
  return new GDDB(config);
}
