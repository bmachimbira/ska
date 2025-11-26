declare module '@mux/mux-player-react' {
  import { ComponentType } from 'react';

  interface MuxPlayerProps {
    playbackId: string;
    streamType?: 'on-demand' | 'live';
    metadata?: {
      video_id?: string;
      video_title?: string;
      viewer_user_id?: string;
      [key: string]: any;
    };
    autoPlay?: boolean | 'muted';
    muted?: boolean;
    loop?: boolean;
    startTime?: number;
    className?: string;
    style?: React.CSSProperties;
    onPlay?: () => void;
    onPause?: () => void;
    onEnded?: () => void;
    onError?: (error: any) => void;
    onLoadedMetadata?: () => void;
    onTimeUpdate?: () => void;
    [key: string]: any;
  }

  const MuxPlayer: ComponentType<MuxPlayerProps>;
  export default MuxPlayer;
}
