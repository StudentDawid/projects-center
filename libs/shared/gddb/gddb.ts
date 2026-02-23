import type {
  GddbConfig,
  SheetMetadata,
  QueryOptions,
  SheetData,
  GetDataConfig,
} from './types';
import {
  fetchSheetData,
  parseSheetData,
  buildQuery,
  parseSheetUrl,
} from './gddb-client';

export class GDDB {
  public config: GddbConfig;
  public metadata = new Map<string, SheetMetadata>();
  public initialized = false;
  private cache = new Map<string, { data: any; timestamp: number }>();

  constructor(sheetUrlOrConfig: string | GddbConfig) {
    if (typeof sheetUrlOrConfig === 'string') {
      const { sheetId, gid } = parseSheetUrl(sheetUrlOrConfig);
      this.config = {
        sheetId,
        configTabName: 'config',
        cache: true,
        cacheTTL: 5 * 60 * 1000, // 5 minutes
      };
    } else {
      this.config = {
        configTabName: 'config',
        cache: true,
        cacheTTL: 5 * 60 * 1000,
        ...sheetUrlOrConfig,
      };
    }
  }

  private initPromise: Promise<void> | null = null;

  /**
   * Initialize GDDB instance (loads metadata from config sheet)
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        await this.loadConfigSheet();
      } catch (error) {
        // Ciche przechwycenie błędu konfiguracyjnego - arkusz config jest opcjonalny
        // Nie rzucamy console.warn, by nie śmiecić logów w konsoli przeglądarki.
      } finally {
        this.initialized = true;
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  private async loadConfigSheet(): Promise<void> {
    const configTabName = this.config.configTabName || 'config';

    const response = await fetchSheetData(
      this.config.sheetId,
      configTabName,
      `select * where A is not null`
    );

    const data = parseSheetData(response);

    data.rows.forEach((row) => {
      const tabName = row['tabName'] || row['Tab Name'] || row['tab_name'];
      if (!tabName) return;

      const metadata: SheetMetadata = {
        tabName,
        gid: row['gid'] || row['GID'],
        description: row['description'] || row['Description'],
      };

      if (row['schema'] || row['Schema']) {
        try {
          metadata.schema = JSON.parse(row['schema'] || row['Schema']);
        } catch {
          // Invalid schema JSON, ignore
        }
      }

      this.metadata.set(tabName, metadata);
    });
  }

  /**
   * Get metadata for a specific tab
   */
  getMetadata(tabName: string): SheetMetadata | undefined {
    return this.metadata.get(tabName);
  }

  /**
   * Get all registered tabs from config
   */
  listTabs(): SheetMetadata[] {
    return Array.from(this.metadata.values());
  }

