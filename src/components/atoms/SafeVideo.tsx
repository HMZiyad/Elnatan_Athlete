import React, { useEffect, useRef } from 'react';

interface SafeVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

export const SafeVideo: React.FC<SafeVideoProps> = ({ src, ...props }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      // Cleanup to prevent Safari "EmptyRanges" ReferenceError on unmount
      if (videoRef.current) {
        videoRef.current.removeAttribute('controls');
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      playsInline
      preload="metadata"
      suppressHydrationWarning
      {...props}
    />
  );
};
