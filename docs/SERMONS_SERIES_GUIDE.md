# Sermons & Series Guide

## Overview

Sermons in the SKA App can be either **standalone** or part of a **series**. The system is designed to be flexible and support both use cases.

---

## Sermon Types

### 1. Standalone Sermons
- **Not part of any series**
- `series_id` is `NULL`
- Common for:
  - Special occasions (Christmas, Easter, etc.)
  - Guest speakers
  - One-time messages
  - Evangelistic meetings
  - Youth programs

### 2. Series Sermons
- **Part of a sermon series**
- `series_id` references a series
- Common for:
  - Multi-week studies
  - Topical series (e.g., "Daniel's Prophecies")
  - Book studies (e.g., "The Gospel of John")
  - Themed series (e.g., "Last Day Events")

---

## Database Schema

### Sermon Table

```sql
CREATE TABLE sermon (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  scripture_refs TEXT[],
  speaker_id BIGINT REFERENCES speaker(id) ON DELETE SET NULL,
  series_id BIGINT REFERENCES series(id) ON DELETE SET NULL,  -- NULLABLE!
  video_asset UUID REFERENCES media_asset(id) ON DELETE SET NULL,
  audio_asset UUID REFERENCES media_asset(id) ON DELETE SET NULL,
  thumbnail_asset UUID REFERENCES media_asset(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT FALSE,
  view_count BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Point:** `series_id` is **nullable**, meaning sermons can exist without a series.

### Series Table

```sql
CREATE TABLE series (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  hero_image UUID REFERENCES media_asset(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## TypeScript Types

```typescript
export interface Sermon {
  id: number;
  title: string;
  description?: string;
  transcript?: string;
  scriptureRefs?: string[];
  speaker?: Speaker;
  series?: Series;  // OPTIONAL!
  videoAsset?: MediaAsset;
  audioAsset?: MediaAsset;
  thumbnailAsset?: MediaAsset;
  publishedAt?: string;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Series {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
}
```

---

## Use Cases

### Use Case 1: Standalone Sermon

```json
{
  "id": 1,
  "title": "The Second Coming of Christ",
  "description": "A powerful message about Jesus' return",
  "speaker": {
    "id": 5,
    "name": "Pastor John Connick"
  },
  "series": null,  // No series
  "publishedAt": "2024-12-01T10:00:00Z",
  "isFeatured": true
}
```

**When to use:**
- Special event sermons
- Guest speaker messages
- Holiday sermons
- One-time topics

### Use Case 2: Series Sermon

```json
{
  "id": 15,
  "title": "Daniel Chapter 2: The Great Image",
  "description": "Part 1 of our Daniel's Prophecies series",
  "speaker": {
    "id": 5,
    "name": "Pastor John Connick"
  },
  "series": {
    "id": 3,
    "title": "Daniel's Prophecies",
    "description": "A 12-week study through the book of Daniel"
  },
  "publishedAt": "2024-11-03T10:00:00Z",
  "isFeatured": false
}
```

**When to use:**
- Multi-week studies
- Systematic teaching
- Book studies
- Themed series

---

## API Examples

### Create Standalone Sermon

```bash
curl -X POST http://localhost:3000/v1/admin/sermons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Sabbath: A Gift from God",
    "description": "Understanding the beauty of the Sabbath",
    "speakerId": 5,
    "series_id": null,
    "scriptureRefs": ["Exodus 20:8-11", "Mark 2:27"],
    "publishedAt": "2024-12-07T10:00:00Z"
  }'
```

### Create Series Sermon

```bash
# First, create the series
curl -X POST http://localhost:3000/v1/admin/series \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Revelation Revealed",
    "description": "A comprehensive study of the book of Revelation"
  }'

# Then create sermons in the series
curl -X POST http://localhost:3000/v1/admin/sermons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Revelation 1: The Vision of Christ",
    "description": "Part 1: John's vision on Patmos",
    "speakerId": 5,
    "seriesId": 3,
    "scriptureRefs": ["Revelation 1:1-20"],
    "publishedAt": "2024-12-07T10:00:00Z"
  }'
```

### Query Sermons by Type

```bash
# Get standalone sermons only
curl "http://localhost:3000/v1/sermons?standalone=true"

# Get sermons in a specific series
curl "http://localhost:3000/v1/sermons?seriesId=3"

# Get all sermons (both standalone and series)
curl "http://localhost:3000/v1/sermons"
```

---

## Admin Panel UI

### Sermon Form

```typescript
<form>
  <input name="title" placeholder="Sermon Title" required />
  <textarea name="description" placeholder="Description" />
  
  {/* Speaker Selection */}
  <select name="speakerId" required>
    <option value="">Select Speaker</option>
    <option value="5">Pastor John Connick</option>
  </select>
  
  {/* Series Selection - OPTIONAL */}
  <select name="seriesId">
    <option value="">No Series (Standalone)</option>
    <option value="1">Daniel's Prophecies</option>
    <option value="2">The Gospel of John</option>
    <option value="3">Revelation Revealed</option>
  </select>
  
  <input name="scriptureRefs" placeholder="Scripture References" />
  <button type="submit">Create Sermon</button>
</form>
```

### Series Management

**Create Series:**
- Title (required)
- Description
- Hero image
- Sermons are added individually after series creation

**View Series:**
- List all sermons in the series
- Show series progress
- Reorder sermons if needed

---

## Display Logic

### Home Page

```typescript
// Show both standalone and series sermons
const recentSermons = await getRecentSermons({ limit: 10 });

// Display with series badge if applicable
{recentSermons.map(sermon => (
  <SermonCard key={sermon.id}>
    <h3>{sermon.title}</h3>
    {sermon.series && (
      <Badge>Series: {sermon.series.title}</Badge>
    )}
    <p>{sermon.speaker.name}</p>
  </SermonCard>
))}
```

### Series Page

```typescript
// Show all series with sermon counts
const series = await getAllSeries();

{series.map(s => (
  <SeriesCard key={s.id}>
    <h3>{s.title}</h3>
    <p>{s.sermonCount} sermons</p>
  </SeriesCard>
))}
```

### Sermon Detail Page

```typescript
// Show series context if applicable
{sermon.series && (
  <div className="series-context">
    <p>Part of: <Link to={`/series/${sermon.series.id}`}>
      {sermon.series.title}
    </Link></p>
    
    {/* Show other sermons in series */}
    <SeriesNavigation 
      currentSermonId={sermon.id}
      seriesId={sermon.series.id}
    />
  </div>
)}
```

---

## Database Queries

### Get standalone sermons

```sql
SELECT * FROM sermon 
WHERE series_id IS NULL 
  AND published_at IS NOT NULL
ORDER BY published_at DESC;
```

### Get sermons in a series

```sql
SELECT s.*, ser.title as series_title
FROM sermon s
JOIN series ser ON s.series_id = ser.id
WHERE s.series_id = 3
ORDER BY s.published_at ASC;
```

### Get series with sermon counts

```sql
SELECT 
  ser.*,
  COUNT(s.id) as sermon_count,
  MIN(s.published_at) as first_sermon_date,
  MAX(s.published_at) as last_sermon_date
FROM series ser
LEFT JOIN sermon s ON ser.id = s.series_id
GROUP BY ser.id
ORDER BY last_sermon_date DESC;
```

### Get mixed list (standalone + series)

```sql
SELECT 
  s.*,
  sp.name as speaker_name,
  ser.title as series_title
FROM sermon s
LEFT JOIN speaker sp ON s.speaker_id = sp.id
LEFT JOIN series ser ON s.series_id = ser.id
WHERE s.published_at IS NOT NULL
ORDER BY s.published_at DESC
LIMIT 20;
```

---

## Best Practices

### For Content Creators

1. **Use Series for:**
   - Multi-week studies
   - Systematic teaching
   - Book studies
   - Themed messages

2. **Use Standalone for:**
   - Special occasions
   - Guest speakers
   - One-time topics
   - Evangelistic meetings

3. **Series Naming:**
   - Clear, descriptive titles
   - Indicate topic or book
   - Examples:
     - "The Sanctuary: God's Plan of Salvation"
     - "Romans: The Gospel Explained"
     - "Last Day Events"

4. **Sermon Titles in Series:**
   - Can include part numbers
   - Should work standalone too
   - Examples:
     - "Daniel 2: The Great Image"
     - "The Investigative Judgment"
     - "Part 3: The Seven Seals"

### For Developers

1. **Always check for null series:**
   ```typescript
   if (sermon.series) {
     // Show series context
   }
   ```

2. **Provide clear UI:**
   - Make series selection optional
   - Show "Standalone" or "No Series" option
   - Display series badge on sermon cards

3. **Filter options:**
   - Allow filtering by series
   - Allow filtering standalone sermons
   - Show both by default

---

## Migration Notes

### Current Status

✅ **Database schema** - `series_id` is nullable  
✅ **TypeScript types** - `series` is optional  
✅ **Indexes** - Efficient queries for both types  
✅ **No migration needed** - Already supports both!  

### Existing Data

All existing sermons work correctly:
- Sermons with `series_id = NULL` are standalone
- Sermons with `series_id = <number>` are part of a series
- No data migration required

---

## Summary

✅ **Sermons can be standalone** (no series required)  
✅ **Sermons can be part of a series** (optional)  
✅ **Database already supports both** (nullable series_id)  
✅ **Types already support both** (optional series field)  
✅ **Flexible for all use cases**  

The system is already designed to handle both standalone sermons and series sermons perfectly! No changes needed. 🎉
