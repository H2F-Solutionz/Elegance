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
  magnifierSize = 150,
  zoomLevel = 3,
}) => {
  const [isActivated, setIsActivated] = useState(false);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isActivated) return;

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
    setShowMagnifier(true);
  };

  const handleClick = () => {
    if (!isActivated) {
      setIsActivated(true);
    }
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-all duration-300",
          isActivated ? "cursor-zoom-in" : "cursor-pointer"
        )}
        loading="lazy"
      />

      {/* Click hint overlay - shown before activation */}
      {!isActivated && (
        <div className="absolute inset-0 flex items-center justify-center bg-charcoal/0 hover:bg-charcoal/20 transition-colors duration-300 cursor-pointer">
          <div className="px-4 py-2 bg-charcoal/80 backdrop-blur-sm rounded-full text-cream text-sm font-medium opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Click to enable zoom
          </div>
        </div>
      )}

      {/* Magnifier lens - only visible after activation */}
      {isActivated && (
        <div
          className={cn(
            "pointer-events-none absolute rounded-full border-2 border-primary/60 transition-all duration-150 ease-out",
            showMagnifier ? "opacity-100 scale-100" : "opacity-0 scale-90"
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
            boxShadow: '0 0 30px rgba(212, 175, 55, 0.4), 0 8px 32px rgba(0,0,0,0.3), inset 0 0 20px rgba(255,255,255,0.1)',
          }}
        />
      )}

      {/* Subtle vignette effect when magnifier is active */}
      {isActivated && showMagnifier && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{
            background: `radial-gradient(circle ${magnifierSize / 2 + 30}px at ${cursorPosition.x}px ${cursorPosition.y}px, transparent 0%, rgba(0,0,0,0.2) 100%)`,
          }}
        />
      )}

      {/* Active indicator */}
      {isActivated && (
        <div className="absolute top-3 right-3 px-2 py-1 bg-primary/90 backdrop-blur-sm rounded text-primary-foreground text-xs font-medium">
          Zoom Active
        </div>
      )}
    </div>
  );
};

export default ImageMagnifier;
