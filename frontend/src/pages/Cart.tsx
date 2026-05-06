import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { paymentsAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await paymentsAPI.createCheckoutSession({
        items,
        successUrl: window.location.origin + '/?success=true',
        cancelUrl: window.location.origin + '/cart?canceled=true',
      });
      window.location.href = res.url;
    } catch (err: any) {
      toast({
        title: "Checkout failed",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Shopping Cart - Elegance Jewelry</title>
        </Helmet>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center px-4">
              <div className="h-24 w-24 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <h1 className="font-serif text-2xl font-bold mb-2">Your Cart is Empty</h1>
              <p className="font-sans text-muted-foreground mb-6">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link to="/">
                <Button variant="gold" size="lg">
                  Start Shopping
                </Button>
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`Shopping Cart (${totalItems} items) - Elegance Jewelry`}</title>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8">
              Shopping Cart
            </h1>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-card rounded-xl shadow-soft animate-fade-in"
                  >
                    {/* Image */}
                    <Link
                      to={`/product/${item.id}`}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.id}`}>
                        <h3 className="font-serif text-lg font-semibold hover:text-primary transition-colors line-clamp-1">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="font-sans text-sm text-muted-foreground mb-2">
                        {item.material}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-serif text-lg font-bold text-primary">
                            LKR {(item.price * item.quantity).toLocaleString()}
                          </p>
                          {item.quantity > 1 && (
                            <p className="font-sans text-xs text-muted-foreground">
                              LKR {item.price.toLocaleString()} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                  <div className="bg-card rounded-xl p-6 shadow-soft lg:sticky lg:top-24">
                  <h2 className="font-serif text-xl font-bold mb-6">Order Summary</h2>
                  
                  <div className="space-y-4 pb-4 border-b border-border">
                    <div className="flex justify-between">
                      <span className="font-sans text-muted-foreground">Subtotal ({totalItems} items)</span>
                      <span className="font-medium">LKR {totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-muted-foreground">Shipping</span>
                      <span className="font-medium text-primary">
                        {totalPrice >= 5000 ? 'Free' : 'LKR 199'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-muted-foreground">Tax (GST 3%)</span>
                      <span className="font-medium">LKR {Math.round(totalPrice * 0.03).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between py-4">
                    <span className="font-serif text-lg font-bold">Total</span>
                    <span className="font-serif text-xl font-bold text-primary">
                      LKR {(totalPrice + (totalPrice < 5000 ? 199 : 0) + Math.round(totalPrice * 0.03)).toLocaleString()}
                    </span>
                  </div>

                  {totalPrice < 5000 && (
                    <p className="font-sans text-sm text-muted-foreground mb-4">
                      Add LKR {(5000 - totalPrice).toLocaleString()} more for free shipping
                    </p>
                  )}

                  <Button 
                    variant="gold" 
                    size="xl" 
                    className="w-full gap-2" 
                    onClick={handleCheckout} 
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? "Processing..." : "Proceed to Checkout via Stripe"}
                    <ArrowRight className="h-5 w-5" />
                  </Button>

                  <Link to="/" className="block mt-4">
                    <Button variant="ghost" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Cart;
