import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { getLatestArrivals } from '@/data/products';

const LatestArrivals: React.FC = () => {
  const products = getLatestArrivals();

  return (
    <>
      <Helmet>
        <title>Latest Arrivals - Elegance Jewelry</title>
        <meta
          name="description"
          content="Discover our newest jewelry collections. Fresh designs in bangles, bracelets, and more. Shop the latest arrivals at Elegance."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1">
          {/* Hero Banner */}
          <section className="relative h-48 md:h-64 bg-muted overflow-hidden">
            <div className="absolute inset-0 gradient-hero" />
            <div className="relative h-full container mx-auto px-4 flex items-center justify-center">
              <div className="text-center">
                <span className="inline-block px-4 py-1 gradient-gold text-primary-foreground text-sm font-medium rounded-full mb-4">
                  Fresh Designs
                </span>
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-2">
                  Latest Arrivals
                </h1>
                <p className="font-sans text-muted-foreground">
                  Discover our newest collections
                </p>
              </div>
            </div>
          </section>

          <div className="container mx-auto px-4 py-8 md:py-12">
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="font-sans text-muted-foreground text-lg">
                  No new arrivals at the moment. Check back soon!
                </p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default LatestArrivals;
