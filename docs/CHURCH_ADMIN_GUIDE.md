# Church Management Admin Guide

## Overview

Complete guide for managing churches through the admin panel with Role-Based Access Control (RBAC).

---

## Authentication & Authorization

### User Roles

1. **Member** - Basic church member
2. **Elder** - Can post devotionals
3. **Deacon** - Can manage events
4. **Pastor** - Full content creation
5. **Admin** - Full church management

### Authentication

All admin endpoints require authentication via `x-user-id` header:

```bash
curl -H "x-user-id: 1" http://localhost:3000/v1/admin/churches
```

**Note:** In production, this will be replaced with JWT tokens.

---

## Church Data

### Seeded Churches

| Church | City | Pastor | Invite Code |
|--------|------|--------|-------------|
| Ebenezer SDA Church | Bulawayo | Pastor S Oliphant | EBENEZERBULAWAYO |
| Bethel SDA Church | Zvishavane | Pastor D Hall | BETHELZVISHAVANE |
| Maranatha SDA Church | Shurugwi | Pastor S Jerias | MARANATHASHURUGWI |
| Mount of Olives SDA Church | Zvishavane | Pastor E Z Mukubwa | MOUNTOFOLIVESZVISHAVANE |
| Mutare City Centre SDA Church | Mutare | - | - |
| Ray of Light SDA Church | Harare | Pastor John Connick | RAYOFLIGHTHARARE |
| Remnant SDA Church | Gweru | Pastor S Jerias | REMNANTGWERU |
| Thorngrove SDA Church | Bulawayo | Pastor S Oliphant | THORNGROVEBULAWAYO |

### Seeded Pastors

| Name | Email | Primary Church |
|------|-------|----------------|
| Pastor S Oliphant | pastor.oliphant@ska.org.zw | Ebenezer (also serves Thorngrove) |
| Pastor D Hall | pastor.hall@ska.org.zw | Bethel |
| Pastor S Jerias | pastor.jerias@ska.org.zw | Maranatha (also serves Remnant) |
| Pastor E Z Mukubwa | pastor.mukubwa@ska.org.zw | Mount of Olives |
| Pastor John Connick | pastor.connick@ska.org.zw | Ray of Light |

---

## API Endpoints

### Base URL
```
http://localhost:3000/v1/admin/churches
```

---

## Church Management

### 1. Create Church (Global Admin Only)

```bash
POST /v1/admin/churches
Headers: x-user-id: {adminUserId}

{
  "name": "New SDA Church",
  "slug": "new-church-city",
  "description": "Description of the church",
  "address": "123 Main St",
  "city": "Harare",
  "country": "Zimbabwe",
  "phone": "+263...",
  "email": "church@ska.org.zw",
  "timezone": "Africa/Harare"
}
```

### 2. Update Church

```bash
PUT /v1/admin/churches/:churchId
Headers: x-user-id: {pastorOrAdminUserId}

{
  "name": "Updated Church Name",
  "description": "Updated description",
  "phone": "+263...",
  "isActive": true
}
```

---

## Member Management

### 1. List Church Members

```bash
GET /v1/admin/churches/:churchId/members?page=1&limit=50
Headers: x-user-id: {pastorOrAdminUserId}
```

**Response:**
```json
{
  "members": [
    {
      "id": 1,
      "role": "pastor",
      "isPrimary": true,
      "joinedAt": "2024-01-15T10:00:00Z",
      "user": {
        "id": 1,
        "name": "Pastor John",
        "email": "pastor@ska.org.zw"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

### 2. Update Member Role

```bash
PUT /v1/admin/churches/:churchId/members/:memberId/role
Headers: x-user-id: {pastorOrAdminUserId}

{
  "role": "elder"
}
```

**Valid Roles:** member, elder, deacon, pastor, admin

### 3. Remove Member

```bash
DELETE /v1/admin/churches/:churchId/members/:memberId
Headers: x-user-id: {pastorOrAdminUserId}
```

---

## Devotional Management

### 1. Create Devotional

```bash
POST /v1/admin/churches/:churchId/devotionals
Headers: x-user-id: {elderOrAboveUserId}

