import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/data/products';
import { cn } from '@/lib/utils';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink: string;
  className?: string;
}

const ProductSection: React.FC<ProductSectionProps> = ({
  title,
  subtitle,
  products,
  viewAllLink,
  className,
}) => {
  return (
    <section className={cn("py-12 md:py-20", className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12">
          <div>
            {subtitle && (
              <span className="font-display text-primary text-lg mb-1 block">
                {subtitle}
              </span>
            )}
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              {title}
            </h2>
          </div>
          <Link to={viewAllLink} className="mt-4 md:mt-0">
            <Button variant="ghost" className="gap-2 group">
              View All
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 4).map((product, index) => (
            <div
              key={`${title}-${product.id}-${index}`}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
