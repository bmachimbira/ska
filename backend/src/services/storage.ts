/**
 * MinIO Storage Service
 * Handles file uploads and storage using MinIO (S3-compatible)
 */

import * as Minio from 'minio';
import * as dotenv from 'dotenv';

dotenv.config();

// MinIO client configuration
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'sda-media';

/**
 * Initialize MinIO bucket
 */
export async function initializeStorage(): Promise<void> {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`✓ MinIO bucket '${BUCKET_NAME}' created`);

      // Set bucket policy to allow public read access for media files
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/public/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    } else {
      console.log(`✓ MinIO bucket '${BUCKET_NAME}' already exists`);
    }
  } catch (error) {
    console.error('Failed to initialize MinIO storage:', error);
    throw error;
  }
}

/**
 * Upload a file to MinIO
 */
export async function uploadFile(
  objectName: string,
  filePath: string,
  metadata?: Record<string, string>
): Promise<string> {
  try {
    await minioClient.fPutObject(BUCKET_NAME, objectName, filePath, metadata);
    return objectName;
  } catch (error) {
    console.error('Failed to upload file to MinIO:', error);
    throw error;
  }
}

/**
 * Upload file from buffer
 */
export async function uploadBuffer(
  objectName: string,
  buffer: Buffer,
  size: number,
  metadata?: Record<string, string>
): Promise<string> {
  try {
    await minioClient.putObject(BUCKET_NAME, objectName, buffer, size, metadata);
    return objectName;
  } catch (error) {
    console.error('Failed to upload buffer to MinIO:', error);
    throw error;
  }
}

/**
 * Get a presigned URL for uploading
 */
export async function getUploadUrl(
  objectName: string,
  expirySeconds: number = 3600
): Promise<string> {
  try {
    return await minioClient.presignedPutObject(BUCKET_NAME, objectName, expirySeconds);
  } catch (error) {
    console.error('Failed to generate upload URL:', error);
    throw error;
  }
}

/**
 * Get a presigned URL for downloading/accessing a file
 */
export async function getDownloadUrl(
  objectName: string,
  expirySeconds: number = 3600
): Promise<string> {
  try {
    return await minioClient.presignedGetObject(BUCKET_NAME, objectName, expirySeconds);
  } catch (error) {
    console.error('Failed to generate download URL:', error);
    throw error;
  }
}

/**
 * Get public URL for a file (if bucket allows public access)
 */
export function getPublicUrl(objectName: string): string {
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  const port = process.env.MINIO_PORT || '9000';
  const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
  return `${protocol}://${endpoint}:${port}/${BUCKET_NAME}/${objectName}`;
}

/**
 * Delete a file from MinIO
 */
export async function deleteFile(objectName: string): Promise<void> {
  try {
    await minioClient.removeObject(BUCKET_NAME, objectName);
  } catch (error) {
    console.error('Failed to delete file from MinIO:', error);
    throw error;
  }
}

/**
 * List files in a prefix
 */
export async function listFiles(prefix: string = ''): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const stream = minioClient.listObjects(BUCKET_NAME, prefix, true);
    const files: string[] = [];

    stream.on('data', (obj) => {
      if (obj.name) {
        files.push(obj.name);
      }
    });

    stream.on('error', (err) => {
      reject(err);
    });

    stream.on('end', () => {
      resolve(files);
    });
  });
}

/**
 * Download a file from a URL and save it to MinIO
 */
export async function downloadAndSave(
  url: string,
  objectName: string,
  contentType?: string
): Promise<string> {
  try {
    // Fetch the file
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    // Get the buffer
    const buffer = Buffer.from(await response.arrayBuffer());

    // Upload to MinIO
    const metadata: Record<string, string> = {};
    if (contentType) {
      metadata['Content-Type'] = contentType;
    }

    await minioClient.putObject(BUCKET_NAME, objectName, buffer, buffer.length, metadata);

    console.log(`✓ Saved file to MinIO: ${objectName}`);
    return objectName;
  } catch (error) {
    console.error('Failed to download and save file to MinIO:', error);
    throw error;
  }
}
