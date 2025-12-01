# Speakers System - Church Members & Guest Speakers

## Overview

The speaker system now supports both **church member speakers** (pastors, elders) and **guest speakers** from other churches or external organizations.

---

## Speaker Types

### 1. Church Member Speakers
- **Linked to `app_user`** table (church members)
- Automatically created when a user becomes a pastor or elder
- Can speak at their own church or be invited to other churches
- Have full church member profile and permissions

### 2. Guest Speakers
- **Not linked to `app_user`** (external speakers)
- Can be from other SDA churches
- Can be external speakers (evangelists, visiting pastors, etc.)
- Have guest-specific information fields

---

## Database Schema

### Speaker Table Fields

```sql
CREATE TABLE speaker (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  photo_asset UUID REFERENCES media_asset(id),
  
  -- Church Member Link (NULL for guests)
  user_id BIGINT REFERENCES app_user(id) ON DELETE SET NULL,
  
  -- Guest Speaker Fields
  is_guest BOOLEAN DEFAULT FALSE,
  guest_church_name TEXT,
  guest_church_location TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Constraints

```sql
-- Speakers must be either:
-- 1. Church members (is_guest=false AND user_id IS NOT NULL)
-- 2. Guest speakers (is_guest=true AND guest_church_name IS NOT NULL)
ALTER TABLE speaker ADD CONSTRAINT check_speaker_type 
  CHECK (
    (is_guest = false AND user_id IS NOT NULL) OR 
    (is_guest = true AND (guest_church_name IS NOT NULL OR user_id IS NOT NULL))
  );
```

---

## Automatic Speaker Creation

### Trigger: Auto-create Speaker for Church Leaders

When a church member is assigned the role of **pastor** or **elder**, a speaker entry is automatically created:

```sql
CREATE TRIGGER trigger_create_speaker_for_leader
AFTER INSERT OR UPDATE OF role ON church_member
FOR EACH ROW
EXECUTE FUNCTION create_speaker_for_leader();
```

**Example:**
```sql
-- User becomes a pastor
UPDATE church_member 
SET role = 'pastor' 
WHERE user_id = 5 AND church_id = 9;

-- Speaker entry automatically created
-- speaker.user_id = 5
-- speaker.is_guest = false
-- speaker.name = (from app_user)
```

---

## Use Cases

### Use Case 1: Local Pastor Preaching

```typescript
// Pastor John Connick (church member) preaching at his church
{
  id: 1,
  name: "Pastor John Connick",
  bio: "Church leader at Ray of Light SDA Church",
  userId: 5,
  isGuest: false,
  primaryChurch: {
    id: 9,
    name: "Ray of Light SDA Church",
    slug: "ray-of-light-harare",
    city: "Harare"
  }
}
```

### Use Case 2: Guest Pastor from Another Church

```typescript
// Pastor from Bulawayo visiting Harare church
{
  id: 15,
  name: "Pastor S Oliphant",
  bio: "Senior Pastor",
  userId: 1,
  isGuest: true, // Marked as guest for this sermon
  guestChurchName: "Ebenezer SDA Church",
  guestChurchLocation: "Bulawayo, Zimbabwe",
  primaryChurch: {
    id: 4,
    name: "Ebenezer SDA Church",
    slug: "ebenezer-bulawayo",
    city: "Bulawayo"
  }
}
```

### Use Case 3: External Guest Speaker

```typescript
// Evangelist from outside the church system
{
  id: 20,
  name: "Elder Mark Finley",
  bio: "International evangelist and speaker",
  userId: null, // Not a church member in our system
  isGuest: true,
  guestChurchName: "General Conference",
  guestChurchLocation: "Silver Spring, Maryland, USA",
  contactEmail: "mark.finley@adventist.org",
  contactPhone: "+1-301-680-6000"
}
```

---

## API Examples

### Create Church Member Speaker (Automatic)

```bash
# Promote user to pastor - speaker created automatically
curl -X PUT http://localhost:3000/v1/admin/churches/9/members/5/role \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "pastor"}'

# Speaker entry created automatically:
# - user_id: 5
# - is_guest: false
# - name: from app_user table
```

### Create Guest Speaker (Manual)

```bash
# Create external guest speaker
curl -X POST http://localhost:3000/v1/admin/speakers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Elder Mark Finley",
    "bio": "International evangelist",
    "isGuest": true,
    "guestChurchName": "General Conference",
    "guestChurchLocation": "Silver Spring, MD, USA",
    "contactEmail": "mark.finley@adventist.org"
  }'
