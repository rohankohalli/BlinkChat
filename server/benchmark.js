import mysql from 'mysql2/promise';

async function runBenchmark() {
  const QUERY_COUNT = 100;
  console.log(`Running ${QUERY_COUNT} concurrent queries...\n`);

  // --- METHOD 1: No Pool (Individual Connections) ---
  const startNoPool = performance.now();
  const noPoolPromises = [];
  
  for (let i = 0; i < QUERY_COUNT; i++) {
    noPoolPromises.push((async () => {
      // Opening a new TCP connection every time
      const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'blinkchat'
      });
      await conn.query('SELECT 1');
      await conn.end(); // Closing the connection
    })());
  }
  
  await Promise.all(noPoolPromises);
  const timeNoPool = performance.now() - startNoPool;
  console.log(`❌ Without Pool (createConnection): ${timeNoPool.toFixed(2)} ms`);

  // --- METHOD 2: With Pool ---
  const startPool = performance.now();
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'blinkchat',
    connectionLimit: 10
  });

  const poolPromises = [];
  for (let i = 0; i < QUERY_COUNT; i++) {
    poolPromises.push((async () => {
      // Just borrowing an existing connection from the pool
      await pool.query('SELECT 1');
    })());
  }

  await Promise.all(poolPromises);
  const timePool = performance.now() - startPool;
  console.log(`✅ With Pool (createPool): ${timePool.toFixed(2)} ms`);
  
  console.log(`\n🔥 Result: The Pool is ${(timeNoPool / timePool).toFixed(1)}x faster!`);
  process.exit(0);
}

runBenchmark();
