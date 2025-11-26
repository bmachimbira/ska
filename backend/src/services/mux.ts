/**
 * Mux Video Service
 * Handles video processing and streaming via Mux
 */

import Mux from '@mux/mux-node';
import * as dotenv from 'dotenv';

dotenv.config();

// Check if Mux credentials are configured
const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID;
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET;

if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET || 
    MUX_TOKEN_ID === 'your-mux-token-id' || 
    MUX_TOKEN_SECRET === 'your-mux-token-secret') {
  console.warn('⚠️  Mux credentials not configured. Video processing will fail.');
  console.warn('   Set MUX_TOKEN_ID and MUX_TOKEN_SECRET in your .env file');
  console.warn('   Get credentials at: https://dashboard.mux.com/settings/access-tokens');
}

// Initialize Mux client
const mux = new Mux({
  tokenId: MUX_TOKEN_ID,
  tokenSecret: MUX_TOKEN_SECRET,
});

const { video } = mux;

export interface MuxAssetData {
  assetId: string;
  playbackId: string;
  status: string;
  duration?: number;
  aspectRatio?: string;
  maxStoredResolution?: string;
  maxStoredFrameRate?: number;
}

/**
 * Create a Mux asset from a URL (e.g., MinIO presigned URL)
 */
export async function createAssetFromUrl(
  videoUrl: string,
  options?: {
    passthrough?: string;
    playbackPolicy?: 'public' | 'signed';
    mp4Support?: 'standard' | 'none';
  }
): Promise<MuxAssetData> {
  try {
    // Build asset creation params
    const createParams: any = {
      input: [{ url: videoUrl }],
      playback_policy: [options?.playbackPolicy || 'public'],
      passthrough: options?.passthrough,
    };

    // Only add mp4_support if explicitly set (deprecated on basic plans)
    // if (options?.mp4Support && options.mp4Support !== 'standard') {
    //   createParams.mp4_support = options.mp4Support;
    // }

    const asset = await video.assets.create(createParams);

    // Get the playback ID
    const playbackId = asset.playback_ids?.[0]?.id || '';

    return {
      assetId: asset.id,
      playbackId,
      status: asset.status,
      duration: asset.duration,
      aspectRatio: asset.aspect_ratio,
      maxStoredResolution: asset.max_stored_resolution,
      maxStoredFrameRate: asset.max_stored_frame_rate,
    };
  } catch (error: any) {
    console.error('Failed to create Mux asset:', error);
    
    // Check if it's an authentication error
    if (error.message?.includes('authentication') || error.message?.includes('unauthorized')) {
      throw new Error('Mux authentication failed. Please check your MUX_TOKEN_ID and MUX_TOKEN_SECRET in .env file');
    }
    
    throw new Error(`Mux video processing failed: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Get Mux asset details
 */
export async function getAsset(assetId: string): Promise<MuxAssetData> {
  try {
    const asset = await video.assets.retrieve(assetId);
    const playbackId = asset.playback_ids?.[0]?.id || '';

    return {
      assetId: asset.id,
      playbackId,
      status: asset.status,
      duration: asset.duration,
      aspectRatio: asset.aspect_ratio,
      maxStoredResolution: asset.max_stored_resolution,
      maxStoredFrameRate: asset.max_stored_frame_rate,
    };
  } catch (error) {
    console.error('Failed to get Mux asset:', error);
    throw error;
  }
}

/**
 * Delete a Mux asset
 */
export async function deleteAsset(assetId: string): Promise<void> {
  try {
    await video.assets.delete(assetId);
  } catch (error) {
    console.error('Failed to delete Mux asset:', error);
    throw error;
  }
}

/**
 * Get HLS streaming URL for a playback ID
 */
export function getHlsUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

/**
 * Get thumbnail URL for a playback ID
 */
export function getThumbnailUrl(
  playbackId: string,
  options?: {
    width?: number;
    height?: number;
    time?: number; // seconds into video
    fitMode?: 'preserve' | 'stretch' | 'crop' | 'smartcrop';
  }
): string {
  const params = new URLSearchParams();
  if (options?.width) params.append('width', options.width.toString());
  if (options?.height) params.append('height', options.height.toString());
  if (options?.time) params.append('time', options.time.toString());
  if (options?.fitMode) params.append('fit_mode', options.fitMode);

  const queryString = params.toString();
  return `https://image.mux.com/${playbackId}/thumbnail.jpg${queryString ? '?' + queryString : ''}`;
}

/**
 * Get GIF preview URL
 */
export function getGifUrl(
  playbackId: string,
  options?: {
    width?: number;
    height?: number;
    fps?: number;
    start?: number;
    end?: number;
  }
): string {
  const params = new URLSearchParams();
  if (options?.width) params.append('width', options.width.toString());
  if (options?.height) params.append('height', options.height.toString());
  if (options?.fps) params.append('fps', options.fps.toString());
  if (options?.start) params.append('start', options.start.toString());
  if (options?.end) params.append('end', options.end.toString());

  const queryString = params.toString();
  return `https://image.mux.com/${playbackId}/animated.gif${queryString ? '?' + queryString : ''}`;
}

/**
 * Create a direct upload URL for uploading videos directly to Mux
 * (Alternative to uploading to MinIO first)
 */
export async function createDirectUpload(
  options?: {
    corsOrigin?: string;
    newAssetSettings?: {
      playbackPolicy?: 'public' | 'signed';
      mp4Support?: 'standard' | 'none';
      passthrough?: string;
    };
  }
): Promise<{ uploadId: string; uploadUrl: string }> {
  try {
    // Build new asset settings
    const newAssetSettings: any = {
      playback_policy: [options?.newAssetSettings?.playbackPolicy || 'public'],
      passthrough: options?.newAssetSettings?.passthrough,
    };

    // Only add mp4_support if explicitly set and not 'standard' (deprecated on basic plans)
    // if (options?.newAssetSettings?.mp4Support && options.newAssetSettings.mp4Support !== 'standard') {
    //   newAssetSettings.mp4_support = options.newAssetSettings.mp4Support;
    // }

    const upload = await video.uploads.create({
      cors_origin: options?.corsOrigin || '*',
      new_asset_settings: newAssetSettings,
    });

    return {
      uploadId: upload.id,
      uploadUrl: upload.url,
    };
  } catch (error) {
    console.error('Failed to create Mux direct upload:', error);
    throw error;
  }
}

/**
 * Get upload status
 */
export async function getUploadStatus(uploadId: string) {
  try {
    return await video.uploads.retrieve(uploadId);
  } catch (error) {
    console.error('Failed to get upload status:', error);
    throw error;
  }
}
