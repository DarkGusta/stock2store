
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Package, Calendar, DollarSign, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import RefundRequestForm from '@/components/refunds/RefundRequestForm';

interface OrderWithItems {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: {
    id: string;
    item_serial: string;
    price: number;
    items: {
      inventory: {
        name: string;
        description: string;
      };
    };
  }[];
  refund_requests: {
    id: string;
    status: string;
    created_at: string;
  }[];
}

const Orders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showRefundForm, setShowRefundForm] = useState<string | null>(null);

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          created_at,
          order_items (
            id,
            item_serial,
            price,
            items (
              inventory (
                name,
                description
              )
            )
          ),
          refund_requests (
            id,
            status,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return data as OrderWithItems[];
    },
    enabled: !!user,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRefundStatus = (order: OrderWithItems) => {
    if (order.refund_requests.length === 0) return null;
    
    const latestRequest = order.refund_requests.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
    
    return latestRequest.status;
  };

  const canRequestRefund = (order: OrderWithItems) => {
    return order.status === 'completed' && order.refund_requests.length === 0;
  };

  const handleRefundSuccess = () => {
    setShowRefundForm(null);
    refetch();
    toast({
      title: "Refund request submitted",
      description: "Your refund request has been submitted and will be reviewed.",
    });
  };

  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-700 dark:text-gray-300">Loading orders...</span>
      </div>
    );
  }

  if (showRefundForm) {
    const order = orders?.find(o => o.id === showRefundForm);
    if (order) {
      return (
        <div className="w-full h-full bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <RefundRequestForm
              orderId={order.id}
              orderNumber={order.order_number}
              onSuccess={handleRefundSuccess}
              onCancel={() => setShowRefundForm(null)}
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              My Orders
            </h1>
            <p className="text-muted-foreground">
              Track your orders and request refunds
            </p>
          </div>

          {!orders || orders.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  No Orders Found
                </CardTitle>
                <CardDescription>
                  You haven't placed any orders yet. Start shopping to see your orders here.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const refundStatus = getRefundStatus(order);
                
                return (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Order #{order.order_number}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(order.created_at), 'PPP')}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              ${order.total_amount.toFixed(2)}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          
                          {refundStatus && (
                            <Badge variant="outline" className={
                              refundStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              refundStatus === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }>
                              Refund {refundStatus}
                            </Badge>
                          )}
                          
                          {canRequestRefund(order) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowRefundForm(order.id)}
                              className="flex items-center gap-2"
                            >
                              <RotateCcw className="h-4 w-4" />
                              Request Refund
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Order Items:</h4>
                        <div className="space-y-2">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {item.items?.inventory?.name || 'Unknown Product'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Serial: {item.item_serial}
                                </p>
                                {item.items?.inventory?.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {item.items.inventory.description}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  ${item.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
