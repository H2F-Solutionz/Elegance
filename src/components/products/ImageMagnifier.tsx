import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ImageMagnifierProps {
  src: string;
  alt: string;
  className?: string;
  magnifierSize?: number;
  zoomLevel?: number;
}

const ImageMagnifier: React.FC<ImageMagnifierProps> = ({
  src,
  alt,
  className,
  magnifierSize = 120,
  zoomLevel = 2.5,
}) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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
  };

  const handleMouseEnter = () => {
    setShowMagnifier(true);
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-700 ease-out"
        loading="lazy"
      />

      {/* Magnifier lens */}
      <div
        className={cn(
          "pointer-events-none absolute rounded-full border-2 border-primary/50 shadow-xl transition-opacity duration-200 ease-out",
          showMagnifier ? "opacity-100" : "opacity-0"
        )}
        style={{
          width: magnifierSize,
          height: magnifierSize,
          left: cursorPosition.x - magnifierSize / 2,
          top: cursorPosition.y - magnifierSize / 2,
          backgroundImage: `url(${src})`,
          backgroundSize: `${zoomLevel * 100}%`,
          backgroundPosition: `${magnifierPosition.x}% ${magnifierPosition.y}%`,
          backgroundRepeat: 'no-repeat',
          boxShadow: '0 0 20px rgba(212, 175, 55, 0.3), inset 0 0 10px rgba(0,0,0,0.1)',
        }}
      />

      {/* Subtle darkening effect around cursor */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-300",
          showMagnifier ? "opacity-100" : "opacity-0"
        )}
        style={{
          background: showMagnifier
            ? `radial-gradient(circle ${magnifierSize / 2 + 20}px at ${cursorPosition.x}px ${cursorPosition.y}px, transparent 0%, rgba(0,0,0,0.15) 100%)`
            : 'transparent',
        }}
      />
    </div>
  );
};

export default ImageMagnifier;