```

### Get Church Speakers

```bash
# Get all speakers from a specific church (pastors/elders)
curl http://localhost:3000/v1/churches/9/speakers \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "speakers": [
    {
      "id": 5,
      "name": "Pastor John Connick",
      "bio": "Church leader at Ray of Light SDA Church",
      "role": "pastor",
      "isGuest": false,
      "primaryChurch": {
        "id": 9,
        "name": "Ray of Light SDA Church"
      }
    }
  ]
}
```

---

## Helper Functions

### Get Church Speakers

```sql
-- Get all speakers (pastors/elders) from a specific church
SELECT * FROM get_church_speakers(9);
```

Returns speakers who are church members with pastor/elder roles.

### Speaker with User View

```sql
-- View that combines speaker and user data
SELECT * FROM speaker_with_user WHERE id = 1;
```

Returns speaker with their user profile and primary church information.

---

## Admin Panel Integration

### Speaker Selection in Sermon Form

```typescript
// Dropdown shows both church members and guest speakers
<select name="speakerId">
  <optgroup label="Church Members">
    <option value="1">Pastor John Connick (Ray of Light)</option>
    <option value="2">Pastor S Oliphant (Ebenezer)</option>
  </optgroup>
  <optgroup label="Guest Speakers">
    <option value="15">Elder Mark Finley (General Conference)</option>
    <option value="16">Dr. David Asscherick (Light Bearers)</option>
  </optgroup>
</select>
```

### Speaker Management

**Church Member Speakers:**
- Managed through church member roles
- Automatically synced with speaker table
- Cannot be deleted (only role can be changed)

**Guest Speakers:**
- Created manually in speaker management
- Can be edited/deleted
- Require guest information fields

---

## Migration Summary

### What Changed

1. **Added to `speaker` table:**
   - `user_id` - Link to church members (nullable)
   - `is_guest` - Flag for guest speakers
   - `guest_church_name` - Guest's church name
   - `guest_church_location` - Guest's church location
   - `contact_email` - Guest contact email
   - `contact_phone` - Guest contact phone

2. **Created:**
   - Trigger to auto-create speakers for pastors/elders
   - View combining speaker and user data
   - Helper function to get church speakers
   - Constraint to validate speaker types

3. **Migrated:**
   - Existing speakers without user_id marked as guests
   - Existing pastors/elders linked to speaker entries

---

## Benefits

### For Church Members
✅ Automatic speaker profile when becoming pastor/elder  
✅ Linked to church membership and permissions  
✅ Can speak at own church or be invited elsewhere  
✅ Full integration with church system  

### For Guest Speakers
✅ Can be added without church membership  
✅ Track their home church affiliation  
✅ Store contact information  
✅ Maintain speaker history across visits  

### For Administrators
✅ Clear distinction between members and guests  
✅ Easy speaker management  
✅ Automatic sync for church leaders  
✅ Flexible for various scenarios  

---

## Database Queries

### Find all church member speakers

```sql
SELECT s.*, u.email, c.name as church_name
FROM speaker s
JOIN app_user u ON s.user_id = u.id
LEFT JOIN church_member cm ON u.id = cm.user_id AND cm.is_primary = true
LEFT JOIN church c ON cm.church_id = c.id
WHERE s.is_guest = false;
```

### Find all guest speakers

```sql
SELECT * FROM speaker 
WHERE is_guest = true 
ORDER BY guest_church_name, name;
```

### Find speakers who have preached at a specific church

```sql
SELECT DISTINCT s.*, COUNT(ser.id) as sermon_count
FROM speaker s
JOIN sermon ser ON s.id = ser.speaker_id
-- Assuming sermons have church_id (would need to add this)
GROUP BY s.id
ORDER BY sermon_count DESC;
```

---

## Status

✅ **Migration created** (`010_link_speakers_to_users.sql`)  
✅ **Types updated** (shared package)  
✅ **Automatic speaker creation** (trigger)  
✅ **Guest speaker support** (full fields)  
✅ **Backward compatibility** (view and functions)  

**Ready to migrate!** Run `npm run migrate` in the backend directory.
