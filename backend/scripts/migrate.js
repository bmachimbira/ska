#!/usr/bin/env node

/**
 * Database Migration Runner
 * Runs all pending migrations in order
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');
const MIGRATIONS_TABLE = 'schema_migrations';

async function runMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✓ Connected to database');

    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        id SERIAL PRIMARY KEY,
        version TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Get list of applied migrations
    const { rows: appliedMigrations } = await client.query(
      `SELECT version FROM ${MIGRATIONS_TABLE} ORDER BY version`
    );
    const appliedVersions = new Set(appliedMigrations.map((row) => row.version));

    // Get list of migration files
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('No migration files found');
      return;
    }

    let migrationsRun = 0;

    for (const file of files) {
      const version = file.replace('.sql', '');

      if (appliedVersions.has(version)) {
        console.log(`⊘ Skipping ${file} (already applied)`);
        continue;
      }

      console.log(`▸ Running migration: ${file}`);

      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        // Run migration in a transaction
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          `INSERT INTO ${MIGRATIONS_TABLE} (version, name) VALUES ($1, $2)`,
          [version, file]
        );
        await client.query('COMMIT');

        console.log(`✓ Migration ${file} applied successfully`);
        migrationsRun++;
      } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Failed to apply migration ${file}: ${error.message}`);
      }
    }

    if (migrationsRun === 0) {
      console.log('\n✓ Database is up to date');
    } else {
      console.log(`\n✓ Applied ${migrationsRun} migration(s)`);
    }
  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run migrations
runMigrations().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
