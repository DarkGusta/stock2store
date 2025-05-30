
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { processRefund } from '@/services/orders/orderProcessingService';

interface RefundRequestWithDetails {
  id: string;
  order_id: string;
  user_id: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  photo_url?: string;
  created_at: string;
  admin_notes?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  orders: {
    order_number: string;
    total_amount: number;
  } | null;
  profiles: {
    name: string | null;
    email: string | null;
  } | null;
}

const RefundRequestsTab = () => {
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const [processingRefund, setProcessingRefund] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: refundRequests = [], isLoading } = useQuery({
    queryKey: ['refund-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('refund_requests')
        .select(`
          id,
          order_id,
          user_id,
          description,
          status,
          photo_url,
          created_at,
          admin_notes,
          reviewed_at,
          reviewed_by,
          orders!inner (
            order_number,
            total_amount
          ),
          profiles!inner (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RefundRequestWithDetails[];
    },
  });

  const handleStatusUpdate = async (requestId: string, newStatus: 'approved' | 'rejected', orderId?: string) => {
    try {
      if (newStatus === 'approved') {
        setProcessingRefund(requestId);
      }

      // Get current user for admin notes
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update refund request status
      const { error } = await supabase
        .from('refund_requests')
        .update({
          status: newStatus,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes[requestId] || null
        })
        .eq('id', requestId);

      if (error) throw error;

      // If approved and orderId exists, process the refund
      if (newStatus === 'approved' && orderId) {
        const refundResult = await processRefund(orderId, user.id);
        if (!refundResult.success) {
          throw new Error(refundResult.error || 'Failed to process refund');
        }
      }

      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['refund-requests'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['warehouse-products'] });

      toast({
        title: 'Success',
        description: `Refund request ${newStatus} successfully${newStatus === 'approved' ? ' and items marked for repair' : ''}`,
      });

      // Clear admin notes for this request
      setAdminNotes(prev => {
        const updated = { ...prev };
        delete updated[requestId];
        return updated;
      });

    } catch (error) {
      console.error('Error updating refund request:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update refund request',
        variant: 'destructive',
      });
    } finally {
      setProcessingRefund(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading refund requests...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Refund Requests Management
          </CardTitle>
          <CardDescription>Review and process customer refund requests</CardDescription>
        </CardHeader>
        <CardContent>
          {refundRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No refund requests found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {refundRequests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1 capitalize">{request.status}</span>
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Order #{request.orders?.order_number || 'Unknown'}
                          </span>
                        </div>
                        <h3 className="font-semibold">
                          Refund Request from {request.profiles?.name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-600">{request.profiles?.email || 'No email'}</p>
                        <p className="text-sm">
                          <strong>Amount:</strong> ${request.orders?.total_amount || 0}
                        </p>
                        <p className="text-sm">
                          <strong>Submitted:</strong> {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Customer Description:</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {request.description}
                      </p>
                    </div>

                    {request.photo_url && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Attached Photo:</h4>
                        <img
                          src={request.photo_url}
                          alt="Refund request"
                          className="max-w-xs rounded border"
                        />
                      </div>
                    )}

                    {request.admin_notes && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Admin Notes:</h4>
                        <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                          {request.admin_notes}
                        </p>
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Admin Notes (Optional):
                          </label>
                          <Textarea
                            placeholder="Add any notes about this refund decision..."
                            value={adminNotes[request.id] || ''}
                            onChange={(e) =>
                              setAdminNotes(prev => ({
                                ...prev,
                                [request.id]: e.target.value
                              }))
                            }
                            className="min-h-20"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleStatusUpdate(request.id, 'approved', request.order_id)}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={processingRefund === request.id}
                          >
                            {processingRefund === request.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Refund
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleStatusUpdate(request.id, 'rejected')}
                            variant="destructive"
                            disabled={processingRefund === request.id}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Refund
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RefundRequestsTab;
