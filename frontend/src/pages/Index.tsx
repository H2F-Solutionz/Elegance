import React, { useState, useEffect } from 'react';
import SEO from '@/components/SEO';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroCarousel from '@/components/home/HeroCarousel';
import ProductSection from '@/components/home/ProductSection';
import { productsAPI } from '@/lib/api';

const Index: React.FC = () => {
  const [hotSales, setHotSales] = useState<any[]>([]);
  const [latestArrivals, setLatestArrivals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [hot, latest] = await Promise.all([
          productsAPI.getAll({ hot_sales: 'true' }),
          productsAPI.getAll({ latest: 'true' })
        ]);
        setHotSales(hot);
        setLatestArrivals(latest);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <SEO />

      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1">
          {/* Hero Section */}
          <HeroCarousel />

          {/* Hot Sales Section */}
          <ProductSection
            title="Hot Sales & Deals"
            subtitle="Limited Time Offers"
            products={hotSales}
            viewAllLink="/hot-sales"
          />

          {/* Banner Section */}
          <section className="py-12 md:py-20 gradient-hero">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <span className="font-display text-primary text-lg mb-2 block">
                    Handcrafted Excellence
                  </span>
                  <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4">
                    The Art of Traditional Jewelry Making
                  </h2>
                  <p className="font-sans text-muted-foreground mb-6 max-w-md">
                    Each piece in our collection is meticulously crafted by skilled artisans 
                    who have inherited centuries of jewelry-making traditions. Experience 
                    the perfect blend of heritage and contemporary design.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="text-center">
                      <span className="font-serif text-3xl font-bold text-primary">20+</span>
                      <p className="font-sans text-sm text-muted-foreground">Years Experience</p>
                    </div>
                    <div className="text-center">
                      <span className="font-serif text-3xl font-bold text-primary">50K+</span>
                      <p className="font-sans text-sm text-muted-foreground">Happy Customers</p>
                    </div>
                    <div className="text-center">
                      <span className="font-serif text-3xl font-bold text-primary">1000+</span>
                      <p className="font-sans text-sm text-muted-foreground">Unique Designs</p>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2 relative">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-medium">
                    <img
                      src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800"
                      alt="Traditional jewelry craftsmanship"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-4 -left-4 h-24 w-24 gradient-gold rounded-xl flex items-center justify-center shadow-gold">
                    <span className="font-serif text-primary-foreground text-lg font-bold text-center leading-tight">
                      100%<br />Certified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Latest Arrivals Section */}
          <ProductSection
            title="Latest Arrivals"
            subtitle="Fresh Designs"
            products={latestArrivals}
            viewAllLink="/latest-arrivals"
          />

          {/* Categories Preview */}
          <section className="py-12 md:py-20 bg-muted">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <span className="font-display text-primary text-lg mb-2 block">
                  Shop By Category
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                  Find Your Perfect Piece
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Women',
                    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600',
                    link: '/categories/women',
                  },
                  {
                    title: 'Men',
                    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600',
                    link: '/categories/men',
                  },
                  {
                    title: 'Kids',
                    image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600',
                    link: '/categories/kids',
                  },
                ].map((category) => (
                  <a
                    key={category.title}
                    href={category.link}
                    className="group relative aspect-[4/5] rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-500"
                  >
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="font-serif text-2xl font-bold text-cream mb-2">
                        {category.title}
                      </h3>
                      <span className="font-sans text-sm text-cream/80 group-hover:text-primary transition-colors">
                        Explore Collection →
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Index;
