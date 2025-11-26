'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle, Film, Loader } from 'lucide-react';

interface VideoUploadProps {
  onUploadComplete: (assetId: string, hlsUrl: string, thumbnailUrl: string) => void;
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
  thumbnailUrl?: string;
}

export default function VideoUpload({
  onUploadComplete,
  onError,
  accept = 'video/*',
  maxSize = 2 * 1024 * 1024 * 1024, // 2GB default
}: VideoUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    progress: 0,
    message: '',
  });

  const uploadVideo = useCallback(
    async (file: File) => {
      try {
        setUploadStatus({
          status: 'uploading',
          progress: 10,
          message: 'Getting upload URL...',
        });

        // Step 1: Get presigned upload URL from backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
        const uploadEndpoint = `${apiUrl}/media/upload-url`;
        
        console.log('Requesting upload URL from:', uploadEndpoint);
        
        const uploadUrlResponse = await fetch(uploadEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
          }),
        });

        if (!uploadUrlResponse.ok) {
          const errorText = await uploadUrlResponse.text();
          console.error('Upload URL request failed:', {
            status: uploadUrlResponse.status,
            statusText: uploadUrlResponse.statusText,
            body: errorText,
          });
          throw new Error(`Failed to get upload URL: ${uploadUrlResponse.status} ${uploadUrlResponse.statusText}`);
        }

        const { uploadUrl, objectName } = await uploadUrlResponse.json();

        setUploadStatus({
          status: 'uploading',
          progress: 20,
          message: 'Uploading video...',
        });

        // Step 2: Upload file to MinIO using presigned URL
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload video');
        }

        setUploadStatus({
          status: 'processing',
          progress: 50,
          message: 'Processing video with Mux...',
        });

        // Step 3: Process video with Mux
        const processResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1'}/media/process`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              objectName,
            }),
          }
        );

        if (!processResponse.ok) {
          throw new Error('Failed to process video');
        }

        const result = await processResponse.json();

        setUploadStatus({
          status: 'complete',
          progress: 100,
          message: 'Video uploaded successfully!',
          assetId: result.assetId,
          hlsUrl: result.hlsUrl,
          thumbnailUrl: result.mux.thumbnailUrl,
        });

        // Notify parent component
        onUploadComplete(
          result.assetId,
          result.hlsUrl,
          result.mux.thumbnailUrl
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
        uploadVideo(acceptedFiles[0]);
      }
    },
    [uploadVideo]
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
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {isDragActive
              ? 'Drop video here'
              : 'Click to upload or drag and drop'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            MP4, MOV, AVI, or other video formats up to{' '}
            {Math.round(maxSize / (1024 * 1024 * 1024))}GB
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
              {uploadStatus.thumbnailUrl && (
                <img
                  src={uploadStatus.thumbnailUrl}
                  alt="Video thumbnail"
                  className="rounded-lg mb-2 max-w-xs"
                />
              )}
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
