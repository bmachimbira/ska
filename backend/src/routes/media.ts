/**
 * Media Routes
 * Handles video uploads, processing, and streaming
 */

import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler';
import { z } from 'zod';
import * as storageService from '../services/storage';
import * as muxService from '../services/mux';
import { getPool } from '../config/database';

export const mediaRouter = Router();

/**
 * POST /v1/media/upload-url
 * Get a presigned URL for uploading a video to MinIO
 */
mediaRouter.post(
  '/upload-url',
  asyncHandler(async (req: Request, res: Response) => {
    const schema = z.object({
      filename: z.string(),
      contentType: z.string().optional(),
    });

    const { filename, contentType } = schema.parse(req.body);

    // Generate unique object name
    const timestamp = Date.now();
    const objectName = `videos/${timestamp}-${filename}`;

    // Get presigned upload URL (valid for 1 hour)
    const uploadUrl = await storageService.getUploadUrl(objectName, 3600);

    res.json({
      uploadUrl,
      objectName,
      expiresIn: 3600,
    });
  })
);

/**
 * POST /v1/media/process
 * Process a video from MinIO using Mux
 */
mediaRouter.post(
  '/process',
  asyncHandler(async (req: Request, res: Response) => {
    const schema = z.object({
      objectName: z.string(),
      passthrough: z.string().optional(),
    });

    const { objectName, passthrough } = schema.parse(req.body);

    // Get presigned URL from MinIO (valid for 24 hours for Mux to fetch)
    const videoUrl = await storageService.getDownloadUrl(objectName, 86400);

    // Create Mux asset
    const muxAsset = await muxService.createAssetFromUrl(videoUrl, {
      passthrough,
      playbackPolicy: 'public',
    });

    // Store media asset in database
    const pool = getPool();
    const result = await pool.query(
      `
      INSERT INTO media_asset (
        id,
        kind,
        hls_url,
        download_url,
        metadata,
        created_at,
        updated_at
      ) VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
      RETURNING id, kind, hls_url, download_url, metadata
      `,
      [
        'video',
        muxService.getHlsUrl(muxAsset.playbackId),
        videoUrl,
        JSON.stringify({
          muxAssetId: muxAsset.assetId,
          muxPlaybackId: muxAsset.playbackId,
          minioObjectName: objectName,
          status: muxAsset.status,
          duration: muxAsset.duration,
        }),
      ]
    );

    const asset = result.rows[0];

    res.json({
      assetId: asset.id,
      kind: asset.kind,
      hlsUrl: asset.hls_url,
      mux: {
        assetId: muxAsset.assetId,
        playbackId: muxAsset.playbackId,
        status: muxAsset.status,
        thumbnailUrl: muxService.getThumbnailUrl(muxAsset.playbackId),
      },
    });
  })
);

/**
 * POST /v1/media/direct-upload
 * Get a direct upload URL to Mux (bypasses MinIO)
 */
mediaRouter.post(
  '/direct-upload',
  asyncHandler(async (req: Request, res: Response) => {
    const schema = z.object({
      corsOrigin: z.string().optional(),
      passthrough: z.string().optional(),
    });

    const { corsOrigin, passthrough } = schema.parse(req.body);

    const upload = await muxService.createDirectUpload({
      corsOrigin,
      newAssetSettings: {
        playbackPolicy: 'public',
        passthrough,
      },
    });

    res.json({
      uploadId: upload.uploadId,
      uploadUrl: upload.uploadUrl,
    });
  })
);

/**
 * GET /v1/media/:assetId
 * Get media asset details
 */
mediaRouter.get(
  '/:assetId',
  asyncHandler(async (req: Request, res: Response) => {
    const { assetId } = req.params;
    const pool = getPool();

    const result = await pool.query(
      `
      SELECT
        id,
        kind,
        hls_url,
        dash_url,
        download_url,
        width,
        height,
        duration_seconds,
        metadata,
        created_at,
        updated_at
      FROM media_asset
      WHERE id = $1
      `,
      [assetId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Media asset ${assetId} not found`,
      });
    }

    const asset = result.rows[0];
    const metadata = asset.metadata || {};

    // If it's a Mux asset, get updated status
    let muxData = null;
    if (metadata.muxAssetId) {
      try {
        const muxAsset = await muxService.getAsset(metadata.muxAssetId);
        muxData = {
          assetId: muxAsset.assetId,
          playbackId: muxAsset.playbackId,
          status: muxAsset.status,
          thumbnailUrl: muxService.getThumbnailUrl(muxAsset.playbackId),
          duration: muxAsset.duration,
        };
      } catch (error) {
        console.error('Failed to fetch Mux asset details:', error);
      }
    }

    res.json({
      asset: {
        id: asset.id,
        kind: asset.kind,
        hlsUrl: asset.hls_url,
        dashUrl: asset.dash_url,
        downloadUrl: asset.download_url,
        width: asset.width,
        height: asset.height,
        durationSeconds: asset.duration_seconds,
        createdAt: asset.created_at,
        updatedAt: asset.updated_at,
      },
      mux: muxData,
    });
  })
);

/**
 * DELETE /v1/media/:assetId
 * Delete a media asset (removes from Mux and MinIO)
 */
mediaRouter.delete(
  '/:assetId',
  asyncHandler(async (req: Request, res: Response) => {
    const { assetId } = req.params;
    const pool = getPool();

    // Get asset details
    const result = await pool.query(
      'SELECT metadata FROM media_asset WHERE id = $1',
      [assetId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Media asset ${assetId} not found`,
      });
    }

    const metadata = result.rows[0].metadata || {};

    // Delete from Mux if it exists
    if (metadata.muxAssetId) {
      try {
        await muxService.deleteAsset(metadata.muxAssetId);
      } catch (error) {
        console.error('Failed to delete from Mux:', error);
      }
    }

    // Delete from MinIO if it exists
    if (metadata.minioObjectName) {
      try {
        await storageService.deleteFile(metadata.minioObjectName);
      } catch (error) {
        console.error('Failed to delete from MinIO:', error);
      }
    }

    // Delete from database
    await pool.query('DELETE FROM media_asset WHERE id = $1', [assetId]);

    res.status(204).send();
  })
);

/**
 * POST /v1/media/webhook/mux
 * Webhook endpoint for Mux events
 */
mediaRouter.post(
  '/webhook/mux',
  asyncHandler(async (req: Request, res: Response) => {
    const event = req.body;

    console.log('Mux webhook received:', event.type);

    // Handle different Mux events
    switch (event.type) {
      case 'video.asset.ready':
        // Asset is ready for playback
        const assetId = event.data.id;
        const playbackIds = event.data.playback_ids;

        console.log(`Mux asset ${assetId} is ready`);

        // Update database with asset status
        const pool = getPool();
        await pool.query(
          `
          UPDATE media_asset
          SET metadata = metadata || $1::jsonb, updated_at = NOW()
          WHERE metadata->>'muxAssetId' = $2
          `,
          [
            JSON.stringify({
              status: 'ready',
              duration: event.data.duration,
            }),
            assetId,
          ]
        );
        break;

      case 'video.asset.errored':
        console.error('Mux asset error:', event.data);
        break;

      default:
        console.log('Unhandled Mux event:', event.type);
    }

    res.status(200).json({ received: true });
  })
);
