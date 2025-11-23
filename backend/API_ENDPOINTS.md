# SDA Backend API - Quarterly & Lesson Endpoints

This document describes the implemented API endpoints for accessing quarterly and lesson data.

## Base URL

**Development:** `http://localhost:3000/v1`

## Authentication

Currently, all endpoints are public. No authentication required.

---

## Endpoints

### 1. List Quarterlies

Get a list of all quarterlies with optional filtering.

**Endpoint:** `GET /v1/quarterlies`

**Query Parameters:**
- `kind` (optional): Filter by quarterly type (`adult`, `youth`, `kids`)
- `lang` (optional): Filter by language code (default: `en`)

**Example Requests:**
```bash
# Get all quarterlies
curl http://localhost:3000/v1/quarterlies

# Get only adult quarterlies
curl http://localhost:3000/v1/quarterlies?kind=adult

# Get youth quarterlies in English
curl http://localhost:3000/v1/quarterlies?kind=youth&lang=en
```

**Response:**
```json
{
  "quarterlies": [
    {
      "id": "4",
      "kind": "adult",
      "year": 2025,
      "quarter": 4,
      "title": "Lessons on Faith",
      "description": "...",
      "lang": "en",
      "heroImage": null,
      "createdAt": "2025-11-23T07:12:05.359Z",
      "updatedAt": "2025-11-23T07:12:05.359Z"
    }
  ]
}
```

---

### 2. Get Quarterly Detail

Get details of a specific quarterly by ID.

**Endpoint:** `GET /v1/quarterlies/:id`

**Example Request:**
```bash
curl http://localhost:3000/v1/quarterlies/4
```

**Response:**
```json
{
  "quarterly": {
    "id": "4",
    "kind": "adult",
    "year": 2025,
    "quarter": 4,
    "title": "Lessons on Faith",
    "description": "...",
    "lang": "en",
    "heroImage": null,
    "createdAt": "2025-11-23T07:12:05.359Z",
    "updatedAt": "2025-11-23T07:12:05.359Z"
  }
}
```

---

### 3. List Lessons for a Quarterly

Get all lessons for a specific quarterly.

**Endpoint:** `GET /v1/quarterlies/:id/lessons`

**Example Request:**
```bash
curl http://localhost:3000/v1/quarterlies/4/lessons
```

**Response:**
```json
{
  "lessons": [
    {
      "id": "9",
      "quarterlyId": "4",
      "indexInQuarter": 1,
      "title": "Lesson 1 - 27th September 2025",
      "description": "...",
      "createdAt": "2025-11-23T07:12:05.359Z",
      "updatedAt": "2025-11-23T07:12:05.359Z"
    },
    ...
  ]
}
```

---

### 4. Get Lesson Detail

Get details of a specific lesson including all its daily content.

**Endpoint:** `GET /v1/lessons/:id`

**Example Request:**
```bash
curl http://localhost:3000/v1/lessons/9
```

**Response:**
```json
{
  "lesson": {
    "id": "9",
    "quarterlyId": "4",
    "indexInQuarter": 1,
    "title": "Lesson 1 - 27th September 2025",
    "description": "...",
    "createdAt": "2025-11-23T07:12:05.359Z",
    "updatedAt": "2025-11-23T07:12:05.359Z",
    "quarterly": {
      "id": "4",
      "kind": "adult",
      "year": 2025,
      "quarter": 4,
      "title": "Lessons on Faith"
    },
    "days": [
      {
        "id": "5",
        "lessonId": "9",
        "dayIndex": 1,
        "date": null,
        "title": "MEMORY VERSE...",
        "bodyMd": "...",
        "memoryVerse": "...",
        "audioAsset": null,
        "createdAt": "2025-11-23T07:12:05.359Z",
        "updatedAt": "2025-11-23T07:12:05.359Z"
      },
      ...
    ]
  }
}
```

---

### 5. Get Lesson Day

Get a specific day of a lesson by day index.

**Endpoint:** `GET /v1/lessons/:id/days/:dayIndex`

**Path Parameters:**
- `id`: Lesson ID
- `dayIndex`: Day index (1-7, where 1=Sabbath, 2=Sunday, ..., 7=Friday)

**Example Request:**
```bash
# Get Sunday (day index 2) for lesson 9
curl http://localhost:3000/v1/lessons/9/days/2
```

**Response:**
```json
{
  "day": {
    "id": "6",
    "lessonId": "9",
    "dayIndex": 2,
    "date": null,
    "title": "The Role Of Faith",
    "bodyMd": "...",
    "memoryVerse": null,
    "audioAsset": null,
    "createdAt": "2025-11-23T07:12:05.359Z",
    "updatedAt": "2025-11-23T07:12:05.359Z",
    "lesson": {
      "id": "9",
      "title": "Lesson 1 - 27th September 2025",
      "indexInQuarter": 1,
      "quarterlyId": "4"
    },
    "quarterly": {
      "id": "4",
      "kind": "adult",
      "year": 2025,
      "quarter": 4,
      "title": "Lessons on Faith"
    }
  }
}
```

---

## Day Index Mapping

| Day Index | Day Name  |
|-----------|-----------|
| 1         | Sabbath   |
| 2         | Sunday    |
| 3         | Monday    |
| 4         | Tuesday   |
| 5         | Wednesday |
| 6         | Thursday  |
| 7         | Friday    |

---

## Error Responses

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Quarterly with id 999 not found"
}
```

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "dayIndex must be a number between 1 and 7"
}
```

---

## Current Data

The database currently contains:
- **Q4 2025 Adult English Lessons**: "Lessons on Faith" (13 lessons, 90 lesson days)
- **Q1 2025 Seed Data**: Sample quarterlies for Adult, Youth, and Kids

---

## Next Steps

### For Android App Integration:
1. Update `NEXT_PUBLIC_API_URL` in admin panel to `http://localhost:3000/v1`
2. Update Android app's `BASE_URL` to point to your backend server
3. The Android app is already fully implemented and ready to consume these endpoints!

### For Admin Panel Integration:
1. Replace mock data in `/dashboard/quarterlies/page.tsx` with API calls
2. Implement create/edit forms for quarterlies and lessons
3. Add admin CRUD endpoints (coming next)

---

## Testing

All endpoints have been tested and are working correctly. See test examples above.

Server is running on: **http://localhost:3000**
