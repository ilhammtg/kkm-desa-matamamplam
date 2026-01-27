const { Pool } = require('pg');

const connectionString = "postgresql://postgres.hiituskaiwuczebelbdl:Lg1QnXnlsBvv32ab@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testConnection() {
  try {
    console.log("Mencoba koneksi ke Supabase...");

    const client = await pool.connect();

    console.log("✅ Koneksi BERHASIL!");

    const res = await client.query("SELECT NOW()");
    console.log(res.rows[0]);

    client.release();
    await pool.end();
  } catch (err) {
    console.error("❌ GAGAL:", err.message);
  }
}

testConnection();
