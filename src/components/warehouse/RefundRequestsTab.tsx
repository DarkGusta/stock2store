
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Eye, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface RefundRequest {
  id: string;
  order_id: string;
  user_id: string;
  description: string;
  photo_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  orders: {
    order_number: string;
    total_amount: number;
  };
  profiles: {
    name: string;
    email: string;
  };
}

const RefundRequestsTab: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: refundRequests, isLoading } = useQuery({
    queryKey: ['refund-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('refund_requests')
        .select(`
          *,
          orders (
            order_number,
            total_amount
          ),
          profiles!refund_requests_user_id_fkey (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RefundRequest[];
    },
  });

  const processRefundMutation = useMutation({
    mutationFn: async ({ 
      requestId, 
      action, 
      notes 
    }: { 
      requestId: string; 
      action: 'approved' | 'rejected'; 
      notes: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update refund request
      const { error: updateError } = await supabase
        .from('refund_requests')
        .update({
          status: action,
          admin_notes: notes,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If approved, update order status and items
      if (action === 'approved') {
        const request = refundRequests?.find(r => r.id === requestId);
        if (!request) throw new Error('Refund request not found');

        // Update order status to refunded
        const { error: orderError } = await supabase
          .from('orders')
          .update({ status: 'refunded' })
          .eq('id', request.order_id);

        if (orderError) throw orderError;

        // Get order items and update their status to in_repair
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select('item_serial')
          .eq('order_id', request.order_id);

        if (itemsError) throw itemsError;

        if (orderItems && orderItems.length > 0) {
          const serialIds = orderItems.map(item => item.item_serial);
          
          const { error: itemStatusError } = await supabase
            .from('items')
            .update({ status: 'in_repair' })
            .in('serial_id', serialIds);

          if (itemStatusError) throw itemStatusError;
        }
      }

      return { requestId, action };
    },
    onSuccess: (data) => {
      toast({
        title: "Refund request processed",
        description: `Refund request has been ${data.action}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['refund-requests'] });
      setSelectedRequest(null);
      setAdminNotes('');
    },
    onError: (error) => {
      console.error('Error processing refund request:', error);
      toast({
        title: "Error",
        description: "Failed to process refund request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleProcessRefund = async (action: 'approved' | 'rejected') => {
    if (!selectedRequest) return;

    if (action === 'rejected' && !adminNotes.trim()) {
      toast({
        title: "Admin notes required",
        description: "Please provide a reason for rejecting the refund request.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await processRefundMutation.mutateAsync({
        requestId: selectedRequest.id,
        action,
        notes: adminNotes.trim(),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading refund requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Refund Requests</h3>
        <p className="text-muted-foreground">
          Review and process customer refund requests
        </p>
      </div>

      {!refundRequests || refundRequests.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Refund Requests</CardTitle>
            <CardDescription>
              There are currently no refund requests to review.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {refundRequests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      Order #{request.orders.order_number}
                    </CardTitle>
                    <CardDescription>
                      Customer: {request.profiles.name} ({request.profiles.email})<br />
                      Amount: ${request.orders.total_amount.toFixed(2)}<br />
                      Submitted: {format(new Date(request.created_at), 'PPP')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                    <Dialog 
                      open={selectedRequest?.id === request.id} 
                      onOpenChange={(open) => {
                        if (!open) {
                          setSelectedRequest(null);
                          setAdminNotes('');
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>
                            Refund Request - Order #{request.orders.order_number}
                          </DialogTitle>
                          <DialogDescription>
                            Review the refund request details and make a decision.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Customer Description:</Label>
                            <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                              {request.description}
                            </p>
                          </div>

                          {request.photo_url && (
                            <div>
                              <Label className="text-sm font-medium">Photo Evidence:</Label>
                              <div className="mt-2">
                                <img
                                  src={request.photo_url}
                                  alt="Refund evidence"
                                  className="max-w-full h-64 object-cover rounded-lg border"
                                />
                              </div>
                            </div>
                          )}

                          {request.status === 'pending' && (
                            <div>
                              <Label htmlFor="admin-notes" className="text-sm font-medium">
                                Admin Notes:
                              </Label>
                              <Textarea
                                id="admin-notes"
                                placeholder="Add notes about your decision (required for rejections)..."
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                          )}

                          {request.admin_notes && (
                            <div>
                              <Label className="text-sm font-medium">Previous Admin Notes:</Label>
                              <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                {request.admin_notes}
                              </p>
                            </div>
                          )}

                          {request.status === 'pending' && (
                            <div className="flex gap-2 pt-4 border-t">
                              <Button
                                onClick={() => handleProcessRefund('approved')}
                                disabled={isProcessing}
                                className="flex-1"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Refund
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleProcessRefund('rejected')}
                                disabled={isProcessing}
                                className="flex-1"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Refund
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {request.description}
                </p>
                {request.admin_notes && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <div className="flex items-center gap-1 text-blue-700 font-medium">
                      <MessageSquare className="h-3 w-3" />
                      Admin Response:
                    </div>
                    <p className="text-blue-600 mt-1">{request.admin_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RefundRequestsTab;
