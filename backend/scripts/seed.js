#!/usr/bin/env node

/**
 * Database Seed Script
 * Seeds the database with initial production data or sample development data
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✓ Connected to database');

    // Determine which seed file to use
    let seedFile;
    
    // Check if we have production seed data
    const prodSeedFile = path.join(__dirname, '..', 'seeds', 'initial_data.sql');
    const devSeedFile = path.join(__dirname, '..', 'migrations', '002_seed_data.sql');
    
    if (fs.existsSync(prodSeedFile)) {
      seedFile = prodSeedFile;
      console.log('▸ Using production seed data from seeds/initial_data.sql');
    } else if (fs.existsSync(devSeedFile)) {
      seedFile = devSeedFile;
      console.log('▸ Using development seed data from migrations/002_seed_data.sql');
    } else {
      console.log('⚠ No seed data file found. Skipping seed.');
      console.log('  Run migrations to create initial data.');
      return;
    }

    const sql = fs.readFileSync(seedFile, 'utf8');

    console.log('▸ Seeding database...');
    console.log('⚠️  Note: This will fail if data already exists. Use on fresh databases only.');

    await client.query(sql);

    console.log('\n✓ Database seeded successfully');
    
    // Show some stats
    const tables = [
      'users',
      'sermons', 
      'speakers',
      'devotionals',
      'quarterlies',
      'lessons',
      'churches',
      'events',
      'causes'
    ];
    
    console.log('\n📊 Database contents:');
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        const count = parseInt(result.rows[0].count);
        if (count > 0) {
          console.log(`   ${table}: ${count} records`);
        }
      } catch (err) {
        // Table might not exist, skip
      }
    }

    if (seedFile === devSeedFile) {
      console.log('\nSample login credentials:');
      console.log('  - admin@example.com / password123 (super_admin)');
      console.log('  - editor@example.com / password123 (editor)');
      console.log('  - uploader@example.com / password123 (uploader)');
      console.log('\n⚠️  Remember to update password hashes before using in production!');
    }

  } catch (error) {
    console.error('\n✗ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
