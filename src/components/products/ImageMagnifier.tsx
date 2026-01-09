import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ImageMagnifierProps {
  src: string;
  hdSrc?: string; // Optional ultra-HD source for zoom
  alt: string;
  className?: string;
  magnifierSize?: number;
  zoomLevel?: number;
}

const ImageMagnifier: React.FC<ImageMagnifierProps> = ({
  src,
  hdSrc,
  alt,
  className,
  magnifierSize = 400,
  zoomLevel = 18,
}) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use HD source for zoom if provided, otherwise use regular source
  const zoomImageSrc = hdSrc || src;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const elem = imageRef.current;
    const { top, left, width, height } = elem.getBoundingClientRect();

    // Calculate cursor position relative to image
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Calculate percentage position for background
    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;

    setCursorPosition({ x, y });
    setMagnifierPosition({ x: xPercent, y: yPercent });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setShowMagnifier(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowMagnifier(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden cursor-none", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        willChange: 'transform',
      }}
    >
      {/* Base image */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
        style={{
          willChange: 'transform',
          imageRendering: 'crisp-edges' as const,
        }}
      />

      {/* Ultra-premium magnifier lens */}
      <div
        className={cn(
          "pointer-events-none absolute rounded-full border-2 border-primary/80 z-50",
          "transition-[opacity,transform] duration-150 ease-out"
        )}
        style={{
          width: magnifierSize,
          height: magnifierSize,
          left: cursorPosition.x - magnifierSize / 2,
          top: cursorPosition.y - magnifierSize / 2,
          backgroundImage: `url(${zoomImageSrc})`,
          backgroundSize: `${zoomLevel * 100}%`,
          backgroundPosition: `${magnifierPosition.x}% ${magnifierPosition.y}%`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'auto' as const,
          boxShadow: `
            0 0 0 3px rgba(212, 175, 55, 0.3),
            0 0 60px rgba(212, 175, 55, 0.4),
            0 25px 80px rgba(0,0,0,0.5),
            inset 0 0 40px rgba(255,255,255,0.15)
          `,
          opacity: showMagnifier ? 1 : 0,
          transform: showMagnifier ? 'scale(1)' : 'scale(0.8)',
          willChange: 'transform, opacity, left, top, background-position',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          perspective: 1000,
        }}
      />

      {/* Custom cursor indicator at center of magnifier */}
      <div
        className={cn(
          "pointer-events-none absolute z-50 rounded-full",
          "transition-opacity duration-150 ease-out"
        )}
        style={{
          width: 8,
          height: 8,
          left: cursorPosition.x - 4,
          top: cursorPosition.y - 4,
          backgroundColor: 'rgba(212, 175, 55, 0.9)',
          boxShadow: '0 0 10px rgba(212, 175, 55, 0.8)',
          opacity: showMagnifier ? 1 : 0,
          willChange: 'opacity, left, top',
        }}
      />

      {/* Elegant vignette overlay when magnifier is active */}
      <div
        className="pointer-events-none absolute inset-0 z-40 transition-opacity duration-300"
        style={{
          background: showMagnifier 
            ? `radial-gradient(circle ${magnifierSize / 2 + 60}px at ${cursorPosition.x}px ${cursorPosition.y}px, transparent 0%, rgba(0,0,0,0.25) 100%)`
            : 'transparent',
          opacity: showMagnifier ? 1 : 0,
          willChange: 'opacity, background',
        }}
      />

      {/* Zoom level indicator */}
      <div
        className={cn(
          "absolute bottom-4 right-4 z-50 px-3 py-1.5 rounded-full",
          "bg-black/70 text-primary text-xs font-medium tracking-wide",
          "transition-all duration-200 ease-out backdrop-blur-sm",
          "border border-primary/30"
        )}
        style={{
          opacity: showMagnifier ? 1 : 0,
          transform: showMagnifier ? 'translateY(0)' : 'translateY(10px)',
          willChange: 'opacity, transform',
        }}
      >
        {zoomLevel}× ZOOM
      </div>
    </div>
  );
};

export default ImageMagnifier;
