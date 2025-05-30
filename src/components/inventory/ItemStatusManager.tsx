
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Package, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getDetailedInventory, updateItemStatus, getItemStatusCounts } from '@/services/inventory/inventoryService';
import { supabase } from '@/integrations/supabase/client';

const ItemStatusManager = () => {
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [statusChanges, setStatusChanges] = useState<{ [key: string]: string }>({});
  const [reasons, setReasons] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventoryItems = [], isLoading, refetch } = useQuery({
    queryKey: ['detailed-inventory'],
    queryFn: getDetailedInventory,
  });

  const handleStatusChange = async (serialId: string, newStatus: string) => {
    try {
      setUpdatingItem(serialId);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const reason = reasons[serialId] || undefined;
      const success = await updateItemStatus(serialId, newStatus as any, user.id, reason);
      
      if (success) {
        toast({
          title: 'Status Updated',
          description: `Item ${serialId} status updated to ${newStatus}`,
        });

        // Clear the status change and reason
        setStatusChanges(prev => {
          const updated = { ...prev };
          delete updated[serialId];
          return updated;
        });
        setReasons(prev => {
          const updated = { ...prev };
          delete updated[serialId];
          return updated;
        });

        // Refresh data
        queryClient.invalidateQueries({ queryKey: ['detailed-inventory'] });
        queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
        queryClient.invalidateQueries({ queryKey: ['warehouse-products'] });
      } else {
        throw new Error('Failed to update item status');
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update item status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingItem(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'sold':
        return 'bg-blue-100 text-blue-800';
      case 'damaged':
        return 'bg-red-100 text-red-800';
      case 'in_repair':
        return 'bg-yellow-100 text-yellow-800';
      case 'unavailable':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading inventory items...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Item Status Management
          </CardTitle>
          <CardDescription>
            View and update individual item statuses. Items marked as damaged can be repaired or made unavailable.
          </CardDescription>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="w-fit">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {inventoryItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No inventory items found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {inventoryItems.map((inventory) => {
                const statusCounts = getItemStatusCounts(inventory.serial_items);
                
                return (
                  <Card key={inventory.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{inventory.name}</h3>
                          <p className="text-sm text-gray-600">{inventory.description}</p>
                          <p className="text-sm text-gray-500 mt-1">Category: {inventory.category}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">Available: {statusCounts.available}</Badge>
                            <Badge variant="outline">Sold: {statusCounts.sold}</Badge>
                            <Badge variant="outline">Damaged: {statusCounts.damaged}</Badge>
                            <Badge variant="outline">In Repair: {statusCounts.in_repair}</Badge>
                            <Badge variant="outline">Unavailable: {statusCounts.unavailable}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">Individual Items:</h4>
                        {inventory.serial_items.map((item) => (
                          <div key={item.serial_id} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                            <div className="flex-1">
                              <span className="font-mono text-sm">{item.serial_id}</span>
                              <Badge className={`ml-2 ${getStatusColor(item.status)}`}>
                                {item.status}
                              </Badge>
                            </div>
                            
                            {(item.status === 'damaged' || item.status === 'in_repair' || item.status === 'unavailable') && (
                              <div className="flex items-center gap-2">
                                <Select
                                  value={statusChanges[item.serial_id] || ''}
                                  onValueChange={(value) => 
                                    setStatusChanges(prev => ({ ...prev, [item.serial_id]: value }))
                                  }
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Change status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="available">Available</SelectItem>
                                    <SelectItem value="damaged">Damaged</SelectItem>
                                    <SelectItem value="in_repair">In Repair</SelectItem>
                                    <SelectItem value="unavailable">Unavailable</SelectItem>
                                  </SelectContent>
                                </Select>
                                
                                {statusChanges[item.serial_id] && (
                                  <>
                                    <Textarea
                                      placeholder="Reason for status change (optional)"
                                      value={reasons[item.serial_id] || ''}
                                      onChange={(e) => 
                                        setReasons(prev => ({ ...prev, [item.serial_id]: e.target.value }))
                                      }
                                      className="min-h-8 w-48"
                                    />
                                    <Button
                                      onClick={() => handleStatusChange(item.serial_id, statusChanges[item.serial_id])}
                                      disabled={updatingItem === item.serial_id}
                                      size="sm"
                                    >
                                      {updatingItem === item.serial_id ? 'Updating...' : 'Update'}
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ItemStatusManager;
