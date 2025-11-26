-- SDA Content App - Seed Data
-- Version: 002
-- Description: Sample data for development and testing

-- ============================================================================
-- ADMIN USERS
-- ============================================================================
-- Password: 'password123' (hashed with bcrypt)
-- In production, change these passwords and use proper secrets

INSERT INTO admin_user (email, password_hash, name, role) VALUES
  ('admin@example.com', '$2b$10$JtVYaKT8euq79AU33yTzTe1jP9qOislnB9apC87pjkcjjk570jsqy', 'Super Admin', 'super_admin'),
  ('editor@example.com', '$2b$10$JtVYaKT8euq79AU33yTzTe1jP9qOislnB9apC87pjkcjjk570jsqy', 'Content Editor', 'editor'),
  ('uploader@example.com', '$2b$10$JtVYaKT8euq79AU33yTzTe1jP9qOislnB9apC87pjkcjjk570jsqy', 'Media Uploader', 'uploader');

-- ============================================================================
-- TAGS
-- ============================================================================

INSERT INTO tag (slug, name) VALUES
  ('faith', 'Faith'),
  ('prayer', 'Prayer'),
  ('worship', 'Worship'),
  ('grace', 'Grace'),
  ('salvation', 'Salvation'),
  ('prophecy', 'Prophecy'),
  ('sabbath', 'Sabbath'),
  ('health', 'Health'),
  ('family', 'Family'),
  ('youth', 'Youth');

-- ============================================================================
-- SPEAKERS
-- ============================================================================

INSERT INTO speaker (name, bio) VALUES
  ('Pastor John Smith', 'Senior pastor with 20 years of ministry experience. Passionate about biblical teaching and community outreach.'),
  ('Dr. Sarah Johnson', 'Bible scholar and theologian. Specializes in prophetic studies and Old Testament history.'),
  ('Elder Michael Brown', 'Youth ministry leader and inspirational speaker. Dedicated to engaging the next generation.'),
  ('Pastor David Lee', 'Evangelist and church planter. Known for powerful sermons on grace and redemption.'),
  ('Dr. Emily Chen', 'Professor of theology. Expert in New Testament studies and practical Christian living.');

-- ============================================================================
-- SERMON SERIES
-- ============================================================================

INSERT INTO series (title, description) VALUES
  ('The Gospel of Grace', 'A deep dive into God''s amazing grace and what it means for our daily lives.'),
  ('Prophecy Revealed', 'Understanding biblical prophecy and its relevance for today.'),
  ('Sabbath Rest', 'Exploring the beauty and significance of the Sabbath day.'),
  ('Family Foundations', 'Building strong Christian families in a changing world.'),
  ('Prayer Warriors', 'Developing a powerful prayer life and intimate relationship with God.');

-- ============================================================================
-- SERMONS
-- ============================================================================

INSERT INTO sermon (title, description, scripture_refs, speaker_id, series_id, published_at, is_featured) VALUES
  (
    'The Power of Grace',
    'Discover how God''s grace transforms our lives and empowers us to live victoriously.',
    ARRAY['Ephesians 2:8-9', 'Romans 5:8', 'Titus 2:11-14'],
    1,
    1,
    NOW() - INTERVAL '2 days',
    TRUE
  ),
  (
    'Understanding Daniel''s Prophecies',
    'An in-depth look at the book of Daniel and its prophetic significance.',
    ARRAY['Daniel 2', 'Daniel 7', 'Revelation 13'],
    2,
    2,
    NOW() - INTERVAL '5 days',
    TRUE
  ),
  (
    'The Sabbath: A Gift from God',
    'Why the Sabbath matters and how it enriches our relationship with God.',
    ARRAY['Genesis 2:1-3', 'Exodus 20:8-11', 'Isaiah 58:13-14'],
    3,
    3,
    NOW() - INTERVAL '7 days',
    FALSE
  ),
  (
    'Raising Godly Children',
    'Practical wisdom for nurturing faith in our children.',
    ARRAY['Proverbs 22:6', 'Deuteronomy 6:6-9', 'Ephesians 6:4'],
    1,
    4,
    NOW() - INTERVAL '10 days',
    TRUE
  ),
  (
    'The Secret of Effective Prayer',
    'Learn the principles of prayer that moves mountains.',
    ARRAY['Matthew 6:9-13', 'James 5:16', '1 Thessalonians 5:17'],
    4,
    5,
    NOW() - INTERVAL '14 days',
    FALSE
  );

-- ============================================================================
-- SERMON TAGS
-- ============================================================================

