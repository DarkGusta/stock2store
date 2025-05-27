
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Lock, CreditCard, User, MapPin } from 'lucide-react';
import InvoiceForm from '@/components/checkout/InvoiceForm';
import PaymentForm from '@/components/checkout/PaymentForm';
import OrderSummary from '@/components/checkout/OrderSummary';

export interface InvoiceData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States'
  });
  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/store');
      toast({
        title: "Cart is empty",
        description: "Add items to your cart before checking out.",
        variant: "destructive",
      });
    }
  }, [items, navigate, toast]);

  // Auto-fill invoice data from user profile
  useEffect(() => {
    if (user) {
      setInvoiceData(prev => ({
        ...prev,
        firstName: user.name.split(' ')[0] || '',
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleInvoiceSubmit = (data: InvoiceData) => {
    setInvoiceData(data);
    setCurrentStep(2);
  };

  const handlePaymentSubmit = async (data: PaymentData) => {
    setPaymentData(data);
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Here you would typically integrate with a payment processor
      // For now, we'll just simulate a successful payment
      
      toast({
        title: "Order placed successfully!",
        description: `Your order has been confirmed. Order total: $${(total * 1.08).toFixed(2)}`,
      });

      clearCart();
      navigate('/store');
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { number: 1, title: 'Invoice Information', icon: User },
    { number: 2, title: 'Payment Details', icon: CreditCard }
  ];

  if (items.length === 0) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/cart')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Checkout
            </h1>
            <p className="text-muted-foreground">
              Complete your purchase securely
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.number
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-500'
              }`}>
                <step.icon className="h-5 w-5" />
              </div>
              <div className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                {step.title}
              </div>
              {index < steps.length - 1 && (
                <div className={`mx-6 h-0.5 w-16 ${
                  currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Forms */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 1 && (
              <InvoiceForm
                initialData={invoiceData}
                onSubmit={handleInvoiceSubmit}
              />
            )}

            {currentStep === 2 && (
              <PaymentForm
                initialData={paymentData}
                onSubmit={handlePaymentSubmit}
                onBack={() => setCurrentStep(1)}
                isProcessing={isProcessing}
              />
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary 
              items={items}
              total={total}
              currentStep={currentStep}
            />
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          <Lock className="h-4 w-4 mr-2" />
          Your payment information is secure and encrypted
        </div>
      </div>
    </div>
  );
};

export default Checkout;
