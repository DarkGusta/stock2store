
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CreditCard, ArrowLeft } from 'lucide-react';
import { PaymentData } from '@/pages/Checkout';

interface PaymentFormProps {
  initialData: PaymentData;
  onSubmit: (data: PaymentData) => void;
  onBack: () => void;
  isProcessing: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ initialData, onSubmit, onBack, isProcessing }) => {
  const form = useForm<PaymentData>({
    defaultValues: initialData
  });

  const handleSubmit = (data: PaymentData) => {
    onSubmit(data);
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cardholderName"
              rules={{ required: "Cardholder name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cardholder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cardNumber"
              rules={{ 
                required: "Card number is required",
                minLength: {
                  value: 19,
                  message: "Card number must be complete"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      {...field}
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value);
                        field.onChange(formatted);
                      }}
                      maxLength={19}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                rules={{ 
                  required: "Expiry date is required",
                  pattern: {
                    value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                    message: "Invalid expiry date format (MM/YY)"
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="MM/YY"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatExpiryDate(e.target.value);
                          field.onChange(formatted);
                        }}
                        maxLength={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cvv"
                rules={{ 
                  required: "CVV is required",
                  minLength: {
                    value: 3,
                    message: "CVV must be 3-4 digits"
                  },
                  maxLength: {
                    value: 4,
                    message: "CVV must be 3-4 digits"
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123"
                        type="password"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          field.onChange(value);
                        }}
                        maxLength={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-4 space-y-3">
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">Test Card Information:</p>
                <p>• Card Number: 4242 4242 4242 4242</p>
                <p>• Expiry: Any future date (e.g., 12/25)</p>
                <p>• CVV: Any 3-4 digits (e.g., 123)</p>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onBack} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" disabled={isProcessing} className="flex-1">
                  {isProcessing ? 'Processing...' : 'Complete Order'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
