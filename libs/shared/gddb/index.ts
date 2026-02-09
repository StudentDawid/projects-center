/**
 * GDDB - Google Drive Data Base
 * Easy data fetching from public Google Sheets
 */

import type { SheetData, QueryOptions, SheetMetadata, GddbConfig } from './types';
import {
  initGddb as _initGddb,
  getInstance,
  isInitialized,
  getTabMetadata,
  getAllTabs,
  clearCache,
  getCachedData,
  setCachedData,
  resetGddb,
} from './config';
import {
  fetchSheetData,
  parseSheetData,
  buildQuery,
  parseSheetUrl,
} from './gddb-client';

// Export types
export type {
  GddbConfig,
  SheetData,
  QueryOptions,
  SheetMetadata,
  ColumnSchema,
  GVizResponse,
  GVizColumn,
  GVizRow,
  GVizCell,
} from './types';

/**
 * Initialize GDDB with a Google Sheets URL or config object
 * @param sheetUrlOrConfig - Google Sheets URL or configuration object
 * @example
 * await initGddb('https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit');
 */
export async function initGddb(
  sheetUrlOrConfig: string | GddbConfig
): Promise<void> {
  await _initGddb(sheetUrlOrConfig);
}

/**
 * Get data from a specific sheet tab
 * @param tabNameOrGid - Tab name or GID number
 * @param options - Optional query options for filtering/sorting
 * @returns Structured sheet data with columns and rows
 * @example
 * const data = await getSheet('users');
 * const filtered = await getSheet('users', { where: 'age > 18', orderBy: 'name ASC' });
 */
export async function getSheet(
  tabNameOrGid: string | number,
  options?: QueryOptions
): Promise<SheetData> {
  if (!isInitialized()) {
    throw new Error('GDDB not initialized. Call initGddb() first.');
  }

  const instance = getInstance();
  const gid = typeof tabNameOrGid === 'number' ? tabNameOrGid : undefined;
  let targetGid = gid;

  // Try to get GID from metadata if tab name provided
  if (typeof tabNameOrGid === 'string') {
    const metadata = getTabMetadata(tabNameOrGid);
    if (metadata?.gid !== undefined) {
      targetGid = metadata.gid;
    }
  }

  // Build cache key
  const cacheKey = `sheet:${targetGid || tabNameOrGid}:${JSON.stringify(options || {})}`;

  // Check cache
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch data
  const query = buildQuery(options);
  const response = await fetchSheetData(
    instance.config.sheetId,
    targetGid,
    query,
    options?.headers
  );

  const data = parseSheetData(response);

  // Cache result
  setCachedData(cacheKey, data);

  return data;
}

/**
 * Execute a custom Google Visualization Query Language query
 * @param tabNameOrGid - Tab name or GID number
 * @param queryString - Full GQL query string
 * @param headers - Number of header rows (default: 1)
 * @returns Structured sheet data
 * @example
 * const data = await query('users', 'select A, B where C > 100 order by A limit 10');
 */
export async function query(
  tabNameOrGid: string | number,
  queryString: string,
  headers: number = 1
): Promise<SheetData> {
  if (!isInitialized()) {
    throw new Error('GDDB not initialized. Call initGddb() first.');
  }

  const instance = getInstance();
  const gid = typeof tabNameOrGid === 'number' ? tabNameOrGid : undefined;
  let targetGid = gid;

  // Try to get GID from metadata if tab name provided
  if (typeof tabNameOrGid === 'string') {
    const metadata = getTabMetadata(tabNameOrGid);
    if (metadata?.gid !== undefined) {
      targetGid = metadata.gid;
    }
  }

  // Build cache key
  const cacheKey = `query:${targetGid || tabNameOrGid}:${queryString}:${headers}`;

  // Check cache
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch data
  const response = await fetchSheetData(
    instance.config.sheetId,
    targetGid,
    queryString,
    headers
  );

  const data = parseSheetData(response);

  // Cache result
  setCachedData(cacheKey, data);

  return data;
}

/**
 * Get metadata for a specific tab (from config sheet)
 * @param tabName - Name of the tab
 * @returns Tab metadata or undefined if not found
 */
export function getMetadata(tabName: string): SheetMetadata | undefined {
  return getTabMetadata(tabName);
}

/**
 * Get all available tabs from config sheet
 * @returns Array of tab metadata
 */
export function listTabs(): SheetMetadata[] {
  return getAllTabs();
}

/**
 * Clear all cached data
 */
export function clearGddbCache(): void {
  clearCache();
}

/**
 * Check if GDDB is initialized and ready to use
 * @returns true if initialized
 */
export function isGddbInitialized(): boolean {
  return isInitialized();
}

/**
 * Parse a Google Sheets URL to extract sheet ID and GID
 * @param url - Google Sheets URL
 * @returns Object with sheetId and optional gid
 */
export function parseGoogleSheetsUrl(url: string): { sheetId: string; gid?: number } {
  return parseSheetUrl(url);
}

/**
 * Reset GDDB instance (mainly for testing)
 */
export function reset(): void {
  resetGddb();
}

// Default export
export default {
  initGddb,
  getSheet,
  query,
  getMetadata,
  listTabs,
  clearCache: clearGddbCache,
  isInitialized: isGddbInitialized,
  parseUrl: parseGoogleSheetsUrl,
  reset,
};
