import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { userAPI } from '@/lib/api';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { addToCart } = useCart();
  const [isLiked, setIsLiked] = useState(false);
  const productId = product._id || product.id;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await userAPI.toggleWishlist(productId);
      setIsLiked(!isLiked);
      toast({
        title: !isLiked ? "Added to wishlist" : "Removed from wishlist",
        description: product.name,
      });
    } catch (err) {
      toast({
        title: "Please login first",
        description: "You need an account to save items.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/product/${productId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: url,
        });
      } else {
        throw new Error('Not supported');
      }
    } catch (err) {
      navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;



  return (
    <Link
      to={`/product/${productId}`}
      className={cn(
        "group block bg-card rounded-lg overflow-hidden shadow-soft hover:shadow-medium transition-all duration-500",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-125 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isHotSale && (
            <span className="px-2 py-1 bg-destructive text-destructive-foreground text-xs font-medium rounded">
              Hot Sale
            </span>
          )}
          {product.isLatestArrival && (
            <span className="px-2 py-1 gradient-gold text-primary-foreground text-xs font-medium rounded">
              New
            </span>
          )}
          {discount > 0 && (
            <span className="px-2 py-1 bg-charcoal text-cream text-xs font-medium rounded">
              -{discount}%
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 transform translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={handleToggleWishlist}
            className={cn(
              "h-9 w-9 rounded-full bg-cream/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-cream",
              isLiked ? "text-pink-600 shadow-gold" : "text-gray-600"
            )}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
          </button>
          <button
            onClick={handleShare}
            className="h-9 w-9 rounded-full bg-cream/80 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-cream text-gray-600"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Add Button */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button
            onClick={handleAddToCart}
            variant="elegant"
            size="sm"
            className="w-full gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className={cn("h-4 w-4", product.rating > 0 ? "fill-primary text-primary" : "text-muted")} />
          <span className="font-sans text-sm font-medium">{product.rating || 0}</span>
          <span className="font-sans text-xs text-muted-foreground">
            ({product.reviews} reviews)
          </span>
        </div>

        {/* Name */}
        <h3 className="font-serif text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-2">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-sans text-lg font-bold text-primary">
            LKR {product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="font-sans text-sm text-muted-foreground line-through">
              LKR {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
