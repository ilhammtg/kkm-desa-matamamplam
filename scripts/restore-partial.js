const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ Error: DATABASE_URL not found in .env");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function restore() {
  const backupDir = path.join(__dirname, '..', 'backup');
  // Find the most recent backup file
  const files = fs.readdirSync(backupDir).filter(f => f.startsWith('neon-backup-') && f.endsWith('.json'));
  if (files.length === 0) {
    console.error("❌ No backup file found in backup/");
    process.exit(1);
  }
  const latestBackup = files.sort().reverse()[0];
  const filePath = path.join(backupDir, latestBackup);

  console.log(`📂 Reading backup file: ${filePath}`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const client = await pool.connect();

  try {
    // await client.query('BEGIN'); // Removing transaction to allow partial success/continue

    // Define table order for restoration to respect Foreign Keys
    const tableOrder = [
      'users',
      'site_settings',
      'divisions',
      'positions',
      'members',
      'income_categories',
      'expense_categories',
      'payment_methods',
      'finance_days',
      // 'rabs', // Skip - Incompatible Schema
      'rab_categories',
      // 'rab_items', // Skip
      'incomes',
      // 'expenses', // Skip - Migrating separately
      'faqs',
      'social_medias',
      'about_pages',
      'about_mission_items',
      'about_program_items',
      'posts',
      'comments',
      'contact_messages',
      'site_visits',
      'login_attempts'
    ];

    for (const tableName of tableOrder) {
      const rows = data[tableName];
      if (!rows || rows.length === 0) {
        console.log(`Table ${tableName}: No data to restore.`);
        continue;
      }

      console.log(`Restoring ${rows.length} rows to ${tableName}...`);

      for (const row of rows) {
        const columns = Object.keys(row);
        const values = Object.values(row).map((val, idx) => {
          const colName = columns[idx];
          // Fix for JSON columns that retain Array type (interpreted as Postgres array -> invalid JSON)
          if ((colName === 'gallery' || colName === 'extra_meta') && Array.isArray(val)) {
             return JSON.stringify(val);
          }
           // Also object for 'extra_meta' or 'gallery' if necessary? 
           // pg handles regular objects fine for JSON columns. Arrays are the issue.
          return val;
        });
        
        const columnNames = columns.map(c => `"${c}"`).join(', ');
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

        const conflictTarget = tableName === 'site_settings' ? 'key' : 
                               tableName === 'login_attempts' ? 'identifier' : 'id';

        const query = `
          INSERT INTO "${tableName}" (${columnNames})
          VALUES (${placeholders})
          ON CONFLICT ("${conflictTarget}") DO NOTHING
        `;

        try {
          await client.query(query, values);
        } catch (rowErr) {
          console.error(`❌ Error in ${tableName} (Row ${row.id || row.identifier || row.key}): ${rowErr.message}`);
          // Continue to next row
        }
      }
    }

    // await client.query('COMMIT');
    console.log("✅ Restore process finished!");

  } catch (err) {
    // await client.query('ROLLBACK');
    console.error("❌ Restore script error:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

restore();
