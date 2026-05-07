import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { slidesAPI } from '@/lib/api';

const DEFAULT_SLIDES = [
  {
    _id: '1',
    title: 'Timeless Elegance',
    subtitle: 'Discover Our Wedding Collection',
    description: 'Exquisite bangles crafted with love for your special moments',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920',
    cta: 'Shop Wedding',
    link: '/categories/women?filter=wedding',
  },
  {
    _id: '2',
    title: 'New Arrivals',
    subtitle: 'Contemporary Designs',
    description: 'Modern minimalist pieces for the everyday woman',
    image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1920',
    cta: 'Explore Now',
    link: '/latest-arrivals',
  },
  {
    _id: '3',
    title: 'Festive Sale',
    subtitle: 'Up to 30% Off',
    description: 'Celebrate with stunning gold and diamond bangles',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1920',
    cta: 'Shop Deals',
    link: '/hot-sales',
  },
];

const HeroCarousel: React.FC = () => {
  const [slides, setSlides] = useState<any[]>(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Fetch slides from backend
  useEffect(() => {
    slidesAPI.getPublic()
      .then((data) => {
        if (data && data.length > 0) setSlides(data);
      })
      .catch(() => {
        // Silently fall back to default slides
      });
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  return (
    <section className="relative h-[60vh] md:h-[80vh] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide._id || slide.id || index}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full container mx-auto px-4 flex items-center">
            <div
              className={cn(
                "max-w-xl transform transition-all duration-1000 delay-300",
                index === currentSlide ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
              )}
            >
              {slide.subtitle && (
                <span className="font-display text-lg md:text-xl text-primary mb-2 block">
                  {slide.subtitle}
                </span>
              )}
              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-cream mb-4">
                {slide.title}
              </h1>
              {slide.description && (
                <p className="font-sans text-cream/80 text-base md:text-lg mb-8 max-w-md">
                  {slide.description}
                </p>
              )}
              <Link to={slide.link || '/'}>
                <Button variant="gold" size="xl" className="font-medium">
                  {slide.cta || 'Shop Now'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-cream/10 backdrop-blur-md flex items-center justify-center text-cream hover:bg-cream/20 transition-all duration-300"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-cream/10 backdrop-blur-md flex items-center justify-center text-cream hover:bg-cream/20 transition-all duration-300"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === currentSlide
                ? "w-8 bg-primary"
                : "w-2 bg-cream/50 hover:bg-cream/70"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
