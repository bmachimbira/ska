-- Verification queries for Adult English Lessons import

-- 1. Check quarterly
SELECT
  id,
  kind,
  year,
  quarter,
  title,
  LEFT(description, 100) as description_preview
FROM quarterly
WHERE kind = 'adult' AND year = 2025 AND quarter = 4;

-- 2. Check lesson count
SELECT COUNT(*) as lesson_count
FROM lesson
WHERE quarterly_id = (
  SELECT id FROM quarterly
  WHERE kind = 'adult' AND year = 2025 AND quarter = 4
);

-- 3. Check sample lessons
SELECT
  l.id,
  l.index_in_quarter,
  l.title,
  LEFT(l.description, 80) as description_preview
FROM lesson l
WHERE l.quarterly_id = (
  SELECT id FROM quarterly
  WHERE kind = 'adult' AND year = 2025 AND quarter = 4
)
ORDER BY l.index_in_quarter
LIMIT 5;

-- 4. Check lesson days count
SELECT COUNT(*) as total_days
FROM lesson_day ld
JOIN lesson l ON ld.lesson_id = l.id
WHERE l.quarterly_id = (
  SELECT id FROM quarterly
  WHERE kind = 'adult' AND year = 2025 AND quarter = 4
);

-- 5. Check sample lesson days for first lesson
SELECT
  ld.day_index,
  ld.title,
  LEFT(ld.body_md, 100) as body_preview,
  CASE WHEN ld.memory_verse IS NOT NULL THEN '✓' ELSE '' END as has_memory_verse
FROM lesson_day ld
JOIN lesson l ON ld.lesson_id = l.id
WHERE l.quarterly_id = (SELECT id FROM quarterly WHERE kind = 'adult' AND year = 2025 AND quarter = 4)
  AND l.index_in_quarter = 1
ORDER BY ld.day_index;

-- 6. Check memory verses (should be on Sabbath days, day_index = 1)
SELECT
  l.index_in_quarter,
  l.title as lesson_title,
  ld.day_index,
  LEFT(ld.memory_verse, 100) as memory_verse_preview
FROM lesson_day ld
JOIN lesson l ON ld.lesson_id = l.id
WHERE l.quarterly_id = (SELECT id FROM quarterly WHERE kind = 'adult' AND year = 2025 AND quarter = 4)
  AND ld.memory_verse IS NOT NULL
ORDER BY l.index_in_quarter, ld.day_index;
