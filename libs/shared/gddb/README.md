# GDDB - Google Drive Data Base

Easy data fetching from public Google Sheets using Google Visualization API.

## 🚀 Features

- ✅ Fetch data from **public Google Sheets**
- ✅ **Google Visualization API** integration
- ✅ Built-in **caching** with configurable TTL
- ✅ **Type-safe** TypeScript support
- ✅ Support for **config sheet** with metadata
- ✅ Powerful query capabilities (filter, sort, limit)
- ✅ Zero configuration for simple use cases
- ✅ Lightweight and dependency-minimal

## 📦 Installation

```bash
# In monorepo (current setup)
# Already available via @shared/lib/gddb

# Future npm package
npm install @dkz/gddb
# or
yarn add @dkz/gddb
```

## 🎯 Quick Start

### Basic Usage

```typescript
import { initGddb, getSheet } from '@shared/lib/gddb';

// Initialize with Google Sheets URL
await initGddb('https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit');

// Fetch data from a tab (by name or GID)
const data = await getSheet('users');

console.log(data.rows); // Array of row objects
```

### With Configuration Object

```typescript
import { initGddb, getSheet } from '@shared/lib/gddb';

await initGddb({
  sheetId: 'YOUR_SHEET_ID',
  configTabName: 'config', // Optional: tab name for metadata
  cache: true, // Enable caching (default: true)
  cacheTTL: 5 * 60 * 1000, // Cache lifetime in ms (default: 5 min)
});

const users = await getSheet('users');
```

## 📖 Usage Examples

### Filtering and Sorting

```typescript
// Fetch filtered and sorted data
const adults = await getSheet('users', {
  where: 'age > 18',
  orderBy: 'name ASC',
  limit: 10,
});

// Multiple conditions
const activeUsers = await getSheet('users', {
  where: "status = 'active' AND age >= 18",
  orderBy: 'created DESC',
});
```

### Custom Queries

```typescript
import { query } from '@shared/lib/gddb';

// Use Google Visualization Query Language directly
const data = await query(
  'users',
  'select A, B, C where D > 100 order by A limit 50'
);
```

### Working with Config Sheet

Create a `config` tab in your Google Sheet with this structure:

| tabName | gid | description | schema |
|---------|-----|-------------|--------|
| users | 0 | User database | [{"name":"id","type":"number"},{"name":"name","type":"string"}] |
| products | 123456 | Product catalog | null |
| orders | 789012 | Order history | null |

Then use it in your code:

```typescript
import { initGddb, listTabs, getMetadata, getSheet } from '@shared/lib/gddb';

await initGddb('YOUR_SHEET_URL');

// List all configured tabs
const tabs = listTabs();
console.log(tabs); // [{ tabName: 'users', gid: 0, description: '...' }, ...]

// Get metadata for specific tab
const usersMeta = getMetadata('users');
console.log(usersMeta?.description); // "User database"

// Fetch data (library will use GID from config automatically)
const users = await getSheet('users');
```

## 🔧 API Reference

### `initGddb(sheetUrlOrConfig)`

Initialize GDDB with a Google Sheets URL or config object.

```typescript
// With URL
await initGddb('https://docs.google.com/spreadsheets/d/SHEET_ID/edit');

// With config
await initGddb({
  sheetId: 'SHEET_ID',
  configTabName: 'config', // default: 'config'
  cache: true, // default: true
  cacheTTL: 300000, // default: 5 minutes
});
```

### `getSheet(tabNameOrGid, options?)`

Fetch data from a specific sheet tab.

```typescript
interface QueryOptions {
  select?: string; // Columns: 'A, B, C' or '*'
  where?: string; // WHERE clause: 'B > 100'
  orderBy?: string; // ORDER BY: 'A ASC, B DESC'
  limit?: number; // LIMIT: 10
  offset?: number; // OFFSET: 20
  headers?: number; // Header rows (default: 1)
}

const data = await getSheet('users', {
  where: 'age > 18',
  orderBy: 'name ASC',
  limit: 50,
});
```

