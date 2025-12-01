# Network Configuration Summary

This document summarizes all network URLs and configurations across the entire SKA App stack.

---

## 🌐 Complete URL Configuration

### Backend API Server

**Location:** `/backend`

**Running On:** `http://localhost:3000/v1`

**Configuration:**
- Port: `3000` (configured in `.env`)
- Database: `postgresql://user:password@localhost:5432/sda_app`
- Environment: Development

**Start Command:**
```bash
cd backend
npm run dev
```

---

### Admin Panel (Next.js)

**Location:** `/admin-panel`

**Running On:** `http://localhost:3000` (or Next.js assigned port)

**Backend API URL:** `http://localhost:3000/v1`

**Configuration File:** `/admin-panel/.env.local`
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
```

**Start Command:**
```bash
cd admin-panel
npm run dev
```

---

### Android App

**Location:** `/mobile-android`

**Backend API URL (Emulator):** `http://10.0.2.2:3000/v1`

**Configuration Files:**

1. **`gradle.properties`**
   ```properties
   API_BASE_URL=http://10.0.2.2:3000/v1
   ```

2. **`app/build.gradle.kts`**
   - Default: `http://10.0.2.2:3000/v1`
   - Dev flavor: `http://10.0.2.2:3000/v1`
   - Staging: `https://api-staging.example.com/v1` (update when staging is ready)
   - Production: `https://api.example.com/v1` (update when production is ready)

**Important Notes:**
- `10.0.2.2` is the **Android emulator's special IP** that routes to `localhost` on your host machine
- For **physical devices** on the same network, use your computer's actual IP: `http://192.168.x.x:3000/v1`
- For **production**, update to your actual server URL

**Build Command:**
```bash
cd mobile-android
./gradlew assembleDevDebug
```

---

## 📊 URL Matrix

| Component | Environment | URL | Notes |
|-----------|-------------|-----|-------|
| Backend API | Development | `http://localhost:3000/v1` | Running locally |
| Admin Panel | Development | `http://localhost:3000` | Points to backend:3000 |
| Android (Emulator) | Development | `http://10.0.2.2:3000/v1` | Routes to host localhost:3000 |
| Android (Physical Device) | Development | `http://YOUR_IP:3000/v1` | Replace with your machine's IP |
| Android | Staging | `https://api-staging.example.com/v1` | Update when ready |
| Android | Production | `https://api.example.com/v1` | Update when ready |

---

## 🔧 Testing Configuration

### Test Backend API
```bash
curl http://localhost:3000/v1/quarterlies
```

### Test from Android Emulator
```bash
# From within the emulator (using ADB shell)
curl http://10.0.2.2:3000/v1/quarterlies
```

### Find Your Machine's IP (for physical devices)
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr IPv4
```

---

## 🚀 Complete Startup Sequence

### 1. Start Database (Docker)
```bash
docker-compose up -d postgres
```

### 2. Start Backend API
```bash
cd backend
npm run dev
# Running on http://localhost:3000
```

### 3. Start Admin Panel
```bash
cd admin-panel
npm run dev
# Running on http://localhost:3000 (or auto-assigned port)
```

### 4. Build & Run Android App
```bash
cd mobile-android
./gradlew assembleDevDebug
./gradlew installDevDebug
```

---

## ✅ Verification Checklist

- [ ] Backend API responding at `http://localhost:3000/v1/quarterlies`
- [ ] Admin panel loading quarterlies from backend
- [ ] Android app configured with correct URL (`10.0.2.2:3000` for emulator)
- [ ] Database connection working (check backend logs)
- [ ] CORS enabled for admin panel origin

---

## 🔐 Production Deployment Notes

When deploying to production:

1. **Backend:**
   - Deploy to a server (e.g., Railway, Render, AWS)
   - Get production URL (e.g., `https://api.yourdomain.com`)
   - Update DATABASE_URL to production database
   - Set NODE_ENV=production

2. **Admin Panel:**
   - Update `NEXT_PUBLIC_API_URL` to production backend URL
   - Deploy to Vercel/Netlify
   - Enable authentication

3. **Android App:**
   - Update production flavor URL in `build.gradle.kts`
   - Build production variant: `./gradlew assembleProductionRelease`
   - Sign APK for Play Store

---

## 📱 Common Issues & Solutions

### Issue: Android app can't connect to backend

**Solution:**
- **Emulator:** Use `http://10.0.2.2:3000/v1`
- **Physical device:** Use your computer's IP address (e.g., `http://192.168.1.100:3000/v1`)
- Ensure backend is running: `curl http://localhost:3000/v1/quarterlies`
- Check firewall settings allow port 3000

### Issue: Admin panel shows connection error

**Solution:**
- Verify `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:3000/v1`
- Check backend is running on port 3000
- Check browser console for CORS errors
- Restart Next.js dev server after changing .env.local

### Issue: Wrong port (3000 vs 3000)

**Solution:**
- Backend runs on **port 3000** (not 3000)
- Port 3000 is typically used by other apps
- All configurations updated to use 3000

---

## 🎯 Current Status

✅ **Backend API** - Running on port 3000
✅ **Admin Panel** - Configured to use port 3000
✅ **Android App** - Updated to use port 3000
✅ **Database** - Connected and populated with Q4 2025 data

**Everything is configured correctly and ready to use!** 🚀
