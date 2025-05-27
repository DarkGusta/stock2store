
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Cart = () => {
  const { items, total, itemCount, removeFromCart, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCheckout = () => {
    const unavailableItems = items.filter(item => item.status === 'unavailable' || item.product.stock < item.quantity);
    
    if (unavailableItems.length > 0) {
      toast({
        title: "Cannot proceed to checkout",
        description: "Some items in your cart are no longer available or have insufficient stock.",
        variant: "destructive",
      });
      return;
    }

    navigate('/checkout');
  };

  const getItemStatus = (item: any) => {
    if (item.product.stock <= 0) return 'unavailable';
    if (item.quantity > item.product.stock) return 'insufficient';
    return 'available';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unavailable':
        return <Badge variant="destructive">Out of Stock</Badge>;
      case 'insufficient':
        return <Badge variant="destructive">Insufficient Stock</Badge>;
      default:
        return <Badge variant="secondary">Available</Badge>;
    }
  };

  if (items.length === 0) {
    return (
      <div className="w-full h-full bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start shopping to add items to your cart.
            </p>
            <Button onClick={() => navigate('/store')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const status = getItemStatus(item);
              return (
                <Card key={item.id} className="relative">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {item.product.name}
                          </h3>
                          {getStatusBadge(status)}
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                          {item.product.description}
                        </p>
                        
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          Category: {item.product.category}
                        </p>

                        {status === 'insufficient' && (
                          <div className="flex items-center gap-2 text-amber-600 text-sm mb-4">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Only {item.product.stock} available (you have {item.quantity} in cart)</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="font-medium text-lg w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              ${item.product.price.toFixed(2)} each
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.product.id)}
                        className="ml-4 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${(total * 0.08).toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${(total * 1.08).toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={handleCheckout} 
                    className="w-full"
                    disabled={items.some(item => getItemStatus(item) !== 'available')}
                  >
                    Proceed to Checkout
                  </Button>
                  
                  <Button variant="outline" onClick={clearCart} className="w-full">
                    Clear Cart
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/store')} 
                    className="w-full"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stock Warnings */}
            {items.some(item => getItemStatus(item) !== 'available') && (
              <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
                <CardHeader>
                  <CardTitle className="text-amber-800 dark:text-amber-200 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Stock Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-700 dark:text-amber-300 text-sm">
                    Some items in your cart have stock issues. Please review and adjust quantities before proceeding.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
