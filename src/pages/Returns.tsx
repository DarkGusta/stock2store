
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { RotateCcw, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface RefundRequestWithDetails {
  id: string;
  description: string;
  photo_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  orders: {
    order_number: string;
    total_amount: number;
  };
}

const Returns = () => {
  const { user } = useAuth();

  const { data: refundRequests, isLoading } = useQuery({
    queryKey: ['user-refund-requests', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('refund_requests')
        .select(`
          id,
          description,
          photo_url,
          status,
          admin_notes,
          created_at,
          reviewed_at,
          orders (
            order_number,
            total_amount
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RefundRequestWithDetails[];
    },
    enabled: !!user,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
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
      <div className="w-full h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-700 dark:text-gray-300">Loading refund requests...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Returns & Refunds
            </h1>
            <p className="text-muted-foreground">
              Track your refund requests and their status
            </p>
          </div>

          {!refundRequests || refundRequests.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  No Refund Requests
                </CardTitle>
                <CardDescription>
                  You haven't submitted any refund requests yet. You can request refunds for delivered orders from the Orders page.
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
                        <CardTitle className="flex items-center gap-2">
                          <RotateCcw className="h-5 w-5" />
                          Refund Request - Order #{request.orders.order_number}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Submitted: {format(new Date(request.created_at), 'PPP')}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            Order Amount: ${request.orders.total_amount.toFixed(2)}
                          </span>
                          {request.reviewed_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Reviewed: {format(new Date(request.reviewed_at), 'PPP')}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Your Description:</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                          {request.description}
                        </p>
                      </div>

                      {request.photo_url && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Photo Evidence:</h4>
                          <img
                            src={request.photo_url}
                            alt="Refund evidence"
                            className="max-w-sm h-32 object-cover rounded border"
                          />
                        </div>
                      )}

                      {request.admin_notes && (
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {request.status === 'approved' ? 'Approval Notes:' : 'Rejection Reason:'}
                          </h4>
                          <p className={`text-sm p-3 rounded ${
                            request.status === 'approved' 
                              ? 'text-green-700 bg-green-50 dark:bg-green-900 dark:text-green-300' 
                              : 'text-red-700 bg-red-50 dark:bg-red-900 dark:text-red-300'
                          }`}>
                            {request.admin_notes}
                          </p>
                        </div>
                      )}

                      {request.status === 'pending' && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900 p-3 rounded">
                          <p className="font-medium text-blue-700 dark:text-blue-300">Your refund request is being reviewed</p>
                          <p className="text-blue-600 dark:text-blue-400">Our team will review your request and get back to you soon.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Returns;