{
  "title": "Walking in Faith",
  "bodyMd": "# Walking in Faith\n\nToday's message...",
  "scriptureRefs": ["John 3:16", "Romans 8:28"],
  "date": "2024-12-01",
  "isPublished": true
}
```

### 2. Update Devotional

```bash
PUT /v1/admin/churches/:churchId/devotionals/:devotionalId
Headers: x-user-id: {authorOrAdminUserId}

{
  "title": "Updated Title",
  "isPublished": true
}
```

### 3. Delete Devotional

```bash
DELETE /v1/admin/churches/:churchId/devotionals/:devotionalId
Headers: x-user-id: {authorOrAdminUserId}
```

---

## Event Management

### 1. Create Event

```bash
POST /v1/admin/churches/:churchId/events
Headers: x-user-id: {deaconOrAboveUserId}

{
  "title": "Sabbath Worship Service",
  "description": "Join us for worship",
  "eventDate": "2024-12-07",
  "eventTime": "09:00:00",
  "endTime": "12:00:00",
  "location": "Main Sanctuary",
  "eventType": "worship",
  "registrationRequired": false,
  "isPublished": true,
  "isFeatured": true
}
```

**Event Types:** worship, prayer, study, social, outreach, youth, other

### 2. Update Event

```bash
PUT /v1/admin/churches/:churchId/events/:eventId
Headers: x-user-id: {creatorOrAdminUserId}

{
  "title": "Updated Event Title",
  "maxAttendees": 100,
  "registrationRequired": true
}
```

### 3. Delete Event

```bash
DELETE /v1/admin/churches/:churchId/events/:eventId
Headers: x-user-id: {creatorOrAdminUserId}
```

---

## Project Management

### 1. Create Project

```bash
POST /v1/admin/churches/:churchId/projects
Headers: x-user-id: {pastorOrAdminUserId}

{
  "title": "Church Building Fund",
  "description": "Help us build a new sanctuary",
  "goalAmount": 50000,
  "currency": "USD",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "projectType": "building",
  "isActive": true,
  "isFeatured": true
}
```

**Project Types:** fundraising, volunteer, mission, building, community, other

### 2. Update Project

```bash
PUT /v1/admin/churches/:churchId/projects/:projectId
Headers: x-user-id: {creatorOrAdminUserId}

{
  "title": "Updated Project Title",
  "goalAmount": 75000,
  "isActive": true
}
```

### 3. Delete Project

```bash
DELETE /v1/admin/churches/:churchId/projects/:projectId
Headers: x-user-id: {creatorOrAdminUserId}
```

---

## Announcement Management

### 1. Create Announcement

```bash
POST /v1/admin/churches/:churchId/announcements
Headers: x-user-id: {elderOrAboveUserId}

{
  "title": "Important Notice",
  "content": "Please note the change in service time...",
  "priority": "high",
  "expiresAt": "2024-12-31T23:59:59Z",
  "isPublished": true
}
```

**Priority Levels:** low, normal, high, urgent

### 2. Update Announcement

```bash
PUT /v1/admin/churches/:churchId/announcements/:announcementId
Headers: x-user-id: {creatorOrAdminUserId}

{
  "priority": "urgent",
  "isPublished": true
}
```

### 3. Delete Announcement

```bash
DELETE /v1/admin/churches/:churchId/announcements/:announcementId
Headers: x-user-id: {creatorOrAdminUserId}
```

---

## Invitation Code Management

### 1. Create Invitation Code

```bash
POST /v1/admin/churches/:churchId/invitations
Headers: x-user-id: {pastorOrAdminUserId}

{
  "code": "WELCOME2024",
  "maxUses": 100,
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

### 2. List Invitation Codes

```bash
GET /v1/admin/churches/:churchId/invitations
Headers: x-user-id: {pastorOrAdminUserId}
```

**Response:**
```json
{
  "invitations": [
    {
      "id": 1,
      "code": "WELCOME2024",
      "maxUses": 100,
      "usesCount": 25,
      "expiresAt": "2024-12-31T23:59:59Z",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 3. Deactivate Invitation Code

```bash
DELETE /v1/admin/churches/:churchId/invitations/:invitationId
Headers: x-user-id: {pastorOrAdminUserId}
```

---

## Testing the API

### Get Pastor User IDs

```bash
docker exec sda_postgres psql -U user -d sda_app -c "SELECT id, name, email FROM app_user;"
```

### Example: Create a Devotional as Pastor John Connick

```bash
# Get Pastor John's ID (let's say it's 5)
curl -X POST http://localhost:3000/v1/admin/churches/9/devotionals \
  -H "Content-Type: application/json" \
  -H "x-user-id: 5" \
  -d '{
    "title": "Grace Abounds",
    "bodyMd": "# Grace Abounds\n\nGods grace is sufficient for us...",
    "scriptureRefs": ["2 Corinthians 12:9"],
    "date": "2024-12-01",
    "isPublished": true
  }'
