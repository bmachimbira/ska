#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get project root
const projectRoot = path.join(__dirname, '..');
const inputPath = path.join(projectRoot, 'data', 'lessons.json');
const outputPath = path.join(projectRoot, 'data', 'lessons_cleaned.json');

/**
 * Trims a field at a stop word
 */
function trimField(value, stopWord) {
  if (!value || typeof value !== 'string') return value;
  
  const index = value.indexOf(stopWord);
  if (index === -1) return value.trim();
  
  return value.substring(0, index).trim();
}

/**
 * Clean a single lesson object
 */
function cleanLesson(lesson) {
  return {
    ...lesson,
    memory_verse: trimField(lesson.memory_verse, 'STUDY HELPS'),
    study_helps: trimField(lesson.study_helps, 'STUDY AIM:'),
    study_aim: trimField(lesson.study_aim, 'INTRODUCTION')
  };
}

// Main execution
try {
  console.log(`Reading ${inputPath}...`);
  
  // Read and parse JSON
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  
  // Clean all lessons
  if (data.lessons && Array.isArray(data.lessons)) {
    console.log(`Processing ${data.lessons.length} lessons...`);
    data.lessons = data.lessons.map(cleanLesson);
  } else {
    console.error('Error: No lessons array found in JSON');
    process.exit(1);
  }
  
  // Write cleaned JSON
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
  
  console.log(`✔ Cleaning complete → ${outputPath}`);
  console.log(`  Processed ${data.lessons.length} lessons`);
  
} catch (error) {
  console.error('✗ Error:', error.message);
  process.exit(1);
}
