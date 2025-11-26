#!/usr/bin/env node

/**
 * Update admin user passwords
 * Updates existing admin users with proper password hashes
 */

const { Client } = require('pg');

async function updatePasswords() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✓ Connected to database');

    // The bcrypt hash for 'password123'
    const passwordHash = '$2b$10$JtVYaKT8euq79AU33yTzTe1jP9qOislnB9apC87pjkcjjk570jsqy';

    // Update all admin users
    const result = await client.query(
      `UPDATE admin_user 
       SET password_hash = $1, updated_at = NOW()
       WHERE email IN ('admin@example.com', 'editor@example.com', 'uploader@example.com')`,
      [passwordHash]
    );

    console.log(`✓ Updated ${result.rowCount} admin user(s)`);
    console.log('\nAdmin credentials:');
    console.log('  - admin@example.com / password123 (super_admin)');
    console.log('  - editor@example.com / password123 (editor)');
    console.log('  - uploader@example.com / password123 (uploader)');
    console.log('\n⚠️  Remember to change these passwords in production!');

  } catch (error) {
    console.error('\n✗ Update failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

updatePasswords().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
