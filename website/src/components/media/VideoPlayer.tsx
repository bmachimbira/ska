'use client';

import { useState } from 'react';
import ReactPlayer from 'react-player';
import { Loader2 } from 'lucide-react';

export interface VideoPlayerProps {
  url: string;
  title?: string;
  thumbnail?: string;
}

export function VideoPlayer({ url, title, thumbnail }: VideoPlayerProps) {
  const [isReady, setIsReady] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
        </div>
      )}
      <ReactPlayer
        url={url}
        controls
        width="100%"
        height="100%"
        light={thumbnail}
        playing={false}
        onReady={() => setIsReady(true)}
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload',
            },
          },
        }}
      />
    </div>
  );
}
