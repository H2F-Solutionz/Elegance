import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { adminAPI, paymentsAPI, ordersAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState({ stripe: false, cod: false });
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'cod' | null>(null);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const methods = await adminAPI.getPaymentMethods();
        setPaymentMethods(methods);
        // Set default to first available method
        if (methods.cod) {
          setSelectedPaymentMethod('cod');
        } else if (methods.stripe) {
          setSelectedPaymentMethod('stripe');
        }
      } catch (err) {
        console.error('Failed to load payment methods:', err);
      } finally {
        setLoadingMethods(false);
      }
    };
    loadPaymentMethods();
  }, []);

  const handleStripeCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const res = await paymentsAPI.createCheckoutSession({
        items,
        successUrl: window.location.origin + '/?success=true',
        cancelUrl: window.location.origin + '/cart?canceled=true',
      });
      window.location.href = res.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast({
        title: "Checkout failed",
        description: message,
        variant: "destructive",
      });
      setIsCheckingOut(false);
    }
  };

  const handleCODCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // Create an order for each item in cart
      const orderPromises = items.map(item =>
        ordersAPI.create({
          product_id: item.id,
          quantity: item.quantity,
          total_amount: item.price * item.quantity,
          payment_method: 'cod',
        })
      );
      
      await Promise.all(orderPromises);
      clearCart();
      toast({
        title: "Order placed successfully!",
        description: "Your order has been confirmed. You will receive it via Cash on Delivery.",
      });
      setTimeout(() => {
        window.location.href = '/?success=true';
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast({
        title: "Order failed",
        description: message,
        variant: "destructive",
      });
      setIsCheckingOut(false);
    }
  };

  const handleCheckout = () => {
    if (selectedPaymentMethod === 'stripe') {
      handleStripeCheckout();
    } else if (selectedPaymentMethod === 'cod') {
      handleCODCheckout();
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
          <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">
              Shopping Cart
            </h1>

            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-card rounded-xl shadow-soft animate-fade-in"
                  >
                    {/* Image */}
                    <Link
                      to={`/product/${item.id}`}
                      className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0"
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
                        <h3 className="font-serif text-sm sm:text-lg font-semibold hover:text-primary transition-colors line-clamp-1">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="font-sans text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                        {item.material}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-serif text-base sm:text-lg font-bold text-primary">
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
                  <div className="bg-card rounded-xl p-4 sm:p-6 shadow-soft lg:sticky lg:top-24">
                  <h2 className="font-serif text-lg sm:text-xl font-bold mb-4 sm:mb-6">Order Summary</h2>
                  
                  <div className="space-y-2 sm:space-y-3 pb-3 sm:pb-4 border-b border-border">
                    <div className="flex justify-between text-sm">
                      <span className="font-sans text-muted-foreground">Subtotal ({totalItems} items)</span>
                      <span className="font-medium">LKR {totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-sans text-muted-foreground">Shipping</span>
                      <span className="font-medium text-primary">
                        {totalPrice >= 5000 ? 'Free' : 'LKR 199'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-sans text-muted-foreground">Tax (GST 3%)</span>
                      <span className="font-medium">LKR {Math.round(totalPrice * 0.03).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between py-3 sm:py-4">
                    <span className="font-serif font-bold text-base">Total</span>
                    <span className="font-serif font-bold text-lg sm:text-xl text-primary">
                      LKR {(totalPrice + (totalPrice < 5000 ? 199 : 0) + Math.round(totalPrice * 0.03)).toLocaleString()}
                    </span>
                  </div>

                  {totalPrice < 5000 && (
                    <p className="font-sans text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                      Add LKR {(5000 - totalPrice).toLocaleString()} more for free shipping
                    </p>
                  )}

                  {/* Payment Method Selection */}
                  {(paymentMethods.stripe || paymentMethods.cod) && (
                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      <p className="text-xs sm:text-sm font-medium">Select Payment Method:</p>
                      <div className="grid gap-2">
                        {paymentMethods.stripe && (
                          <Button
                            variant={selectedPaymentMethod === 'stripe' ? 'default' : 'outline'}
                            className="w-full justify-start h-10 sm:h-auto text-xs sm:text-sm py-2 sm:py-2.5"
                            onClick={() => setSelectedPaymentMethod('stripe')}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                checked={selectedPaymentMethod === 'stripe'}
                                readOnly
                                className="h-4 w-4"
                              />
                              <span>Stripe (Credit Card)</span>
                            </div>
                          </Button>
                        )}
                        {paymentMethods.cod && (
                          <Button
                            variant={selectedPaymentMethod === 'cod' ? 'default' : 'outline'}
                            className="w-full justify-start h-10 sm:h-auto text-xs sm:text-sm py-2 sm:py-2.5"
                            onClick={() => setSelectedPaymentMethod('cod')}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                checked={selectedPaymentMethod === 'cod'}
                                readOnly
                                className="h-4 w-4"
                              />
                              <span>Cash on Delivery (COD)</span>
                            </div>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  <Button 
                    variant="gold" 
                    size="xl" 
                    className="w-full gap-2 h-12 sm:h-auto text-sm sm:text-base"
                    onClick={handleCheckout} 
                    disabled={isCheckingOut || loadingMethods || !selectedPaymentMethod}
                  >
                    {isCheckingOut ? "Processing..." : `Proceed to Checkout${selectedPaymentMethod ? ` via ${selectedPaymentMethod === 'stripe' ? 'Stripe' : 'COD'}` : ''}`}
                    <ArrowRight className="h-4 w-4" />
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
