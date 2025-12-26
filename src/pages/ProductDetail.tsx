import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, Star, Minus, Plus, ShoppingBag, Heart, Share2, Truck, Shield, RefreshCw } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { getProductById, getByCategory } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import ProductCard from '@/components/products/ProductCard';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = id ? getProductById(id) : null;
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold mb-4">Product Not Found</h1>
            <Link to="/">
              <Button variant="gold">Go Back Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const images = product.images || [product.image];
  const relatedProducts = getByCategory(product.category).filter(p => p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity} × ${product.name} has been added to your cart.`,
    });
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  return (
    <>
      <Helmet>
        <title>{product.name} - Elegance Jewelry</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1">
          {/* Breadcrumb */}
          <div className="container mx-auto px-4 py-4">
            <Link
              to={`/categories/${product.category}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to {product.category}'s collection
            </Link>
          </div>

          {/* Product Section */}
          <section className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Images */}
              <div className="space-y-4">
                <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-3">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index
                            ? 'border-primary shadow-gold'
                            : 'border-transparent hover:border-border'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-primary text-primary'
                            : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-sans text-sm text-muted-foreground">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>

                {/* Name */}
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="flex items-center gap-4">
                  <span className="font-serif text-3xl font-bold text-primary">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="font-sans text-xl text-muted-foreground line-through">
                        ₹{product.originalPrice.toLocaleString()}
                      </span>
                      <span className="px-2 py-1 bg-destructive/10 text-destructive text-sm font-medium rounded">
                        Save ₹{(product.originalPrice - product.price).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <p className="font-sans text-muted-foreground leading-relaxed">
                  {product.description}
                </p>

                {/* Specs */}
                {(product.material || product.weight) && (
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                    {product.material && (
                      <div>
                        <span className="font-sans text-sm text-muted-foreground block">Material</span>
                        <span className="font-medium">{product.material}</span>
                      </div>
                    )}
                    {product.weight && (
                      <div>
                        <span className="font-sans text-sm text-muted-foreground block">Weight</span>
                        <span className="font-medium">{product.weight}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Quantity */}
                <div className="flex items-center gap-4">
                  <span className="font-sans text-sm font-medium">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="gold"
                    size="xl"
                    className="flex-1 gap-2"
                    onClick={handleAddToCart}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="xl">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="xl">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <Truck className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <span className="font-sans text-xs text-muted-foreground">Free Delivery</span>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <Shield className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <span className="font-sans text-xs text-muted-foreground">Certified</span>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <RefreshCw className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <span className="font-sans text-xs text-muted-foreground">Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="container mx-auto px-4 py-12">
              <h2 className="font-serif text-2xl font-bold mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProductDetail;