INSERT INTO sermon_tag (sermon_id, tag_id) VALUES
  (1, 4),  -- The Power of Grace -> Grace
  (1, 5),  -- The Power of Grace -> Salvation
  (2, 6),  -- Understanding Daniel's Prophecies -> Prophecy
  (3, 7),  -- The Sabbath: A Gift from God -> Sabbath
  (3, 3),  -- The Sabbath: A Gift from God -> Worship
  (4, 9),  -- Raising Godly Children -> Family
  (5, 2);  -- The Secret of Effective Prayer -> Prayer

-- ============================================================================
-- DEVOTIONALS
-- ============================================================================

INSERT INTO devotional (slug, title, author, body_md, date, lang) VALUES
  (
    'gods-unfailing-love',
    'God''s Unfailing Love',
    'Ellen G. White',
    E'# God''s Unfailing Love\n\n"For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life." - John 3:16\n\n## Reflection\n\nGod''s love is beyond human comprehension. It is not based on our worthiness but on His character. Today, pause and consider the depth of God''s love for you personally.\n\n## Prayer\n\nDear Father, thank You for Your unconditional love. Help me to share this love with others today. Amen.',
    CURRENT_DATE,
    'en'
  ),
  (
    'walking-in-faith',
    'Walking in Faith',
    'Morris Venden',
    E'# Walking in Faith\n\n"Now faith is the substance of things hoped for, the evidence of things not seen." - Hebrews 11:1\n\n## Reflection\n\nFaith is not blind belief but trust in God based on His proven character and promises. When we walk by faith, we demonstrate our confidence in God''s wisdom and timing.\n\n## Prayer\n\nLord, increase my faith. Help me to trust You even when I cannot see the way forward. Amen.',
    CURRENT_DATE - INTERVAL '1 day',
    'en'
  ),
  (
    'the-joy-of-salvation',
    'The Joy of Salvation',
    'Mark Finley',
    E'# The Joy of Salvation\n\n"Restore to me the joy of Your salvation, and uphold me by Your generous Spirit." - Psalm 51:12\n\n## Reflection\n\nSalvation is not just a future hope but a present reality that brings joy and transformation. Let us rejoice in what Christ has done for us.\n\n## Prayer\n\nThank You, Jesus, for the gift of salvation. Fill my heart with joy as I serve You today. Amen.',
    CURRENT_DATE - INTERVAL '2 days',
    'en'
  );

-- ============================================================================
-- QUARTERLIES
-- ============================================================================

INSERT INTO quarterly (kind, year, quarter, title, description, lang) VALUES
  (
    'adult',
    2025,
    1,
    'The Book of Romans',
    'A comprehensive study of Paul''s letter to the Romans, exploring themes of grace, justification, and Christian living.',
    'en'
  ),
  (
    'youth',
    2025,
    1,
    'Heroes of Faith',
    'Inspiring stories from the Bible about young people who made a difference for God.',
    'en'
  ),
  (
    'kids',
    2025,
    1,
    'Jesus and Me',
    'Learning about Jesus through simple stories and activities designed for children.',
    'en'
  );

-- ============================================================================
-- LESSONS
-- ============================================================================

-- Adult Quarterly Lessons
INSERT INTO lesson (quarterly_id, index_in_quarter, title, description) VALUES
  (1, 1, 'The Gospel According to Paul', 'Introduction to Romans and its central themes'),
  (1, 2, 'The Human Condition', 'Understanding sin and our need for salvation'),
  (1, 3, 'Justification by Faith', 'The core message of righteousness through faith in Christ'),
  (1, 4, 'Life in the Spirit', 'Walking in the power of the Holy Spirit');

-- Youth Quarterly Lessons
INSERT INTO lesson (quarterly_id, index_in_quarter, title, description) VALUES
  (2, 1, 'David: Shepherd to King', 'The journey of David from shepherd boy to Israel''s greatest king'),
  (2, 2, 'Esther: Courage for Such a Time', 'How Esther saved her people through faith and courage');

-- Kids Quarterly Lessons
INSERT INTO lesson (quarterly_id, index_in_quarter, title, description) VALUES
  (3, 1, 'Jesus Loves the Children', 'Learning how much Jesus cares for kids'),
  (3, 2, 'Jesus Tells Great Stories', 'Exploring the parables of Jesus');

-- ============================================================================
-- LESSON DAYS
-- ============================================================================

