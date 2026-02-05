// Example usage of GDDB library
import { initGddb, getSheet, query, listTabs, getMetadata } from '@shared/lib/gddb';

async function example() {
  // Initialize with your public Google Sheet URL
  await initGddb('https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit');

  // Example 1: Get all data from a tab
  const users = await getSheet('users');
  console.log('All users:', users.rows);

  // Example 2: Filter and sort
  const activeAdults = await getSheet('users', {
    where: "status = 'active' AND age >= 18",
    orderBy: 'name ASC',
    limit: 10,
  });
  console.log('Active adults:', activeAdults.rows);

  // Example 3: Custom query
  const custom = await query('users', 'select A, B, C where D > 100 order by A limit 50');
  console.log('Custom query results:', custom.rows);

  // Example 4: Work with metadata
  const tabs = listTabs();
  console.log('Available tabs:', tabs);

  const usersMeta = getMetadata('users');
  console.log('Users tab metadata:', usersMeta);
}

// Run example
// example().catch(console.error);
