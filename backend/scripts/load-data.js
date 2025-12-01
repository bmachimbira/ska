#!/usr/bin/env node

/**
 * Load Full Database Dump
 * Restores complete database state from initial_data.sql
 * Use this to deploy your current production data to a new server
 * 
 * ⚠️  This will DROP and recreate all tables!
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { execSync } = require('child_process');

async function loadData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✓ Connected to database');

    // Use initial_data.sql which contains the complete production database
    const dumpFile = path.join(__dirname, '..', 'seeds', 'initial_data.sql');
    
    if (!fs.existsSync(dumpFile)) {
      console.error('\n✗ Seed file not found:', dumpFile);
      console.error('   Run ./scripts/dump-seed-data.sh to create it');
      process.exit(1);
    }

    console.log('▸ Loading full database from seeds/initial_data.sql...');
    console.log('⚠️  This will DROP existing tables and restore from backup!');
    console.log('⚠️  Press Ctrl+C within 5 seconds to cancel...');
    
    // Give user time to cancel
    await new Promise(resolve => setTimeout(resolve, 5000));

    await client.end();
    
    console.log('▸ Restoring database...');
    
    // Parse DATABASE_URL to get connection details
    const dbUrl = new URL(process.env.DATABASE_URL);
    const dbHost = dbUrl.hostname;
    const dbPort = dbUrl.port || 5432;
    const dbName = dbUrl.pathname.slice(1);
    const dbUser = dbUrl.username;
    const dbPassword = dbUrl.password;

    // Use psql to restore the dump
    const env = {
      ...process.env,
      PGPASSWORD: dbPassword,
    };
    
    try {
      execSync(
        `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f ${dumpFile}`,
        {
          env,
          stdio: ['pipe', 'pipe', 'pipe'],
        }
      );
    } catch (execError) {
      console.error('\n✗ psql command failed:', execError.message);
      process.exit(1);
    }
    
    // Reconnect to show stats
    await client.connect();
    console.log('\n✓ Data loaded successfully');
    
    // Show some stats
    const tables = [
      'admin_user',
      'app_user',
      'church',
      'church_member',
      'sermons',
      'speakers',
      'devotionals',
      'quarterlies',
      'lessons',
      'church_event',
      'church_project',
      'event',
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

    console.log('\n✅ All data loaded successfully!');
    console.log('\n⚠️  Remember to:');
    console.log('   1. Change admin passwords');
    console.log('   2. Update any API keys');
    console.log('   3. Verify church and user data');

  } catch (error) {
    console.error('\n✗ Loading failed:', error.message);
    console.error('\nPossible issues:');
    console.error('   - Migrations not run (run: npm run migrate)');
    console.error('   - Data already exists (use fresh database)');
    console.error('   - Database connection issue');
    process.exit(1);
  } finally {
    await client.end();
  }
}

loadData().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
