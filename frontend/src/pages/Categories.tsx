import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import { productsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const subCategoryFilters = [
  { id: 'all', label: 'All' },
  { id: 'wedding', label: 'Wedding Jewelers' },
  { id: 'casual', label: 'Casual Jewelers' },
  { id: 'dancing', label: 'Dancing Jewelers' },
];

const Categories: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') || 'all';
  const [activeFilter, setActiveFilter] = useState(filterParam);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await productsAPI.getAll({ category });
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch category products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [category]);

  const filteredProducts = products.filter(p => 
    activeFilter === 'all' || p.subCategory === activeFilter
  );

  const categoryTitle = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : 'All';

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      searchParams.delete('filter');
    } else {
      searchParams.set('filter', filter);
    }
    setSearchParams(searchParams);
  };

  return (
    <>
      <Helmet>
        <title>{categoryTitle}'s Jewelry Collection - Elegance</title>
        <meta
          name="description"
          content={`Explore our ${categoryTitle.toLowerCase()}'s jewelry collection. Premium bangles, bracelets, and accessories for every occasion.`}
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
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-2">
                  {categoryTitle}'s Collection
                </h1>
                <p className="font-sans text-muted-foreground">
                  Discover exquisite jewelry designed for {categoryTitle.toLowerCase()}
                </p>
              </div>
            </div>
          </section>

          <div className="container mx-auto px-4 py-8 md:py-12">
            {/* Filters - Only show for women's category */}
            {category === 'women' && (
              <div className="mb-8">
                <h2 className="font-sans text-sm font-medium text-muted-foreground mb-4">
                  Filter by Type
                </h2>
                <div className="flex flex-wrap gap-3">
                  {subCategoryFilters.map((filter) => (
                    <Button
                      key={filter.id}
                      variant={activeFilter === filter.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange(filter.id)}
                      className={cn(
                        'transition-all duration-300',
                        activeFilter === filter.id && 'shadow-gold'
                      )}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product, index) => (
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
                  No products found in this category.
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

export default Categories;
