import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ImageMagnifierProps {
  src: string;
  hdSrc?: string;
  alt: string;
  className?: string;
  maxZoom?: number;
}

const ImageMagnifier: React.FC<ImageMagnifierProps> = ({
  src,
  hdSrc,
  alt,
  className,
  maxZoom = 4,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Use HD source when zoomed if available
  const zoomImageSrc = hdSrc || src;

  // Calculate optimal zoom based on image resolution
  const calculateOptimalZoom = useCallback(() => {
    if (naturalSize.width === 0 || displaySize.width === 0) return maxZoom;
    
    // Zoom relative to how much detail is available
    const resolutionRatio = naturalSize.width / displaySize.width;
    // Clamp between 2x and maxZoom, scaling with resolution
    return Math.min(Math.max(resolutionRatio, 2), maxZoom);
  }, [naturalSize.width, displaySize.width, maxZoom]);

  // Update sizes when image loads
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      setNaturalSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      });
      const rect = imageRef.current.getBoundingClientRect();
      setDisplaySize({ width: rect.width, height: rect.height });
    }
  }, []);

  // Update display size on resize
  useEffect(() => {
    const updateDisplaySize = () => {
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        setDisplaySize({ width: rect.width, height: rect.height });
      }
    };

    window.addEventListener('resize', updateDisplaySize);
    return () => window.removeEventListener('resize', updateDisplaySize);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !isZoomed) return;

    const rect = containerRef.current.getBoundingClientRect();
    const optimalZoom = calculateOptimalZoom();

    // Cursor position as percentage (0 to 1)
    const xPercent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const yPercent = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    // Calculate max translation to keep image within bounds
    // When zoomed, the image is larger than container by (scale - 1) * size
    const maxTranslateX = ((optimalZoom - 1) * rect.width) / 2;
    const maxTranslateY = ((optimalZoom - 1) * rect.height) / 2;

    // Map cursor position to translation
    // At 0% cursor, translate to +max (show left/top edge)
    // At 100% cursor, translate to -max (show right/bottom edge)
    const translateX = maxTranslateX - (xPercent * 2 * maxTranslateX);
    const translateY = maxTranslateY - (yPercent * 2 * maxTranslateY);

    setTransform({
      x: translateX,
      y: translateY,
      scale: optimalZoom,
    });
  }, [isZoomed, calculateOptimalZoom]);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsZoomed(true);
    // Trigger initial position calculation
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const optimalZoom = calculateOptimalZoom();
      
      const xPercent = (e.clientX - rect.left) / rect.width;
      const yPercent = (e.clientY - rect.top) / rect.height;
      
      const maxTranslateX = ((optimalZoom - 1) * rect.width) / 2;
      const maxTranslateY = ((optimalZoom - 1) * rect.height) / 2;
      
      const translateX = maxTranslateX - (xPercent * 2 * maxTranslateX);
      const translateY = maxTranslateY - (yPercent * 2 * maxTranslateY);

      setTransform({
        x: translateX,
        y: translateY,
        scale: optimalZoom,
      });
    }
  }, [calculateOptimalZoom]);

  const handleMouseLeave = useCallback(() => {
    setIsZoomed(false);
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  const optimalZoom = calculateOptimalZoom();

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden cursor-zoom-in",
        isZoomed && "cursor-move",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        willChange: 'transform',
      }}
    >
      {/* Main image with GPU-accelerated transform */}
      <img
        ref={imageRef}
        src={isZoomed ? zoomImageSrc : src}
        alt={alt}
        onLoad={handleImageLoad}
        className="w-full h-full object-cover"
        style={{
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
          transformOrigin: 'center center',
          transition: isZoomed 
            ? 'transform 0.08s cubic-bezier(0.25, 0.46, 0.45, 0.94)' 
            : 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      />

      {/* Zoom indicator badge */}
      <div
        className={cn(
          "absolute bottom-4 right-4 z-50 px-3 py-1.5 rounded-full",
          "bg-black/70 text-primary text-xs font-medium tracking-wide",
          "transition-all duration-300 ease-out backdrop-blur-sm",
          "border border-primary/30"
        )}
        style={{
          opacity: isZoomed ? 1 : 0,
          transform: isZoomed ? 'translateY(0)' : 'translateY(10px)',
          willChange: 'opacity, transform',
        }}
      >
        {optimalZoom.toFixed(1)}× ZOOM
      </div>

      {/* Subtle hover hint when not zoomed */}
      <div
        className={cn(
          "absolute inset-0 z-10 flex items-center justify-center",
          "bg-black/0 transition-all duration-300",
          "pointer-events-none"
        )}
        style={{
          opacity: isZoomed ? 0 : 0,
        }}
      />
    </div>
  );
};

export default ImageMagnifier;
