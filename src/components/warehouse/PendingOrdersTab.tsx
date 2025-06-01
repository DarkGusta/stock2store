
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth/AuthProvider';
import { CheckCircle, Clock, DollarSign, Package, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { completeOrder } from '@/services/orders/orderProcessingService';

interface PendingOrder {
  id: string;
  order_number: string;
  total_amount: number;
  created_at: string;
  status: string;
  user_id: string;
  profiles: {
    name: string;
    email: string;
  };
  order_items: {
    id: string;
    item_serial: string;
    price: number;
    items: {
      inventory: {
        name: string;
      };
    };
  }[];
}

const PendingOrdersTab: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingOrders = [], isLoading } = useQuery({
    queryKey: ['pending-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          created_at,
          status,
          user_id,
          profiles!orders_user_id_fkey (
            name,
            email
          ),
          order_items (
            id,
            item_serial,
            price,
            items (
              inventory (
                name
              )
            )
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PendingOrder[];
    },
  });

  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const result = await completeOrder(orderId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to accept order');
      }
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Order Accepted",
        description: "The order has been successfully accepted and completed.",
      });
      queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAcceptOrder = (orderId: string) => {
    acceptOrderMutation.mutate(orderId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading pending orders...</span>
      </div>
    );
  }

  if (pendingOrders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            No Pending Orders
          </CardTitle>
          <CardDescription>
            All orders have been processed. New orders will appear here when customers make purchases.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pending Order Requests</h2>
          <p className="text-muted-foreground">
            Review and accept customer orders to complete the fulfillment process.
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {pendingOrders.length} Pending
        </Badge>
      </div>

      <div className="space-y-4">
        {pendingOrders.map((order) => (
          <Card key={order.id} className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    Order #{order.order_number}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {order.profiles.name} ({order.profiles.email})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(order.created_at), 'PPP p')}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      ${order.total_amount.toFixed(2)}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    Pending Approval
                  </Badge>
                  <Button
                    onClick={() => handleAcceptOrder(order.id)}
                    disabled={acceptOrderMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {acceptOrderMutation.isPending ? 'Processing...' : 'Accept Order'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Items ({order.order_items.length})
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Serial ID</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.order_items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.items.inventory.name}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {item.item_serial}
                          </TableCell>
                          <TableCell className="text-right">
                            ${item.price.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PendingOrdersTab;
