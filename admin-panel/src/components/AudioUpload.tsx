'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle, Music, Loader } from 'lucide-react';

interface AudioUploadProps {
  onUploadComplete: (assetId: string, hlsUrl: string) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSize?: number; // in bytes
}

interface UploadStatus {
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  message: string;
  assetId?: string;
  hlsUrl?: string;
  duration?: number;
}

export default function AudioUpload({
  onUploadComplete,
  onError,
  accept = 'audio/*',
  maxSize = 500 * 1024 * 1024, // 500MB default
}: AudioUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    progress: 0,
    message: '',
  });

  const uploadAudio = useCallback(
    async (file: File) => {
      try {
        setUploadStatus({
          status: 'uploading',
          progress: 10,
          message: 'Getting upload URL...',
        });

        // Step 1: Get Mux direct upload URL from backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
        const directUploadEndpoint = `${apiUrl}/media/direct-upload`;

        console.log('Requesting Mux direct upload URL from:', directUploadEndpoint);

        const directUploadResponse = await fetch(directUploadEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            corsOrigin: window.location.origin,
          }),
        });

        if (!directUploadResponse.ok) {
          const errorText = await directUploadResponse.text();
          console.error('Direct upload request failed:', {
            status: directUploadResponse.status,
            statusText: directUploadResponse.statusText,
            body: errorText,
          });
          throw new Error(`Failed to get upload URL: ${directUploadResponse.status}`);
        }

        const { uploadUrl, uploadId } = await directUploadResponse.json();

        setUploadStatus({
          status: 'uploading',
          progress: 30,
          message: 'Uploading audio to Mux...',
        });

        // Step 2: Upload file directly to Mux
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type || 'audio/mpeg',
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload audio to Mux');
        }

        setUploadStatus({
          status: 'processing',
          progress: 70,
          message: 'Processing audio...',
        });

        // Step 3: Poll for upload completion and get asset details
        let attempts = 0;
        const maxAttempts = 30;
        let assetId = null;

        while (attempts < maxAttempts && !assetId) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

          const statusResponse = await fetch(
            `${apiUrl}/media/upload-status/${uploadId}`,
            {
              headers: { 'Content-Type': 'application/json' },
            }
          );

          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            if (statusData.assetId) {
              assetId = statusData.assetId;
              break;
            }
          }

          attempts++;
          setUploadStatus({
            status: 'processing',
            progress: 70 + (attempts * 1),
            message: `Processing audio... (${attempts}/${maxAttempts})`,
          });
        }

        if (!assetId) {
          throw new Error('Upload timeout - please check media library');
        }

        // Step 4: Get the media asset details
        const assetResponse = await fetch(`${apiUrl}/media/${assetId}`);
        if (!assetResponse.ok) {
          throw new Error('Failed to get media asset details');
        }

        const result = await assetResponse.json();

        setUploadStatus({
          status: 'complete',
          progress: 100,
          message: 'Audio uploaded successfully!',
          assetId: result.asset.id,
          hlsUrl: result.asset.hlsUrl,
          duration: result.mux?.duration,
        });

        // Notify parent component
        onUploadComplete(
          result.asset.id,
          result.asset.hlsUrl
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed';
        setUploadStatus({
          status: 'error',
          progress: 0,
          message: errorMessage,
        });
        onError?.(errorMessage);
      }
    },
    [onUploadComplete, onError]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        uploadAudio(acceptedFiles[0]);
      }
    },
    [uploadAudio]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { [accept]: [] },
    maxSize,
    multiple: false,
  });

  const handleReset = () => {
    setUploadStatus({
      status: 'idle',
      progress: 0,
      message: '',
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {uploadStatus.status === 'idle' && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
              : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600'
          }`}
        >
          <input {...getInputProps()} />
          <Music className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {isDragActive
              ? 'Drop audio here'
              : 'Click to upload or drag and drop'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            MP3, WAV, M4A, or other audio formats up to{' '}
            {Math.round(maxSize / (1024 * 1024))}MB
          </p>
        </div>
      )}

      {(uploadStatus.status === 'uploading' ||
        uploadStatus.status === 'processing') && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Loader className="w-5 h-5 text-primary-600 animate-spin" />
            <span className="text-gray-900 dark:text-white font-medium">
              {uploadStatus.message}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadStatus.progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {uploadStatus.progress}%
          </p>
        </div>
      )}

      {uploadStatus.status === 'complete' && (
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-900 dark:text-green-100 font-medium mb-2">
                {uploadStatus.message}
              </p>
              <div className="flex items-center gap-4 mb-2">
                <Music className="w-16 h-16 text-green-600 dark:text-green-500" />
                {uploadStatus.duration && (
                  <div className="text-sm text-green-700 dark:text-green-300">
                    Duration: {formatDuration(uploadStatus.duration)}
                  </div>
                )}
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Asset ID: {uploadStatus.assetId}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="p-1 text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {uploadStatus.status === 'error' && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-900 dark:text-red-100 font-medium mb-1">
                Upload Failed
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                {uploadStatus.message}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="p-1 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
