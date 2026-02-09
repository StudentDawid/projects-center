/**
 * Google Visualization API Client
 * Handles communication with Google Sheets via the gviz/tq endpoint
 */

import axios from 'axios';
import type {
  GVizResponse,
  GVizColumn,
  GVizRow,
  SheetData,
  QueryOptions,
} from './types';

const GVIZ_BASE_URL = 'https://docs.google.com/spreadsheets/d';

/**
 * Parse Google Sheets URL to extract sheet ID and optional GID
 */
export function parseSheetUrl(url: string): { sheetId: string; gid?: number } {
  // https://docs.google.com/spreadsheets/d/{sheetId}/edit#gid={gid}
  // https://docs.google.com/spreadsheets/d/{sheetId}/edit?gid={gid}
  const sheetIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  const gidMatch = url.match(/[#?]gid=(\d+)/);

  if (!sheetIdMatch) {
    throw new Error('Invalid Google Sheets URL');
  }

  return {
    sheetId: sheetIdMatch[1],
    gid: gidMatch ? parseInt(gidMatch[1], 10) : undefined,
  };
}

/**
 * Build Google Visualization Query Language query string
 */
export function buildQuery(options?: QueryOptions): string {
  if (!options) return '';

  const parts: string[] = [];

  if (options.select) {
    parts.push(`select ${options.select}`);
  }

  if (options.where) {
    parts.push(`where ${options.where}`);
  }

  if (options.orderBy) {
    parts.push(`order by ${options.orderBy}`);
  }

  if (options.limit !== undefined) {
    parts.push(`limit ${options.limit}`);
  }

  if (options.offset !== undefined) {
    parts.push(`offset ${options.offset}`);
  }

  return parts.join(' ');
}

/**
 * Fetch data from Google Sheets using Visualization API
 */
export async function fetchSheetData(
  sheetId: string,
  gid?: number,
  query?: string,
  headers: number = 1
): Promise<GVizResponse> {
  const url = `${GVIZ_BASE_URL}/${sheetId}/gviz/tq`;
  const params: Record<string, string> = {
    tqx: 'out:json',
    headers: headers.toString(),
  };

  if (gid !== undefined) {
    params.gid = gid.toString();
  }

  if (query) {
    params.tq = query;
  }

  try {
    const response = await axios.get(url, { params });

    // Google returns JSONP, need to extract JSON
    const jsonpData = response.data;
    const jsonMatch = jsonpData.match(/google\.visualization\.Query\.setResponse\((.*)\);?\s*$/);

    if (!jsonMatch) {
      throw new Error('Invalid response format from Google Sheets API');
    }

    const jsonData: GVizResponse = JSON.parse(jsonMatch[1]);

    if (jsonData.status === 'error') {
      const errorMsg = jsonData.errors?.[0]?.message || 'Unknown error';
      throw new Error(`Google Sheets API error: ${errorMsg}`);
    }

    return jsonData;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error('Sheet not found or not publicly accessible');
      }
      throw new Error(`Failed to fetch sheet data: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Convert GViz response to structured data
 */
export function parseSheetData(response: GVizResponse): SheetData {
  const { cols, rows } = response.table;

  // Convert rows to objects with column labels as keys
  const parsedRows = rows.map((row) => {
    const obj: Record<string, any> = {};
    row.c.forEach((cell, index) => {
      const col = cols[index];
      obj[col.label || col.id] = cell?.v ?? null;
    });
    return obj;
  });

  return {
    columns: cols,
    rows: parsedRows,
    rawRows: rows,
  };
}

/**
 * Get column letter from index (0 = A, 1 = B, ..., 25 = Z, 26 = AA, etc.)
 */
export function getColumnLetter(index: number): string {
  let letter = '';
  let num = index;

  while (num >= 0) {
    letter = String.fromCharCode((num % 26) + 65) + letter;
    num = Math.floor(num / 26) - 1;
  }

  return letter;
}

/**
 * Convert column letters to query format (A, B, C or * for all)
 */
export function columnsToQuery(columns: string[] | '*'): string {
  if (columns === '*') return '*';
  return columns.join(', ');
}
