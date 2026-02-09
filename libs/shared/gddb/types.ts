/**
 * Google Sheets Data Types
 */

// Google Visualization API Response Types
export interface GVizResponse {
  version: string;
  reqId: string;
  status: 'ok' | 'error';
  sig: string;
  table: GVizTable;
  errors?: GVizError[];
}

export interface GVizError {
  reason: string;
  message: string;
  detailed_message: string;
}

export interface GVizTable {
  cols: GVizColumn[];
  rows: GVizRow[];
  parsedNumHeaders: number;
}

export interface GVizColumn {
  id: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'timeofday';
  pattern?: string;
}

export interface GVizRow {
  c: GVizCell[];
}

export interface GVizCell {
  v: any; // Actual value
  f?: string; // Formatted value
}

// Library Types
export interface GddbConfig {
  sheetId: string;
  configTabName?: string; // Default: 'config'
  cache?: boolean; // Default: true
  cacheTTL?: number; // Default: 5 minutes in ms
}

export interface SheetMetadata {
  tabName: string;
  gid?: number;
  description?: string;
  schema?: ColumnSchema[];
}

export interface ColumnSchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'timeofday';
  label?: string;
}

export interface SheetData {
  columns: GVizColumn[];
  rows: Record<string, any>[];
  rawRows: GVizRow[];
}

export interface QueryOptions {
  select?: string; // Columns to select (e.g., 'A, B, C' or '*')
  where?: string; // WHERE clause (e.g., 'B > 100')
  orderBy?: string; // ORDER BY clause (e.g., 'A ASC, B DESC')
  limit?: number; // LIMIT clause
  offset?: number; // OFFSET clause
  headers?: number; // Number of header rows (default: 1)
}

export interface GddbInstance {
  config: GddbConfig;
  metadata: Map<string, SheetMetadata>;
  initialized: boolean;
}
