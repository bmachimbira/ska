#!/usr/bin/env node

/**
 * Create Migration Script
 * Creates a new migration file with a timestamp
 */

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

function createMigration() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: npm run migrate:create <migration-name>');
    process.exit(1);
  }

  const name = args.join('_').toLowerCase().replace(/[^a-z0-9_]/g, '_');

  // Get the next migration number
  const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql'));
  const numbers = files.map(f => {
    const match = f.match(/^(\d+)_/);
    return match ? parseInt(match[1], 10) : 0;
  });
  const nextNumber = Math.max(0, ...numbers) + 1;
  const version = String(nextNumber).padStart(3, '0');

  const filename = `${version}_${name}.sql`;
  const filepath = path.join(MIGRATIONS_DIR, filename);

  const template = `-- SDA Content App - Migration
-- Version: ${version}
-- Description: ${name.replace(/_/g, ' ')}

-- Write your migration SQL here

-- Example:
-- CREATE TABLE example (
--   id BIGSERIAL PRIMARY KEY,
--   name TEXT NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration ${version} completed successfully';
END $$;
`;

  fs.writeFileSync(filepath, template);
  console.log(`✓ Created migration: ${filename}`);
  console.log(`  Path: ${filepath}`);
}

createMigration();
