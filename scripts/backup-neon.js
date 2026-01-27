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

async function backup() {
  const client = await pool.connect();
  const backupData = {};

  try {
    console.log("Using Connection String:", connectionString.replace(/:[^:/@]+@/, ':***@')); // Hide password

    // 1. Get all table names
    const resTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    const tables = resTables.rows.map(row => row.table_name);
    console.log(`Found ${tables.length} tables:`, tables.join(', '));

    // 2. Fetch data for each table
    for (const table of tables) {
      console.log(`Backing up ${table}...`);
      const resData = await client.query(`SELECT * FROM "${table}"`);
      backupData[table] = resData.rows;
    }

    // 3. Save to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '..', 'backup');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const filename = `neon-backup-${timestamp}.json`;
    const filePath = path.join(backupDir, filename);

    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
    console.log(`✅ Backup successful! Saved to: ${filePath}`);

  } catch (err) {
    console.error("❌ Backup failed:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

backup();