-- Days for Lesson 1 (Adult - The Gospel According to Paul)
INSERT INTO lesson_day (lesson_id, day_index, date, title, body_md, memory_verse) VALUES
  (
    1,
    1,
    CURRENT_DATE + INTERVAL '0 days',
    'Introduction to Romans',
    E'# Introduction to Romans\n\n## Key Points\n\n- Paul wrote Romans around AD 57\n- Written to the church in Rome\n- The most systematic presentation of the gospel in Scripture\n\n## Study Questions\n\n1. What was Paul''s purpose in writing to the Romans?\n2. How does this letter still speak to us today?\n\n## Application\n\nAs we begin this study, ask God to open your heart to understand His grace more fully.',
    'Romans 1:16-17 - "For I am not ashamed of the gospel of Christ, for it is the power of God to salvation for everyone who believes."'
  ),
  (
    1,
    2,
    CURRENT_DATE + INTERVAL '1 day',
    'Paul''s Greeting',
    E'# Paul''s Greeting\n\n## Scripture Focus: Romans 1:1-7\n\nPaul identifies himself as a servant of Jesus Christ, called to be an apostle. His greeting reveals key themes that will unfold throughout the letter.\n\n## Key Insights\n\n- The gospel is about Jesus Christ, descended from David\n- Jesus was declared the Son of God by His resurrection\n- God''s grace calls us to obedience of faith\n\n## Reflection\n\nHow does Paul''s understanding of his calling challenge your view of your own calling?',
    'Romans 1:7 - "Grace to you and peace from God our Father and the Lord Jesus Christ."'
  );

-- Days for Lesson 1 (Youth - David)
INSERT INTO lesson_day (lesson_id, day_index, date, title, body_md, memory_verse) VALUES
  (
    5,
    1,
    CURRENT_DATE + INTERVAL '0 days',
    'The Youngest Brother',
    E'# The Youngest Brother\n\n## The Story\n\nDavid was the youngest of eight brothers. While his older brothers went to battle, David stayed home to watch the sheep. But God had big plans for this shepherd boy!\n\n## Think About It\n\n- God doesn''t look at the outside; He looks at the heart\n- Age doesn''t matter to God\n- Being faithful in small things prepares us for big things\n\n## Challenge\n\nThis week, be faithful in the tasks you''re given, even if they seem small.',
    '1 Samuel 16:7 - "The Lord does not see as man sees; for man looks at the outward appearance, but the Lord looks at the heart."'
  );

-- Days for Lesson 1 (Kids - Jesus Loves Children)
INSERT INTO lesson_day (lesson_id, day_index, date, title, body_md, memory_verse) VALUES
  (
    7,
    1,
    CURRENT_DATE + INTERVAL '0 days',
    'Jesus Wants to Be Your Friend',
    E'# Jesus Wants to Be Your Friend\n\n## Story Time\n\nOne day, parents brought their children to see Jesus. The disciples tried to send them away, but Jesus said, "Let the little children come to me!"\n\n## What We Learn\n\n- Jesus loves children\n- Jesus wants to spend time with you\n- You are special to Jesus\n\n## Activity\n\nDraw a picture of yourself with Jesus. What would you do together?\n\n## Prayer\n\nDear Jesus, thank You for loving me. I want to be Your friend forever. Amen.',
    'Mark 10:14 - "Let the little children come to Me, and do not forbid them; for of such is the kingdom of God."'
  );

-- ============================================================================
-- SEARCH TEST DATA (for full-text search testing)
-- ============================================================================

-- Update view counts for testing
UPDATE sermon SET view_count = floor(random() * 1000 + 100) WHERE id <= 5;
UPDATE devotional SET view_count = floor(random() * 500 + 50) WHERE id <= 3;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Seed data migration completed successfully';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  - 3 admin users';
  RAISE NOTICE '  - 10 tags';
  RAISE NOTICE '  - 5 speakers';
  RAISE NOTICE '  - 5 sermon series';
  RAISE NOTICE '  - 5 sermons';
  RAISE NOTICE '  - 3 devotionals';
  RAISE NOTICE '  - 3 quarterlies (Adult, Youth, Kids)';
  RAISE NOTICE '  - 8 lessons';
  RAISE NOTICE '  - 4 lesson days';
  RAISE NOTICE '';
  RAISE NOTICE 'Login credentials:';
  RAISE NOTICE '  - admin@example.com / password123 (super_admin)';
  RAISE NOTICE '  - editor@example.com / password123 (editor)';
  RAISE NOTICE '  - uploader@example.com / password123 (uploader)';
  RAISE NOTICE '';
  RAISE NOTICE 'NOTE: Remember to update password hashes before using in production!';
END $$;
