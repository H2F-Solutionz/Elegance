import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { ChevronLeft, Star, Minus, Plus, ShoppingBag, Heart, Share2, Truck, Shield, RefreshCw, MapPin, CreditCard } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { productsAPI, ordersAPI, reviewsAPI, userAPI, paymentsAPI, adminAPI } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import ProductCard from '@/components/products/ProductCard';
import ImageMagnifier from '@/components/products/ImageMagnifier';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Product } from '@/data/products';

type ProductData = Product & {
  _id?: string;
};

type ReviewData = {
  _id: string;
  rating: number;
  review_text: string;
  created_at: string;
  user_id?: {
    display_name?: string;
    avatar_url?: string;
  };
};

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, text: '' });
  const [isLiked, setIsLiked] = useState(false);
  const { addToCart } = useCart();

  // Payment methods
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState({
    stripe: true,
    paypal: false,
    cod: true,
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProductData = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const [productData, reviewsData, paymentMethods] = await Promise.all([
          productsAPI.getById(id),
          reviewsAPI.getByProduct(id),
          adminAPI.getPaymentMethods()
        ]);
        
        setProduct({
          ...productData,
          id: productData.id || productData._id || id,
        });
        setReviews(reviewsData);
        setAvailablePaymentMethods(paymentMethods);
        
        // Set default payment method to first available one
        if (paymentMethods.stripe) {
          setSelectedPaymentMethod('stripe');
        } else if (paymentMethods.paypal) {
          setSelectedPaymentMethod('paypal');
        } else if (paymentMethods.cod) {
          setSelectedPaymentMethod('cod');
        }
        
        // Fetch related products
        if (productData.category) {
          const related = await productsAPI.getAll({ category: productData.category });
          setRelatedProducts(
            related
              .filter((p: ProductData) => (p._id || p.id) !== id)
              .map((p: ProductData) => ({
                ...p,
                id: p.id || p._id || '',
              }))
              .slice(0, 4)
          );
        }
      } catch (err) {
        console.error('Failed to fetch product data:', err);
        // Use default if payment methods fetch fails
        const defaultMethods = { stripe: true, paypal: false, cod: true };
        setAvailablePaymentMethods(defaultMethods);
        // Set default payment method to first available one
        if (defaultMethods.stripe) {
          setSelectedPaymentMethod('stripe');
        } else if (defaultMethods.paypal) {
          setSelectedPaymentMethod('paypal');
        } else if (defaultMethods.cod) {
          setSelectedPaymentMethod('cod');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductData();
  }, [id]);
  
  // Buy Now modal state
  const [isBuyNowOpen, setIsBuyNowOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    phone: '',
    email: '',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

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

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const productId = product._id || product.id;

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

  const handleToggleWishlist = async () => {
    try {
      await userAPI.toggleWishlist(productId);
      setIsLiked(!isLiked);
      toast({
        title: !isLiked ? "Added to wishlist" : "Removed from wishlist",
        description: product.name,
      });
    } catch (err) {
      toast({
        title: "Please login",
        description: "You need an account to save items.",
        variant: "destructive"
      });
    }
  };

  const handleBuyNow = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.street || !formData.city || !formData.state || !formData.zip_code || !formData.country || !formData.phone || !formData.email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate selected payment method is available
    const isPaymentMethodAvailable = 
      (selectedPaymentMethod === 'stripe' && availablePaymentMethods.stripe) ||
      (selectedPaymentMethod === 'paypal' && availablePaymentMethods.paypal) ||
      (selectedPaymentMethod === 'cod' && availablePaymentMethods.cod);

    if (!isPaymentMethodAvailable) {
      toast({
        title: "Invalid payment method",
        description: "The selected payment method is not available. Please select another option.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (selectedPaymentMethod === 'stripe') {
        // Create Stripe checkout session with address
        const session = await paymentsAPI.createCheckoutSession({
          items: [{
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
          }],
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zip_code,
            country: formData.country,
            phone: formData.phone,
          },
          successUrl: `${window.location.origin}/profile?success=true`,
          cancelUrl: window.location.href
        });

        if (session.url) {
          window.location.href = session.url;
        }
      } else if (selectedPaymentMethod === 'cod') {
        // Handle Cash on Delivery
        toast({
          title: "Order Placed",
          description: "Your order has been placed. Payment will be collected on delivery.",
        });
        // Create order in database
        // TODO: Implement order creation endpoint
        setIsBuyNowOpen(false);
        setFormData({
          street: '',
          city: '',
          state: '',
          zip_code: '',
          country: '',
          phone: '',
          email: '',
        });
      } else if (selectedPaymentMethod === 'paypal') {
        // Handle PayPal
        toast({
          title: "Coming Soon",
          description: "PayPal payment option is coming soon.",
        });
      }
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      toast({
        title: "Payment failed",
        description: "Could not initiate checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.text) return;
    
    setIsSubmitting(true);
    try {
      await reviewsAPI.postReview({
        product_id: productId,
        rating: newReview.rating,
        review_text: newReview.text,
      });
      
      toast({ title: "Review submitted!", description: "Thank you for your feedback." });
      setNewReview({ rating: 5, text: '' });
      // Refresh reviews and product data
      const [updatedReviews, updatedProduct] = await Promise.all([
        reviewsAPI.getByProduct(productId),
        productsAPI.getById(productId)
      ]);
      setReviews(updatedReviews);
      setProduct(updatedProduct);
    } catch (err: any) {
      console.error('Review error:', err);
      toast({
        title: "Failed to post review",
        description: err.message || "Please login to leave a review.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO 
        title={product.name}
        description={product.description}
        type="product"
        image={product.image}
        canonical={`https://sparkle-bangles.pages.dev/product/${productId}`}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: [product.image, ...(product.images || [])],
          description: product.description,
          sku: productId,
          offers: {
            '@type': 'Offer',
            url: `https://sparkle-bangles.pages.dev/product/${productId}`,
            priceCurrency: 'LKR',
            price: product.price,
            itemCondition: 'https://schema.org/NewCondition',
            availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
              '@type': 'Organization',
              name: 'Sparkle Bangles'
            }
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviews || 1
          }
        }}
      />

      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 pb-20">
          {/* Breadcrumb */}
          <div className="container mx-auto px-4 py-4 overflow-x-hidden">
            <Link
              to={`/categories/${product.category}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to {product.category}'s collection
            </Link>
          </div>

          {/* Product Section */}
          <section className="container mx-auto px-4 py-4 md:py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* Images */}
              <div className="space-y-4 max-w-full">
                <div className="aspect-square rounded-xl overflow-hidden bg-muted w-full relative">
                  <ImageMagnifier
                    src={images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    maxZoom={5}
                  />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
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
                    LKR {product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="font-sans text-xl text-muted-foreground line-through">
                        LKR {product.originalPrice.toLocaleString()}
                      </span>
                      <span className="px-2 py-1 bg-destructive/10 text-destructive text-sm font-medium rounded">
                        Save LKR {(product.originalPrice - product.price).toLocaleString()}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-border">
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
                  <Button 
                    variant={isLiked ? "gold" : "outline"} 
                    size="xl" 
                    className="flex-1 gap-2"
                    onClick={handleToggleWishlist}
                  >
                    <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
                    {isLiked ? "Wishlisted" : "Add to Wishlist"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="xl" 
                    className="gap-2"
                    onClick={handleShare}
                  >
                    <Share2 className="h-5 w-5" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Reviews Section */}
          <section className="container mx-auto px-4 py-12 border-t border-border">
            <div className="grid md:grid-cols-3 gap-12">
              {/* Review Summary */}
              <div className="md:col-span-1">
                <h2 className="font-serif text-2xl font-bold mb-4">Customer Reviews</h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl font-bold text-primary">{product.rating}</div>
                  <div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("h-4 w-4", i < Math.floor(product.rating) ? "fill-primary text-primary" : "text-muted")} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Based on {reviews.length} reviews</p>
                  </div>
                </div>

                {/* Add Review Form */}
                <div className="bg-muted p-6 rounded-xl">
                  <h3 className="font-semibold mb-4">Write a Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star className={cn("h-6 w-6", star <= newReview.rating ? "fill-primary text-primary" : "text-gray-300")} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      placeholder="Share your experience with this product..."
                      className="w-full min-h-[100px] p-3 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={newReview.text}
                      onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                      required
                    />
                    <Button type="submit" variant="gold" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                  </form>
                </div>
              </div>

              {/* Review List */}
              <div className="md:col-span-2">
                <div className="space-y-8">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review._id} className="border-b border-border pb-8 last:border-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {review.user_id?.display_name?.[0] || 'U'}
                            </div>
                            <div>
                              <p className="font-bold">{review.user_id?.display_name || 'Anonymous'}</p>
                              <div className="flex items-center gap-0.5 mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={cn("h-3 w-3", i < review.rating ? "fill-primary text-primary" : "text-muted")} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed italic">"{review.review_text}"</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="container mx-auto px-4 py-12">
              <h2 className="font-serif text-2xl font-bold mb-8">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} />
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
          
          <form onSubmit={handleBuyNow} className="space-y-4 mt-4 px-1">
            <div className="p-3 rounded-lg bg-muted flex items-center justify-between">
              <div>
                <span className="font-medium block truncate max-w-[200px]">{product.name}</span>
                <p className="text-sm text-muted-foreground">Quantity: {quantity}</p>
              </div>
              <span className="text-primary font-bold whitespace-nowrap">LKR {(product.price * quantity).toLocaleString()}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                name="street"
                placeholder="Enter street address"
                value={formData.street}
                onChange={handleInputChange}
                className="h-10"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province *</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="h-10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zip_code">Zip Code *</Label>
                <Input
                  id="zip_code"
                  name="zip_code"
                  placeholder="Enter zip code"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  name="country"
                  placeholder="Enter country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="h-10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Label>Payment Method *</Label>
              <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                {availablePaymentMethods.stripe && (
                  <div className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                      <div className="font-medium">Credit Card (Stripe)</div>
                      <div className="text-sm text-gray-500">Pay securely with your credit card</div>
                    </Label>
                  </div>
                )}
                {availablePaymentMethods.paypal && (
                  <div className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                      <div className="font-medium">PayPal</div>
                      <div className="text-sm text-gray-500">Pay with your PayPal account</div>
                    </Label>
                  </div>
                )}
                {availablePaymentMethods.cod && (
                  <div className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="font-medium">Cash on Delivery</div>
                      <div className="text-sm text-gray-500">Pay when you receive your order</div>
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-[13px]">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span><strong>Jaffna:</strong> One-day delivery</span>
              </p>
              <p className="flex items-center gap-2 mt-1">
                <Truck className="h-4 w-4 text-primary shrink-0" />
                <span><strong>Other areas:</strong> 3-5 days delivery</span>
              </p>
            </div>

            <Button
              type="submit"
              variant="gold"
              className="w-full h-11 text-lg font-semibold shadow-gold mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
              Proceed to Payment
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductDetail;
