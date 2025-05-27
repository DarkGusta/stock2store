
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/context/CartContext';
import { AlertTriangle } from 'lucide-react';

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
  currentStep: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ items, total, currentStep }) => {
  const subtotal = total;
  const tax = subtotal * 0.08;
  const finalTotal = subtotal + tax;

  const hasStockIssues = items.some(item => 
    item.product.stock <= 0 || item.quantity > item.product.stock
  );

  return (
    <div className="space-y-4">
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Items */}
          <div className="space-y-3">
            {items.map((item) => {
              const hasIssue = item.product.stock <= 0 || item.quantity > item.product.stock;
              return (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.product.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                      {hasIssue && (
                        <Badge variant="destructive" className="text-xs">
                          Stock Issue
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ${item.product.price.toFixed(2)} each
                    </p>
                  </div>
                  <span className="font-medium text-sm">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Stock Warning */}
          {hasStockIssues && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    Stock Issues Detected
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 mt-1">
                    Some items may not be available. Please review your cart.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Step {currentStep} of 2
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 2) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderSummary;
