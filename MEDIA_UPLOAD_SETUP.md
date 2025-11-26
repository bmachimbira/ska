# Video Upload Setup Guide

This guide explains how to set up and use video uploads with MinIO and Mux.

## Overview

The video upload system works as follows:
1. **Upload to MinIO** - Video files are uploaded to MinIO (S3-compatible object storage)
2. **Process with Mux** - Videos are processed by Mux for adaptive streaming
3. **Store Asset** - Media asset metadata is stored in PostgreSQL database
4. **Serve HLS** - Videos are served via HLS for adaptive bitrate streaming

## Prerequisites

- Docker and Docker Compose installed
- Mux account (for video processing)
- MinIO running locally or in the cloud

## Quick Start

### 1. Start MinIO with Docker Compose

```bash
# From the project root
docker-compose up -d minio
```

This starts:
- MinIO API on `http://localhost:9000`
- MinIO Console on `http://localhost:9001`

### 2. Configure Environment Variables

Update your `/backend/.env` file with MinIO settings:

```env
# MinIO Object Storage
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=sda-media

# Mux Video Processing
STREAMING_PROVIDER=mux
MUX_TOKEN_ID=your-mux-token-id
MUX_TOKEN_SECRET=your-mux-token-secret
```

### 3. Get Mux Credentials

1. Sign up at [https://mux.com](https://mux.com)
2. Create a new Access Token:
   - Go to Settings → Access Tokens
   - Click "Generate new token"
   - Select "Mux Video" permissions
   - Copy the Token ID and Secret

### 4. Start the Backend

```bash
cd backend
npm run dev
```

The backend will automatically:
- Initialize the MinIO bucket (`sda-media`)
- Set up public read permissions for media files

## Using the Upload Feature

### From the Admin Panel

1. Navigate to **Sermons → New Sermon**
2. Scroll to the **Video Upload** section
3. Click or drag-and-drop a video file
4. Wait for:
   - ✅ Upload to MinIO (progress bar)
   - ✅ Processing with Mux (this may take a few minutes)
   - ✅ Asset ID and HLS URL returned
5. Fill in other sermon details and save

### Upload Flow

```
1. User selects video file
   ↓
2. Frontend requests presigned upload URL
   POST /v1/media/upload-url
   ↓
3. File is uploaded directly to MinIO
   PUT to presigned URL
   ↓
4. Backend processes video with Mux
   POST /v1/media/process
   ↓
5. Mux creates HLS stream
   ↓
6. Asset metadata saved to database
   ↓
7. Asset ID returned to frontend
```

## API Endpoints

### Get Upload URL
```bash
POST /v1/media/upload-url
Content-Type: application/json

{
  "filename": "sermon-2024.mp4",
  "contentType": "video/mp4"
}

Response:
{
  "uploadUrl": "http://localhost:9000/sda-media/videos/...",
  "objectName": "videos/1234567890-sermon-2024.mp4",
  "expiresIn": 3600
}
```

### Process Video
```bash
POST /v1/media/process
Content-Type: application/json

{
  "objectName": "videos/1234567890-sermon-2024.mp4"
}

Response:
{
  "assetId": "uuid-here",
  "kind": "video",
  "hlsUrl": "https://stream.mux.com/...",
  "mux": {
    "assetId": "mux-asset-id",
    "playbackId": "playback-id",
    "status": "preparing",
    "thumbnailUrl": "https://image.mux.com/..."
  }
}
```

## Troubleshooting

### MinIO Connection Error

**Error**: `Failed to initialize MinIO storage`

**Solution**:
```bash
# Check if MinIO is running
docker ps | grep minio

# If not running, start it
docker-compose up -d minio

# Check logs
docker logs sda_minio
```

### Mux Processing Failed

**Error**: `Failed to process video`

**Possible causes**:
1. Invalid Mux credentials
   - Verify `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET` in `.env`
   - Regenerate token if needed

2. Video file too large
   - Mux has a 500GB limit per file
   - Check Mux dashboard for quotas

3. Unsupported format
   - Mux supports most common video formats
   - Try converting to MP4 (H.264) first

### Upload Fails Silently

**Check**:
1. Browser console for errors
2. Backend logs: `cd backend && npm run dev`
3. MinIO console: `http://localhost:9001`
   - Username: `minioadmin`
   - Password: `minioadmin`

## MinIO Console

Access the MinIO web console at `http://localhost:9001`:

- **Username**: `minioadmin`
- **Password**: `minioadmin`

From here you can:
- Browse uploaded files
- Manage buckets
- Set access policies
- Generate access keys

## Production Considerations

### Security

1. **Change default credentials**:
   ```env
   MINIO_ACCESS_KEY=your-secure-access-key
   MINIO_SECRET_KEY=your-secure-secret-key-min-8-chars
   ```

2. **Enable SSL/TLS**:
   ```env
   MINIO_USE_SSL=true
   MINIO_ENDPOINT=minio.yourdomain.com
   MINIO_PORT=443
   ```

3. **Use IAM policies** for fine-grained access control

### Scaling

For production, consider:
- **MinIO in cluster mode** for high availability
- **CDN** (CloudFlare/CloudFront) in front of MinIO
- **Separate bucket** for different content types
- **Object lifecycle policies** for cost optimization

### Mux Webhooks

Set up webhooks to get notified when video processing completes:

```bash
# In Mux dashboard:
Webhook URL: https://yourdomain.com/v1/media/webhook/mux

# Backend endpoint already configured at:
POST /v1/media/webhook/mux
```

## Alternative: Direct Upload to Mux

Skip MinIO and upload directly to Mux:

```bash
POST /v1/media/direct-upload
Content-Type: application/json

{
  "corsOrigin": "http://localhost:3100"
}

Response:
{
  "uploadId": "...",
  "uploadUrl": "https://storage.googleapis.com/..."
}
```

This is simpler but you lose the original file (only HLS stream remains).

## Video Format Requirements

**Recommended formats**:
- Container: MP4
- Video codec: H.264 (AVC)
- Audio codec: AAC
- Resolution: 1080p or 720p
- Frame rate: 24, 25, 30, or 60 fps

**Maximum file size**: 2GB (configurable in VideoUpload component)

## Support

For issues:
1. Check backend logs: `npm run dev`
2. Check MinIO logs: `docker logs sda_minio`
3. Review Mux dashboard: https://dashboard.mux.com
4. MinIO docs: https://min.io/docs
5. Mux docs: https://docs.mux.com
