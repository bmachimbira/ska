#!/usr/bin/env node

/**
 * Database Seed Script
 * Seeds the database with sample data for development
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

    // Check if we're in production
    if (process.env.NODE_ENV === 'production') {
      console.error('\n✗ Cannot seed production database!');
      console.error('   Set NODE_ENV to "development" or "test" to proceed.');
      process.exit(1);
    }

    // Read the seed SQL file
    const seedFile = path.join(__dirname, '..', 'migrations', '002_seed_data.sql');

    if (!fs.existsSync(seedFile)) {
      console.error('\n✗ Seed file not found:', seedFile);
      process.exit(1);
    }

    const sql = fs.readFileSync(seedFile, 'utf8');

    console.log('▸ Seeding database...');

    await client.query(sql);

    console.log('\n✓ Database seeded successfully');
    console.log('\nSample login credentials:');
    console.log('  - admin@example.com / password123 (super_admin)');
    console.log('  - editor@example.com / password123 (editor)');
    console.log('  - uploader@example.com / password123 (uploader)');
    console.log('\n⚠️  Remember to update password hashes before using in production!');

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
