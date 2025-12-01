#!/usr/bin/env node

/**
 * Clear all data from the quarterlies table (and cascading to lessons and lesson_days)
 *
 * This script removes all data from the quarterlies table for staging environment cleanup.
 * Due to CASCADE constraints, this will also remove all associated lessons and lesson_days.
 */

const { Client } = require('pg');
require('dotenv').config();

async function clearQuarterlies() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✓ Connected to database');

    // Get counts before deletion
    const quarterlyCount = await client.query('SELECT COUNT(*) FROM quarterly');
    const lessonCount = await client.query('SELECT COUNT(*) FROM lesson');
    const lessonDayCount = await client.query('SELECT COUNT(*) FROM lesson_day');

    console.log('\n📊 Current data:');
    console.log(`   Quarterlies: ${quarterlyCount.rows[0].count}`);
    console.log(`   Lessons: ${lessonCount.rows[0].count}`);
    console.log(`   Lesson Days: ${lessonDayCount.rows[0].count}`);

    if (parseInt(quarterlyCount.rows[0].count) === 0) {
      console.log('\n✓ Tables are already empty. Nothing to delete.');
      return;
    }

    // Confirm deletion
    console.log('\n⚠️  WARNING: This will delete ALL quarterlies data and CASCADE to lessons and lesson_days!');

    // Delete all quarterlies (cascades to lessons and lesson_days)
    console.log('\n🗑️  Deleting all data...');
    await client.query('DELETE FROM quarterly');

    console.log('\n✓ All quarterlies data has been deleted successfully!');

    // Verify deletion
    const afterCount = await client.query('SELECT COUNT(*) FROM quarterly');
    console.log(`\n📊 After deletion:`);
    console.log(`   Quarterlies: ${afterCount.rows[0].count}`);

  } catch (error) {
    console.error('\n✗ Clear operation failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✓ Database connection closed');
  }
}

// Run the clear operation
if (require.main === module) {
  clearQuarterlies()
    .then(() => {
      console.log('\n✓ Clear operation completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Clear operation failed:', error);
      process.exit(1);
    });
}

module.exports = { clearQuarterlies };