  /**
   * Get cached data if valid
   */
  private getCachedData(key: string): any | null {
    if (!this.config.cache) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    const ttl = this.config.cacheTTL || 5 * 60 * 1000;
    if (Date.now() - entry.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached data
   */
  private setCachedData(key: string, data: any): void {
    if (!this.config.cache) return;
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get data from a specific sheet tab
   */
  async getSheet(
    tabNameOrGid: string | number,
    options?: QueryOptions
  ): Promise<SheetData> {
    if (!this.initialized) await this.init();

    const gid = typeof tabNameOrGid === 'number' ? tabNameOrGid : undefined;
    let targetGid = gid;

    if (typeof tabNameOrGid === 'string') {
      const metadata = this.metadata.get(tabNameOrGid);
      if (metadata?.gid !== undefined) targetGid = metadata.gid;
    }

    const cacheKey = `sheet:${targetGid || tabNameOrGid}:${JSON.stringify(options || {})}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const queryStr = buildQuery(options);
    const response = await fetchSheetData(
      this.config.sheetId,
      targetGid !== undefined ? targetGid : tabNameOrGid,
      queryStr,
      options?.headers
    );

    const data = parseSheetData(response);
    this.setCachedData(cacheKey, data);
    return data;
  }

  /**
   * Execute a custom Google Visualization Query Language query
   */
  async query(
    tabNameOrGid: string | number,
    queryString: string,
    headers: number = 1
  ): Promise<SheetData> {
    if (!this.initialized) await this.init();

    const gid = typeof tabNameOrGid === 'number' ? tabNameOrGid : undefined;
    let targetGid = gid;

    if (typeof tabNameOrGid === 'string') {
      const metadata = this.metadata.get(tabNameOrGid);
      if (metadata?.gid !== undefined) targetGid = metadata.gid;
    }

    const cacheKey = `query:${targetGid || tabNameOrGid}:${queryString}:${headers}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const response = await fetchSheetData(
      this.config.sheetId,
      targetGid !== undefined ? targetGid : tabNameOrGid,
      queryString,
      headers
    );

    const data = parseSheetData(response);
    this.setCachedData(cacheKey, data);
    return data;
  }

  /**
   * Uniwersalne pobieranie danych z arkusza, niezależnie od tego czy układ jest poziomy (klasyczny)
   * czy pionowy (Pola w kolumnie, rekordy w kolejnych kolumnach).
   */
  async getData(config: GetDataConfig): Promise<Record<string, any>[]> {
    if (!this.initialized) await this.init();

    const gid =
      typeof config.tabNameOrGid === 'number' ? config.tabNameOrGid : undefined;
    let targetGid = gid;

    if (typeof config.tabNameOrGid === 'string') {
      const metadata = this.metadata.get(config.tabNameOrGid);
      if (metadata?.gid !== undefined) targetGid = metadata.gid;
    }

    const cacheKey = `data:${targetGid || config.tabNameOrGid}:${JSON.stringify(config)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const orientation = config.orientation || 'horizontal';
    const startFrom = config.startFrom || 0;
    const limit = config.limit ?? 100;
    const headersCount = config.headers ?? 1;

    let result: Record<string, any>[] = [];

    if (orientation === 'horizontal') {
      // Tryb poziomy: Wiersze to rekordy (standard)
      const queryOptions: QueryOptions = { headers: headersCount };
      if (startFrom > 0) {
        queryOptions.offset = startFrom;
      }
      if (limit !== '*') {
        queryOptions.limit = limit;
      }

      const sheetData = await this.getSheet(config.tabNameOrGid, queryOptions);
      result = sheetData.rows;
    } else {
      // Tryb pionowy: Kolumny to rekordy, a wiersze to pola (klucze) w pierwszej kolumnie
      // Pobieramy cały arkusz bez nagłówków, aby nie stracić nazw kluczy
      const sheetData = await this.getSheet(config.tabNameOrGid, {
        headers: 0,
      });
      const rawRows = sheetData.rawRows;

      if (rawRows.length > 0) {
        // Określamy maksymalną liczbę kolumn na podstawie pierwszego wiersza
        const maxColsArr = rawRows.map((r) => (r.c ? r.c.length : 0));
        const numCols = Math.max(...maxColsArr, 0);

        // actualStart to kolumna, od której zaczynają się dane. (headersCount = ile zajmują nazwy pól)
        const actualStart = headersCount + startFrom;
        const actualLimit = limit === '*' ? numCols - headersCount : limit;
        const actualEnd = Math.min(actualStart + actualLimit, numCols);

        for (let colIndex = actualStart; colIndex < actualEnd; colIndex++) {
          const record: Record<string, any> = {};
          let hasAnyValue = false; // Sprawdzamy czy rekord nie jest całkowicie pusty

          for (let rowIndex = 0; rowIndex < rawRows.length; rowIndex++) {
            const row = rawRows[rowIndex];
            if (!row || !row.c) continue;

            let fieldName = '';
            for (let h = 0; h < headersCount; h++) {
              const val = row.c[h]?.v;
              if (val !== undefined && val !== null) {
                fieldName += String(val).trim();
              }
            }

            if (!fieldName) continue;

            const cellValue = row.c[colIndex]?.v ?? null;
            if (cellValue !== null) {
              hasAnyValue = true;
            }
            record[fieldName] = cellValue;
          }

          if (hasAnyValue) {
            result.push(record);
          }
        }
      }
    }

    this.setCachedData(cacheKey, result);
    return result;
  }
}