**Returns:**
```typescript
interface SheetData {
  columns: GVizColumn[]; // Column metadata
  rows: Record<string, any>[]; // Parsed rows as objects
  rawRows: GVizRow[]; // Raw GViz rows
}
```

### `query(tabNameOrGid, queryString, headers?)`

Execute a custom Google Visualization Query Language query.

```typescript
const data = await query(
  'users',
  'select A, B where C > 100 order by A limit 10',
  1 // number of header rows
);
```

### `listTabs()`

Get all tabs registered in the config sheet.

```typescript
const tabs = listTabs();
// [{ tabName: 'users', gid: 0, description: '...' }, ...]
```

### `getMetadata(tabName)`

Get metadata for a specific tab from config sheet.

```typescript
const meta = getMetadata('users');
// { tabName: 'users', gid: 0, description: 'User database', schema: [...] }
```

### `clearGddbCache()`

Clear all cached data.

```typescript
clearGddbCache();
```

### `isGddbInitialized()`

Check if GDDB is initialized.

```typescript
if (isGddbInitialized()) {
  // Ready to fetch data
}
```

### `parseGoogleSheetsUrl(url)`

Parse a Google Sheets URL to extract sheet ID and GID.

```typescript
const { sheetId, gid } = parseGoogleSheetsUrl(
  'https://docs.google.com/spreadsheets/d/ABC123/edit#gid=456'
);
// { sheetId: 'ABC123', gid: 456 }
```

## 🎨 TypeScript Types

```typescript
import type {
  GddbConfig,
  SheetData,
  QueryOptions,
  SheetMetadata,
  ColumnSchema,
} from '@shared/lib/gddb';
```

## 🔍 Google Visualization Query Language

GDDB supports the full Google Visualization Query Language syntax:

### Basic Queries

```sql
select A, B, C
select *
select A, B where C > 100
select A, sum(B) group by A
```

### WHERE Clauses

```sql
where A > 10
where A = 'text'
where A contains 'search'
where A is null
where A > 10 and B < 20
where A = 'x' or B = 'y'
```

### Sorting and Limiting

```sql
order by A
order by A asc, B desc
limit 10
offset 20
```

[Learn more about GQL](https://developers.google.com/chart/interactive/docs/querylanguage)

## ⚙️ Configuration

### Config Sheet Format

Create a tab named `config` (or custom name) with these columns:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| tabName | string | ✅ | Name of the tab |
| gid | number | ❌ | Tab GID (optional, for direct access) |
| description | string | ❌ | Tab description |
| schema | JSON string | ❌ | Column schema as JSON array |

**Schema format:**
```json
[
  {"name": "id", "type": "number", "label": "User ID"},
  {"name": "name", "type": "string", "label": "Full Name"},
  {"name": "created", "type": "date"}
]
```

### Making Your Sheet Public

1. Open your Google Sheet
2. Click **Share** → **Get link**
3. Change to **"Anyone with the link"** → **Viewer**
4. Copy the URL

## 🚧 Limitations

- ✅ Works with **public sheets only** (viewer access)
- ✅ Uses Google Visualization API (no authentication needed)
- ⚠️ Subject to [Google's rate limits](https://developers.google.com/chart/interactive/docs/limits)
- ⚠️ Best for read-only use cases
- ⚠️ No write operations (read-only)

## 🛠️ Future Enhancements

- [ ] Publish to npm as standalone package
- [ ] Add build pipeline (Vite/Rollup)
- [ ] Support for authenticated access (Google Sheets API v4)
- [ ] Batch operations
- [ ] Better error handling and retry logic
- [ ] Offline mode with persistent cache
- [ ] React/Vue hooks for easy integration

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! This library is part of a monorepo but can be extracted and published independently.

---

Made with ❤️ by dkz
