#!/usr/bin/env node

/**
 * Import Adult English Lessons from JSON file into PostgreSQL database
 *
 * This script imports quarterly lessons from the JSON export into the database,
 * creating entries in the quarterly, lesson, and lesson_day tables.
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const JSON_FILE_PATH = path.join(__dirname, '../../data/Adult_English_Lessons_4Q2025.json');

async function importLessons() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    // Connect to database
    await client.connect();
    console.log('✓ Connected to database');

    // Read JSON file
    console.log('Reading JSON file...');
    const jsonData = JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf8'));
    console.log(`✓ Found ${jsonData.lessons_count} lessons to import`);

    // Start transaction
    await client.query('BEGIN');

    // 1. Create or update the quarterly entry
    console.log('\n1. Creating quarterly entry...');
    const quarterlyResult = await client.query(`
      INSERT INTO quarterly (
        kind,
        year,
        quarter,
        title,
        description,
        lang,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, NOW(), NOW()
      )
      ON CONFLICT (kind, year, quarter, lang)
      DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        updated_at = NOW()
      RETURNING id, title
    `, [
      'adult',
      2025,
      4, // Q4
      'Lessons on Faith',
      jsonData.preamble.substring(0, 500), // Use first 500 chars of preamble as description
      'en'
    ]);

    const quarterlyId = quarterlyResult.rows[0].id;
    console.log(`✓ Quarterly created/updated: "${quarterlyResult.rows[0].title}" (ID: ${quarterlyId})`);

    // Map day names to day_index (1=Sabbath, 2=Sunday, ..., 7=Friday)
    const dayNameToIndex = {
      'Sabbath': 1,
      'Sunday': 2,
      'Monday': 3,
      'Tuesday': 4,
      'Wednesday': 5,
      'Thursday': 6,
      'Friday': 7
    };

    // 2. Import all lessons
    console.log('\n2. Importing lessons...');
    for (const lessonData of jsonData.lessons) {
      // Combine introduction, study_helps, and study_aim into description
      const description = [
        lessonData.introduction,
        lessonData.study_helps ? `\n\n**Study Helps:** ${lessonData.study_helps}` : '',
        lessonData.study_aim ? `\n\n**Study Aim:** ${lessonData.study_aim}` : ''
      ].filter(Boolean).join('');

      // Insert lesson
      const lessonResult = await client.query(`
        INSERT INTO lesson (
          quarterly_id,
          index_in_quarter,
          title,
          description,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, NOW(), NOW()
        )
        ON CONFLICT (quarterly_id, index_in_quarter)
        DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          updated_at = NOW()
        RETURNING id, index_in_quarter, title
      `, [
        quarterlyId,
        lessonData.lesson_number,
        lessonData.title || `Lesson ${lessonData.lesson_number} - ${lessonData.date}`,
        description
      ]);

      const lessonId = lessonResult.rows[0].id;
      console.log(`  ✓ Lesson ${lessonData.lesson_number}: "${lessonResult.rows[0].title}" (ID: ${lessonId})`);

      // 3. Import lesson days for this lesson
      for (const dayData of lessonData.days) {
        const dayIndex = dayNameToIndex[dayData.day];
        if (!dayIndex) {
          console.warn(`    ⚠ Unknown day name: ${dayData.day}, skipping...`);
          continue;
        }

        // Extract memory verse if this is the Sabbath day (contains MEMORY VERSE)
        let memoryVerse = null;
        if (dayData.day === 'Sabbath' && lessonData.memory_verse) {
          memoryVerse = lessonData.memory_verse;
        }

        await client.query(`
          INSERT INTO lesson_day (
            lesson_id,
            day_index,
            title,
            body_md,
            memory_verse,
            created_at,
            updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, NOW(), NOW()
          )
          ON CONFLICT (lesson_id, day_index)
          DO UPDATE SET
            title = EXCLUDED.title,
            body_md = EXCLUDED.body_md,
            memory_verse = EXCLUDED.memory_verse,
            updated_at = NOW()
        `, [
          lessonId,
          dayIndex,
          dayData.title,
          dayData.content,
          memoryVerse
        ]);
      }
      console.log(`    → Imported ${lessonData.days.length} days`);
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log('\n✓ All data imported successfully!');

    // Print summary
    console.log('\n=== IMPORT SUMMARY ===');
    console.log(`Quarterly: Lessons on Faith (Q4 2025)`);
    console.log(`Total Lessons: ${jsonData.lessons_count}`);
    console.log(`Total Days: ${jsonData.lessons.reduce((sum, l) => sum + l.days.length, 0)}`);

  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('\n✗ Import failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✓ Database connection closed');
  }
}

// Run the import
if (require.main === module) {
  importLessons()
    .then(() => {
      console.log('\n✓ Import completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Import failed:', error);
      process.exit(1);
    });
}

module.exports = { importLessons };
