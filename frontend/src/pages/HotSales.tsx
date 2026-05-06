import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { productsAPI } from '@/lib/api';
import { Loader2 } from 'lucide-react';

const HotSales: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await productsAPI.getAll({ hot_sales: 'true' });
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch hot sales:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <>
      <Helmet>
        <title>Hot Sales & Deals - Elegance Jewelry</title>
        <meta
          name="description"
          content="Shop our hot sales and exclusive deals on premium jewelry. Limited time offers on bangles, bracelets, and more."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1">
          {/* Hero Banner */}
          <section className="relative h-48 md:h-64 bg-destructive/5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-destructive/20 to-primary/20" />
            <div className="relative h-full container mx-auto px-4 flex items-center justify-center">
              <div className="text-center">
                <span className="inline-block px-4 py-1 bg-destructive text-destructive-foreground text-sm font-medium rounded-full mb-4">
                  Limited Time Only
                </span>
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-2">
                  Hot Sales & Deals
                </h1>
                <p className="font-sans text-muted-foreground">
                  Up to 30% off on selected items
                </p>
              </div>
            </div>
          </section>

          <div className="container mx-auto px-4 py-8 md:py-12">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product, index) => (
                  <div
                    key={product._id || product.id}
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
                  No hot sales at the moment. Check back soon!
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

export default HotSales;
