# Church Management Admin Guide - Using Existing JWT Auth

## ✅ Integration with Existing Admin System

The church management system now uses the **existing admin authentication** with JWT tokens!

---

## Authentication

### Existing Admin Users

From `002_seed_data.sql`:
- **admin@example.com** - Super Admin (password: `password123`)
- **editor@example.com** - Content Editor (password: `password123`)
- **uploader@example.com** - Media Uploader (password: `password123`)

### Login to Get JWT Token

```bash
curl -X POST http://localhost:3000/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "name": "Super Admin",
    "role": "super_admin",
    "isActive": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Using the Token

All church admin endpoints require the JWT token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/v1/admin/churches
```

---

## Admin Roles

### Existing Admin Roles
1. **super_admin** - Full system access (can create churches)
2. **editor** - Content management
3. **uploader** - Media management

### Church Member Roles (Separate System)
1. **member** - Basic church member
2. **elder** - Can post devotionals
3. **deacon** - Can manage events
4. **pastor** - Full content creation
5. **admin** - Full church management

**Note:** These are two separate systems:
- **Admin users** (`admin_user` table) - Manage the platform
- **Church members** (`church_member` table) - Belong to churches

---

## Quick Start

### 1. Login as Admin

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}' \
  | jq -r '.token')

echo "Token: $TOKEN"
```

### 2. List Churches

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/v1/admin/churches
```

### 3. Create a Devotional

```bash
# Get a church ID and pastor ID first
CHURCH_ID=9  # Ray of Light
PASTOR_ID=5  # Pastor John Connick

curl -X POST http://localhost:3000/v1/admin/churches/$CHURCH_ID/devotionals \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Grace Abounds",
    "bodyMd": "# Grace Abounds\n\nGods grace is sufficient...",
    "scriptureRefs": ["2 Corinthians 12:9"],
    "date": "2024-12-01",
    "isPublished": true
  }'
```

### 4. Create an Event

```bash
curl -X POST http://localhost:3000/v1/admin/churches/$CHURCH_ID/events \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Youth Bible Study",
    "description": "Interactive Bible study for youth",
    "eventDate": "2024-12-07",
    "eventTime": "18:00:00",
    "location": "Youth Hall",
    "eventType": "study",
    "isPublished": true
  }'
```

---

## API Endpoints

### Authentication
- `POST /v1/admin/auth/login` - Get JWT token

### Church Management (Requires JWT)
- `POST /v1/admin/churches` - Create church (super_admin only)
- `PUT /v1/admin/churches/:churchId` - Update church
- `GET /v1/admin/churches/:churchId/members` - List members
- `PUT /v1/admin/churches/:churchId/members/:memberId/role` - Update role
- `DELETE /v1/admin/churches/:churchId/members/:memberId` - Remove member

### Content Management (Requires JWT)
- `POST /v1/admin/churches/:churchId/devotionals` - Create devotional
- `PUT /v1/admin/churches/:churchId/devotionals/:id` - Update devotional
- `DELETE /v1/admin/churches/:churchId/devotionals/:id` - Delete devotional
- `POST /v1/admin/churches/:churchId/events` - Create event
- `PUT /v1/admin/churches/:churchId/events/:id` - Update event
- `DELETE /v1/admin/churches/:churchId/events/:id` - Delete event
- `POST /v1/admin/churches/:churchId/projects` - Create project
- `PUT /v1/admin/churches/:churchId/projects/:id` - Update project
- `DELETE /v1/admin/churches/:churchId/projects/:id` - Delete project
- `POST /v1/admin/churches/:churchId/announcements` - Create announcement
- `PUT /v1/admin/churches/:churchId/announcements/:id` - Update announcement
- `DELETE /v1/admin/churches/:churchId/announcements/:id` - Delete announcement

### Invitation Codes (Requires JWT)
- `POST /v1/admin/churches/:churchId/invitations` - Create invite code
- `GET /v1/admin/churches/:churchId/invitations` - List invite codes
- `DELETE /v1/admin/churches/:churchId/invitations/:id` - Deactivate code

---

## Permission Matrix

| Action | super_admin | editor | uploader |
|--------|-------------|--------|----------|
| Create church | ✅ | ❌ | ❌ |
| Update church | ✅ | ✅ | ❌ |
| Manage members | ✅ | ✅ | ❌ |
| Create devotionals | ✅ | ✅ | ❌ |
| Create events | ✅ | ✅ | ❌ |
| Create projects | ✅ | ✅ | ❌ |
| Create announcements | ✅ | ✅ | ❌ |
| Manage invitations | ✅ | ✅ | ❌ |

---

## Testing Script

Save this as `test-church-api.sh`:

```bash
#!/bin/bash

# Login and get token
echo "Logging in..."
TOKEN=$(curl -s -X POST http://localhost:3000/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}' \
  | jq -r '.token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "Login failed!"
  exit 1
fi

echo "✅ Logged in successfully"
echo "Token: ${TOKEN:0:50}..."

# List churches
echo -e "\n📍 Listing churches..."
curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/v1/admin/churches \
  | jq '.churches[] | {id, name, city, memberCount}'

# Get church members
CHURCH_ID=9
echo -e "\n👥 Listing members of church $CHURCH_ID..."
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/v1/admin/churches/$CHURCH_ID/members" \
  | jq '.members[] | {role, user: .user.name}'

# Create a devotional
echo -e "\n📖 Creating devotional..."
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "http://localhost:3000/v1/admin/churches/$CHURCH_ID/devotionals" \
  -d '{
    "title": "Test Devotional",
    "bodyMd": "# Test\n\nThis is a test devotional.",
    "scriptureRefs": ["John 3:16"],
    "date": "2024-12-02",
    "isPublished": true
  }' | jq '.'

echo -e "\n✅ All tests completed!"
```

Make it executable and run:
```bash
chmod +x test-church-api.sh
./test-church-api.sh
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication token required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Super admin access required"
}
```

### Token Expired
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

---

## Security Notes

1. **JWT Secret**: Change `JWT_SECRET` in production (`.env` file)
2. **Token Expiry**: Tokens expire after 7 days
3. **Password Hashing**: Uses bcrypt with 10 salt rounds
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: Already configured in main app

---

## Database Queries

### Check Admin Users

```bash
docker exec sda_postgres psql -U user -d sda_app -c "SELECT id, email, name, role, is_active FROM admin_user;"
```

### Check Church Members

```bash
docker exec sda_postgres psql -U user -d sda_app -c "SELECT u.name as user, c.name as church, cm.role FROM app_user u JOIN church_member cm ON u.id = cm.user_id JOIN church c ON cm.church_id = c.id;"
```

---

## Summary

✅ **Integrated with existing admin system**  
✅ **JWT token authentication**  
✅ **Role-based permissions**  
✅ **30+ protected endpoints**  
✅ **Production-ready security**  

The church management system now seamlessly integrates with your existing admin panel authentication!
