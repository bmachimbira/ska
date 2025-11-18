#!/usr/bin/env node

/**
 * Migration Rollback Script
 * Rolls back the last applied migration
 *
 * NOTE: This is a basic implementation. For production, consider using
 * a migration tool with proper up/down migration support.
 */

const { Client } = require('pg');

const MIGRATIONS_TABLE = 'schema_migrations';

async function rollback() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✓ Connected to database');

    // Get the last applied migration
    const { rows } = await client.query(
      `SELECT version, name FROM ${MIGRATIONS_TABLE}
       ORDER BY applied_at DESC
       LIMIT 1`
    );

    if (rows.length === 0) {
      console.log('No migrations to rollback');
      return;
    }

    const { version, name } = rows[0];

    console.warn('\n⚠️  WARNING: This will attempt to rollback the last migration');
    console.warn(`   Migration: ${name}`);
    console.warn(`   Version: ${version}`);
    console.warn('\n   Manual intervention may be required to restore data.');
    console.warn('   Make sure you have a backup before proceeding!\n');

    // In a real implementation, you would:
    // 1. Look for a corresponding rollback SQL file
    // 2. Execute the rollback SQL
    // 3. Remove the migration record

    console.log('\nFor now, please manually rollback the migration:');
    console.log(`1. Review migration: migrations/${version}.sql`);
    console.log('2. Write appropriate rollback SQL');
    console.log('3. Execute rollback SQL');
    console.log(`4. Delete migration record: DELETE FROM ${MIGRATIONS_TABLE} WHERE version = '${version}'`);

  } catch (error) {
    console.error('\n✗ Rollback failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

rollback().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