```

### Example: Create an Event

```bash
curl -X POST http://localhost:3000/v1/admin/churches/9/events \
  -H "Content-Type: application/json" \
  -H "x-user-id: 5" \
  -d '{
    "title": "Youth Bible Study",
    "description": "Join us for an interactive Bible study",
    "eventDate": "2024-12-07",
    "eventTime": "18:00:00",
    "location": "Youth Hall",
    "eventType": "study",
    "isPublished": true
  }'
```

---

## Permission Matrix

| Action | Member | Elder | Deacon | Pastor | Admin |
|--------|--------|-------|--------|--------|-------|
| View church content | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create devotional | ❌ | ✅ | ✅ | ✅ | ✅ |
| Create event | ❌ | ❌ | ✅ | ✅ | ✅ |
| Create project | ❌ | ❌ | ❌ | ✅ | ✅ |
| Create announcement | ❌ | ✅ | ✅ | ✅ | ✅ |
| Manage members | ❌ | ❌ | ❌ | ✅ | ✅ |
| Update church settings | ❌ | ❌ | ❌ | ✅ | ✅ |
| Create invitation codes | ❌ | ❌ | ❌ | ✅ | ✅ |
| Create new church | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Requires one of: pastor, admin"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Church not found"
}
```

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Title and content are required"
}
```

---

## Database Queries

### Useful Admin Queries

```sql
-- Get all churches with member counts
SELECT id, name, city, member_count 
FROM church 
ORDER BY member_count DESC;

-- Get all pastors and their churches
SELECT u.name as pastor, c.name as church, cm.role
FROM app_user u
JOIN church_member cm ON u.id = cm.user_id
JOIN church c ON cm.church_id = c.id
WHERE cm.role IN ('pastor', 'admin')
ORDER BY u.name;

-- Get church statistics
SELECT 
  c.name,
  COUNT(DISTINCT cm.user_id) as members,
  COUNT(DISTINCT cd.id) as devotionals,
  COUNT(DISTINCT ce.id) as events,
  COUNT(DISTINCT cp.id) as projects
FROM church c
LEFT JOIN church_member cm ON c.id = cm.church_id
LEFT JOIN church_devotional cd ON c.id = cd.church_id
LEFT JOIN church_event ce ON c.id = ce.church_id
LEFT JOIN church_project cp ON c.id = cp.church_id
GROUP BY c.id, c.name
ORDER BY members DESC;

-- Get upcoming events across all churches
SELECT c.name as church, ce.title, ce.event_date, ce.event_time
FROM church_event ce
JOIN church c ON ce.church_id = c.id
WHERE ce.is_published = true 
  AND ce.event_date >= CURRENT_DATE
ORDER BY ce.event_date, ce.event_time;
```

---

## Next Steps

1. **Implement JWT Authentication**
   - Replace `x-user-id` header with JWT tokens
   - Add token refresh mechanism
   - Implement password reset flow

2. **Build Admin Panel UI**
   - Church dashboard
   - Member management interface
   - Content creation forms
   - Analytics and reports

3. **Add Notifications**
   - Email notifications for new content
   - Push notifications for events
   - SMS reminders

4. **Enhance Features**
   - Bulk operations
   - Content scheduling
   - Advanced analytics
   - Multi-language support

---

## Support

For issues or questions:
- Check the API documentation at `/api/docs`
- Review the implementation guide in `CHURCH_MEMBERSHIP_IMPLEMENTATION.md`
- Contact the development team

---

**Status:** ✅ Fully Implemented and Ready for Use!
