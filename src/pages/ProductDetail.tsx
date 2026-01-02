import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, Star, Minus, Plus, ShoppingBag, Heart, Share2, Truck, Shield, RefreshCw, MapPin, CreditCard } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getProductById, getByCategory } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import ProductCard from '@/components/products/ProductCard';
import { supabase } from '@/integrations/supabase/client';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = id ? getProductById(id) : null;
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  
  // Buy Now modal state
  const [isBuyNowOpen, setIsBuyNowOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    billingAddress: '',
    phone: '',
    email: '',
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBuyNow = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.deliveryAddress || !formData.billingAddress || !formData.phone || !formData.email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const totalAmount = product.price * quantity;
      
      const { error } = await supabase.functions.invoke('send-order-confirmation', {
        body: {
          email: formData.email,
          phone: formData.phone,
          deliveryAddress: formData.deliveryAddress,
          billingAddress: formData.billingAddress,
          productName: product.name,
          quantity: quantity,
          totalAmount: totalAmount,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Order placed successfully!",
        description: "A confirmation email has been sent to your email address.",
      });
      
      setIsBuyNowOpen(false);
      setFormData({ deliveryAddress: '', billingAddress: '', phone: '', email: '' });
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast({
        title: "Order failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

                {/* Delivery Info */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Delivery Information</h4>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-primary">One-day delivery</span> available for all orders within Jaffna.
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        For locations outside Jaffna, delivery takes <span className="font-medium">3 to 5 days</span>.
                      </p>
                    </div>
                  </div>
                </div>

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
                  <Button
                    variant="gold-outline"
                    size="xl"
                    className="flex-1 gap-2"
                    onClick={() => setIsBuyNowOpen(true)}
                  >
                    <CreditCard className="h-5 w-5" />
                    Buy Now
                  </Button>
                </div>
                
                <div className="flex gap-4">
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

      {/* Buy Now Modal */}
      <Dialog open={isBuyNowOpen} onOpenChange={setIsBuyNowOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Complete Your Order</DialogTitle>
            <DialogDescription>
              Fill in your details to place your order for {product.name}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleBuyNow} className="space-y-4 mt-4">
            <div className="p-3 rounded-lg bg-muted">
              <div className="flex justify-between items-center">
                <span className="font-medium">{product.name}</span>
                <span className="text-primary font-bold">₹{(product.price * quantity).toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground">Quantity: {quantity}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Delivery Address *</Label>
              <Input
                id="deliveryAddress"
                name="deliveryAddress"
                placeholder="Enter your delivery address"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingAddress">Billing Address *</Label>
              <Input
                id="billingAddress"
                name="billingAddress"
                placeholder="Enter your billing address"
                value={formData.billingAddress}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span><strong>Jaffna:</strong> One-day delivery</span>
              </p>
              <p className="flex items-center gap-2 mt-1">
                <Truck className="h-4 w-4 text-primary" />
                <span><strong>Other areas:</strong> 3-5 days delivery</span>
              </p>
            </div>

            <Button
              type="submit"
              variant="gold"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Placing Order...' : 'Place Order'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductDetail;
