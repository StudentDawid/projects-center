/**
 * Configuration Management for GDDB
 * Handles initialization and config sheet parsing
 */

import type { GddbConfig, GddbInstance, SheetMetadata } from './types';
import { parseSheetUrl, fetchSheetData, parseSheetData } from './gddb-client';

// Global instance
let instance: GddbInstance | null = null;

// Cache for fetched data
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Get or create GDDB instance
 */
export function getInstance(): GddbInstance {
  if (!instance) {
    throw new Error('GDDB not initialized. Call initGddb() first.');
  }
  return instance;
}

/**
 * Check if GDDB is initialized
 */
export function isInitialized(): boolean {
  return instance !== null && instance.initialized;
}

/**
 * Initialize GDDB with sheet URL or config
 */
export async function initGddb(
  sheetUrlOrConfig: string | GddbConfig
): Promise<void> {
  let config: GddbConfig;

  if (typeof sheetUrlOrConfig === 'string') {
    const { sheetId, gid } = parseSheetUrl(sheetUrlOrConfig);
    config = {
      sheetId,
      configTabName: 'config',
      cache: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
    };
  } else {
    config = {
      configTabName: 'config',
      cache: true,
      cacheTTL: 5 * 60 * 1000,
      ...sheetUrlOrConfig,
    };
  }

  instance = {
    config,
    metadata: new Map<string, SheetMetadata>(),
    initialized: false,
  };

  // Try to load config sheet
  try {
    await loadConfigSheet();
    instance.initialized = true;
  } catch (error) {
    // Config sheet is optional, proceed without it
    console.warn('Config sheet not found or invalid, proceeding without metadata:', error);
    instance.initialized = true;
  }
}

/**
 * Load and parse config sheet
 * Expected format:
 * | tabName | gid | description | schema (optional JSON) |
 */
async function loadConfigSheet(): Promise<void> {
  if (!instance) return;

  const configTabName = instance.config.configTabName || 'config';

  try {
    const response = await fetchSheetData(
      instance.config.sheetId,
      undefined,
      `select * where A is not null`
    );

    const data = parseSheetData(response);

    // Parse config rows
    data.rows.forEach((row) => {
      const tabName = row['tabName'] || row['Tab Name'] || row['tab_name'];
      if (!tabName) return;

      const metadata: SheetMetadata = {
        tabName,
        gid: row['gid'] || row['GID'],
        description: row['description'] || row['Description'],
      };

      // Parse schema if provided as JSON string
      if (row['schema'] || row['Schema']) {
        try {
          metadata.schema = JSON.parse(row['schema'] || row['Schema']);
        } catch {
          // Invalid schema JSON, ignore
        }
      }

      instance!.metadata.set(tabName, metadata);
    });
  } catch (error) {
    throw new Error(`Failed to load config sheet '${configTabName}': ${error}`);
  }
}

/**
 * Get metadata for a specific tab
 */
export function getTabMetadata(tabName: string): SheetMetadata | undefined {
  if (!instance) return undefined;
  return instance.metadata.get(tabName);
}

/**
 * Get all registered tabs from config
 */
export function getAllTabs(): SheetMetadata[] {
  if (!instance) return [];
  return Array.from(instance.metadata.values());
}

/**
 * Clear cache
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get cached data if valid
 */
export function getCachedData(key: string): any | null {
  if (!instance?.config.cache) return null;

  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  const ttl = instance.config.cacheTTL || 5 * 60 * 1000;

  if (now - entry.timestamp > ttl) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Set cached data
 */
export function setCachedData(key: string, data: any): void {
  if (!instance?.config.cache) return;

  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Reset GDDB instance (useful for testing)
 */
export function resetGddb(): void {
  instance = null;
  cache.clear();
}
